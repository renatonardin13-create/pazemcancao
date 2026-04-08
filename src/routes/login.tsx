import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Music, Mail, Lock, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
      {/* Atmospheric background layers */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-gold)/0.06,transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,var(--color-gold)/0.04,transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary)/0.03,transparent_40%)]" />

      {/* Subtle noise texture feel */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }} />

      <div className="flex flex-1 relative z-10">
        {/* Left — decorative panel */}
        <div className="hidden lg:flex lg:w-[45%] relative items-center justify-center overflow-hidden">
          {/* Deep card background with gold atmosphere */}
          <div className="absolute inset-0 bg-card/50" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-gold)/0.10,transparent_70%)]" />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background/80 to-transparent" />

          {/* Decorative floating orbs */}
          <div className="absolute top-20 left-16 h-32 w-32 rounded-full bg-gold/[0.04] blur-3xl animate-pulse" />
          <div className="absolute bottom-32 right-12 h-40 w-40 rounded-full bg-gold/[0.03] blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

          {/* Vertical golden line accent */}
          <div className="absolute right-0 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-gold/20 to-transparent" />

          <div className="relative z-10 max-w-sm text-center px-10 animate-in fade-in slide-in-from-left-6 duration-700">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10 shadow-xl shadow-gold/10">
              <Music className="h-9 w-9 text-gold" />
            </div>

            <h2 className="font-display text-4xl font-bold text-foreground tracking-tight">
              Paz em Canção
            </h2>
            <div className="mx-auto mt-4 h-px w-16 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            <p className="mt-4 text-sm font-medium text-gold/80 tracking-wide">
              30 Louvores Inéditos que Tocam a Alma
            </p>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground/80">
              Sua biblioteca espiritual privada com louvores preparados para
              trazer paz, cura e presença de Deus.
            </p>

            {/* Testimonial-style element */}
            <div className="mt-10 rounded-xl border border-gold/10 bg-gold/[0.03] backdrop-blur-sm p-5">
              <p className="text-xs italic text-muted-foreground/70 leading-relaxed">
                "Essas canções se tornaram meu refúgio nos dias mais difíceis.
                É como se cada louvor tivesse sido escrito para mim."
              </p>
              <div className="mt-3 flex items-center justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Sparkles key={s} className="h-3 w-3 text-gold/60" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right — login form */}
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Mobile logo */}
            <div className="lg:hidden mb-12 text-center">
              <div className="mx-auto mb-5 flex h-18 w-18 items-center justify-center rounded-2xl bg-gold/10 border border-gold/20 shadow-lg shadow-gold/10">
                <Music className="h-8 w-8 text-gold" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
                Paz em Canção
              </h1>
              <div className="mx-auto mt-3 h-px w-12 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
              <p className="mt-3 text-xs text-muted-foreground/70">
                Sua biblioteca espiritual privada
              </p>
            </div>

            {/* Login card */}
            <div className="rounded-3xl border border-border/60 bg-card/50 backdrop-blur-md p-7 sm:p-9 shadow-2xl shadow-black/20 relative overflow-hidden">
              {/* Subtle gold glow on card */}
              <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gold/[0.06] blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-gold/[0.04] blur-3xl" />

              <div className="relative z-10">
                <div className="mb-7">
                  <h2 className="text-2xl font-bold text-foreground font-display tracking-tight">
                    Acesse sua área exclusiva
                  </h2>
                  <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
                    Entre com o e-mail usado na sua compra para acessar seus louvores.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3.5 text-sm text-destructive animate-in fade-in slide-in-from-top-2 duration-300">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                      E-mail
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-11 h-12 bg-background/60 border-border/60 rounded-xl text-sm placeholder:text-muted-foreground/40 focus-visible:ring-gold/40 focus-visible:border-gold/30 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                      Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-11 h-12 bg-background/60 border-border/60 rounded-xl text-sm placeholder:text-muted-foreground/40 focus-visible:ring-gold/40 focus-visible:border-gold/30 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full gap-2.5 rounded-xl h-12 font-bold text-sm uppercase tracking-wider bg-gold text-gold-foreground hover:brightness-110 shadow-lg shadow-gold/20 transition-all duration-300 active:scale-[0.98]"
                  >
                    {loading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gold-foreground/30 border-t-gold-foreground" />
                    ) : (
                      <>
                        Entrar na Minha Área
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-muted-foreground/50">
                  <ShieldCheck className="h-3.5 w-3.5 text-gold/50" />
                  Acesso individual, seguro e protegido
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-[11px] text-muted-foreground/40">
              Problemas com o acesso?{" "}
              <a href="mailto:suporte@pazemcancao.com" className="text-gold/60 hover:text-gold transition-colors underline underline-offset-2">
                Fale conosco
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 py-4 text-center">
        <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground/40">
          <Link to="/termos" className="hover:text-muted-foreground/60 transition-colors">Termos de Uso</Link>
          <span className="text-border">·</span>
          <Link to="/privacidade" className="hover:text-muted-foreground/60 transition-colors">Privacidade</Link>
          <span className="text-border">·</span>
          <span>© {new Date().getFullYear()} Paz em Canção</span>
        </div>
      </footer>
    </div>
  );
}
