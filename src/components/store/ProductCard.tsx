/**
 * ProductCard — versão atômica e burra.
 * Recebe `accessState` final + dados tratados. NÃO decide regra de negócio.
 *
 * Para a Vitrine, o card real usado é o `VitrineCourseCard` (mais completo).
 * Este aqui é o fallback/atômico para uso em telas customizadas.
 */
import { useNavigate } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { PosterCard } from "@/components/PosterCard";
import { ProductCardLockedOverlay } from "./ProductCardLockedOverlay";
import type { ProductAccessState } from "@/lib/product-access";

export interface ProductCardData {
  id: string;
  title: string;
  cover_image_url?: string | null;
  short_description?: string | null;
  total_lessons?: number | null;
  category_name?: string | null;
}

interface ProductCardProps {
  product: ProductCardData;
  accessState: ProductAccessState;
  onLockedClick?: (product: ProductCardData) => void;
  index?: number;
}

export function ProductCard({ product, accessState, onLockedClick, index = 0 }: ProductCardProps) {
  const navigate = useNavigate();
  if (accessState === "hidden") return null;

  const isLocked = accessState === "locked";
  const isComing = accessState === "coming_soon";

  const handleClick = () => {
    if (accessState === "owned") {
      navigate({ to: "/cursos/$courseId", params: { courseId: product.id } });
      return;
    }
    onLockedClick?.(product);
  };

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className="group/card relative block cursor-pointer"
    >
      <PosterCard
        cover={product.cover_image_url || null}
        coverAlt={product.title}
        fallback={
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.04]">
            <BookOpen className="h-7 w-7 text-white/25" />
          </div>
        }
        title={product.title}
        subtitle={product.total_lessons ? `${product.total_lessons} aulas` : product.short_description || ""}
        overlay={isLocked || isComing ? <ProductCardLockedOverlay state={accessState as "locked" | "coming_soon"} /> : undefined}
        locked={isLocked}
        index={index}
      />
    </div>
  );
}
