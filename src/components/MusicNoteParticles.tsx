import { useMemo } from "react";

const NOTES = ["♪", "♫", "♩", "♬"];

interface Particle {
  id: number;
  note: string;
  left: string;
  top: string;
  delay: string;
  duration: string;
  size: number;
  opacity: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    note: NOTES[i % NOTES.length],
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 8}s`,
    duration: `${12 + Math.random() * 10}s`,
    size: 14 + Math.random() * 12,
    opacity: 0.06 + Math.random() * 0.12,
  }));
}

export function MusicNoteParticles() {
  const particles = useMemo(() => generateParticles(12), []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute text-gold select-none animate-[float_var(--dur)_ease-in-out_var(--delay)_infinite]"
          style={{
            left: p.left,
            top: p.top,
            fontSize: p.size,
            opacity: p.opacity,
            "--dur": p.duration,
            "--delay": p.delay,
          } as React.CSSProperties}
        >
          {p.note}
        </span>
      ))}
    </div>
  );
}
