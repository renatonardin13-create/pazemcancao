import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import productBox from "@/assets/product-box.png";
import { Mail, Lock, ArrowRight, ShieldCheck, KeyRound, ArrowLeft, CheckCircle, ShieldAlert, Music, User, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { requestFirstAccess } from "@/lib/first-access.functions";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

type View = "login" | "signup" | "reset" | "reset-sent" | "new-password" | "success";

function LoginPage() {
  const area = null;
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading, blocked, blockMessage } = useAuth();
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Signup fields
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated && view !== "success") {
      navigate({ to: "/cursos" });
    }
  }, [isAuthenticated, authLoading, navigate, view]);

  // Check for recovery token in URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      setView("new-password");
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          setView("new-password");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });

      if (result.error) {
        setError("Não foi possível entrar com Google. Tente novamente.");
        setLoading(false);
        return;
      }

      if (result.redirected) {
        return;
      }

      setView("success");
      setLoading(false);
      setTimeout(() => {
        navigate({ to: "/cursos" });
      }, 2000);
    } catch {
      setError("Erro ao conectar com Google. Tente novamente.");
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setView("success");
      setLoading(false);
      setTimeout(() => {
        navigate({ to: "/cursos" });
      }, 2000);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (signupPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (signupPassword !== signupConfirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (!acceptTerms) {
      setError("Você precisa aceitar os termos de uso para continuar.");
      return;
    }

    setLoading(true);

    const { error: signupError } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: { full_name: signupName },
      },
    });

    if (signupError) {
      setError(signupError.message === "User already registered"
        ? "Este e-mail já está cadastrado. Tente fazer login."
        : "Não foi possível criar sua conta. Tente novamente.");
      setLoading(false);
      return;
    }

    setSuccessMsg("Conta criada! Verifique seu e-mail para confirmar o cadastro.");
    setLoading(false);
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await requestFirstAccess({ data: { email } });
      if (result.success) {
        setView("reset-sent");
      } else {
        setError(result.message);
      }
    } catch {
      setError("Não foi possível processar sua solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError("Não foi possível atualizar sua senha. Tente novamente.");
      setLoading(false);
      return;
    }

    setSuccessMsg("Senha definida com sucesso!");
    setLoading(false);

    setTimeout(() => {
      navigate({ to: "/cursos" });
    }, 1500);
  };

  const googleButton = (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 rounded-xl h-12 text-[12px] font-semibold tracking-wider bg-background/60 border border-border/40 text-foreground/80 hover:bg-background/80 hover:border-border/60 transition-all duration-500 active:scale-[0.98] disabled:opacity-40"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      Continuar com Google
    </button>
  );

  const divider = (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-border/20" />
      <span className="text-xs text-muted-foreground/70 uppercase tracking-widest">ou</span>
      <div className="flex-1 h-px bg-border/20" />
    </div>
  );

  // ═══ BLOCKED STATE ═══
  if (blocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_35%_at_50%_20%,var(--color-gold)/0.03,transparent_70%)]" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[400px]"
        >
          <div className="rounded-3xl border border-border/40 bg-card/20 backdrop-blur-md p-10 text-center relative overflow-hidden">
            <div className="pointer-events-none absolute -top-28 -right-28 h-56 w-56 rounded-full bg-destructive/[0.03] blur-[80px]" />
            
            <div className="relative z-10">
              <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/[0.06] border border-destructive/10">
                <ShieldAlert className="h-7 w-7 text-destructive/70" />
              </div>
              
              <h2 className="text-xl font-bold text-foreground font-display tracking-tight mb-4">
                Acesso não autorizado detectado
              </h2>
              
              <p className="text-[14px] text-muted-foreground/70 leading-[2] font-light mb-3">
                {blockMessage || 'Esta conta está vinculada ao comprador original. Se você é o titular da compra, tente novamente no dispositivo autorizado.'}
              </p>
              
              <div className="mx-auto my-7 h-px w-16 bg-gradient-to-r from-transparent via-border/20 to-transparent" />
              
              <p className="text-[12px] text-muted-foreground/50 leading-[1.8] mb-8">
                Se acredita que houve um engano, entre em contato com nosso suporte.
              </p>
              
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 text-[12px] text-gold/70 hover:text-gold/70 transition-colors duration-500 underline underline-offset-4 decoration-gold/15 hover:decoration-gold/30"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Tentar novamente
                </button>

                <a
                  href={`https://wa.me/5517988308037?text=${encodeURIComponent('Olá, preciso de ajuda para acessar o Paz em Canção')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 text-emerald-400/70 border border-emerald-500/15 px-5 py-2.5 text-xs font-semibold tracking-wider uppercase hover:bg-emerald-500/20 hover:text-emerald-400/90 transition-all duration-500"
                >
                  Falar com Suporte
                </a>
              </div>
            </div>
          </div>
          
          <p className="mt-6 text-center text-xs text-muted-foreground/50">
            Suporte: (17) 98830-8037
          </p>
        </motion.div>
      </div>
    );
  }

  // ═══ SUCCESS TRANSITION SCREEN ═══
  if (view === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_35%_at_50%_20%,var(--color-gold)/0.06,transparent_70%)]" />
        <div className="pointer-events-none absolute top-[10%] left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-gold/[0.025] blur-[200px] animate-breathe" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center px-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mb-10 flex h-20 w-20 items-center justify-center rounded-full bg-gold/[0.08] border border-gold/15"
          >
            <Music className="h-8 w-8 text-gold/70" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-4">
              Acesso liberado
            </h2>
            <p className="text-[15px] text-muted-foreground/70 leading-[2] font-light">
              Preparando seus louvores…
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-10"
          >
            <div className="h-0.5 w-16 mx-auto rounded-full bg-gold/20 overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                className="h-full w-1/2 bg-gold/50 rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const leftPanel = (
    <div className="hidden lg:flex lg:w-[45%] relative items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-card/20" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-gold)/0.04,transparent_70%)]" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
      <div className="absolute right-0 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-gold/10 to-transparent" />

      <div className="relative z-10 flex items-center justify-center px-10 animate-in fade-in slide-in-from-left-4 duration-700">
        <img
          src={productBox}
          alt="Paz em Canção — Coleção Exclusiva com 30 Louvores Inéditos"
          className="max-h-[70vh] w-auto object-contain drop-shadow-[0_0_40px_rgba(212,175,55,0.15)]"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_35%_at_50%_20%,var(--color-gold)/0.06,transparent_70%)]" />
      <div className="pointer-events-none absolute top-[10%] left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-gold/[0.03] blur-[150px] animate-breathe" />

      <div className="flex flex-1 relative z-10">
        {leftPanel}

        <div className="flex flex-1 lg:flex-[1.2] items-center justify-center px-6 py-6 sm:py-12">
          <div className="w-full max-w-[420px] sm:max-w-[480px] lg:max-w-[600px] lg:min-w-[500px] animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Mobile header */}
            <div className="lg:hidden mb-6 sm:mb-10 text-center">
              <div className="mx-auto mb-5 w-px h-8 bg-gradient-to-b from-transparent via-gold/15 to-transparent" />
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Paz em Canção
              </h1>
              <div className="mx-auto mt-3 h-px w-10 bg-gradient-to-r from-transparent via-gold/12 to-transparent" />
              <p className="mt-3 text-xs text-muted-foreground/60 tracking-[0.3em] uppercase">
                Sua biblioteca espiritual
              </p>
            </div>

            <div className="rounded-3xl border border-primary/20 bg-card p-7 sm:p-10 lg:p-14 relative overflow-hidden shadow-[0_8px_60px_-12px_rgba(0,0,0,0.6)]">
              <div className="pointer-events-none absolute -top-28 -right-28 h-56 w-56 rounded-full bg-gold/[0.04] blur-[80px]" />

              <div className="relative z-10">
                <AnimatePresence mode="wait" initial={false}>
                  {/* ═══ LOGIN VIEW ═══ */}
                  {view === "login" && (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="mb-9">
                        <h2 className="text-3xl font-bold text-foreground font-display tracking-tight">
                          Bem-vindo de volta
                        </h2>
                        <p className="mt-3 text-[15px] text-muted-foreground/70 leading-[1.8]">
                          Entre com suas credenciais para continuar
                        </p>
                        <p className="mt-3 text-[13px] text-muted-foreground/50 leading-[1.7] text-center">
                          Use o e-mail da sua compra na Kiwify. Se é o seu primeiro acesso,
                          clique em{' '}
                          <button
                            type="button"
                            onClick={() => { setView("reset"); setError(""); }}
                            className="text-gold/60 hover:text-gold/80 underline underline-offset-2 decoration-gold/20 hover:decoration-gold/40 transition-colors duration-300"
                          >
                            Esqueceu sua senha?
                          </button>{' '}
                          para criar sua senha de acesso.
                        </p>
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-6 rounded-xl border border-destructive/10 bg-destructive/5 px-4 py-3.5 text-[13px] text-destructive/80 leading-[1.7]"
                        >
                          {error}
                        </motion.div>
                      )}

                      <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-3">
                          <Label htmlFor="email" className="text-[12px] font-medium uppercase tracking-[0.3em] text-muted-foreground/60">
                            E-mail
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="seu@email.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-12 h-14 bg-background/60 border-border/40 rounded-xl text-base placeholder:text-muted-foreground/70 focus-visible:ring-gold/20 focus-visible:border-gold/15 transition-all duration-500"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="password" className="text-[12px] font-medium uppercase tracking-[0.3em] text-muted-foreground/60">
                            Senha
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                            <Input
                              id="password"
                              type="password"
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pl-12 h-14 bg-background/60 border-border/40 rounded-xl text-base placeholder:text-muted-foreground/70 focus-visible:ring-gold/20 focus-visible:border-gold/15 transition-all duration-500"
                              required
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full flex items-center justify-center gap-2.5 rounded-xl h-14 text-[15px] font-bold tracking-wider bg-gold text-background border border-gold/80 hover:bg-gold/90 transition-all duration-500 active:scale-[0.98] disabled:opacity-40"
                        >
                          {loading ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-background/20 border-t-background/50" />
                          ) : (
                            <>
                              Entrar
                            </>
                          )}
                        </button>
                      </form>

                      <div className="mt-6 text-center">
                        <button
                          onClick={() => { setView("reset"); setError(""); }}
                          className="text-[12px] text-gold/55 hover:text-gold/70 transition-colors duration-500 underline underline-offset-4 decoration-gold/15 hover:decoration-gold/30"
                        >
                          Esqueceu sua senha?
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ═══ SIGNUP VIEW ═══ */}
                  {view === "signup" && (
                    <motion.div
                      key="signup"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="mb-7">
                        <h2 className="text-xl font-bold text-foreground font-display tracking-tight">
                          Criar conta
                        </h2>
                        <p className="mt-3 text-[13px] text-muted-foreground/70 leading-[1.8]">
                          Preencha os dados abaixo para se cadastrar.
                        </p>
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-6 rounded-xl border border-destructive/10 bg-destructive/5 px-4 py-3.5 text-[13px] text-destructive/80 leading-[1.7]"
                        >
                          {error}
                        </motion.div>
                      )}

                      {successMsg && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-6 rounded-xl border border-gold/15 bg-gold/5 px-4 py-3.5 text-[13px] text-gold/70 flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4 text-gold/70 shrink-0" />
                          {successMsg}
                        </motion.div>
                      )}

                      {!successMsg && (
                        <>
                          {googleButton}
                          {divider}

                          <form onSubmit={handleSignup} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="signup-name" className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground/60">
                                Nome completo
                              </Label>
                              <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                                <Input
                                  id="signup-name"
                                  type="text"
                                  placeholder="Seu nome"
                                  value={signupName}
                                  onChange={(e) => setSignupName(e.target.value)}
                                  className="pl-11 h-12 bg-background/60 border-border/40 rounded-xl text-sm placeholder:text-muted-foreground/70 focus-visible:ring-gold/20 focus-visible:border-gold/15 transition-all duration-500"
                                  required
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="signup-email" className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground/60">
                                E-mail
                              </Label>
                              <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                                <Input
                                  id="signup-email"
                                  type="email"
                                  placeholder="seu@email.com"
                                  value={signupEmail}
                                  onChange={(e) => setSignupEmail(e.target.value)}
                                  className="pl-11 h-12 bg-background/60 border-border/40 rounded-xl text-sm placeholder:text-muted-foreground/70 focus-visible:ring-gold/20 focus-visible:border-gold/15 transition-all duration-500"
                                  required
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="signup-password" className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground/60">
                                Senha
                              </Label>
                              <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                                <Input
                                  id="signup-password"
                                  type="password"
                                  placeholder="Mínimo 6 caracteres"
                                  value={signupPassword}
                                  onChange={(e) => setSignupPassword(e.target.value)}
                                  className="pl-11 h-12 bg-background/60 border-border/40 rounded-xl text-sm placeholder:text-muted-foreground/70 focus-visible:ring-gold/20 focus-visible:border-gold/15 transition-all duration-500"
                                  required
                                  minLength={6}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="signup-confirm" className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground/60">
                                Confirmar senha
                              </Label>
                              <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                                <Input
                                  id="signup-confirm"
                                  type="password"
                                  placeholder="Repita a senha"
                                  value={signupConfirm}
                                  onChange={(e) => setSignupConfirm(e.target.value)}
                                  className="pl-11 h-12 bg-background/60 border-border/40 rounded-xl text-sm placeholder:text-muted-foreground/70 focus-visible:ring-gold/20 focus-visible:border-gold/15 transition-all duration-500"
                                  required
                                  minLength={6}
                                />
                              </div>
                            </div>

                            <div className="flex items-start gap-3 pt-1">
                              <Checkbox
                                id="terms"
                                checked={acceptTerms}
                                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                                className="mt-0.5 border-border/40 data-[state=checked]:bg-gold/20 data-[state=checked]:border-gold/30"
                              />
                              <label htmlFor="terms" className="text-xs text-muted-foreground/60 leading-[1.6] cursor-pointer">
                                Li e aceito os{" "}
                                <Link to="/termos" className="text-gold/55 underline underline-offset-2 hover:text-gold/70" target="_blank">
                                  Termos de Uso
                                </Link>{" "}
                                e a{" "}
                                <Link to="/privacidade" className="text-gold/55 underline underline-offset-2 hover:text-gold/70" target="_blank">
                                  Política de Privacidade
                                </Link>
                              </label>
                            </div>

                            <button
                              type="submit"
                              disabled={loading}
                              className="w-full flex items-center justify-center gap-2.5 rounded-xl h-12 text-[12px] font-semibold tracking-wider uppercase bg-gold/15 text-gold/70 border border-gold/12 hover:bg-gold/22 hover:text-gold/80 transition-all duration-500 active:scale-[0.98] disabled:opacity-40"
                            >
                              {loading ? (
                                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gold/20 border-t-gold/50" />
                              ) : (
                                <>
                                  Criar conta
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </>
                              )}
                            </button>
                          </form>
                        </>
                      )}

                      <div className="mt-6 text-center">
                        <button
                          onClick={() => { setView("login"); setError(""); setSuccessMsg(""); }}
                          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-muted-foreground/75 transition-colors duration-500"
                        >
                          <ArrowLeft className="h-3 w-3" />
                          Voltar ao login
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ═══ RESET REQUEST VIEW ═══ */}
                  {view === "reset" && (
                    <motion.div
                      key="reset"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="mb-9">
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-gold/[0.06] border border-gold/10">
                          <KeyRound className="h-5 w-5 text-gold/70" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground font-display tracking-tight">
                          Recuperar senha
                        </h2>
                        <p className="mt-3 text-[13px] text-muted-foreground/70 leading-[1.8]">
                          Digite seu e-mail. Enviaremos um link seguro para redefinir sua senha.
                        </p>
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-7 rounded-xl border border-destructive/10 bg-destructive/5 px-4 py-3.5 text-[13px] text-destructive/80 leading-[1.7]"
                        >
                          {error}
                        </motion.div>
                      )}

                      <form onSubmit={handleResetRequest} className="space-y-6">
                        <div className="space-y-2.5">
                          <Label htmlFor="reset-email" className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground/60">
                            E-mail
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                            <Input
                              id="reset-email"
                              type="email"
                              placeholder="seu@email.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-11 h-12 bg-background/60 border-border/40 rounded-xl text-sm placeholder:text-muted-foreground/70 focus-visible:ring-gold/20 focus-visible:border-gold/15 transition-all duration-500"
                              required
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full flex items-center justify-center gap-2.5 rounded-xl h-12 text-[12px] font-semibold tracking-wider uppercase bg-gold/15 text-gold/70 border border-gold/12 hover:bg-gold/22 hover:text-gold/80 transition-all duration-500 active:scale-[0.98] disabled:opacity-40"
                        >
                          {loading ? (
                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gold/20 border-t-gold/50" />
                          ) : (
                            <>
                              Enviar link de recuperação
                              <ArrowRight className="h-3.5 w-3.5" />
                            </>
                          )}
                        </button>
                      </form>

                      <div className="mt-7 text-center">
                        <button
                          onClick={() => { setView("login"); setError(""); }}
                          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-muted-foreground/75 transition-colors duration-500"
                        >
                          <ArrowLeft className="h-3 w-3" />
                          Voltar ao login
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ═══ RESET SENT VIEW ═══ */}
                  {view === "reset-sent" && (
                    <motion.div
                      key="reset-sent"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="text-center py-4"
                    >
                      <div className="mb-6 flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-gold/[0.08] border border-gold/15">
                        <CheckCircle className="h-6 w-6 text-gold/70" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground font-display tracking-tight mb-4">
                        Verifique seu e-mail
                      </h2>
                      <p className="text-[14px] text-muted-foreground/70 leading-[2] font-light mb-2">
                        Enviamos um link seguro para redefinir sua senha no e-mail <span className="text-foreground/90 font-medium">{email}</span>.
                      </p>
                      <p className="text-[12px] text-muted-foreground/50 leading-[1.8] mb-8">
                        Verifique também a pasta de spam.
                      </p>

                      <button
                        onClick={() => { setView("login"); setError(""); }}
                        className="inline-flex items-center gap-1.5 text-xs text-gold/55 hover:text-gold/70 transition-colors duration-500"
                      >
                        <ArrowLeft className="h-3 w-3" />
                        Voltar ao login
                      </button>
                    </motion.div>
                  )}

                  {/* ═══ NEW PASSWORD VIEW ═══ */}
                  {view === "new-password" && (
                    <motion.div
                      key="new-password"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="mb-9">
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-gold/[0.06] border border-gold/10">
                          <Lock className="h-5 w-5 text-gold/70" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground font-display tracking-tight">
                          Defina sua senha
                        </h2>
                        <p className="mt-3 text-[13px] text-muted-foreground/70 leading-[1.8]">
                          Escolha uma senha segura para acessar seu espaço de paz.
                        </p>
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-7 rounded-xl border border-destructive/10 bg-destructive/5 px-4 py-3.5 text-[13px] text-destructive/80 leading-[1.7]"
                        >
                          {error}
                        </motion.div>
                      )}

                      {successMsg && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-7 rounded-xl border border-gold/15 bg-gold/5 px-4 py-3.5 text-[13px] text-gold/70 flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4 text-gold/70 shrink-0" />
                          {successMsg}
                        </motion.div>
                      )}

                      <form onSubmit={handleNewPassword} className="space-y-6">
                        <div className="space-y-2.5">
                          <Label htmlFor="new-password" className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground/60">
                            Nova Senha
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                            <Input
                              id="new-password"
                              type="password"
                              placeholder="Mínimo 6 caracteres"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="pl-11 h-12 bg-background/60 border-border/40 rounded-xl text-sm placeholder:text-muted-foreground/70 focus-visible:ring-gold/20 focus-visible:border-gold/15 transition-all duration-500"
                              required
                              minLength={6}
                            />
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          <Label htmlFor="confirm-password" className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground/60">
                            Confirmar Senha
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                            <Input
                              id="confirm-password"
                              type="password"
                              placeholder="Repita a senha"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="pl-11 h-12 bg-background/60 border-border/40 rounded-xl text-sm placeholder:text-muted-foreground/70 focus-visible:ring-gold/20 focus-visible:border-gold/15 transition-all duration-500"
                              required
                              minLength={6}
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading || !!successMsg}
                          className="w-full flex items-center justify-center gap-2.5 rounded-xl h-12 text-[12px] font-semibold tracking-wider uppercase bg-gold/15 text-gold/70 border border-gold/12 hover:bg-gold/22 hover:text-gold/80 transition-all duration-500 active:scale-[0.98] disabled:opacity-40"
                        >
                          {loading ? (
                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gold/20 border-t-gold/50" />
                          ) : (
                            <>
                              Definir senha e entrar
                              <ArrowRight className="h-3.5 w-3.5" />
                            </>
                          )}
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <p className="mt-8 text-center text-xs text-muted-foreground/50">
              Precisa de ajuda?{" "}
              <a href="mailto:suporte@pazemcancao.com" className="text-gold/35 hover:text-gold/55 transition-colors duration-500 underline underline-offset-2">
                Fale conosco
              </a>
            </p>
          </div>
        </div>
      </div>

      <footer className="relative z-10 py-4 text-center">
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/50">
          <Link to="/termos" className="hover:text-muted-foreground/70 transition-colors duration-500">Termos</Link>
          <span className="text-border/30">·</span>
          <Link to="/privacidade" className="hover:text-muted-foreground/70 transition-colors duration-500">Privacidade</Link>
          <span className="text-border/30">·</span>
          <span>© {new Date().getFullYear()} Paz em Canção</span>
        </div>
      </footer>
    </div>
  );
}
