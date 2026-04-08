import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { generateFingerprint } from "@/lib/fingerprint";
import { registerLogin, validateSession } from "@/lib/security.functions";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  loading: boolean;
  blocked: boolean;
  blockMessage: string | null;
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
  const [blocked, setBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState<string | null>(null);
  const loginRegistered = useRef(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Session validation interval — check every 2 minutes
  useEffect(() => {
    if (!session || typeof window === 'undefined') return;

    const checkSession = async () => {
      try {
        const sessionToken = getSessionToken();
        const result = await validateSession({ data: { sessionToken } });
        if (!result.valid) {
          // Session invalidated — another device logged in
          setBlocked(true);
          setBlockMessage(
            'Sua sessão foi encerrada porque um novo login foi detectado em outro dispositivo.'
          );
          await supabase.auth.signOut();
        }
      } catch {
        // Silently fail — don't block if validation check fails
      }
    };

    const interval = setInterval(checkSession, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [session]);

  const login = useCallback(async (email: string, password: string) => {
    setBlocked(false);
    setBlockMessage(null);
    loginRegistered.current = false;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: "Não foi possível acessar. Verifique seu e-mail e senha e tente novamente." };
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
      // Don't block login if security check fails — log and continue
      console.error('Security check failed:', err);
    }

    return { error: null };
  }, []);

  const logout = useCallback(async () => {
    setBlocked(false);
    setBlockMessage(null);
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
        blocked,
        blockMessage,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
