import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Track } from "@/lib/sample-tracks";

interface PlayerState {
  currentTrack: Track | null;
  playing: boolean;
  progress: number;
  play: (track: Track) => void;
  pause: () => void;
  toggle: (track: Track) => void;
  setProgress: (p: number) => void;
  stop: () => void;
}

const PlayerContext = createContext<PlayerState | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const play = (track: Track) => {
    if (currentTrack?.id !== track.id) {
      setProgress(0);
    }
    setCurrentTrack(track);
    setPlaying(true);
  };

  const pause = () => setPlaying(false);

  const toggle = (track: Track) => {
    if (currentTrack?.id === track.id && playing) {
      pause();
    } else {
      play(track);
    }
  };

  const stop = () => {
    setPlaying(false);
    setCurrentTrack(null);
    setProgress(0);
  };

  return (
    <PlayerContext.Provider
      value={{ currentTrack, playing, progress, play, pause, toggle, setProgress, stop }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
