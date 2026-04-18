import { Lock, Play, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductAccessState } from "@/lib/product-access";

interface ProductAccessButtonProps {
  state: ProductAccessState;
  onAccess?: () => void;
  onLockedClick?: () => void;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
}

/**
 * Botão contextual. NÃO decide acesso — apenas reflete o estado recebido.
 */
export function ProductAccessButton({
  state,
  onAccess,
  onLockedClick,
  disabled,
  size = "default",
}: ProductAccessButtonProps) {
  if (state === "owned") {
    return (
      <Button variant="premium" size={size} className="w-full" onClick={onAccess} disabled={disabled}>
        <Play className="h-4 w-4 fill-current" />
        Acessar
      </Button>
    );
  }
  if (state === "coming_soon") {
    return (
      <Button variant="outline" size={size} className="w-full border-amber-400/30 text-amber-300/85" disabled>
        <Clock3 className="h-4 w-4" />
        Em breve
      </Button>
    );
  }
  // locked
  return (
    <Button variant="outline" size={size} className="w-full border-gold/30 text-gold hover:bg-gold/10" onClick={onLockedClick}>
      <Lock className="h-4 w-4" />
      Ver oferta
    </Button>
  );
}
