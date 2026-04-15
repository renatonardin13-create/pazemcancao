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
    <div className={`mx-auto ${widths[maxWidth]} px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
