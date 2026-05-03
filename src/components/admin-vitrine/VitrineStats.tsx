import { BookOpen, Layers, ImageIcon } from "lucide-react";

interface Props {
  coursesPublished: number;
  shelvesActive: number;
  heroEnabled: boolean;
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: any;
  tone: "emerald" | "gold" | "amber";
}) {
  const tones: Record<string, string> = {
    emerald: "border-emerald-500/20 bg-emerald-500/5 text-emerald-300",
    gold: "border-gold/20 bg-gold/5 text-gold",
    amber: "border-amber-500/20 bg-amber-500/5 text-amber-300",
  };
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border/30 bg-card/30 px-5 py-4 backdrop-blur-sm">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${tones[tone]}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
          {label}
        </p>
        <p className="mt-0.5 text-lg font-bold tabular-nums text-foreground/90">{value}</p>
      </div>
    </div>
  );
}

export function VitrineStats({ coursesPublished, shelvesActive, heroEnabled }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <StatCard label="Cursos Publicados" value={coursesPublished} icon={BookOpen} tone="emerald" />
      <StatCard label="Prateleiras Ativas" value={shelvesActive} icon={Layers} tone="gold" />
      <StatCard
        label="Banner Principal"
        value={heroEnabled ? "Ativo" : "Inativo"}
        icon={ImageIcon}
        tone={heroEnabled ? "emerald" : "amber"}
      />
    </div>
  );
}
