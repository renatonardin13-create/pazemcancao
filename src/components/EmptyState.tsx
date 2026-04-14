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
        "flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-border/25 bg-card/5",
        compact ? "py-10 px-6" : "py-16 px-8",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-muted/10 border border-border/15",
          compact ? "h-12 w-12 mb-3" : "h-14 w-14 mb-4"
        )}
      >
        <Icon className={cn("text-muted-foreground/40", compact ? "h-5 w-5" : "h-6 w-6")} />
      </div>

      <h3 className={cn("font-semibold text-foreground/80", compact ? "text-sm" : "text-base")}>
        {title}
      </h3>

      {description && (
        <p className={cn("text-muted-foreground/60 mt-1.5 max-w-sm", compact ? "text-xs" : "text-sm")}>
          {description}
        </p>
      )}

      {actionLabel && (actionTo || onAction) && (
        <div className="mt-5">
          {actionTo ? (
            <Button asChild size="sm">
              <Link to={actionTo}>
                {ActionIcon && <ActionIcon className="h-4 w-4 mr-1.5" />}
                {actionLabel}
              </Link>
            </Button>
          ) : (
            <Button size="sm" onClick={onAction}>
              {ActionIcon && <ActionIcon className="h-4 w-4 mr-1.5" />}
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
