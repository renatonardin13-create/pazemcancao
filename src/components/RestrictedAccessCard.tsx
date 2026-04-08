import { Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function RestrictedAccessCard() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_40%,var(--color-gold)/0.02,transparent_70%)]" />

      <div className="relative max-w-sm text-center animate-in fade-in duration-1000">
        <div className="mx-auto mb-8 w-px h-14 bg-gradient-to-b from-transparent via-gold/12 to-transparent" />

        <Lock className="h-5 w-5 text-gold/30 mx-auto mb-6" />

        <h1 className="font-display text-2xl font-bold text-foreground/85">
          Acesso restrito
        </h1>
        <p className="mt-4 text-sm text-muted-foreground/40 leading-[1.9]">
          Esta área é exclusiva para<br />compradores autorizados.
        </p>

        <div className="mt-10">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full bg-gold/12 text-gold/55 border border-gold/10 px-8 py-3 text-[12px] font-semibold tracking-wider uppercase hover:bg-gold/20 hover:text-gold/75 transition-all duration-500"
          >
            Fazer Login
          </Link>
        </div>

        <div className="mx-auto mt-10 w-px h-8 bg-gradient-to-b from-gold/8 to-transparent" />
      </div>
    </div>
  );
}
