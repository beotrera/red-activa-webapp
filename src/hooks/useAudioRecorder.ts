import { useCallback, useRef, useState } from "react";

export type RecorderState = "idle" | "requesting" | "recording" | "recorded";

export const AUDIO_MAX_DURATION_SECONDS = 120; // 2 minutes
export const AUDIO_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function pickMimeType(): string {
  const candidates = ["audio/webm", "audio/mp4", "audio/ogg"];
  for (const type of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "";
}

function extensionFor(mimeType: string): string {
  if (mimeType.includes("mp4")) return "m4a";
  if (mimeType.includes("ogg")) return "ogg";
  return "webm";
}

export function useAudioRecorder() {
  const [state, setState] = useState<RecorderState>("idle");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const maxDurationTimeoutRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const clearMaxDurationTimeout = () => {
    if (maxDurationTimeoutRef.current != null) {
      window.clearTimeout(maxDurationTimeoutRef.current);
      maxDurationTimeoutRef.current = null;
    }
  };

  const start = useCallback(async (): Promise<boolean> => {
    if (state === "recording" || state === "requesting") return false;
    setError(null);
    setState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        clearTimer();
        clearMaxDurationTimeout();
        const usedType = recorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: usedType });
        stream.getTracks().forEach((track) => track.stop());

        if (blob.size > AUDIO_MAX_SIZE_BYTES) {
          setError(
            `El audio supera el límite permitido (${(AUDIO_MAX_SIZE_BYTES / 1024 / 1024).toFixed(0)} MB). Grabe una nota más corta.`
          );
          setState("idle");
          setElapsedSeconds(0);
          return;
        }

        const file = new File([blob], `nota-de-voz-${Date.now()}.${extensionFor(usedType)}`, { type: usedType });
        setAudioFile(file);
        setAudioUrl(URL.createObjectURL(blob));
        setState("recorded");
      };

      recorderRef.current = recorder;
      recorder.start();
      setElapsedSeconds(0);
      timerRef.current = window.setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
      maxDurationTimeoutRef.current = window.setTimeout(() => {
        recorderRef.current?.stop();
      }, AUDIO_MAX_DURATION_SECONDS * 1000);
      setState("recording");
      return true;
    } catch {
      setError("No se pudo acceder al micrófono. Revise los permisos del navegador.");
      setState("idle");
      return false;
    }
  }, [state]);

  const stop = useCallback(() => {
    recorderRef.current?.stop();
  }, []);

  const discard = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioFile(null);
    setAudioUrl(null);
    setElapsedSeconds(0);
    setError(null);
    setState("idle");
  }, [audioUrl]);

  return { state, audioFile, audioUrl, elapsedSeconds, error, start, stop, discard };
}
