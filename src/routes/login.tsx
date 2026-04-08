import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
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
      {/* Deep atmospheric layers — night, silence, intimacy */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_20%,var(--color-gold)/0.045,transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_50%_at_75%_75%,var(--color-gold)/0.025,transparent_55%)]" />

      {/* Breathing orb — alive, warm */}
      <div className="pointer-events-none absolute top-[15%] left-[50%] -translate-x-1/2 h-96 w-96 rounded-full bg-gold/[0.025] blur-[120px] animate-breathe" />

      <div className="flex flex-1 relative z-10">
        {/* Left — contemplative panel */}
        <div className="hidden lg:flex lg:w-[45%] relative items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-card/30" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-gold)/0.06,transparent_70%)]" />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background to-transparent" />

          {/* Vertical light accent */}
          <div className="absolute right-0 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-gold/15 to-transparent" />

          {/* Breathing orbs */}
          <div className="absolute top-24 left-20 h-28 w-28 rounded-full bg-gold/[0.03] blur-3xl animate-breathe" />
          <div className="absolute bottom-28 right-16 h-36 w-36 rounded-full bg-gold/[0.02] blur-3xl animate-breathe" style={{ animationDelay: '3s' }} />

          <div className="relative z-10 max-w-xs text-center px-10 animate-in fade-in slide-in-from-left-8 duration-1000">
            {/* Spiritual mark — vertical line */}
            <div className="mx-auto mb-10 w-px h-14 bg-gradient-to-b from-transparent via-gold/25 to-transparent" />

            <h2 className="font-display text-4xl font-bold text-foreground tracking-tight leading-[1.1]">
              Paz em<br />Canção
            </h2>

            <div className="mx-auto mt-5 h-px w-12 bg-gradient-to-r from-transparent via-gold/25 to-transparent" />

            <p className="mt-5 text-[13px] font-medium text-gold/50 tracking-widest uppercase">
              30 Louvores Inéditos
            </p>

            <p className="mt-8 text-sm leading-[1.9] text-muted-foreground/60">
              Canções criadas para os momentos em que a alma
              precisa de silêncio, refúgio e presença.
            </p>

            {/* Testimonial */}
            <div className="mt-12 rounded-2xl border border-gold/8 bg-gold/[0.02] p-6">
              <p className="text-[13px] italic text-muted-foreground/50 leading-[1.8]">
                "Essas canções se tornaram meu refúgio nos dias
                mais difíceis. É como se cada louvor tivesse
                sido escrito para mim."
              </p>
              <div className="mt-4 h-px w-8 mx-auto bg-gold/15" />
            </div>
          </div>
        </div>

        {/* Right — login form */}
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-[380px] animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Mobile header */}
            <div className="lg:hidden mb-14 text-center">
              <div className="mx-auto mb-8 w-px h-10 bg-gradient-to-b from-transparent via-gold/25 to-transparent" />
              <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
                Paz em Canção
              </h1>
              <div className="mx-auto mt-4 h-px w-10 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
              <p className="mt-4 text-xs text-muted-foreground/45 tracking-widest uppercase">
                Sua biblioteca espiritual
              </p>
            </div>

            {/* Login card */}
            <div className="rounded-3xl border border-border/40 bg-card/30 backdrop-blur-md p-8 sm:p-10 shadow-2xl shadow-black/30 relative overflow-hidden">
              {/* Subtle warm glow */}
              <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gold/[0.035] blur-[60px]" />

              <div className="relative z-10">
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-foreground font-display tracking-tight">
                    Acesse sua área exclusiva
                  </h2>
                  <p className="mt-3 text-sm text-muted-foreground/55 leading-relaxed">
                    Entre com o e-mail usado na sua compra.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 rounded-xl border border-destructive/15 bg-destructive/8 px-4 py-3.5 text-sm text-destructive/90 animate-in fade-in slide-in-from-top-2 duration-300">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
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
                        className="pl-11 h-12 bg-background/50 border-border/40 rounded-xl text-sm placeholder:text-muted-foreground/25 focus-visible:ring-gold/30 focus-visible:border-gold/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
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
                        className="pl-11 h-12 bg-background/50 border-border/40 rounded-xl text-sm placeholder:text-muted-foreground/25 focus-visible:ring-gold/30 focus-visible:border-gold/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full gap-2.5 rounded-xl h-12 font-bold text-sm tracking-wider bg-gold/90 text-gold-foreground hover:bg-gold shadow-xl shadow-gold/12 transition-all duration-500 active:scale-[0.98]"
                  >
                    {loading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gold-foreground/30 border-t-gold-foreground" />
                    ) : (
                      <>
                        Entrar
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-7 flex items-center justify-center gap-2 text-[10px] text-muted-foreground/35">
                  <ShieldCheck className="h-3.5 w-3.5 text-gold/30" />
                  Acesso individual, seguro e protegido
                </div>
              </div>
            </div>

            <p className="mt-7 text-center text-[10px] text-muted-foreground/30">
              Problemas com o acesso?{" "}
              <a href="mailto:suporte@pazemcancao.com" className="text-gold/40 hover:text-gold/60 transition-colors underline underline-offset-2">
                Fale conosco
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/20 py-4 text-center">
        <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground/30">
          <Link to="/termos" className="hover:text-muted-foreground/50 transition-colors">Termos de Uso</Link>
          <span className="text-border/50">·</span>
          <Link to="/privacidade" className="hover:text-muted-foreground/50 transition-colors">Privacidade</Link>
          <span className="text-border/50">·</span>
          <span>© {new Date().getFullYear()} Paz em Canção</span>
        </div>
      </footer>
    </div>
  );
}
