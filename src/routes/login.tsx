import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Mail, Lock, ArrowRight, ShieldCheck, KeyRound, ArrowLeft, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { requestFirstAccess } from "@/lib/first-access.functions";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

type View = "login" | "reset" | "reset-sent" | "new-password";

function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate({ to: "/downloads" });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Check for recovery token in URL hash (Supabase sends #access_token=...)
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    }
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

    // Redirect to downloads after short delay
    setTimeout(() => {
      navigate({ to: "/downloads" });
    }, 1500);
  };

  const leftPanel = (
    <div className="hidden lg:flex lg:w-[45%] relative items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-card/20" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-gold)/0.04,transparent_70%)]" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
      <div className="absolute right-0 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-gold/10 to-transparent" />

      <div className="relative z-10 max-w-xs text-center px-10 animate-in fade-in slide-in-from-left-8 duration-[1200ms]">
        <div className="mx-auto mb-12 w-px h-16 bg-gradient-to-b from-transparent via-gold/15 to-transparent" />

        <h2 className="font-display text-4xl font-bold text-foreground/90 tracking-tight leading-[1.08]">
          Seu espaço<br />de paz
        </h2>

        <div className="mx-auto mt-6 h-px w-12 bg-gradient-to-r from-transparent via-gold/12 to-transparent" />

        <p className="mt-6 text-[11px] font-medium text-gold/40 tracking-[0.3em] uppercase">
          30 Louvores Inéditos
        </p>

        <p className="mt-10 text-[14px] leading-[2.2] text-muted-foreground/50 font-light">
          Um refúgio sonoro para momentos de oração,
          quietude e renovação espiritual.
        </p>

        <div className="mt-14 py-6">
          <p className="text-[13px] italic text-muted-foreground/45 leading-[2]">
            "Essas canções se tornaram parte
            da minha rotina de oração."
          </p>
          <div className="mt-5 h-px w-6 mx-auto bg-gold/10" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_35%_at_50%_20%,var(--color-gold)/0.03,transparent_70%)]" />
      <div className="pointer-events-none absolute top-[10%] left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-gold/[0.015] blur-[150px] animate-breathe" />

      <div className="flex flex-1 relative z-10">
        {leftPanel}

        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-[360px] animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Mobile header */}
            <div className="lg:hidden mb-16 text-center">
              <div className="mx-auto mb-10 w-px h-14 bg-gradient-to-b from-transparent via-gold/15 to-transparent" />
              <h1 className="font-display text-3xl font-bold text-foreground/90 tracking-tight">
                Paz em Canção
              </h1>
              <div className="mx-auto mt-5 h-px w-10 bg-gradient-to-r from-transparent via-gold/12 to-transparent" />
              <p className="mt-5 text-[11px] text-muted-foreground/40 tracking-[0.3em] uppercase">
                Sua biblioteca espiritual
              </p>
            </div>

            <div className="rounded-3xl border border-border/25 bg-card/20 backdrop-blur-md p-8 sm:p-10 relative overflow-hidden">
              <div className="pointer-events-none absolute -top-28 -right-28 h-56 w-56 rounded-full bg-gold/[0.02] blur-[80px]" />

              <div className="relative z-10">
                {/* ═══ LOGIN VIEW ═══ */}
                {view === "login" && (
                  <>
                    <div className="mb-9">
                      <h2 className="text-xl font-bold text-foreground/85 font-display tracking-tight">
                        Acesse seu espaço
                      </h2>
                      <p className="mt-3 text-[13px] text-muted-foreground/50 leading-[1.8]">
                        Use o e-mail da sua compra para entrar.
                      </p>
                    </div>

                    {error && (
                      <div className="mb-7 rounded-xl border border-destructive/10 bg-destructive/5 px-4 py-3 text-[13px] text-destructive/70 animate-in fade-in duration-300">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                      <div className="space-y-2.5">
                        <Label htmlFor="email" className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground/40">
                          E-mail
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-11 h-12 bg-background/40 border-border/25 rounded-xl text-sm placeholder:text-muted-foreground/20 focus-visible:ring-gold/20 focus-visible:border-gold/15 transition-all duration-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <Label htmlFor="password" className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground/40">
                          Senha
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
                          <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-11 h-12 bg-background/40 border-border/25 rounded-xl text-sm placeholder:text-muted-foreground/20 focus-visible:ring-gold/20 focus-visible:border-gold/15 transition-all duration-500"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2.5 rounded-xl h-12 text-[12px] font-semibold tracking-wider uppercase bg-gold/15 text-gold/65 border border-gold/12 hover:bg-gold/22 hover:text-gold/80 transition-all duration-500 active:scale-[0.98] disabled:opacity-40"
                      >
                        {loading ? (
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gold/20 border-t-gold/50" />
                        ) : (
                          <>
                            Entrar
                            <ArrowRight className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>
                    </form>

                    {/* First access / forgot password link */}
                    <div className="mt-7 text-center">
                      <button
                        onClick={() => { setView("reset"); setError(""); }}
                        className="text-[12px] text-gold/40 hover:text-gold/65 transition-colors duration-500 underline underline-offset-4 decoration-gold/15 hover:decoration-gold/30"
                      >
                        Primeiro acesso ou esqueceu sua senha?
                      </button>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-muted-foreground/30">
                      <ShieldCheck className="h-3 w-3 text-gold/25" />
                      Acesso seguro e exclusivo
                    </div>
                  </>
                )}

                {/* ═══ RESET REQUEST VIEW ═══ */}
                {view === "reset" && (
                  <>
                    <div className="mb-9">
                      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-gold/[0.06] border border-gold/10">
                        <KeyRound className="h-5 w-5 text-gold/50" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground/85 font-display tracking-tight">
                        Primeiro acesso
                      </h2>
                      <p className="mt-3 text-[13px] text-muted-foreground/50 leading-[1.8]">
                        Digite o e-mail da sua compra. Enviaremos um link seguro para você definir sua senha.
                      </p>
                    </div>

                    {error && (
                      <div className="mb-7 rounded-xl border border-destructive/10 bg-destructive/5 px-4 py-3 text-[13px] text-destructive/70 animate-in fade-in duration-300">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleResetRequest} className="space-y-6">
                      <div className="space-y-2.5">
                        <Label htmlFor="reset-email" className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground/40">
                          E-mail da compra
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-11 h-12 bg-background/40 border-border/25 rounded-xl text-sm placeholder:text-muted-foreground/20 focus-visible:ring-gold/20 focus-visible:border-gold/15 transition-all duration-500"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2.5 rounded-xl h-12 text-[12px] font-semibold tracking-wider uppercase bg-gold/15 text-gold/65 border border-gold/12 hover:bg-gold/22 hover:text-gold/80 transition-all duration-500 active:scale-[0.98] disabled:opacity-40"
                      >
                        {loading ? (
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gold/20 border-t-gold/50" />
                        ) : (
                          <>
                            Enviar link de acesso
                            <ArrowRight className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>
                    </form>

                    <div className="mt-7 text-center">
                      <button
                        onClick={() => { setView("login"); setError(""); }}
                        className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/35 hover:text-muted-foreground/55 transition-colors duration-500"
                      >
                        <ArrowLeft className="h-3 w-3" />
                        Voltar ao login
                      </button>
                    </div>
                  </>
                )}

                {/* ═══ RESET SENT VIEW ═══ */}
                {view === "reset-sent" && (
                  <div className="text-center py-4">
                    <div className="mb-6 flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-gold/[0.08] border border-gold/15">
                      <CheckCircle className="h-6 w-6 text-gold/60" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground/85 font-display tracking-tight mb-4">
                      Verifique seu e-mail
                    </h2>
                    <p className="text-[14px] text-muted-foreground/50 leading-[2] font-light mb-2">
                      Se o e-mail <span className="text-foreground/70 font-medium">{email}</span> estiver vinculado a uma compra aprovada, você receberá um link para definir sua senha.
                    </p>
                    <p className="text-[12px] text-muted-foreground/35 leading-[1.8] mb-8">
                      Verifique também a pasta de spam.
                    </p>

                    <button
                      onClick={() => { setView("login"); setError(""); }}
                      className="inline-flex items-center gap-1.5 text-[11px] text-gold/40 hover:text-gold/60 transition-colors duration-500"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      Voltar ao login
                    </button>
                  </div>
                )}

                {/* ═══ NEW PASSWORD VIEW ═══ */}
                {view === "new-password" && (
                  <>
                    <div className="mb-9">
                      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-gold/[0.06] border border-gold/10">
                        <Lock className="h-5 w-5 text-gold/50" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground/85 font-display tracking-tight">
                        Defina sua senha
                      </h2>
                      <p className="mt-3 text-[13px] text-muted-foreground/50 leading-[1.8]">
                        Escolha uma senha segura para acessar seu espaço de paz.
                      </p>
                    </div>

                    {error && (
                      <div className="mb-7 rounded-xl border border-destructive/10 bg-destructive/5 px-4 py-3 text-[13px] text-destructive/70 animate-in fade-in duration-300">
                        {error}
                      </div>
                    )}

                    {successMsg && (
                      <div className="mb-7 rounded-xl border border-gold/15 bg-gold/5 px-4 py-3 text-[13px] text-gold/70 animate-in fade-in duration-300 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-gold/50" />
                        {successMsg}
                      </div>
                    )}

                    <form onSubmit={handleNewPassword} className="space-y-6">
                      <div className="space-y-2.5">
                        <Label htmlFor="new-password" className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground/40">
                          Nova Senha
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
                          <Input
                            id="new-password"
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="pl-11 h-12 bg-background/40 border-border/25 rounded-xl text-sm placeholder:text-muted-foreground/20 focus-visible:ring-gold/20 focus-visible:border-gold/15 transition-all duration-500"
                            required
                            minLength={6}
                          />
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <Label htmlFor="confirm-password" className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground/40">
                          Confirmar Senha
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
                          <Input
                            id="confirm-password"
                            type="password"
                            placeholder="Repita a senha"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-11 h-12 bg-background/40 border-border/25 rounded-xl text-sm placeholder:text-muted-foreground/20 focus-visible:ring-gold/20 focus-visible:border-gold/15 transition-all duration-500"
                            required
                            minLength={6}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !!successMsg}
                        className="w-full flex items-center justify-center gap-2.5 rounded-xl h-12 text-[12px] font-semibold tracking-wider uppercase bg-gold/15 text-gold/65 border border-gold/12 hover:bg-gold/22 hover:text-gold/80 transition-all duration-500 active:scale-[0.98] disabled:opacity-40"
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
                  </>
                )}
              </div>
            </div>

            <p className="mt-8 text-center text-[10px] text-muted-foreground/30">
              Precisa de ajuda?{" "}
              <a href="mailto:suporte@pazemcancao.com" className="text-gold/35 hover:text-gold/55 transition-colors duration-500 underline underline-offset-2">
                Fale conosco
              </a>
            </p>
          </div>
        </div>
      </div>

      <footer className="relative z-10 py-4 text-center">
        <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground/30">
          <Link to="/termos" className="hover:text-muted-foreground/50 transition-colors duration-500">Termos</Link>
          <span className="text-border/30">·</span>
          <Link to="/privacidade" className="hover:text-muted-foreground/50 transition-colors duration-500">Privacidade</Link>
          <span className="text-border/30">·</span>
          <span>© {new Date().getFullYear()} Paz em Canção</span>
        </div>
      </footer>
    </div>
  );
}
