import { useState, useEffect } from "react";

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

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    note: NOTES[i % NOTES.length],
    left: `${seededRandom(i * 7 + 1) * 100}%`,
    top: `${seededRandom(i * 7 + 2) * 100}%`,
    delay: `${seededRandom(i * 7 + 3) * 8}s`,
    duration: `${12 + seededRandom(i * 7 + 4) * 10}s`,
    size: 14 + seededRandom(i * 7 + 5) * 12,
    opacity: 0.06 + seededRandom(i * 7 + 6) * 0.12,
  }));
}

const PARTICLES = generateParticles(12);

export function MusicNoteParticles() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {PARTICLES.map((p) => (
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
