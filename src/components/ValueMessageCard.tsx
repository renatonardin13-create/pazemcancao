import { Heart } from "lucide-react";

interface ValueMessageCardProps {
  message?: string;
}

export function ValueMessageCard({ message }: ValueMessageCardProps) {
  return (
    <div className="rounded-2xl border border-gold/15 bg-gold/[0.03] backdrop-blur-sm px-5 sm:px-6 py-5 flex items-start gap-4 shadow-sm animate-in fade-in duration-500 delay-300">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/10 mt-0.5">
        <Heart className="h-4 w-4 text-gold" />
      </div>
      <p className="text-sm leading-relaxed text-foreground/70">
        {message || (
          <>
            Que essas canções sejam{" "}
            <span className="font-medium text-foreground">paz</span> para sua alma,{" "}
            <span className="font-medium text-foreground">força</span> para sua caminhada e{" "}
            <span className="font-medium text-foreground">presença de Deus</span> nos seus
            momentos mais silenciosos.
          </>
        )}
      </p>
    </div>
  );
}
