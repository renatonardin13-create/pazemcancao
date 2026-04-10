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

  // Keep refs in sync
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

  const playTrackInternal = useCallback((track: Track) => {
    const isSame = audioRef.current && currentTrack?.id === track.id;

    if (isSame && audioRef.current) {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
      return;
    }

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
      // Auto-advance to next track
      const q = queueRef.current;
      const idx = queueIndexRef.current;
      if (q.length > 0 && idx < q.length - 1) {
        const nextIdx = idx + 1;
        setQueueIndex(nextIdx);
        queueIndexRef.current = nextIdx;
        // Play next track - we need to do it inline to keep browser gesture chain
        const nextTrack = q[nextIdx];
        if (nextTrack) {
          const nextAudio = new Audio(nextTrack.audioUrl);
          if (audioRef.current) {
            audioRef.current.pause();
          }
          audioRef.current = nextAudio;
          setCurrentTrack(nextTrack);
          setProgress(0);
          setCurrentTime(0);
          setDuration(0);

          nextAudio.addEventListener("loadedmetadata", () => setDuration(nextAudio.duration));
          nextAudio.addEventListener("timeupdate", () => {
            if (nextAudio.duration > 0) {
              setCurrentTime(nextAudio.currentTime);
              setProgress((nextAudio.currentTime / nextAudio.duration) * 100);
            }
          });
          nextAudio.addEventListener("ended", () => {
            // Recursive auto-advance via the same ended handler pattern
            nextAudio.dispatchEvent(new Event("_queue_ended"));
          });
          nextAudio.addEventListener("error", () => {
            setPlaying(false);
          });

          nextAudio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
          // Re-attach the ended listener properly for chaining
          nextAudio.removeEventListener("ended", () => {});
          nextAudio.addEventListener("ended", handleEnded);
          return;
        }
      }
      // No more tracks
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
  }, [currentTrack?.id]);

  // Centralized ended handler for auto-advance
  const handleEnded = useCallback(() => {
    const q = queueRef.current;
    const idx = queueIndexRef.current;
    if (q.length > 0 && idx < q.length - 1) {
      const nextIdx = idx + 1;
      setQueueIndex(nextIdx);
      queueIndexRef.current = nextIdx;
      const nextTrack = q[nextIdx];
      if (nextTrack) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        const audio = new Audio(nextTrack.audioUrl);
        audioRef.current = audio;
        setCurrentTrack(nextTrack);
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
        audio.addEventListener("ended", handleEnded);
        audio.addEventListener("error", () => setPlaying(false));
        audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
        return;
      }
    }
    setPlaying(false);
    setProgress(100);
  }, []);

  // Override playTrackInternal to use handleEnded
  const playAudio = useCallback((track: Track) => {
    const isSame = audioRef.current && currentTrack?.id === track.id;
    if (isSame && audioRef.current) {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
      return;
    }
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
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", () => {
      setPlaying(false);
      console.error("Audio playback error for:", track.title);
    });
    audio.play().then(() => setPlaying(true)).catch((err) => {
      console.error("Play failed:", err);
      setPlaying(false);
    });

    // Update queue index if track is in queue
    const idx = queueRef.current.findIndex(t => t.id === track.id);
    if (idx >= 0) {
      setQueueIndex(idx);
      queueIndexRef.current = idx;
    }
  }, [currentTrack?.id, handleEnded]);

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
      playAudio(tracks[startIndex]);
    }
  }, [playAudio]);

  const next = useCallback(() => {
    const q = queueRef.current;
    const idx = queueIndexRef.current;
    if (q.length === 0) return;
    const nextIdx = idx < q.length - 1 ? idx + 1 : 0; // loop
    setQueueIndex(nextIdx);
    queueIndexRef.current = nextIdx;
    if (q[nextIdx]) playAudio(q[nextIdx]);
  }, [playAudio]);

  const previous = useCallback(() => {
    const q = queueRef.current;
    const idx = queueIndexRef.current;
    if (q.length === 0) return;
    // If more than 3s into the song, restart it; otherwise go previous
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setProgress(0);
      return;
    }
    const prevIdx = idx > 0 ? idx - 1 : q.length - 1; // loop
    setQueueIndex(prevIdx);
    queueIndexRef.current = prevIdx;
    if (q[prevIdx]) playAudio(q[prevIdx]);
  }, [playAudio]);

  return (
    <PlayerContext.Provider
      value={{ currentTrack, playing, progress, duration, currentTime, queue, queueIndex, play: playAudio, pause, toggle, seek, stop, setQueue, next, previous }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
