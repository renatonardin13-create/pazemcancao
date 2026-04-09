import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import type { Track } from "@/lib/sample-tracks";

interface PlayerState {
  currentTrack: Track | null;
  playing: boolean;
  progress: number;
  duration: number;
  currentTime: number;
  play: (track: Track) => void;
  pause: () => void;
  toggle: (track: Track) => void;
  seek: (percent: number) => void;
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
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playAudio = useCallback((track: Track) => {
    const isSame = audioRef.current && currentTrack?.id === track.id;

    if (isSame && audioRef.current) {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
      return;
    }

    // Stop current
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Create new Audio synchronously (browser gesture chain)
    const audio = new Audio(track.audioUrl);
    audioRef.current = audio;
    setCurrentTrack(track);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
      if (audio.duration > 0) {
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    });

    audio.addEventListener("ended", () => {
      setPlaying(false);
      setProgress(100);
    });

    audio.addEventListener("error", () => {
      setPlaying(false);
      console.error("Audio playback error for:", track.title);
    });

    audio.play().then(() => {
      setPlaying(true);
    }).catch((err) => {
      console.error("Play failed:", err);
      setPlaying(false);
    });
  }, [currentTrack?.id]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
  }, []);

  const toggle = useCallback((track: Track) => {
    const isSame = currentTrack?.id === track.id;
    if (isSame && playing) {
      pause();
    } else {
      playAudio(track);
    }
  }, [currentTrack?.id, playing, pause, playAudio]);

  const seek = useCallback((percent: number) => {
    if (audioRef.current && audioRef.current.duration) {
      const time = (percent / 100) * audioRef.current.duration;
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      setProgress(percent);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlaying(false);
    setCurrentTrack(null);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  return (
    <PlayerContext.Provider
      value={{ currentTrack, playing, progress, duration, currentTime, play: playAudio, pause, toggle, seek, stop }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
