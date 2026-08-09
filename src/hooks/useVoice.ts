import { useState, useEffect, useRef, useCallback } from 'react';

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
  
  // Speech queue for fluid multi-clause expressive playback
  const utteranceQueueRef = useRef<SpeechSynthesisUtterance[]>([]);
  const isProcessingQueueRef = useRef<boolean>(false);

  useEffect(() => {
    localStorage.setItem('orvixa_voice_enabled', String(voiceEnabled));
  }, [voiceEnabled]);

  useEffect(() => {
    localStorage.setItem('orvixa_voice_language', voiceLanguage);
  }, [voiceLanguage]);

  // Helper to select best voice
  const selectBestVoice = useCallback((lang: string): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    let langVoices = voices.filter(v => {
      const langLower = v.lang.toLowerCase().replace('_', '-');
      const selectedLower = lang.toLowerCase();
      if (selectedLower.includes('hi')) {
        return langLower.includes('hi') || 
               v.name.toLowerCase().includes('hindi') || 
               v.name.toLowerCase().includes('heera') || 
               v.name.toLowerCase().includes('kalpana');
      }
      return langLower.includes(selectedLower);
    });

    if (langVoices.length === 0 && lang.includes('hi')) {
      langVoices = voices.filter(v => 
        v.lang.toLowerCase().includes('en-in') || 
        v.name.toLowerCase().includes('india') ||
        v.name.toLowerCase().includes('ravina') ||
        v.name.toLowerCase().includes('heera')
      );
    }

    let best = langVoices.find(v => v.name.includes('Google') && v.name.toLowerCase().includes('female'));
    if (!best) best = langVoices.find(v => v.name.includes('Google'));
    if (!best) {
      best = langVoices.find(v => 
        v.name.includes('Zira') || 
        v.name.includes('Hazel') || 
        v.name.includes('Heera') || 
        v.name.includes('Kalpana') ||
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('natural')
      );
    }
    if (!best && langVoices.length > 0) best = langVoices[0];
    return best || null;
  }, []);

  // Initialize Speech Recognition
  const initRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const rec = new SpeechRecognition();
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
      utteranceQueueRef.current = [];
      isProcessingQueueRef.current = false;
      setIsSpeaking(false);

      const rec = initRecognition();
      if (!rec) {
        alert('Speech recognition is not supported in this browser.');
        return;
      }

      recognitionRef.current = rec;
      listeningRef.current = true;

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          onResult(text);
        }
      };

      rec.onerror = (e: any) => {
        console.error('Speech recognition error:', e);
        setIsListening(false);
        listeningRef.current = false;
        if (e.error === 'not-allowed') {
          setHasPermissionError(true);
        }
      };

      rec.onend = () => {
        setIsListening(false);
        listeningRef.current = false;
      };

      rec.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      listeningRef.current = false;
    }
  }, [initRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore if already stopped
      }
    }
    setIsListening(false);
    listeningRef.current = false;
  }, []);

  // Process Utterance Queue sequentially for seamless streaming speech playback
  const processQueue = useCallback(() => {
    if (isProcessingQueueRef.current || utteranceQueueRef.current.length === 0) return;

    isProcessingQueueRef.current = true;
    const nextUtterance = utteranceQueueRef.current.shift();
    if (!nextUtterance) {
      isProcessingQueueRef.current = false;
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);

    nextUtterance.onend = () => {
      isProcessingQueueRef.current = false;
      if (utteranceQueueRef.current.length > 0) {
        processQueue();
      } else {
        setIsSpeaking(false);
      }
    };

    nextUtterance.onerror = (e) => {
      console.error('Utterance playback error:', e);
      isProcessingQueueRef.current = false;
      if (utteranceQueueRef.current.length > 0) {
        processQueue();
      } else {
        setIsSpeaking(false);
      }
    };

    window.speechSynthesis.speak(nextUtterance);
  }, []);

  /**
   * EXPRESSIVE VOCAL SYNTHESIS & MELODIC SINGING ENGINE
   * 1. Detects singing / song requests and applies harmonic pitch scale contour & rhythm pauses.
   * 2. Slices long responses into clauses to speak instantly (< 200ms delay).
   * 3. Applies emotional prosody (excitement, curiosity, empathy, whispering, laughter).
   */
  const speakText = useCallback((text: string) => {
    if (!text) return;

    try {
      window.speechSynthesis.cancel(); // Reset any old speech
      utteranceQueueRef.current = [];
      isProcessingQueueRef.current = false;

      // Clean markdown tags, code blocks, and emojis for smooth TTS
      const cleanText = text
        .replace(/```[\s\S]*?```/g, ' [Code Block] ')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/[*#$_\\]/g, ' ')
        .replace(/!\[.*?\]\(.*?\)/g, '') // remove images
        .replace(/\[IMAGE:.*?\]/g, '')
        .trim();

      if (!cleanText) return;

      const voice = selectBestVoice(voiceLanguage);
      const lowerText = cleanText.toLowerCase();

      // Check if text is a song / poem / nursery rhyme / singing performance
      const isSinging = (
        lowerText.includes('🎵') ||
        lowerText.includes('🎶') ||
        lowerText.includes('song') ||
        lowerText.includes('gaana') ||
        lowerText.includes('singing') ||
        lowerText.includes('la la la') ||
        lowerText.includes('sa re ga ma') ||
        lowerText.includes('chanda mama') ||
        lowerText.includes('twinkle twinkle') ||
        lowerText.includes('verse') ||
        lowerText.includes('chorus')
      );

      // Pitch Scale Contours for Melodic Singing Performance
      const singingPitchContour = [1.35, 1.12, 1.42, 1.18, 1.48, 1.25, 1.38, 1.10];

      // Break text into clauses / phrases for micro-tuned playback
      const phrases = cleanText
        .split(/(?<=[.!?\n])\s+/)
        .map(p => p.trim())
        .filter(p => p.length > 0);

      phrases.forEach((phrase, index) => {
        const u = new SpeechSynthesisUtterance(phrase);
        u.lang = voiceLanguage;
        if (voice) u.voice = voice;

        const phraseLower = phrase.toLowerCase();

        if (isSinging) {
          // --- MELODIC SINGING MODE ---
          // Modulate pitch sequentially along a musical scale contour
          const pitchStep = singingPitchContour[index % singingPitchContour.length];
          u.pitch = pitchStep;
          // Melodic rhythm: slightly slower, rhythmic legato pace
          u.rate = (index % 2 === 0) ? 0.90 : 0.96;
        } else {
          // --- EXPRESSIVE VOCAL EMOTION ENGINE ---
          let pitch = 1.05;
          let rate = 0.98;

          if (phrase.includes('!') || phraseLower.includes('wow') || phraseLower.includes('great') || phraseLower.includes('awesome') || phraseLower.includes('haha') || phraseLower.includes('yay')) {
            pitch = 1.22; // Enthusiastic, joyful high pitch
            rate = 1.05;  // Cheerful, upbeat pace
          } else if (phrase.includes('?') || phraseLower.includes('why') || phraseLower.includes('how') || phraseLower.includes('what')) {
            pitch = 1.14; // Inquisitive, rising pitch contour
            rate = 0.98;
          } else if (phraseLower.includes('sorry') || phraseLower.includes('unfortunately') || phraseLower.includes('comfort') || phraseLower.includes('don\'t worry')) {
            pitch = 0.94; // Warm, empathetic lower pitch
            rate = 0.88;  // Comforting slow pace
          } else if (phraseLower.includes('secret') || phraseLower.includes('shh') || phraseLower.includes('listen carefully')) {
            pitch = 0.88; // Soft whispering tone
            rate = 0.82;
          }

          u.pitch = pitch;
          u.rate = rate;
        }

        utteranceQueueRef.current.push(u);
      });

      // Start queue playback immediately
      processQueue();
    } catch (err) {
      console.error('Failed to execute expressive text-to-speech:', err);
      setIsSpeaking(false);
    }
  }, [voiceLanguage, selectBestVoice, processQueue]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    utteranceQueueRef.current = [];
    isProcessingQueueRef.current = false;
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
