import { useState, useRef, useCallback, useEffect } from "react";

type AudioMode = "file" | "tts" | "none";

interface UseEbookAudioOptions {
  audioUrl?: string;
  /** Text extracted from current pages for TTS fallback */
  pageText?: string;
  /** Text of the next page(s) — used to pre-warm TTS */
  nextPageText?: string;
  lang?: string;
  /** Called when TTS finishes reading the current page text */
  onPageNarrationEnd?: () => void;
}

/**
 * Chrome/Edge pause speechSynthesis after ~15 s of continuous speech.
 * A periodic resume() call keeps it alive.
 */
function startKeepAlive(intervalRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>) {
  stopKeepAlive(intervalRef);
  intervalRef.current = setInterval(() => {
    const synth = window.speechSynthesis;
    if (synth.speaking && !synth.paused) {
      synth.pause();
      synth.resume();
    }
  }, 10_000);
}

function stopKeepAlive(intervalRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>) {
  if (intervalRef.current) {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }
}

/** Cached preferred voice per language to avoid repeated lookups */
const voiceCache = new Map<string, SpeechSynthesisVoice | null>();

function getPreferredVoice(lang: string): SpeechSynthesisVoice | null {
  if (voiceCache.has(lang)) return voiceCache.get(lang)!;
  const voices = window.speechSynthesis.getVoices();
  const prefix = lang.split("-")[0];
  const voice =
    voices.find((v) => v.lang.startsWith(prefix) && v.localService) ||
    voices.find((v) => v.lang.startsWith(prefix)) ||
    null;
  voiceCache.set(lang, voice);
  return voice;
}

export function useEbookAudio({ audioUrl, pageText, nextPageText, lang = "pt-BR", onPageNarrationEnd }: UseEbookAudioOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<AudioMode>("none");
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  /** Character index of the word currently being spoken (TTS mode) */
  const [charIndex, setCharIndex] = useState(-1);
  /** Length of the word currently being spoken */
  const [charLength, setCharLength] = useState(0);

  const fileAudioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const onPageEndRef = useRef(onPageNarrationEnd);
  onPageEndRef.current = onPageNarrationEnd;
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Track if a TTS utterance is queued to avoid double-speaking
  const ttsQueuedRef = useRef(false);
  // Pre-warmed utterance for next page
  const nextUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  // Throttle ref for timeupdate
  const lastTimeUpdateRef = useRef(0);

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

  // Setup file audio with preloading
  useEffect(() => {
    if (mode !== "file" || !audioUrl) return;

    const audio = new Audio();
    audio.preload = "auto";
    audio.volume = 0.8;
    audio.src = audioUrl;
    fileAudioRef.current = audio;

    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => { setIsPlaying(false); setProgress(0); };
    // Throttle timeupdate to ~4 Hz instead of ~15-60 Hz
    const onTimeUpdate = () => {
      const now = performance.now();
      if (now - lastTimeUpdateRef.current < 250) return;
      lastTimeUpdateRef.current = now;
      setProgress(audio.currentTime);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      fileAudioRef.current = null;
    };
  }, [mode, audioUrl]);

  // Pre-warm TTS voices so first utterance doesn't lag
  useEffect(() => {
    if (mode !== "tts") return;
    window.speechSynthesis.getVoices();
    // Some browsers fire voiceschanged asynchronously — clear cache on change
    const onVoicesChanged = () => voiceCache.clear();
    window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
    };
  }, [mode]);

  // Pre-warm next page utterance in background
  useEffect(() => {
    if (mode !== "tts" || !nextPageText) {
      nextUtteranceRef.current = null;
      return;
    }
    const utt = new SpeechSynthesisUtterance(nextPageText);
    utt.lang = lang;
    utt.rate = 0.95;
    const voice = getPreferredVoice(lang);
    if (voice) utt.voice = voice;
    nextUtteranceRef.current = utt;
  }, [mode, nextPageText, lang]);

  // Stop TTS + keep-alive when component unmounts or mode changes
  useEffect(() => {
    return () => {
      if (mode === "tts") {
        window.speechSynthesis?.cancel();
      }
      stopKeepAlive(keepAliveRef);
      ttsQueuedRef.current = false;
    };
  }, [mode]);

  /** Create and speak a TTS utterance for given text */
  const speakText = useCallback((text: string) => {
    if (!text || mode !== "tts") return;

    // Cancel only if something is actively speaking — minimize gap
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }

    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang;
    utt.rate = 0.95;
    const voice = getPreferredVoice(lang);
    if (voice) utt.voice = voice;

    utt.onboundary = (e) => {
      if (e.name === "word") {
        setCharIndex(e.charIndex);
        setCharLength(e.charLength ?? 0);
      }
    };
    utt.onend = () => {
      ttsQueuedRef.current = false;
      setIsPlaying(false);
      setProgress(0);
      setCharIndex(-1);
      setCharLength(0);
      stopKeepAlive(keepAliveRef);
      onPageEndRef.current?.();
    };
    utt.onerror = (e) => {
      ttsQueuedRef.current = false;
      if (e.error !== "interrupted") {
        console.warn("[EbookAudio] TTS error:", e.error);
      }
      setIsPlaying(false);
      stopKeepAlive(keepAliveRef);
    };

    utteranceRef.current = utt;
    ttsQueuedRef.current = true;
    window.speechSynthesis.speak(utt);
    startKeepAlive(keepAliveRef);
    setIsPlaying(true);
    setCharIndex(0);
    setCharLength(0);
  }, [mode, lang]);

  const play = useCallback(() => {
    if (mode === "file" && fileAudioRef.current) {
      fileAudioRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else if (mode === "tts" && pageText) {
      speakText(pageText);
    }
  }, [mode, pageText, speakText]);

  const pause = useCallback(() => {
    if (mode === "file" && fileAudioRef.current) {
      fileAudioRef.current.pause();
    } else if (mode === "tts") {
      window.speechSynthesis.pause();
      stopKeepAlive(keepAliveRef);
    }
    setIsPlaying(false);
  }, [mode]);

  const resume = useCallback(() => {
    if (mode === "file" && fileAudioRef.current) {
      fileAudioRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else if (mode === "tts") {
      window.speechSynthesis.resume();
      startKeepAlive(keepAliveRef);
      setIsPlaying(true);
    }
  }, [mode]);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
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
      stopKeepAlive(keepAliveRef);
      ttsQueuedRef.current = false;
    }
    setIsPlaying(false);
    setProgress(0);
    setCharIndex(-1);
    setCharLength(0);
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
    /** TTS boundary tracking */
    charIndex,
    charLength,
  };
}
