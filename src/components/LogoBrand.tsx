import { Music } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface LogoBrandProps {
  size?: "sm" | "md" | "lg";
  linkTo?: string;
  showSubtitle?: boolean;
}

export function LogoBrand({ size = "md", linkTo, showSubtitle = false }: LogoBrandProps) {
  const sizes = {
    sm: { icon: "h-8 w-8", iconInner: "h-3.5 w-3.5", text: "text-base" },
    md: { icon: "h-10 w-10", iconInner: "h-5 w-5", text: "text-base sm:text-lg" },
    lg: { icon: "h-14 w-14", iconInner: "h-7 w-7", text: "text-2xl" },
  };

  const s = sizes[size];

  const content = (
    <div className="flex items-center gap-3">
      <div className={`flex ${s.icon} items-center justify-center rounded-xl bg-gold/10 border border-gold/20 shadow-sm`}>
        <Music className={`${s.iconInner} text-gold`} />
      </div>
      <div>
        <span className={`font-display ${s.text} font-bold text-foreground`}>
          Paz em Canção
        </span>
        {showSubtitle && (
          <p className="text-[10px] sm:text-xs text-muted-foreground/70 hidden sm:block">
            30 Louvores Inéditos que Tocam a Alma
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
