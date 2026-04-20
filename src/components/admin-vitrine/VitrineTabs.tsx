import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon, LayoutGrid, Megaphone, Layers } from "lucide-react";

export type VitrineTabKey = "hero" | "cards" | "promo" | "shelves";

interface Props {
  value: VitrineTabKey;
  onChange: (v: VitrineTabKey) => void;
}

export function VitrineTabs({ value, onChange }: Props) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as VitrineTabKey)}>
      <TabsList className="flex w-full justify-start gap-1 overflow-x-auto bg-card/30 p-1">
        <TabsTrigger value="hero" className="gap-2">
          <ImageIcon className="h-3.5 w-3.5" /> Banner Principal
        </TabsTrigger>
        <TabsTrigger value="cards" className="gap-2">
          <LayoutGrid className="h-3.5 w-3.5" /> Cards
        </TabsTrigger>
        <TabsTrigger value="promo" className="gap-2">
          <Megaphone className="h-3.5 w-3.5" /> Banners Promo
        </TabsTrigger>
        <TabsTrigger value="shelves" className="gap-2">
          <Layers className="h-3.5 w-3.5" /> Prateleiras
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
