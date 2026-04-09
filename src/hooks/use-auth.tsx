import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { generateFingerprint } from "@/lib/fingerprint";
import { registerLogin, validateSession } from "@/lib/security.functions";

const ADMIN_EMAIL = "renatonardin13@gmail.com";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  loading: boolean;
  adminLoading: boolean;
  blocked: boolean;
  blockMessage: string | null;
  isAdmin: boolean;
  role: "admin" | "user";
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

function getSessionToken(): string {
  if (typeof window === 'undefined') return '';
  let token = sessionStorage.getItem('paz-session-token');
  if (!token) {
    token = crypto.randomUUID();
    sessionStorage.setItem('paz-session-token', token);
  }
  return token;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const loginRegistered = useRef(false);

  // Check admin role whenever user changes (with email fallback)
  useEffect(() => {
    if (!user?.id) {
      setIsAdmin(false);
      setAdminLoading(false);
      return;
    }

    // Email-based fallback: always treat this email as admin
    if (user.email?.toLowerCase() === ADMIN_EMAIL) {
      setIsAdmin(true);
      setAdminLoading(false);
      return;
    }

    const checkAdmin = async () => {
      setAdminLoading(true);
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
      setAdminLoading(false);
    };

    checkAdmin();
  }, [user?.id, user?.email]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Session validation interval
  useEffect(() => {
    if (!session || isAdmin || typeof window === 'undefined') return;

    const checkSession = async () => {
      try {
        const sessionToken = getSessionToken();
        const result = await validateSession({ data: { sessionToken } });
        if (!result.valid) {
          setBlocked(true);
          setBlockMessage(
            'Sua sessão foi encerrada porque um novo login foi detectado em outro dispositivo.'
          );
          await supabase.auth.signOut();
        }
      } catch {
        // Silently fail
      }
    };

    const interval = setInterval(checkSession, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [session, isAdmin]);

  const login = useCallback(async (email: string, password: string) => {
    setBlocked(false);
    setBlockMessage(null);
    loginRegistered.current = false;

    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: "Não foi possível acessar. Verifique seu e-mail e senha e tente novamente." };
    }

    if (authData.user?.id) {
      // Email-based fallback for admin
      if (email.toLowerCase() === ADMIN_EMAIL) {
        setIsAdmin(true);
        loginRegistered.current = true;
        return { error: null };
      }

      const { data: adminRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authData.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (adminRole) {
        setIsAdmin(true);
        loginRegistered.current = true;
        return { error: null };
      }
    }

    // Register login with security checks
    try {
      const fingerprint = await generateFingerprint();
      const sessionToken = getSessionToken();

      const result = await registerLogin({
        data: { deviceFingerprint: fingerprint, sessionToken },
      });

      if (!result.allowed) {
        setBlocked(true);
        setBlockMessage(
          result.message ||
          'Acesso não autorizado detectado. Esta conta está vinculada ao comprador original.'
        );
        await supabase.auth.signOut();
        return { error: result.message || 'Acesso bloqueado por segurança.' };
      }

      loginRegistered.current = true;
    } catch (err) {
      console.error('Security check failed:', err);
    }

    return { error: null };
  }, []);

  const logout = useCallback(async () => {
    setBlocked(false);
    setBlockMessage(null);
    setIsAdmin(false);
    loginRegistered.current = false;
    sessionStorage.removeItem('paz-session-token');
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!session,
        user,
        session,
        loading,
        adminLoading,
        blocked,
        blockMessage,
        isAdmin,
        role: isAdmin ? "admin" as const : "user" as const,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
