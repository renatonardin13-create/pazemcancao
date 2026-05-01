import { type LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionTo,
  actionIcon: ActionIcon,
  onAction,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-3xl border border-dashed border-border/20 bg-gradient-to-b from-card/30 to-transparent",
        compact ? "py-10 px-6" : "py-20 px-10",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-muted/5 border border-border/10 shadow-inner",
          compact ? "h-14 w-14 mb-4" : "h-20 w-20 mb-6"
        )}
      >
        <Icon className={cn("text-muted-foreground/30", compact ? "h-6 w-6" : "h-10 w-10")} />
      </div>

      <h3 className={cn("font-display font-black tracking-tight text-foreground/90", compact ? "text-base" : "text-xl")}>
        {title}
      </h3>

      {description && (
        <p className={cn("text-muted-foreground/50 mt-2 max-w-sm leading-relaxed", compact ? "text-xs" : "text-sm")}>
          {description}
        </p>
      )}

      {actionLabel && (actionTo || onAction) && (
        <div className="mt-8">
          {actionTo ? (
            <Button asChild size={compact ? "sm" : "lg"} className="rounded-xl font-bold px-8 shadow-xl hover:shadow-gold/20 transition-all">
              <Link to={actionTo}>
                {ActionIcon && <ActionIcon className="h-4 w-4 mr-2" />}
                {actionLabel}
              </Link>
            </Button>
          ) : (
            <Button size={compact ? "sm" : "lg"} onClick={onAction} className="rounded-xl font-bold px-8 shadow-xl hover:shadow-gold/20 transition-all">
              {ActionIcon && <ActionIcon className="h-4 w-4 mr-2" />}
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
