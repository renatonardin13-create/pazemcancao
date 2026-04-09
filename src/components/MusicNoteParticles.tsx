import { motion } from "framer-motion";
import { useMemo } from "react";

const NOTES = ["♪", "♫", "♩", "♬", "𝅘𝅥𝅮", "𝅗𝅥", "♭", "♯"];

interface Particle {
  id: number;
  note: string;
  startX: number;
  startY: number;
  driftX: number;
  driftY: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
  rotation: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    note: NOTES[i % NOTES.length],
    startX: Math.random() * 100,
    startY: Math.random() * 100,
    driftX: (Math.random() - 0.5) * 120,
    driftY: (Math.random() - 0.5) * 120,
    delay: Math.random() * 10,
    duration: 10 + Math.random() * 14,
    size: 12 + Math.random() * 16,
    opacity: 0.08 + Math.random() * 0.18,
    rotation: (Math.random() - 0.5) * 90,
  }));
}

export function MusicNoteParticles() {
  const particles = useMemo(() => generateParticles(50), []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute text-gold select-none"
          style={{
            left: `${p.startX}%`,
            top: `${p.startY}%`,
            fontSize: p.size,
          }}
          animate={{
            x: [0, p.driftX * 0.4, p.driftX, p.driftX * 0.6, 0],
            y: [0, p.driftY * 0.3, p.driftY, p.driftY * 0.5, 0],
            opacity: [0, p.opacity, p.opacity * 0.7, p.opacity, 0],
            rotate: [0, p.rotation * 0.5, p.rotation, p.rotation * 0.3, 0],
            scale: [0.6, 1, 0.9, 1.1, 0.6],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {p.note}
        </motion.span>
      ))}
    </div>
  );
}
