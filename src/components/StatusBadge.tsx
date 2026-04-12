import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  published: {
    label: "Publicado",
    classes: "text-emerald-400/90 border-emerald-500/25 bg-emerald-500/10",
  },
  draft: {
    label: "Rascunho",
    classes: "text-amber-400/80 border-amber-500/20 bg-amber-500/8",
  },
  archived: {
    label: "Arquivado",
    classes: "text-muted-foreground/50 border-border/20 bg-muted/10",
  },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <Badge
      variant="outline"
      className={`text-[9px] rounded-full px-2 border font-medium ${config.classes} ${className}`}
    >
      {config.label}
    </Badge>
  );
}

export function getStatusLabel(status: string) {
  return STATUS_CONFIG[status]?.label || status;
}
