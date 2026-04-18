interface PriceBoxProps {
  price: string;
  label?: string;
  hint?: string;
  badge?: string;
}

export function PriceBox({ price, label = "Pagamento único", hint = "acesso vitalício", badge = "Oferta" }: PriceBoxProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gold/25 bg-gradient-to-br from-gold/[0.12] via-gold/[0.04] to-transparent px-4 py-3.5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(212,175,55,0.18),transparent_60%)]" />
      <div className="relative flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold/75">{label}</div>
          <div className="mt-0.5 text-3xl font-bold leading-none text-gold">{price}</div>
          <div className="mt-1 text-[10px] text-white/45">{hint}</div>
        </div>
        {badge && (
          <span className="rounded-full border border-gold/30 bg-black/40 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-gold/85">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
