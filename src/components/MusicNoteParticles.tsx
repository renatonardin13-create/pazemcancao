import { motion } from "framer-motion";

const NOTES = ["♪", "♫", "♩", "♬", "𝅘𝅥𝅮"];

interface Particle {
  id: number;
  note: string;
  x: string;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}

const particles: Particle[] = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  note: NOTES[i % NOTES.length],
  x: `${5 + Math.random() * 90}%`,
  delay: Math.random() * 6,
  duration: 8 + Math.random() * 10,
  size: 14 + Math.random() * 18,
  opacity: 0.12 + Math.random() * 0.18,
}));

export function MusicNoteParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute text-gold select-none"
          style={{
            left: p.x,
            fontSize: p.size,
            bottom: "-20px",
          }}
          animate={{
            y: [0, -800 - Math.random() * 400],
            x: [0, (Math.random() - 0.5) * 80],
            opacity: [0, p.opacity, p.opacity, 0],
            rotate: [0, (Math.random() - 0.5) * 60],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        >
          {p.note}
        </motion.span>
      ))}
    </div>
  );
}
