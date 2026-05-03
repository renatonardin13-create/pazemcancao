import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Mail, Lock, Music } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";

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
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate({ to: "/downloads" });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        navigate({ to: "/downloads" });
      }, 1500);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-in fade-in zoom-in duration-500">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gold/10 border border-gold/20">
            <Music className="h-8 w-8 text-gold" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Acesso Liberado</h2>
          <p className="text-muted-foreground">Preparando seus louvores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl font-bold text-gold mb-2">Paz em Canção</h1>
            <p className="text-muted-foreground text-sm uppercase tracking-[0.2em]">Biblioteca Espiritual Privada</p>
          </div>

          <div className="bg-card border border-border/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
            <h2 className="text-2xl font-bold mb-2">Acesse sua plataforma</h2>
            <p className="text-muted-foreground text-sm mb-8">Entre com o e-mail da sua compra para acessar seus louvores.</p>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Seu e-mail de compra"
                    className="pl-10 h-12 rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Senha</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Sua senha"
                    className="pl-10 h-12 rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gold text-background font-bold rounded-xl hover:bg-gold/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Entrando..." : "ENTRAR"}
              </button>
            </form>
          </div>

          <div className="mt-8 flex justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            <Link to="/termos" className="hover:text-gold transition-colors">Termos</Link>
            <Link to="/privacidade" className="hover:text-gold transition-colors">Privacidade</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}