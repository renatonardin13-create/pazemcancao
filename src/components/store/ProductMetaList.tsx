import { BookOpen, Clock3, Tag, Layers } from "lucide-react";

export interface ProductMeta {
  totalLessons?: number | null;
  totalDuration?: string | null;
  categoryName?: string | null;
  productType?: string | null;
}

const TYPE_LABEL: Record<string, string> = {
  curso_individual: "Curso",
  assinatura: "Assinatura",
  ebook: "Ebook",
  pack: "Pack",
  aula: "Aula",
};

export function ProductMetaList({ totalLessons, totalDuration, categoryName, productType }: ProductMeta) {
  const items: Array<{ icon: typeof BookOpen; label: string }> = [];
  if (totalLessons && totalLessons > 0) {
    items.push({ icon: BookOpen, label: `${totalLessons} ${totalLessons === 1 ? "aula" : "aulas"}` });
  }
  if (totalDuration) items.push({ icon: Clock3, label: totalDuration });
  if (categoryName) items.push({ icon: Tag, label: categoryName });
  if (productType && TYPE_LABEL[productType]) {
    items.push({ icon: Layers, label: TYPE_LABEL[productType] });
  }
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {items.map((it) => (
        <span
          key={it.label}
          className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/55 px-2.5 py-0.5 text-[10px] font-medium text-white/75 backdrop-blur-sm"
        >
          <it.icon className="h-3 w-3 text-gold/80" />
          {it.label}
        </span>
      ))}
    </div>
  );
}
