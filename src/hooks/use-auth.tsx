import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { generateFingerprint } from "@/lib/fingerprint";
import { registerLogin, validateSession } from "@/lib/security.functions";
import { checkIsAdmin } from "@/lib/admin.functions";

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
  const adminCheckRef = useRef<string | null>(null);

  // Check admin role via server function (bypasses RLS issues)
  useEffect(() => {
    let cancelled = false;

    if (!user?.id) {
      setIsAdmin(false);
      setAdminLoading(false);
      adminCheckRef.current = null;
      return () => { cancelled = true; };
    }

    // Prevent duplicate checks for the same user
    if (adminCheckRef.current === user.id) {
      return () => { cancelled = true; };
    }

    // Quick email-based hint (sets admin immediately for UX, server confirms)
    const isHardcodedAdmin = user.email?.toLowerCase() === ADMIN_EMAIL;
    if (isHardcodedAdmin) {
      setIsAdmin(true);
      setAdminLoading(false);
      adminCheckRef.current = user.id;
      return () => { cancelled = true; };
    }

    const doCheck = async () => {
      setAdminLoading(true);
      const timeout = setTimeout(() => {
        if (!cancelled) {
          console.error("Admin check timeout for user:", user.id);
          setIsAdmin(false);
          setAdminLoading(false);
        }
      }, 8000);

      try {
        const result = await checkIsAdmin();
        if (cancelled) return;
        setIsAdmin(result.isAdmin);
        adminCheckRef.current = user.id;
      } catch (error) {
        if (!cancelled) {
          console.error("Admin check failed:", error);
          setIsAdmin(false);
        }
      } finally {
        clearTimeout(timeout);
        if (!cancelled) setAdminLoading(false);
      }
    };

    doCheck();
    return () => { cancelled = true; };
  }, [user?.id, user?.email]);

  // Session initialization
  useEffect(() => {
    let cancelled = false;

    const loadSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (cancelled) return;
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      } catch (error) {
        if (!cancelled) {
          console.error("Session load failed:", error);
          setSession(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (cancelled) return;

        // On sign out, clear everything immediately
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setAdminLoading(false);
          adminCheckRef.current = null;
          setLoading(false);
          return;
        }

        // If refresh failed and there's no session, force clean signOut
        if (event === 'TOKEN_REFRESHED' && !newSession) {
          await supabase.auth.signOut();
          return;
        }

        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
      }
    );

    // Re-check session when tab regains focus (catches expired JWT after sleep)
    const handleFocus = async () => {
      if (cancelled) return;
      const { data: { session: s }, error } = await supabase.auth.getSession();
      if (error || !s) {
        // Session expired or invalid — force re-login
        await supabase.auth.signOut();
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Session validation interval (only for non-admin users)
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
        // Silently fail - don't block user on network errors
      }
    };

    const interval = setInterval(checkSession, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [session, isAdmin]);

  const login = useCallback(async (email: string, password: string) => {
    setBlocked(false);
    setBlockMessage(null);
    loginRegistered.current = false;
    adminCheckRef.current = null;

    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const msg = error.message?.toLowerCase() || '';
      if (msg.includes('invalid login') || msg.includes('invalid_credentials')) {
        return { error: "E-mail ou senha incorretos. Verifique seus dados e tente novamente." };
      }
      if (msg.includes('email not confirmed')) {
        return { error: "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada." };
      }
      if (msg.includes('user not found')) {
        return { error: "Nenhuma conta encontrada com este e-mail." };
      }
      return { error: "Não foi possível acessar. Verifique seu e-mail e senha e tente novamente." };
    }

    if (!authData.user?.id) {
      return { error: "Erro inesperado ao autenticar. Tente novamente." };
    }

    // Server-side admin check
    try {
      const adminResult = await checkIsAdmin();
      if (adminResult.isAdmin) {
        setIsAdmin(true);
        adminCheckRef.current = authData.user.id;
        loginRegistered.current = true;
        return { error: null };
      }
    } catch (err) {
      console.error("Admin check during login failed:", err);
      // Fall through to normal user flow
    }

    // Register login with security checks (non-admin only)
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
      // Don't block login on security check failure
      loginRegistered.current = true;
    }

    return { error: null };
  }, []);

  const logout = useCallback(async () => {
    setBlocked(false);
    setBlockMessage(null);
    setIsAdmin(false);
    adminCheckRef.current = null;
    loginRegistered.current = false;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('paz-session-token');
    }
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
