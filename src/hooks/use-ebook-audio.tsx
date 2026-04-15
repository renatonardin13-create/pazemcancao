import { useState, useRef, useCallback, useEffect } from "react";

type AudioMode = "file" | "tts" | "none";

interface UseEbookAudioOptions {
  audioUrl?: string;
  /** Text extracted from current pages for TTS fallback */
  pageText?: string;
  lang?: string;
}

export function useEbookAudio({ audioUrl, pageText, lang = "pt-BR" }: UseEbookAudioOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<AudioMode>("none");
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const fileAudioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Determine mode
  useEffect(() => {
    if (audioUrl) {
      setMode("file");
    } else if ("speechSynthesis" in window) {
      setMode("tts");
    } else {
      setMode("none");
    }
  }, [audioUrl]);

  // Setup file audio
  useEffect(() => {
    if (mode !== "file" || !audioUrl) return;

    const audio = new Audio(audioUrl);
    audio.volume = 0.8;
    fileAudioRef.current = audio;

    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => { setIsPlaying(false); setProgress(0); };
    const onTimeUpdate = () => {
      setProgress(audio.currentTime);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      fileAudioRef.current = null;
    };
  }, [mode, audioUrl]);

  // Stop TTS when component unmounts or mode changes
  useEffect(() => {
    return () => {
      if (mode === "tts") {
        window.speechSynthesis?.cancel();
      }
    };
  }, [mode]);

  const play = useCallback(() => {
    if (mode === "file" && fileAudioRef.current) {
      fileAudioRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else if (mode === "tts" && pageText) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(pageText);
      utt.lang = lang;
      utt.rate = 0.95;
      utt.onend = () => { setIsPlaying(false); setProgress(0); };
      utteranceRef.current = utt;
      window.speechSynthesis.speak(utt);
      setIsPlaying(true);
    }
  }, [mode, pageText, lang]);

  const pause = useCallback(() => {
    if (mode === "file" && fileAudioRef.current) {
      fileAudioRef.current.pause();
    } else if (mode === "tts") {
      window.speechSynthesis.pause();
    }
    setIsPlaying(false);
  }, [mode]);

  const resume = useCallback(() => {
    if (mode === "file" && fileAudioRef.current) {
      fileAudioRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else if (mode === "tts") {
      window.speechSynthesis.resume();
      setIsPlaying(true);
    }
  }, [mode]);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      // If file audio has progress, resume; otherwise start fresh
      if (mode === "file" && fileAudioRef.current && fileAudioRef.current.currentTime > 0) {
        resume();
      } else if (mode === "tts" && window.speechSynthesis.paused) {
        resume();
      } else {
        play();
      }
    }
  }, [isPlaying, pause, resume, play, mode]);

  const stop = useCallback(() => {
    if (mode === "file" && fileAudioRef.current) {
      fileAudioRef.current.pause();
      fileAudioRef.current.currentTime = 0;
    } else if (mode === "tts") {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setProgress(0);
  }, [mode]);

  const seek = useCallback((time: number) => {
    if (mode === "file" && fileAudioRef.current) {
      fileAudioRef.current.currentTime = time;
      setProgress(time);
    }
  }, [mode]);

  const skipForward = useCallback((seconds = 15) => {
    if (mode === "file" && fileAudioRef.current) {
      const t = Math.min(fileAudioRef.current.currentTime + seconds, fileAudioRef.current.duration || 0);
      fileAudioRef.current.currentTime = t;
      setProgress(t);
    }
  }, [mode]);

  const skipBack = useCallback((seconds = 15) => {
    if (mode === "file" && fileAudioRef.current) {
      const t = Math.max(fileAudioRef.current.currentTime - seconds, 0);
      fileAudioRef.current.currentTime = t;
      setProgress(t);
    }
  }, [mode]);

  const available = mode !== "none";
  const isFileMode = mode === "file";

  return {
    isPlaying,
    available,
    isFileMode,
    progress,
    duration,
    toggle,
    stop,
    seek,
    skipForward,
    skipBack,
    mode,
  };
}
