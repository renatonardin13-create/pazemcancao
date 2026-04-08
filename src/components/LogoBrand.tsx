import { Music } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface LogoBrandProps {
  size?: "sm" | "md" | "lg";
  linkTo?: string;
  showSubtitle?: boolean;
}

export function LogoBrand({ size = "md", linkTo, showSubtitle = false }: LogoBrandProps) {
  const sizes = {
    sm: { icon: "h-8 w-8", iconInner: "h-3.5 w-3.5", text: "text-base", radius: "rounded-lg" },
    md: { icon: "h-10 w-10", iconInner: "h-4.5 w-4.5", text: "text-base sm:text-lg", radius: "rounded-xl" },
    lg: { icon: "h-14 w-14", iconInner: "h-7 w-7", text: "text-2xl", radius: "rounded-2xl" },
  };

  const s = sizes[size];

  const content = (
    <div className="flex items-center gap-3">
      <div className={`flex ${s.icon} items-center justify-center ${s.radius} bg-gold/10 border border-gold/20 shadow-sm shadow-gold/5`}>
        <Music className={`${s.iconInner} text-gold`} />
      </div>
      <div className="flex flex-col">
        <span className={`font-display ${s.text} font-bold text-foreground tracking-tight leading-tight`}>
          Paz em Canção
        </span>
        {showSubtitle && (
          <p className="text-[10px] text-gold/50 font-medium tracking-wide hidden sm:block">
            Biblioteca Espiritual Privada
          </p>
        )}
      </div>
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
