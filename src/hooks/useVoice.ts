import { useState, useEffect, useRef, useCallback } from 'react';
import { env } from '@/config/env';

const TTS_URL = `${env.apiBaseUrl}/tts/synthesize`;

// ─── Strip text for TTS ───────────────────────────────────────
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

// ─── Gemini TTS via Backend ───────────────────────────────────
async function playGeminiTTS(
  text: string,
  isSinging: boolean,
  onStart: () => void,
  onEnd: () => void,
  onError: () => void
): Promise<HTMLAudioElement | null> {
  const clean = cleanTextForTTS(text);
  if (!clean) { onEnd(); return null; }

  try {
    const geminiKey = (() => {
      try { return JSON.parse(localStorage.getItem('orvixa_system_settings') || '{}')?.geminiApiKey || null; }
      catch { return null; }
    })();

    const res = await fetch(TTS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: clean, voice: 'Aoede', is_singing: isSinging, gemini_api_key: geminiKey }),
    });

    if (!res.ok || res.status === 204) throw new Error('TTS unavailable');

    const audioBuffer = await res.arrayBuffer();
    if (!audioBuffer || audioBuffer.byteLength === 0) throw new Error('Empty audio');

    const blob = new Blob([audioBuffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    audio.onplay = onStart;
    audio.onended = () => { URL.revokeObjectURL(url); onEnd(); };
    audio.onerror = () => { URL.revokeObjectURL(url); onError(); };

    await audio.play();
    return audio;
  } catch {
    onError();
    return null;
  }
}

// ─── Browser Fallback TTS ─────────────────────────────────────
function browserSpeak(
  text: string,
  lang: string,
  voice: SpeechSynthesisVoice | null,
  onStart: () => void,
  onEnd: () => void
) {
  const clean = cleanTextForTTS(text);
  if (!clean) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = lang;
  u.pitch = 1.05;
  u.rate = 0.98;
  if (voice) u.voice = voice;
  u.onstart = onStart;
  u.onend = onEnd;
  u.onerror = onEnd;
  window.speechSynthesis.speak(u);
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

  const recognitionRef = useRef<any>(null);
  const listeningRef = useRef(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const silenceTimerRef = useRef<any>(null);
  const interimTranscriptRef = useRef('');

  useEffect(() => { localStorage.setItem('orvixa_voice_enabled', String(voiceEnabled)); }, [voiceEnabled]);
  useEffect(() => { localStorage.setItem('orvixa_voice_language', voiceLanguage); }, [voiceLanguage]);

  const selectBestVoice = useCallback((lang: string) => {
    const voices = window.speechSynthesis.getVoices();
    let pool = voices.filter(v => v.lang.toLowerCase().startsWith(lang.toLowerCase().slice(0, 2)));
    let best = pool.find(v => v.name.includes('Google') && v.name.toLowerCase().includes('female'))
      || pool.find(v => v.name.includes('Google'))
      || pool.find(v => /zira|hazel|heera|kalpana|female|natural/i.test(v.name))
      || pool[0] || null;
    return best;
  }, []);

  // ── CONTINUOUS LISTENING with 800ms silence auto-submit ───────
  const startListening = useCallback((onResult: (text: string) => void) => {
    if (listeningRef.current) return;

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported.'); return; }

    try {
      setHasPermissionError(false);

      const rec = new SR();
      rec.continuous = true;       // Keep listening continuously
      rec.interimResults = true;   // Get partial results immediately
      rec.lang = voiceLanguage;

      recognitionRef.current = rec;
      listeningRef.current = true;

      rec.onstart = () => setIsListening(true);

      rec.onresult = (event: any) => {
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

        // Update interim ref so we can grab it on silence timeout
        if (interimText) interimTranscriptRef.current = interimText;

        // Clear existing silence timer and reset it
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        if (finalText.trim()) {
          // Final result from browser — submit immediately
          interimTranscriptRef.current = '';
          clearTimeout(silenceTimerRef.current);
          onResult(finalText.trim());
        } else if (interimText.trim()) {
          // Still speaking — wait 900ms of silence then auto-submit
          silenceTimerRef.current = setTimeout(() => {
            const toSubmit = interimTranscriptRef.current.trim();
            if (toSubmit) {
              interimTranscriptRef.current = '';
              onResult(toSubmit);
            }
          }, 900);
        }
      };

      rec.onerror = (e: any) => {
        setIsListening(false);
        listeningRef.current = false;
        if (e.error === 'not-allowed') setHasPermissionError(true);
        // Auto-restart on non-fatal errors
        if (e.error !== 'not-allowed' && e.error !== 'aborted') {
          setTimeout(() => {
            if (!listeningRef.current) startListening(onResult);
          }, 300);
        }
      };

      rec.onend = () => {
        // Auto-restart for continuous listening
        if (listeningRef.current) {
          try { rec.start(); } catch {}
        } else {
          setIsListening(false);
        }
      };

      rec.start();
    } catch (err) {
      setIsListening(false);
      listeningRef.current = false;
    }
  }, [voiceLanguage]);

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); }
    interimTranscriptRef.current = '';
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // ── SPEAK — stops current audio if interrupted ────────────────
  const speakText = useCallback(async (text: string) => {
    if (!text) return;

    // Stop any existing speech immediately
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    const isSinging = detectSinging(text);
    const audio = await playGeminiTTS(
      text,
      isSinging,
      () => setIsSpeaking(true),
      () => { setIsSpeaking(false); currentAudioRef.current = null; },
      () => {
        // Fallback to browser TTS
        const voice = selectBestVoice(voiceLanguage);
        const sentences = text.match(/[^.!?\n]+[.!?\n]+/g) || [text];
        const shortText = sentences.slice(0, 2).join(' ').trim();
        browserSpeak(shortText || text.slice(0, 300), voiceLanguage, voice,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        );
      }
    );

    if (audio) {
      currentAudioRef.current = audio;
    }
  }, [voiceLanguage, selectBestVoice]);

  // ── INTERRUPT — stop audio mid-playback ──────────────────────
  const interruptSpeaking = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.src = '';
      currentAudioRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const stopSpeaking = useCallback(() => {
    interruptSpeaking();
  }, [interruptSpeaking]);

  return {
    isListening,
    isSpeaking,
    hasPermissionError,
    voiceEnabled, setVoiceEnabled,
    voiceLanguage, setVoiceLanguage,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    interruptSpeaking,
  };
};
