import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Music, Mail, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: integrate with Lovable Cloud auth
    setTimeout(() => {
      navigate({ to: "/downloads" });
    }, 800);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-primary overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,var(--color-gold)/0.15,transparent_60%)]" />
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-sm text-center px-8"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10">
            <Music className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="font-display text-3xl font-bold text-primary-foreground">
            Paz em Canção
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/70">
            Sua biblioteca espiritual privada com 30 louvores inéditos que
            tocam a alma.
          </p>
        </motion.div>
      </div>

      {/* Right — login form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 border border-gold/30">
              <Music className="h-7 w-7 text-gold" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Paz em Canção
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground font-display">
              Bem-vindo de volta
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Entre com o e-mail da sua compra para acessar seus louvores.
            </p>
          </div>

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
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2 rounded-full bg-primary text-primary-foreground py-3 font-semibold"
            >
              {loading ? "Entrando..." : "Entrar"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Problemas com o acesso?{" "}
            <a href="mailto:suporte@pazemcancao.com" className="text-gold underline">
              Fale conosco
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
