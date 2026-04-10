import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo-paz-em-cancao.png";

interface LogoBrandProps {
  size?: "sm" | "md" | "lg";
  linkTo?: string;
  showSubtitle?: boolean;
}

export function LogoBrand({ size = "md", linkTo }: LogoBrandProps) {
  const heights = {
    sm: "h-8",
    md: "h-10 sm:h-12",
    lg: "h-16",
  };

  const content = (
    <img
      src={logo}
      alt="Paz em Canção"
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
