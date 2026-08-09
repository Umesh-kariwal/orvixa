import { useState, useEffect, useRef, useCallback } from 'react';

// Web Audio API Acoustic Accompaniment Engine for Real Singing & Melody
class WebAudioSongAccompaniment {
  private ctx: AudioContext | null = null;
  private timerId: any = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  startSongBackingTrack() {
    try {
      this.initContext();
      if (!this.ctx) return;
      this.stop();

      // Musical Chord Progressions (Hz): C Major -> A Minor -> F Major -> G Major
      const chordProgression = [
        [261.63, 329.63, 392.00], // C4, E4, G4
        [220.00, 261.63, 329.63], // A3, C4, E4
        [174.61, 220.00, 261.63], // F3, A3, C4
        [196.00, 246.94, 293.66], // G3, B3, D4
      ];

      let chordIndex = 0;

      const playChord = () => {
        if (!this.ctx) return;
        const freqs = chordProgression[chordIndex % chordProgression.length];
        chordIndex++;

        freqs.forEach((freq) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          // Soft acoustic volume envelope (ambient lo-fi synth chord)
          gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.035, this.ctx.currentTime + 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(this.ctx.currentTime);
          osc.stop(this.ctx.currentTime + 1.3);
        });
      };

      playChord();
      this.timerId = setInterval(playChord, 1200);
    } catch (e) {
      console.warn('Web Audio backing track unavailable:', e);
    }
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}

const backingTrackEngine = new WebAudioSongAccompaniment();

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
  
  const utteranceQueueRef = useRef<SpeechSynthesisUtterance[]>([]);
  const isProcessingQueueRef = useRef<boolean>(false);

  useEffect(() => {
    localStorage.setItem('orvixa_voice_enabled', String(voiceEnabled));
  }, [voiceEnabled]);

  useEffect(() => {
    localStorage.setItem('orvixa_voice_language', voiceLanguage);
  }, [voiceLanguage]);

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
      backingTrackEngine.stop();
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

  const processQueue = useCallback(() => {
    if (isProcessingQueueRef.current || utteranceQueueRef.current.length === 0) return;

    isProcessingQueueRef.current = true;
    const nextUtterance = utteranceQueueRef.current.shift();
    if (!nextUtterance) {
      isProcessingQueueRef.current = false;
      setIsSpeaking(false);
      backingTrackEngine.stop();
      return;
    }

    setIsSpeaking(true);

    nextUtterance.onend = () => {
      isProcessingQueueRef.current = false;
      if (utteranceQueueRef.current.length > 0) {
        processQueue();
      } else {
        setIsSpeaking(false);
        backingTrackEngine.stop();
      }
    };

    nextUtterance.onerror = (e) => {
      console.error('Utterance playback error:', e);
      isProcessingQueueRef.current = false;
      if (utteranceQueueRef.current.length > 0) {
        processQueue();
      } else {
        setIsSpeaking(false);
        backingTrackEngine.stop();
      }
    };

    window.speechSynthesis.speak(nextUtterance);
  }, []);

  /**
   * ADVANCED SINGING & MUSICAL CADENCE ENGINE
   * 1. Detects song / singing intent.
   * 2. Triggers Web Audio API acoustic musical backing chords.
   * 3. Performs word-level musical pitch stepping (C4-E4-G4-A4-B4 scale).
   */
  const speakText = useCallback((text: string) => {
    if (!text) return;

    try {
      window.speechSynthesis.cancel();
      backingTrackEngine.stop();
      utteranceQueueRef.current = [];
      isProcessingQueueRef.current = false;

      const cleanText = text
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/[*#$_\\]/g, ' ')
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[IMAGE:.*?\]/g, '')
        .replace(/"/g, ' ')
        .trim();

      if (!cleanText) return;

      const voice = selectBestVoice(voiceLanguage);
      const lowerText = cleanText.toLowerCase();

      const isSinging = (
        lowerText.includes('🎵') ||
        lowerText.includes('🎶') ||
        lowerText.includes('song') ||
        lowerText.includes('gaana') ||
        lowerText.includes('singing') ||
        lowerText.includes('chaiyya') ||
        lowerText.includes('mangal bhavan') ||
        lowerText.includes('twinkle twinkle') ||
        lowerText.includes('la la la') ||
        lowerText.includes('sa re ga ma')
      );

      if (isSinging) {
        // Start Web Audio Acoustic Backing Track
        backingTrackEngine.startSongBackingTrack();

        // Musical Pitch Steps (Sa Re Ga Ma / Do Re Mi Scale)
        const scalePitches = [1.25, 1.40, 1.15, 1.35, 1.48, 1.20, 1.30, 1.10];

        // Break song into rhythmic lines
        const lines = cleanText
          .split(/(?<=[.!?\n])\s+/)
          .map(l => l.trim())
          .filter(l => l.length > 0);

        lines.forEach((line, lineIdx) => {
          // Exclude conversational introductory lines from heavy singing pitch
          if (lineIdx === 0 && (line.toLowerCase().includes('gaana') || line.toLowerCase().includes('suna'))) {
            const intro = new SpeechSynthesisUtterance(line);
            intro.lang = voiceLanguage;
            if (voice) intro.voice = voice;
            intro.pitch = 1.05;
            intro.rate = 1.0;
            utteranceQueueRef.current.push(intro);
            return;
          }

          // Group into musical melodic phrases
          const words = line.split(/\s+/).filter(w => w.length > 0);
          if (words.length === 0) return;

          // Process words in rhythmic rhythmic pairs/triplets for musical melody
          for (let i = 0; i < words.length; i += 3) {
            const phrase = words.slice(i, i + 3).join(' ');
            const u = new SpeechSynthesisUtterance(phrase);
            u.lang = voiceLanguage;
            if (voice) u.voice = voice;

            const pitchIdx = (lineIdx * 3 + i) % scalePitches.length;
            u.pitch = scalePitches[pitchIdx];

            // Rhythmic Tempo Modulation (legato sustain vs staccato beat)
            u.rate = (i % 2 === 0) ? 0.88 : 0.94;

            utteranceQueueRef.current.push(u);
          }
        });
      } else {
        // --- NORMAL EXPRESSIVE VOCAL EMOTION ENGINE ---
        const phrases = cleanText
          .split(/(?<=[.!?\n])\s+/)
          .map(p => p.trim())
          .filter(p => p.length > 0);

        phrases.forEach((phrase) => {
          const u = new SpeechSynthesisUtterance(phrase);
          u.lang = voiceLanguage;
          if (voice) u.voice = voice;

          const phraseLower = phrase.toLowerCase();
          let pitch = 1.05;
          let rate = 0.98;

          if (phrase.includes('!') || phraseLower.includes('wow') || phraseLower.includes('great') || phraseLower.includes('awesome') || phraseLower.includes('haha')) {
            pitch = 1.22;
            rate = 1.04;
          } else if (phrase.includes('?') || phraseLower.includes('why') || phraseLower.includes('how')) {
            pitch = 1.14;
            rate = 0.98;
          } else if (phraseLower.includes('sorry') || phraseLower.includes('comfort') || phraseLower.includes('don\'t worry')) {
            pitch = 0.94;
            rate = 0.88;
          }

          u.pitch = pitch;
          u.rate = rate;

          utteranceQueueRef.current.push(u);
        });
      }

      processQueue();
    } catch (err) {
      console.error('Failed to execute expressive text-to-speech:', err);
      setIsSpeaking(false);
      backingTrackEngine.stop();
    }
  }, [voiceLanguage, selectBestVoice, processQueue]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    backingTrackEngine.stop();
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
