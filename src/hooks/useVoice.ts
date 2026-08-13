import { useState, useEffect, useRef, useCallback } from 'react';
import { env } from '@/config/env';

const TTS_URL = `${env.apiBaseUrl}/tts/synthesize`;

// ─── Module-level singleton to prevent zombie audio ────────────
// This persists across React re-renders and component remounts
let _globalAudio: HTMLAudioElement | null = null;
let _globalRecognition: any = null;
let _globalSessionId = 0; // increment on each new session to kill stale callbacks

function killAllAudio() {
  if (_globalAudio) {
    _globalAudio.pause();
    _globalAudio.src = '';
    _globalAudio = null;
  }
  window.speechSynthesis?.cancel();
}

function killRecognition() {
  if (_globalRecognition) {
    try { _globalRecognition.abort(); } catch {}
    _globalRecognition = null;
  }
}

// ─── Clean text for TTS ───────────────────────────────────────
function cleanTextForTTS(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, m => m.slice(1, -1))
    .replace(/\[IMAGE:.*?\]/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27FF}\u{FE00}-\u{FEFF}]/gu, '')
    .replace(/[*#_\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectSinging(text: string): boolean {
  const l = text.toLowerCase();
  return l.includes('twinkle') || l.includes('chanda mama') || l.includes('chaiyya') ||
    l.includes('la la la') || l.includes('sa re ga ma') || l.includes('verse') || l.includes('chorus');
}

// ─────────────────────────────────────────────────────────────
export const useVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(() =>
    localStorage.getItem('orvixa_voice_enabled') === 'true');
  const [voiceLanguage, setVoiceLanguage] = useState<'en-US' | 'hi-IN'>(() =>
    (localStorage.getItem('orvixa_voice_language') as any) || 'en-US');

  // Track our own session — stale sessions cannot play audio
  const sessionIdRef = useRef(0);
  const listeningRef = useRef(false);
  const silenceTimerRef = useRef<any>(null);
  const interimTranscriptRef = useRef('');
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => { localStorage.setItem('orvixa_voice_enabled', String(voiceEnabled)); }, [voiceEnabled]);
  useEffect(() => { localStorage.setItem('orvixa_voice_language', voiceLanguage); }, [voiceLanguage]);

  const selectBestVoice = useCallback((lang: string): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis?.getVoices() || [];
    if (!voices.length) return null;

    const isHindi = lang.toLowerCase().includes('hi');

    if (isHindi) {
      return voices.find(v => /google\s+हिन्दी|google\s+hindi/i.test(v.name))
        || voices.find(v => /swara|heera|kalpana/i.test(v.name) && v.lang.toLowerCase().includes('hi'))
        || voices.find(v => v.lang.toLowerCase().includes('hi'))
        || voices.find(v => /india/i.test(v.name))
        || voices[0];
    }

    return voices.find(v => /google\s+us\s+english/i.test(v.name))
      || voices.find(v => /jenny|natural|zira|aria|hazel/i.test(v.name) && v.lang.toLowerCase().includes('en'))
      || voices.find(v => /google/i.test(v.name) && v.lang.toLowerCase().includes('en'))
      || voices.find(v => v.lang.toLowerCase().includes('en'))
      || voices[0];
  }, []);

  // ── SPEAK — kills ALL zombie audio first ─────────────────────
  const speakText = useCallback(async (text: string) => {
    if (!text) return;

    // Kill any previous audio globally
    killAllAudio();

    // Cancel any in-flight TTS fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsSpeaking(false);

    const clean = cleanTextForTTS(text);
    if (!clean) return;

    const isSinging = detectSinging(text);
    const mySession = sessionIdRef.current; // capture — stale closures will have old value

    // For standard voice responses, use instant local Browser SpeechSynthesis (0ms network delay!)
    if (!isSinging) {
      const voice = selectBestVoice(voiceLanguage);
      const sentences = clean.match(/[^.!?\n]+[.!?\n]+/g) || [clean];
      const shortText = sentences.slice(0, 2).join(' ').trim();

      window.speechSynthesis?.cancel();
      const u = new SpeechSynthesisUtterance(shortText || clean.slice(0, 250));
      u.lang = voiceLanguage;
      u.pitch = 1.0;  // 100% natural human pitch
      u.rate = 1.0;   // 100% natural human speaking rate
      if (voice) u.voice = voice;
      u.onstart = () => { if (sessionIdRef.current === mySession) setIsSpeaking(true); };
      u.onend = () => { if (sessionIdRef.current === mySession) setIsSpeaking(false); };
      u.onerror = () => { if (sessionIdRef.current === mySession) setIsSpeaking(false); };
      window.speechSynthesis?.speak(u);
      return;
    }

    // Attempt Gemini TTS for singing / special requests
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // 500ms race timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 600);

    let usedGemini = false;
    try {
      const geminiKey = (() => {
        try { return JSON.parse(localStorage.getItem('orvixa_system_settings') || '{}')?.geminiApiKey || null; }
        catch { return null; }
      })();

      const res = await fetch(TTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean, voice: 'Aoede', is_singing: isSinging, gemini_api_key: geminiKey }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check if our session is still active
      if (sessionIdRef.current !== mySession) return;

      if (res.ok && res.status !== 204) {
        const audioBuffer = await res.arrayBuffer();
        if (sessionIdRef.current !== mySession) return;

        if (audioBuffer && audioBuffer.byteLength > 0) {
          const blob = new Blob([audioBuffer], { type: 'audio/wav' });
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);

          audio.onplay = () => { if (sessionIdRef.current === mySession) setIsSpeaking(true); };
          audio.onended = () => {
            URL.revokeObjectURL(url);
            if (_globalAudio === audio) _globalAudio = null;
            if (sessionIdRef.current === mySession) setIsSpeaking(false);
          };
          audio.onerror = () => {
            URL.revokeObjectURL(url);
            if (_globalAudio === audio) _globalAudio = null;
            if (sessionIdRef.current === mySession) setIsSpeaking(false);
          };

          killAllAudio();
          if (sessionIdRef.current !== mySession) return;

          _globalAudio = audio;
          await audio.play();
          usedGemini = true;
        }
      }
    } catch (e: any) {
      clearTimeout(timeoutId);
      if (e.name === 'AbortError') {
        // Timed out or cancelled — proceed to fallback
      }
    }

    // Browser TTS fallback
    if (!usedGemini && sessionIdRef.current === mySession) {
      const voice = selectBestVoice(voiceLanguage);
      const sentences = clean.match(/[^.!?\n]+[.!?\n]+/g) || [clean];
      const shortText = sentences.slice(0, 2).join(' ').trim();

      window.speechSynthesis?.cancel();
      const u = new SpeechSynthesisUtterance(shortText || clean.slice(0, 250));
      u.lang = voiceLanguage;
      u.pitch = 1.08;
      u.rate = 1.05;
      if (voice) u.voice = voice;
      u.onstart = () => { if (sessionIdRef.current === mySession) setIsSpeaking(true); };
      u.onend = () => { if (sessionIdRef.current === mySession) setIsSpeaking(false); };
      u.onerror = () => { if (sessionIdRef.current === mySession) setIsSpeaking(false); };
      window.speechSynthesis?.speak(u);
    }
  }, [voiceLanguage, selectBestVoice]);

  // ── INTERRUPT / STOP — global kill ───────────────────────────
  const stopSpeaking = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    killAllAudio();
    setIsSpeaking(false);
  }, []);

  const interruptSpeaking = stopSpeaking;

  // ── CONTINUOUS LISTENING with 900ms silence detection ─────────
  const startListening = useCallback((onResult: (text: string) => void) => {
    if (listeningRef.current) return;

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported.'); return; }

    setHasPermissionError(false);
    listeningRef.current = true;

    const mySession = sessionIdRef.current;

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = voiceLanguage;
    rec.maxAlternatives = 1;

    _globalRecognition = rec;

    rec.onstart = () => {
      if (sessionIdRef.current === mySession) setIsListening(true);
    };

    rec.onresult = (event: any) => {
      if (sessionIdRef.current !== mySession) return; // stale session — ignore

      let interimText = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += t;
        } else {
          interimText += t;
        }
      }

      if (finalText.trim()) {
        clearTimeout(silenceTimerRef.current);
        interimTranscriptRef.current = '';
        onResult(finalText.trim());
      } else if (interimText.trim()) {
        interimTranscriptRef.current = interimText;
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          const toSubmit = interimTranscriptRef.current.trim();
          if (toSubmit && sessionIdRef.current === mySession) {
            interimTranscriptRef.current = '';
            onResult(toSubmit);
          }
        }, 250);
      }
    };

    rec.onerror = (e: any) => {
      if (e.error === 'not-allowed') {
        setHasPermissionError(true);
        listeningRef.current = false;
        setIsListening(false);
        return;
      }
      // Auto-restart on network/no-speech errors (only if session still active)
      if (listeningRef.current && sessionIdRef.current === mySession && e.error !== 'aborted') {
        setTimeout(() => {
          if (listeningRef.current && sessionIdRef.current === mySession) {
            try { rec.start(); } catch {}
          }
        }, 400);
      }
    };

    rec.onend = () => {
      // Auto-restart for continuous mode — only if our session is still active
      if (listeningRef.current && sessionIdRef.current === mySession) {
        try { rec.start(); } catch {}
      } else {
        setIsListening(false);
      }
    };

    try { rec.start(); } catch {}
  }, [voiceLanguage]);

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    clearTimeout(silenceTimerRef.current);
    interimTranscriptRef.current = '';
    killRecognition();
    setIsListening(false);
  }, []);

  // ── NEW SESSION — call this when voice mode opens ─────────────
  const startNewSession = useCallback(() => {
    _globalSessionId++;
    sessionIdRef.current = _globalSessionId;
    killAllAudio();
    killRecognition();
    setIsSpeaking(false);
    setIsListening(false);
  }, []);

  // ── FULL CLEANUP — call this when voice mode closes ───────────
  const fullCleanup = useCallback(() => {
    listeningRef.current = false;
    clearTimeout(silenceTimerRef.current);
    interimTranscriptRef.current = '';
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    killAllAudio();
    killRecognition();
    setIsSpeaking(false);
    setIsListening(false);
  }, []);

  return {
    isListening, isSpeaking, hasPermissionError,
    voiceEnabled, setVoiceEnabled,
    voiceLanguage, setVoiceLanguage,
    startListening, stopListening,
    speakText, stopSpeaking, interruptSpeaking,
    startNewSession, fullCleanup,
  };
};
