import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg";
  className?: string;
}

export function PageContainer({ children, maxWidth = "lg", className = "" }: PageContainerProps) {
  const widths = {
    sm: "max-w-2xl",
    md: "max-w-3xl",
    lg: "max-w-5xl",
  };

  return (
    <div className={`mx-auto ${widths[maxWidth]} px-4 sm:px-6 ${className}`}>
      {children}
    </div>
  );
}
