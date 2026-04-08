import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate({ to: "/downloads" });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_35%_at_50%_20%,var(--color-gold)/0.03,transparent_70%)]" />
      <div className="pointer-events-none absolute top-[10%] left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-gold/[0.015] blur-[150px] animate-breathe" />

      <div className="flex flex-1 relative z-10">
        {/* Left panel */}
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

        {/* Login form */}
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-[360px] animate-in fade-in slide-in-from-bottom-8 duration-1000">
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

                <form onSubmit={handleSubmit} className="space-y-6">
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

                <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-muted-foreground/30">
                  <ShieldCheck className="h-3 w-3 text-gold/25" />
                  Acesso seguro e exclusivo
                </div>
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
