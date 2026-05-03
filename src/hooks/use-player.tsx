import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import type { Track } from "@/lib/sample-tracks";
import { logPlay } from "@/lib/analytics.functions";

interface PlayerState {
  currentTrack: Track | null;
  nextTrack: Track | null;
  playing: boolean;
  progress: number;
  duration: number;
  currentTime: number;
  queue: Track[];
  queueIndex: number;
  play: (track: Track) => void;
  pause: () => void;
  toggle: (track: Track, queue?: Track[]) => void;
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
  // currentArea removed

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
    let audio = audioRef.current;

    // Reuse existing Audio element on mobile to preserve user-gesture permission
    if (!audio) {
      audio = new Audio();
      audioRef.current = audio;
    } else {
      // Remove old listeners before reassigning
      audio.pause();
      audio.onloadedmetadata = null;
      audio.ontimeupdate = null;
      audio.onended = null;
      audio.onerror = null;
    }

    audio.src = track.audioUrl;
    audio.load();
    setCurrentTrack(track);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);

    audio.onloadedmetadata = () => setDuration(audio!.duration);

    audio.ontimeupdate = () => {
      if (audio!.duration > 0) {
        setCurrentTime(audio!.currentTime);
        setProgress((audio!.currentTime / audio!.duration) * 100);
        // Log play after 30 seconds
        if (audio!.currentTime >= 30 && playLoggedRef.current !== String(track.id)) {
          playLoggedRef.current = String(track.id);
          logPlay({
            data: {
              trackId: String(track.id),
              durationSeconds: Math.round(audio!.currentTime),
            }
          }).catch(() => {});

        }
      }
    };

    audio.onended = () => {
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
    };

    audio.onerror = () => {
      setPlaying(false);
      console.error("Audio playback error for:", track.title);
    };

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

  const toggle = useCallback((track: Track, contextQueue?: Track[]) => {
    const isSame = currentTrack?.id === track.id;
    if (isSame && playing) {
      pause();
    } else if (isSame && audioRef.current) {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    } else {
      // Se a página passou uma lista de contexto, usa-a como fila para auto-next.
      if (contextQueue && contextQueue.length > 0) {
        const playable = contextQueue.filter((t) => Boolean(t?.audioUrl));
        const idx = playable.findIndex((item) => item.id === track.id);
        const safeIdx = idx >= 0 ? idx : 0;
        queueRef.current = playable;
        queueIndexRef.current = safeIdx;
        setQueueState(playable);
        setQueueIndex(safeIdx);
        startAudio(playable[safeIdx], true);
        return;
      }
      const idx = queueRef.current.findIndex((item) => item.id === track.id);
      if (idx >= 0) {
        queueIndexRef.current = idx;
        setQueueIndex(idx);
        startAudio(track);
      } else {
        queueRef.current = [track];
        queueIndexRef.current = 0;
        setQueueState([track]);
        setQueueIndex(0);
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
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
      audioRef.current = null;
    }
    queueRef.current = [];
    queueIndexRef.current = -1;
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
    if (idx >= q.length - 1) return; // fim da fila — não volta ao início
    const nextIdx = idx + 1;
    queueIndexRef.current = nextIdx;
    setQueueIndex(nextIdx);
    startAudio(q[nextIdx]);
  }, [startAudio]);

  const previous = useCallback(() => {
    const q = queueRef.current;
    const idx = queueIndexRef.current;
    if (q.length === 0) return;
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setProgress(0);
      return;
    }
    const prevIdx = idx > 0 ? idx - 1 : q.length - 1;
    queueIndexRef.current = prevIdx;
    setQueueIndex(prevIdx);
    startAudio(q[prevIdx]);
  }, [startAudio]);

  const setQueue = useCallback((tracks: Track[], startIndex = 0) => {
    const playableTracks = tracks.filter((track) => Boolean(track?.audioUrl));

    if (playableTracks.length === 0) {
      queueRef.current = [];
      queueIndexRef.current = -1;
      setQueueState([]);
      setQueueIndex(-1);
      setPlaying(false);
      return;
    }

    const safeStartIndex = Math.min(Math.max(startIndex, 0), playableTracks.length - 1);

    queueRef.current = playableTracks;
    queueIndexRef.current = safeStartIndex;
    setQueueState(playableTracks);
    setQueueIndex(safeStartIndex);
    startAudio(playableTracks[safeStartIndex]);
  }, [startAudio]);

  const nextTrack = queueIndex >= 0 && queueIndex < queue.length - 1 ? queue[queueIndex + 1] : null;

  return (
    <PlayerContext.Provider
      value={{
        currentTrack, nextTrack, playing, progress, duration, currentTime,
        queue, queueIndex,
        play: playAudio, pause, toggle, seek, stop, next, previous, setQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
