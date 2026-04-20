import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { getPlatformSettings } from "@/lib/platform-settings.functions";

interface InspirationalMessage {
  id: string;
  text: string;
  is_active?: boolean;
  order?: number;
  category?: string;
}

interface InspirationalBlockConfig {
  enabled?: boolean;
  title?: string;
  mode?: "random" | "fixed";
  type?: "biblical" | "motivational" | "custom";
  rotation_seconds?: number | null;
  messages?: InspirationalMessage[];
}

function pickRandom<T>(arr: T[]): T | undefined {
  if (!arr.length) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function InspirationalBlock() {
  const { data } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: () => getPlatformSettings(),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const config: InspirationalBlockConfig =
    (data?.settings?.inspirational_block as InspirationalBlockConfig) || {};

  const activeMessages = useMemo(
    () => (config.messages || []).filter((m) => m.is_active !== false && m.text),
    [config.messages],
  );

  const [current, setCurrent] = useState<InspirationalMessage | undefined>(undefined);

  useEffect(() => {
    if (!activeMessages.length) {
      setCurrent(undefined);
      return;
    }
    if (config.mode === "fixed") {
      setCurrent(activeMessages[0]);
      return;
    }
    setCurrent(pickRandom(activeMessages));

    const seconds = config.rotation_seconds;
    if (!seconds || seconds <= 0) return;
    const id = setInterval(() => {
      setCurrent(pickRandom(activeMessages));
    }, seconds * 1000);
    return () => clearInterval(id);
  }, [activeMessages, config.mode, config.rotation_seconds]);

  if (!config.enabled || !current) return null;

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-card/60 via-background/40 to-card/30 px-5 py-5 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.5)] sm:px-7 sm:py-6"
      aria-label={config.title || "Mensagem inspiradora"}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gold/[0.06] blur-3xl" />
      <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
        <div className="flex items-center gap-2 text-gold/80">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em]">
            {config.title || "Palavra para hoje"}
          </span>
        </div>
        <p
          key={current.id}
          className="flex-1 font-display text-base leading-relaxed text-foreground/90 sm:text-lg animate-in fade-in duration-700"
        >
          {current.text}
        </p>
      </div>
    </section>
  );
}
