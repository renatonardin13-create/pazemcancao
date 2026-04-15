import { Pencil, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminActionButtonsProps {
  /** Called when edit is clicked */
  onEdit?: () => void;
  /** Current active/enabled state */
  isActive?: boolean;
  /** Called when toggle is clicked — receives the NEW desired state */
  onToggle?: (newState: boolean) => void;
  /** Whether the toggle mutation is loading */
  toggling?: boolean;
  /** Called when delete is clicked */
  onDelete?: () => void;
  /** Extra buttons to render before the standard ones */
  extraBefore?: React.ReactNode;
  /** Extra buttons to render after the standard ones */
  extraAfter?: React.ReactNode;
  /** Compact mode — icon-only (default: false, shows labels) */
  compact?: boolean;
}

const btnBase =
  "inline-flex items-center gap-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed";

const btnSizes = {
  normal: "h-8 px-3",
  compact: "h-8 w-8 justify-center",
};

export function AdminActionButtons({
  onEdit,
  isActive,
  onToggle,
  toggling,
  onDelete,
  extraBefore,
  extraAfter,
  compact = false,
}: AdminActionButtonsProps) {
  const size = compact ? btnSizes.compact : btnSizes.normal;

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {extraBefore}

      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className={cn(
            btnBase,
            size,
            "border-border/25 bg-card/20 text-muted-foreground/70 hover:text-gold hover:border-gold/25 hover:bg-gold/[0.06]"
          )}
          title="Editar"
        >
          <Pencil className="h-3.5 w-3.5" />
          {!compact && <span>Editar</span>}
        </button>
      )}

      {onToggle && isActive !== undefined && (
        <button
          type="button"
          onClick={() => onToggle(!isActive)}
          disabled={toggling}
          className={cn(
            btnBase,
            size,
            isActive
              ? "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400/70 hover:border-emerald-500/30 hover:bg-emerald-500/10"
              : "border-border/25 bg-card/20 text-muted-foreground/50 hover:border-amber-500/25 hover:text-amber-400/70 hover:bg-amber-500/[0.06]"
          )}
          title={isActive ? "Desativar" : "Ativar"}
        >
          {toggling ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isActive ? (
            <Eye className="h-3.5 w-3.5" />
          ) : (
            <EyeOff className="h-3.5 w-3.5" />
          )}
          {!compact && <span>{isActive ? "Ativo" : "Inativo"}</span>}
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className={cn(
            btnBase,
            size,
            "border-border/25 bg-card/20 text-muted-foreground/50 hover:text-destructive/70 hover:border-destructive/25 hover:bg-destructive/[0.06]"
          )}
          title="Excluir"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {!compact && <span>Excluir</span>}
        </button>
      )}

      {extraAfter}
    </div>
  );
}
