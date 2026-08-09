import { useState, useEffect, useRef, useCallback } from 'react';
import { env } from '@/config/env';

// ──────────────────────────────────────────────────────────────────
// TTS endpoint (from env config)
// ──────────────────────────────────────────────────────────────────
const TTS_URL = `${env.apiBaseUrl}/tts/synthesize`;

// ──────────────────────────────────────────────────────────────────
// Utility: Clean text for TTS (strip emojis, markdown, image tags)
// ──────────────────────────────────────────────────────────────────
function cleanTextForTTS(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, m => m.slice(1, -1))
    .replace(/\[IMAGE:.*?\]/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // Remove ALL Unicode emojis (covers 🎵 🎶 🎼 and all others)
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27FF}\u{FE00}-\u{FEFF}]/gu, '')
    .replace(/[*#_\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ──────────────────────────────────────────────────────────────────
// Detect if text is a song / singing request
// ──────────────────────────────────────────────────────────────────
function detectSinging(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes('twinkle') ||
    lower.includes('chanda mama') ||
    lower.includes('chaiyya') ||
    lower.includes('mangal bhavan') ||
    lower.includes('la la la') ||
    lower.includes('sa re ga ma') ||
    lower.includes('song') ||
    lower.includes('gaana') ||
    lower.includes('verse') ||
    lower.includes('chorus')
  );
}

// ──────────────────────────────────────────────────────────────────
// Backend Gemini TTS: Fetch and play audio
// ──────────────────────────────────────────────────────────────────
async function playGeminiTTS(
  text: string,
  apiKey: string | null,
  isSinging: boolean,
  onStart: () => void,
  onEnd: () => void,
  onError: () => void
): Promise<void> {
  const clean = cleanTextForTTS(text);
  if (!clean) { onEnd(); return; }

  try {
    const body = {
      text: clean,
      voice: 'Aoede',
      is_singing: isSinging,
      gemini_api_key: apiKey || undefined,
    };

    const res = await fetch(TTS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok || res.status === 204) {
      // Fallback to browser TTS if Gemini TTS unavailable
      throw new Error('Gemini TTS unavailable');
    }

    const audioBuffer = await res.arrayBuffer();
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      throw new Error('Empty audio response');
    }

    const blob = new Blob([audioBuffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    audio.onplay = onStart;
    audio.onended = () => {
      URL.revokeObjectURL(url);
      onEnd();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      onError();
    };

    await audio.play();
  } catch (e) {
    console.warn('Gemini TTS failed, falling back to browser TTS:', e);
    onError();
  }
}

export const useVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    return localStorage.getItem('orvixa_voice_enabled') === 'true';
  });
  const [voiceLanguage, setVoiceLanguage] = useState<'en-US' | 'hi-IN'>(() => {
    return (localStorage.getItem('orvixa_voice_language') as any) || 'en-US';
  });

  const recognitionRef = useRef<any>(null);
  const listeningRef = useRef<boolean>(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    localStorage.setItem('orvixa_voice_enabled', String(voiceEnabled));
  }, [voiceEnabled]);

  useEffect(() => {
    localStorage.setItem('orvixa_voice_language', voiceLanguage);
  }, [voiceLanguage]);

  // ── Best browser voice selector (fallback only) ──────────────────
  const selectBestVoice = useCallback((lang: string): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    let langVoices = voices.filter(v => {
      const ll = v.lang.toLowerCase().replace('_', '-');
      const sl = lang.toLowerCase();
      if (sl.includes('hi')) {
        return ll.includes('hi') || v.name.toLowerCase().includes('hindi') ||
               v.name.toLowerCase().includes('heera') || v.name.toLowerCase().includes('kalpana');
      }
      return ll.includes(sl);
    });

    if (langVoices.length === 0 && lang.includes('hi')) {
      langVoices = voices.filter(v =>
        v.lang.toLowerCase().includes('en-in') || v.name.toLowerCase().includes('india')
      );
    }

    let best = langVoices.find(v => v.name.includes('Google') && v.name.toLowerCase().includes('female'));
    if (!best) best = langVoices.find(v => v.name.includes('Google'));
    if (!best) best = langVoices.find(v => v.name.includes('Zira') || v.name.includes('Hazel') ||
      v.name.toLowerCase().includes('female'));
    if (!best && langVoices.length > 0) best = langVoices[0];
    return best || null;
  }, []);

  // ── Browser fallback TTS ─────────────────────────────────────────
  const browserFallbackSpeak = useCallback((text: string, pitch = 1.05, rate = 0.98) => {
    const clean = cleanTextForTTS(text);
    if (!clean) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = voiceLanguage;
    u.pitch = pitch;
    u.rate = rate;
    const voice = selectBestVoice(voiceLanguage);
    if (voice) u.voice = voice;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  }, [voiceLanguage, selectBestVoice]);

  // ── Speech Recognition ───────────────────────────────────────────
  const initRecognition = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return null;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = voiceLanguage;
    return rec;
  }, [voiceLanguage]);

  const startListening = useCallback((onResult: (text: string) => void) => {
    if (listeningRef.current) return;
    try {
      setHasPermissionError(false);
      window.speechSynthesis.cancel();
      if (currentAudioRef.current) { currentAudioRef.current.pause(); }
      setIsSpeaking(false);

      const rec = initRecognition();
      if (!rec) { alert('Speech recognition not supported in this browser.'); return; }

      recognitionRef.current = rec;
      listeningRef.current = true;

      rec.onstart = () => setIsListening(true);
      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) onResult(text);
      };
      rec.onerror = (e: any) => {
        setIsListening(false);
        listeningRef.current = false;
        if (e.error === 'not-allowed') setHasPermissionError(true);
      };
      rec.onend = () => { setIsListening(false); listeningRef.current = false; };
      rec.start();
    } catch (err) {
      setIsListening(false);
      listeningRef.current = false;
    }
  }, [initRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsListening(false);
    listeningRef.current = false;
  }, []);

  // ── PRIMARY: speakText → Gemini TTS → Audio element ─────────────
  const speakText = useCallback(async (text: string) => {
    if (!text) return;

    // Stop any existing playback
    window.speechSynthesis.cancel();
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setIsSpeaking(false);

    const isSinging = detectSinging(text);
    const geminiKey = localStorage.getItem('orvixa_gemini_key') ||
                      (() => {
                        try {
                          const s = localStorage.getItem('orvixa_system_settings');
                          return s ? JSON.parse(s)?.geminiApiKey : null;
                        } catch { return null; }
                      })();

    // Try Gemini TTS backend first
    await playGeminiTTS(
      text,
      geminiKey,
      isSinging,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => {
        // Fallback: browser TTS with expressive settings
        const clean = cleanTextForTTS(text);
        const lc = clean.toLowerCase();
        let pitch = 1.05, rate = 0.98;
        if (isSinging) { pitch = 1.20; rate = 0.92; }
        else if (clean.includes('!') || lc.includes('wow') || lc.includes('great')) { pitch = 1.18; rate = 1.04; }
        else if (clean.includes('?')) { pitch = 1.12; }
        else if (lc.includes('sorry') || lc.includes('don\'t worry')) { pitch = 0.94; rate = 0.88; }
        browserFallbackSpeak(clean, pitch, rate);
      }
    );
  }, [browserFallbackSpeak]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    isSpeaking,
    hasPermissionError,
    voiceEnabled,
    setVoiceEnabled,
    voiceLanguage,
    setVoiceLanguage,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
  };
};
