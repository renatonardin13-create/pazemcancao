import type { ReactNode } from "react";

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

export function PremiumCard({ children, className = "", glow = false }: PremiumCardProps) {
  return (
    <div
      className={`rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-5 sm:p-6 shadow-sm transition-all duration-300 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] ${
        glow ? "border-gold/20 hover:border-gold/30" : "hover:border-gold/20"
      } ${className}`}
    >
      {children}
    </div>
  );
}
