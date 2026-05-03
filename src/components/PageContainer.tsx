import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function PageContainer({ children, maxWidth = "lg", className = "" }: PageContainerProps) {
  const widths = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
  };

  return (
    <div className={`mx-auto ${widths[maxWidth]} px-4 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16 ${className}`}>
      {children}
    </div>
  );
}
