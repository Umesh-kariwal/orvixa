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

  useEffect(() => {
    localStorage.setItem('orvixa_voice_enabled', String(voiceEnabled));
  }, [voiceEnabled]);

  useEffect(() => {
    localStorage.setItem('orvixa_voice_language', voiceLanguage);
  }, [voiceLanguage]);

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
      window.speechSynthesis.cancel(); // Cancel any active TTS
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

  const speakText = useCallback((text: string) => {
    if (!text) return;
    try {
      window.speechSynthesis.cancel(); // Clear any queued utterances

      const cleanText = text.replace(/[*#`$\\]/g, ' '); // Strip markdown formatting symbols for clean TTS
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = voiceLanguage;
      
      // Select best high-quality female voice matching the language
      const voices = window.speechSynthesis.getVoices();
      const langVoices = voices.filter(v => v.lang.toLowerCase().replace('_', '-').includes(voiceLanguage.toLowerCase()));
      
      let bestVoice = langVoices.find(v => v.name.includes('Google') && v.name.toLowerCase().includes('female'));
      if (!bestVoice) {
        bestVoice = langVoices.find(v => v.name.includes('Google'));
      }
      if (!bestVoice) {
        bestVoice = langVoices.find(v => v.name.includes('Zira') || v.name.includes('Hazel') || v.name.includes('Heera') || v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('natural'));
      }
      if (!bestVoice && langVoices.length > 0) {
        bestVoice = langVoices[0];
      }
      
      if (bestVoice) {
        utterance.voice = bestVoice;
      }
      
      utterance.rate = 0.98; // Very natural speaking pace
      utterance.pitch = 1.05; // Slightly warmer, more human tone

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = (e) => {
        console.error('TTS utterance error:', e);
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Failed to execute text-to-speech:', err);
      setIsSpeaking(false);
    }
  }, [voiceLanguage]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
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
