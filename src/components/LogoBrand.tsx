import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface LogoBrandProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showSubtitle?: boolean;
  linkTo?: string;
}

export function LogoBrand({ 
  size = "md", 
  className, 
  showSubtitle = true,
  linkTo = "/"
}: LogoBrandProps) {
  const sizes = {
    sm: "text-lg",
    md: "text-xl sm:text-2xl",
    lg: "text-3xl",
    xl: "text-4xl sm:text-5xl",
  };

  return (
    <Link to={linkTo as any} className={cn("flex flex-col items-center", className)}>
      <h1 className={cn("font-display font-bold text-gold tracking-tight", sizes[size])}>
        Paz em Canção
      </h1>
      {showSubtitle && (
        <p className="text-[10px] sm:text-xs text-muted-foreground/60 tracking-[0.3em] uppercase mt-1">
          Biblioteca Espiritual
        </p>
      )}
    </Link>
  );
}