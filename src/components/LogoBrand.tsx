import { Link } from "@tanstack/react-router";
import logoIcon from "@/assets/logo-icon.png";

interface LogoBrandProps {
  size?: "sm" | "md" | "lg";
  linkTo?: string;
  showSubtitle?: boolean;
}

export function LogoBrand({ size = "md", linkTo, showSubtitle = false }: LogoBrandProps) {
  const sizes = {
    sm: { img: "h-7 w-7", text: "text-base" },
    md: { img: "h-8 w-8 sm:h-9 sm:w-9", text: "text-base sm:text-lg" },
    lg: { img: "h-12 w-12", text: "text-2xl" },
  };

  const s = sizes[size];

  const content = (
    <div className="flex items-center gap-2.5">
      <img
        src={logoIcon}
        alt="Paz em Canção"
        className={`${s.img} object-contain`}
        width={512}
        height={512}
      />
      <div className="flex flex-col">
        <span className={`font-display ${s.text} font-bold text-foreground/90 tracking-tight leading-tight`}>
          Paz em Canção
        </span>
        {showSubtitle && (
          <p className="text-[9px] text-gold/35 font-medium tracking-[0.25em] uppercase hidden sm:block">
            Biblioteca Espiritual
          </p>
        )}
      </div>
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
