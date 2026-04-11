import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import type { Track } from "@/lib/sample-tracks";
import { logPlay } from "@/lib/analytics.functions";

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
  next: () => void;
  previous: () => void;
  setQueue: (tracks: Track[], startIndex?: number) => void;
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
  const playLoggedRef = useRef<string | null>(null);

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

  const startAudio = useCallback((track: Track, autoNext = true) => {
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
        // Log play after 30 seconds
        if (audio.currentTime >= 30 && playLoggedRef.current !== String(track.id)) {
          playLoggedRef.current = String(track.id);
          logPlay({ data: { trackId: String(track.id), durationSeconds: Math.round(audio.currentTime) } }).catch(() => {});
        }
      }
    });

    audio.addEventListener("ended", () => {
      if (autoNext) {
        const q = queueRef.current;
        const idx = queueIndexRef.current;
        if (q.length > 0 && idx < q.length - 1) {
          const nextIdx = idx + 1;
          setQueueIndex(nextIdx);
          startAudio(q[nextIdx], true);
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
    const isSame = audioRef.current && currentTrack?.id === track.id;
    if (isSame && audioRef.current) {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
      return;
    }
    startAudio(track);
  }, [currentTrack?.id, startAudio]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
  }, []);

  const toggle = useCallback((track: Track) => {
    const isSame = currentTrack?.id === track.id;
    if (isSame && playing) {
      pause();
    } else if (isSame && audioRef.current) {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    } else {
      // Find in queue
      const idx = queueRef.current.findIndex(t => t.id === track.id);
      if (idx >= 0) {
        setQueueIndex(idx);
        startAudio(track);
      } else {
        // Track not in current queue — play solo without auto-next
        setQueueState([track]);
        setQueueIndex(0);
        queueRef.current = [track];
        queueIndexRef.current = 0;
        startAudio(track, true);
      }
    }
  }, [currentTrack?.id, playing, pause, startAudio]);

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
    setQueueState([]);
    setQueueIndex(-1);
  }, []);

  const next = useCallback(() => {
    const q = queueRef.current;
    const idx = queueIndexRef.current;
    if (q.length === 0) return;
    const nextIdx = idx < q.length - 1 ? idx + 1 : 0;
    setQueueIndex(nextIdx);
    startAudio(q[nextIdx]);
  }, [startAudio]);

  const previous = useCallback(() => {
    const q = queueRef.current;
    const idx = queueIndexRef.current;
    if (q.length === 0) return;
    // If >3s into track, restart; otherwise go previous
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setProgress(0);
      return;
    }
    const prevIdx = idx > 0 ? idx - 1 : q.length - 1;
    setQueueIndex(prevIdx);
    startAudio(q[prevIdx]);
  }, [startAudio]);

  const setQueue = useCallback((tracks: Track[], startIndex = 0) => {
    setQueueState(tracks);
    setQueueIndex(startIndex);
    if (tracks.length > 0 && startIndex < tracks.length) {
      startAudio(tracks[startIndex]);
    }
  }, [startAudio]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack, playing, progress, duration, currentTime,
        queue, queueIndex,
        play: playAudio, pause, toggle, seek, stop, next, previous, setQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
