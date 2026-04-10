import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import type { Track } from "@/lib/sample-tracks";

interface PlayerState {
  currentTrack: Track | null;
  playing: boolean;
  progress: number;
  duration: number;
  currentTime: number;
  queue: Track[];
  queueIndex: number;
  play: (track: Track) => void;
  pause: () => void;
  toggle: (track: Track) => void;
  seek: (percent: number) => void;
  stop: () => void;
  setQueue: (tracks: Track[], startIndex?: number) => void;
  next: () => void;
  previous: () => void;
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
  const [queue, setQueueState] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<Track[]>([]);
  const queueIndexRef = useRef(-1);

  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { queueIndexRef.current = queueIndex; }, [queueIndex]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Core function to start playing a track with auto-advance on ended
  const startPlayback = useCallback((track: Track) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(track.audioUrl);
    audioRef.current = audio;
    setCurrentTrack(track);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);

    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));

    audio.addEventListener("timeupdate", () => {
      if (audio.duration > 0) {
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    });

    audio.addEventListener("ended", () => {
      const q = queueRef.current;
      const idx = queueIndexRef.current;
      if (q.length > 0 && idx < q.length - 1) {
        const nextIdx = idx + 1;
        setQueueIndex(nextIdx);
        queueIndexRef.current = nextIdx;
        const nextTrack = q[nextIdx];
        if (nextTrack) {
          // Recursive: create new audio for next track
          startPlayback(nextTrack);
          return;
        }
      }
      setPlaying(false);
      setProgress(100);
    });

    audio.addEventListener("error", () => {
      setPlaying(false);
      console.error("Audio playback error for:", track.title);
    });

    audio.play().then(() => setPlaying(true)).catch((err) => {
      console.error("Play failed:", err);
      setPlaying(false);
    });
  }, []);

  const playAudio = useCallback((track: Track) => {
    // Resume same track
    const isSame = audioRef.current && currentTrack?.id === track.id;
    if (isSame && audioRef.current) {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
      return;
    }

    startPlayback(track);

    // Update queue index if track is in queue
    const idx = queueRef.current.findIndex(t => t.id === track.id);
    if (idx >= 0) {
      setQueueIndex(idx);
      queueIndexRef.current = idx;
    }
  }, [currentTrack?.id, startPlayback]);

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

  const setQueue = useCallback((tracks: Track[], startIndex = 0) => {
    setQueueState(tracks);
    queueRef.current = tracks;
    setQueueIndex(startIndex);
    queueIndexRef.current = startIndex;
    if (tracks[startIndex]) {
      startPlayback(tracks[startIndex]);
    }
  }, [startPlayback]);

  const next = useCallback(() => {
    const q = queueRef.current;
    const idx = queueIndexRef.current;
    if (q.length === 0) return;
    const nextIdx = idx < q.length - 1 ? idx + 1 : 0;
    setQueueIndex(nextIdx);
    queueIndexRef.current = nextIdx;
    if (q[nextIdx]) startPlayback(q[nextIdx]);
  }, [startPlayback]);

  const previous = useCallback(() => {
    const q = queueRef.current;
    const idx = queueIndexRef.current;
    if (q.length === 0) return;
    // If more than 3s in, restart current track
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setProgress(0);
      return;
    }
    const prevIdx = idx > 0 ? idx - 1 : q.length - 1;
    setQueueIndex(prevIdx);
    queueIndexRef.current = prevIdx;
    if (q[prevIdx]) startPlayback(q[prevIdx]);
  }, [startPlayback]);

  return (
    <PlayerContext.Provider
      value={{ currentTrack, playing, progress, duration, currentTime, queue, queueIndex, play: playAudio, pause, toggle, seek, stop, setQueue, next, previous }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
