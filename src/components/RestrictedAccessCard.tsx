import { Lock, Music } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function RestrictedAccessCard() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center animate-in fade-in duration-500">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10">
          <Lock className="h-7 w-7 text-destructive" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Acesso restrito
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Esta área é exclusiva para compradores autorizados.
        </p>
        <div className="mt-8">
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Music className="h-4 w-4" />
            Voltar para Login
          </Link>
        </div>
      </div>
    </div>
  );
}
