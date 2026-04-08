import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Music, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
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
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        {/* Left — decorative panel */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-card overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,var(--color-gold)/0.12,transparent_60%)]" />
          <div className="relative z-10 max-w-sm text-center px-8 animate-in fade-in slide-in-from-left-6 duration-700">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gold/20 bg-gold/10">
              <Music className="h-8 w-8 text-gold" />
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground">
              Paz em Canção
            </h2>
            <p className="mt-3 text-sm font-medium text-gold/80">
              30 Louvores Inéditos que Tocam a Alma
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Sua biblioteca espiritual privada com louvores preparados para
              trazer paz, cura e presença de Deus.
            </p>
          </div>
        </div>

        {/* Right — login form */}
        <div className="flex flex-1 items-center justify-center px-6 py-12 bg-background">
          <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Mobile logo */}
            <div className="lg:hidden mb-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 border border-gold/20">
                <Music className="h-7 w-7 text-gold" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Paz em Canção
              </h1>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground font-display">
                Acesse sua plataforma exclusiva
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Entre com o mesmo e-mail usado na sua compra para acessar seus louvores.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-in fade-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Digite seu e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-card border-border"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-card border-border"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full gap-2 rounded-full py-3 font-semibold text-base"
              >
                {loading ? "Entrando..." : "ENTRAR"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-gold" />
              Seu acesso é individual, seguro e protegido.
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Problemas com o acesso?{" "}
              <a href="mailto:suporte@pazemcancao.com" className="text-gold underline">
                Fale conosco
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 py-4 text-center">
        <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground/50">
          <Link to="/termos" className="hover:text-muted-foreground transition-colors">Termos de Uso</Link>
          <span>·</span>
          <Link to="/privacidade" className="hover:text-muted-foreground transition-colors">Privacidade</Link>
          <span>·</span>
          <span>© {new Date().getFullYear()} Paz em Canção</span>
        </div>
      </footer>
    </div>
  );
}
