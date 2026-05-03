import React, { useEffect, useState } from "react";

/**
 * Lightweight music note particles for the background.
 * Optimized for performance by using few elements and CSS animations.
 */
export function MusicNoteParticles() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number; delay: number; opacity: number; note: string }>>([]);

  useEffect(() => {
    const notes = ["♪", "♫", "♬", "♩", "♭", "♯"];
    const count = 15; // Kept low for performance
    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 15 + 10,
      duration: Math.random() * 15 + 15, // Slow movement
      delay: Math.random() * 10,
      opacity: Math.random() * 0.2 + 0.05, // Very subtle
      note: notes[Math.floor(Math.random() * notes.length)],
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute text-gold animate-float"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            animationIterationCount: "infinite",
            animationTimingFunction: "ease-in-out",
          }}
        >
          {p.note}
        </div>
      ))}
    </div>
  );
}
