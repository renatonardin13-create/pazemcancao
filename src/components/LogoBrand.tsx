import { Link } from "@tanstack/react-router";

interface LogoBrandProps {
  size?: "sm" | "md" | "lg";
  linkTo?: string;
  showSubtitle?: boolean;
}

export function LogoBrand({ size = "md", linkTo, showSubtitle = false }: LogoBrandProps) {
  const sizes = {
    sm: { text: "text-base" },
    md: { text: "text-base sm:text-lg" },
    lg: { text: "text-2xl" },
  };

  const s = sizes[size];

  const content = (
    <div className="flex flex-col">
      <span className={`font-display ${s.text} font-bold text-foreground/90 tracking-tight leading-tight`}>
        Paz em Canção
      </span>
      {showSubtitle && (
        <p className="text-[10px] text-gold/30 font-medium tracking-widest uppercase hidden sm:block">
          Biblioteca Espiritual
        </p>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="hover:opacity-80 transition-opacity duration-500">
        {content}
      </Link>
    );
  }

  return content;
}
