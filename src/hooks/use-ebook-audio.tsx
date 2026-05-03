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

// ── Voice quality ranking ──
// Prioritise neural / premium voices; deprioritise generic ones.
const VOICE_QUALITY_KEYWORDS = {
  premium: ["neural", "wavenet", "premium", "enhanced", "natural", "studio"],
  good: ["online", "remote", "google", "microsoft", "apple"],
  avoid: ["espeak", "mbrola"],
};

/** Score a voice — higher is better. */
function scoreVoice(v: SpeechSynthesisVoice, langPrefix: string): number {
  if (!v.lang.startsWith(langPrefix)) return -100;
  const nameLower = v.name.toLowerCase();

  // Avoid bad voices
  if (VOICE_QUALITY_KEYWORDS.avoid.some((k) => nameLower.includes(k))) return -50;

  let score = 0;
  // Premium keywords
  if (VOICE_QUALITY_KEYWORDS.premium.some((k) => nameLower.includes(k))) score += 30;
  // Good network voices
  if (VOICE_QUALITY_KEYWORDS.good.some((k) => nameLower.includes(k))) score += 15;
  // Non-local voices tend to be higher quality (network-based)
  if (!v.localService) score += 10;
  // Prefer female voices for narration (generally warmer tone)
  if (nameLower.includes("female") || nameLower.includes("luciana") || nameLower.includes("francisca") || nameLower.includes("fernanda")) score += 5;
  // Exact language match (pt-BR vs pt-PT)
  if (v.lang === "pt-BR") score += 8;

  return score;
}

/** Select the best available voice for narration. */
function selectBestVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const langPrefix = lang.split("-")[0]; // "pt"
  const candidates = voices
    .map((v) => ({ voice: v, score: scoreVoice(v, langPrefix) }))
    .filter((c) => c.score > -50)
    .sort((a, b) => b.score - a.score);

  return candidates.length > 0 ? candidates[0].voice : null;
}

/**
 * Split text into natural sentences for chunked reading.
 * Keeps sentences ≤ 200 chars to avoid Chrome's 15s pause bug.
 */
function splitIntoChunks(text: string, maxLen = 200): string[] {
  if (!text) return [];
  // Split on sentence boundaries
  const rawSentences = text.match(/[^.!?]+[.!?]*\s*/g) || [text];
  const chunks: string[] = [];

  for (const raw of rawSentences) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    if (trimmed.length <= maxLen) {
      chunks.push(trimmed);
    } else {
      // Break long sentences at commas or semicolons
      const parts = trimmed.split(/(?<=[,;])\s+/);
      let current = "";
      for (const part of parts) {
        if (current && (current + " " + part).length > maxLen) {
          chunks.push(current.trim());
          current = part;
        } else {
          current = current ? current + " " + part : part;
        }
      }
      if (current.trim()) chunks.push(current.trim());
    }
  }
  return chunks;
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
  }, 8_000); // 8s to stay well within Chrome's limit
}

function stopKeepAlive(intervalRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>) {
  if (intervalRef.current) {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }
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
  /** Currently active chunk index */
  const [currentChunk, setCurrentChunk] = useState(-1);

  const fileAudioRef = useRef<HTMLAudioElement | null>(null);
  const onPageEndRef = useRef(onPageNarrationEnd);
  onPageEndRef.current = onPageNarrationEnd;
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef(false);
  const bestVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const chunksRef = useRef<string[]>([]);
  const chunkIndexRef = useRef(0);
  const globalCharOffsetRef = useRef(0);
  const isPausedRef = useRef(false);
  const isPlayingRef = useRef(false);

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

  // Pre-load voices (async on some browsers)
  useEffect(() => {
    if (mode !== "tts") return;
    const loadVoices = () => {
      bestVoiceRef.current = selectBestVoice(lang);
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, [mode, lang]);

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
    const onTimeUpdate = () => setProgress(audio.currentTime);

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

  // Stop TTS + keep-alive when component unmounts or mode changes
  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      if (mode === "tts") {
        window.speechSynthesis?.cancel();
      }
      stopKeepAlive(keepAliveRef);
    };
  }, [mode]);

  /** Speak a single chunk, resolving when done. */
  const speakChunk = useCallback(
    (text: string, charOffset: number): Promise<"ended" | "cancelled"> => {
      return new Promise((resolve) => {
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = lang;
        utt.rate = 0.92; // Slightly slower for more natural narration
        utt.pitch = 1.0;
        utt.volume = 1.0;

        // Use the best voice we found
        const voice = bestVoiceRef.current || selectBestVoice(lang);
        if (voice) {
          utt.voice = voice;
          bestVoiceRef.current = voice;
        }

        utt.onboundary = (e) => {
          if (e.name === "word") {
            setCharIndex(charOffset + e.charIndex);
            setCharLength(e.charLength ?? 0);
          }
        };

        utt.onend = () => {
          stopKeepAlive(keepAliveRef);
          resolve("ended");
        };

        utt.onerror = (e) => {
          stopKeepAlive(keepAliveRef);
          if (e.error === "interrupted" || e.error === "canceled") {
            resolve("cancelled");
          } else {
            console.warn("[EbookAudio] TTS chunk error:", e.error);
            resolve("cancelled");
          }
        };

        window.speechSynthesis.speak(utt);
        startKeepAlive(keepAliveRef);
      });
    },
    [lang]
  );

  /** Play all chunks sequentially from a given index. */
  const playChunksFrom = useCallback(
    async (startIndex: number, chunks: string[]) => {
      cancelledRef.current = false;
      isPlayingRef.current = true;
      setIsPlaying(true);

      let charOffset = 0;
      // Calculate char offset for starting index
      for (let i = 0; i < startIndex; i++) {
        charOffset += chunks[i].length + 2; // ". " separator equivalent
      }

      for (let i = startIndex; i < chunks.length; i++) {
        if (cancelledRef.current) break;

        chunkIndexRef.current = i;
        globalCharOffsetRef.current = charOffset;
        setCurrentChunk(i);

        // Small natural pause between sentences (50-150ms)
        if (i > startIndex) {
          await new Promise((r) => setTimeout(r, 80));
        }

        if (cancelledRef.current) break;

        const result = await speakChunk(chunks[i], charOffset);

        charOffset += chunks[i].length + 2;

        if (result === "cancelled") break;
      }

      isPlayingRef.current = false;
      setIsPlaying(false);
      setCharIndex(-1);
      setCharLength(0);
      setCurrentChunk(-1);

      // If we finished all chunks naturally (not cancelled), notify page end
      if (!cancelledRef.current) {
        onPageEndRef.current?.();
      }
    },
    [speakChunk]
  );

  const play = useCallback(() => {
    if (mode === "file" && fileAudioRef.current) {
      fileAudioRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else if (mode === "tts" && pageText) {
      window.speechSynthesis.cancel();
      cancelledRef.current = false;
      isPausedRef.current = false;

      const chunks = splitIntoChunks(pageText);
      chunksRef.current = chunks;

      if (chunks.length > 0) {
        playChunksFrom(0, chunks);
      }
    }
  }, [mode, pageText, playChunksFrom]);

  const pause = useCallback(() => {
    if (mode === "file" && fileAudioRef.current) {
      fileAudioRef.current.pause();
    } else if (mode === "tts") {
      window.speechSynthesis.pause();
      isPausedRef.current = true;
      stopKeepAlive(keepAliveRef);
    }
    setIsPlaying(false);
  }, [mode]);

  const resume = useCallback(() => {
    if (mode === "file" && fileAudioRef.current) {
      fileAudioRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else if (mode === "tts") {
      if (isPausedRef.current && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        startKeepAlive(keepAliveRef);
        isPausedRef.current = false;
        setIsPlaying(true);
      } else {
        // If not paused, restart from current chunk
        play();
      }
    }
  }, [mode, play]);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      if (mode === "file" && fileAudioRef.current && fileAudioRef.current.currentTime > 0) {
        resume();
      } else if (mode === "tts" && isPausedRef.current) {
        resume();
      } else {
        play();
      }
    }
  }, [isPlaying, pause, resume, play, mode]);

  const stop = useCallback(() => {
    cancelledRef.current = true;
    if (mode === "file" && fileAudioRef.current) {
      fileAudioRef.current.pause();
      fileAudioRef.current.currentTime = 0;
    } else if (mode === "tts") {
      window.speechSynthesis.cancel();
      stopKeepAlive(keepAliveRef);
      isPausedRef.current = false;
    }
    setIsPlaying(false);
    setProgress(0);
    setCharIndex(-1);
    setCharLength(0);
    setCurrentChunk(-1);
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
    /** Current chunk being read (for progress indication) */
    currentChunk,
    totalChunks: chunksRef.current.length,
  };
}
