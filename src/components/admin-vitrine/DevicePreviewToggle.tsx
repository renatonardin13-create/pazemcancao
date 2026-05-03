import { Monitor, Tablet, Smartphone } from "lucide-react";

export type DeviceKind = "desktop" | "tablet" | "mobile";

interface Props {
  value: DeviceKind;
  onChange: (v: DeviceKind) => void;
}

const items: { key: DeviceKind; label: string; icon: any }[] = [
  { key: "desktop", label: "Desktop", icon: Monitor },
  { key: "tablet", label: "Tablet", icon: Tablet },
  { key: "mobile", label: "Mobile", icon: Smartphone },
];

export function DevicePreviewToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border/40 bg-background/40 p-1">
      {items.map(({ key, label, icon: Icon }) => {
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
              active
                ? "bg-gold/20 text-gold"
                : "text-muted-foreground/70 hover:text-foreground"
            }`}
            aria-pressed={active}
            title={label}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export const deviceWidth: Record<DeviceKind, string> = {
  desktop: "100%",
  tablet: "820px",
  mobile: "390px",
};
