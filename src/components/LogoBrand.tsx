import { Link } from "@tanstack/react-router";
import defaultLogo from "@/assets/logo-paz-em-cancao.png";
// useArea removed

interface LogoBrandProps {
  size?: "sm" | "md" | "lg";
  linkTo?: string;
  showSubtitle?: boolean;
}

export function LogoBrand({ size = "md", linkTo }: LogoBrandProps) {
  // currentArea removed
  
  const heights = {
    sm: "h-8",
    md: "h-10 sm:h-12",
    lg: "h-16",
  };

  const logoSrc = defaultLogo;
  const logoAlt = "Paz em Canção";

  const content = (
    <img
      src={logoSrc}
      alt={logoAlt}
      className={`${heights[size]} object-contain`}
    />
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
