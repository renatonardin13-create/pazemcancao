import type { ReactNode } from "react";

interface ProductGridProps {
  children: ReactNode;
  /** Permite override do grid se necessário. */
  className?: string;
}

/**
 * Grid responsivo padrão para listas de produtos.
 * Mobile-first: 2 → 3 → 4 → 5 colunas.
 */
export function ProductGrid({ children, className }: ProductGridProps) {
  return (
    <div
      className={
        className ??
        "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      }
    >
      {children}
    </div>
  );
}
