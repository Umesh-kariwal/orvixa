import React, { useEffect, useState, useCallback } from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { useVoice } from '@/hooks/useVoice';
import { Button } from '@/components/ui/Button';
import { X, Mic, Volume2, AudioLines, ExternalLink } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// SMART VOICE COMMAND PARSER
// Detects media/system commands so we don't send them to AI
// ─────────────────────────────────────────────────────────────
interface CommandResult {
  type: 'youtube_open' | 'youtube_play' | 'youtube_search' | 'close' | 'ai_chat';
  query?: string;
}

function parseVoiceCommand(text: string): CommandResult {
  const t = text.toLowerCase().trim();

  // ── CLOSE / BAND KARO ───────────────────────────────────────
  if (/\b(close|band karo|band kr|exit|bye|goodbye)\b/.test(t)) {
    return { type: 'close' };
  }

  // ── YOUTUBE OPEN ────────────────────────────────────────────
  if (/\b(youtube kholo|youtube open|open youtube|youtube chalao|youtube)\b/.test(t) &&
      !/\b(play|baja|sunao|search|dhundo)\b/.test(t)) {
    return { type: 'youtube_open' };
  }

  // ── PLAY A SONG (with song name) ────────────────────────────
  // "play chaiyya chaiyya", "chaiyya chaiyya bajao", "koi song bajao", "sunao"
  const playMatch = t.match(
    /(?:play|baja(?:o)?|suna(?:o)?|chala(?:o)?|gaao?)\s+(.+)|(.+?)\s+(?:play karo|bajao|sunao|chalao|gaao?)/
  );
  if (playMatch) {
    const songName = (playMatch[1] || playMatch[2] || '').trim();
    if (songName && songName.length > 1) {
      return { type: 'youtube_play', query: songName };
    }
    // Generic "play a song" with no specific name → open YouTube Music
    return { type: 'youtube_search', query: 'hindi songs 2024' };
  }

  // ── GENERIC "GAANA BAJAO" (no name) ─────────────────────────
  if (/\b(gaana|song|music|gana)\b/.test(t) && /\b(baja|chala|suna|play)\b/.test(t)) {
    return { type: 'youtube_search', query: 'best hindi songs playlist' };
  }

  // ── DEFAULT: send to AI ──────────────────────────────────────
  return { type: 'ai_chat', query: text };
}

// ─────────────────────────────────────────────────────────────
// EXECUTE MEDIA COMMAND
// ─────────────────────────────────────────────────────────────
function executeMediaCommand(cmd: CommandResult): string | null {
  switch (cmd.type) {
    case 'youtube_open':
      window.open('https://www.youtube.com', '_blank');
      return 'YouTube khol raha hoon!';

    case 'youtube_play':
      window.open(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(cmd.query || '')}`,
        '_blank'
      );
      return `"${cmd.query}" YouTube par dhund raha hoon!`;

    case 'youtube_search':
      window.open(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(cmd.query || 'songs')}`,
        '_blank'
      );
      return 'Aapke liye songs dhund raha hoon!';

    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────
// VOICE OVERLAY COMPONENT
// ─────────────────────────────────────────────────────────────
export const VoiceOverlay: React.FC = () => {
  const {
    isVoiceModeActive,
    setIsVoiceModeActive,
    thinkingStep,
    executeAction,
    conversationHistory
  } = useSidePanel();

  const {
    isSpeaking,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    voiceLanguage,
    setVoiceLanguage,
    hasPermissionError,
  } = useVoice();

  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [lastProcessedMsgCount, setLastProcessedMsgCount] = useState<number>(conversationHistory.length);
  const [mediaAction, setMediaAction] = useState<string | null>(null);

  // ── SYNC VOICE STATE with isSpeaking from useVoice ──────────
  // (uses Gemini TTS Audio element, not window.speechSynthesis)
  useEffect(() => {
    if (isSpeaking) {
      setVoiceState('speaking');
    } else if (thinkingStep !== 'idle') {
      setVoiceState('thinking');
    }
  }, [isSpeaking, thinkingStep]);

  // ── CONVERSATION STATE MACHINE ───────────────────────────────
  useEffect(() => {
    if (!isVoiceModeActive) return;

    if (thinkingStep !== 'idle') {
      setVoiceState('thinking');
      stopListening();
    } else if (!isSpeaking) {
      // AI finished speaking → resume listening
      setVoiceState('listening');
      const timer = setTimeout(() => {
        startListening((text) => {
          if (!text.trim()) return;
          setTranscribedText(text);
          setMediaAction(null);

          const cmd = parseVoiceCommand(text);

          if (cmd.type === 'close') {
            handleClose();
            return;
          }

          if (cmd.type !== 'ai_chat') {
            const response = executeMediaCommand(cmd);
            if (response) {
              setMediaAction(response);
              speakText(response);
            }
            return;
          }

          // Regular AI chat
          executeAction({
            action_id: 'voice_chat',
            label: 'Voice Chat',
            description: text,
            icon: 'sparkles',
          });
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isVoiceModeActive, thinkingStep, isSpeaking]);

  // ── INITIAL LISTENING ON MOUNT ───────────────────────────────
  useEffect(() => {
    if (!isVoiceModeActive) return;

    setVoiceState('listening');
    startListening((text) => {
      if (!text.trim()) return;
      setTranscribedText(text);

      const cmd = parseVoiceCommand(text);
      if (cmd.type === 'close') { handleClose(); return; }
      if (cmd.type !== 'ai_chat') {
        const response = executeMediaCommand(cmd);
        if (response) { setMediaAction(response); speakText(response); }
        return;
      }

      executeAction({
        action_id: 'voice_chat',
        label: 'Voice Chat',
        description: text,
        icon: 'sparkles',
      });
    });

    return () => { stopListening(); stopSpeaking(); };
  }, [isVoiceModeActive]);

  // ── READ AI RESPONSES ALOUD ─────────────────────────────────
  useEffect(() => {
    if (!isVoiceModeActive) return;
    if (conversationHistory.length <= lastProcessedMsgCount) return;

    const lastMsg = conversationHistory[conversationHistory.length - 1];
    if (lastMsg?.role === 'assistant') {
      const rawText = lastMsg.text || '';

      // Truncate to first 2 natural sentences for voice (avoid textbook reading)
      const sentences = rawText.match(/[^.!?\n]+[.!?\n]+/g) || [rawText];
      const voiceText = sentences.slice(0, 2).join(' ').trim() || rawText.slice(0, 200);

      if (rawText.includes('Error:') || rawText.includes('connection error')) {
        speakText('Kuch technical issue hai. Dobara try karein.');
      } else {
        speakText(voiceText);
      }
    }
    setLastProcessedMsgCount(conversationHistory.length);
  }, [conversationHistory]);

  const handleClose = useCallback(() => {
    stopListening();
    stopSpeaking();
    setIsVoiceModeActive(false);
  }, [stopListening, stopSpeaking, setIsVoiceModeActive]);

  if (!isVoiceModeActive) return null;

  const getStatusText = () => {
    if (hasPermissionError) return 'Microphone permission blocked';
    if (voiceState === 'listening') return 'Sun raha hoon... Boliye!';
    if (voiceState === 'thinking') return 'Soch raha hoon...';
    if (voiceState === 'speaking') return 'Bol raha hoon...';
    return 'Mic tap karein';
  };

  const getOrbColor = () => {
    if (voiceState === 'listening') return '#ef4444';
    if (voiceState === 'thinking') return '#f59e0b';
    if (voiceState === 'speaking') return '#10b981';
    return '#3b82f6';
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(8, 12, 28, 0.97)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      zIndex: 1000000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '36px 24px',
      color: '#ffffff',
      fontFamily: 'var(--font-sans)',
      animation: 'fadeIn 0.2s ease',
    }}>

      {/* ── TOP HEADER ─────────────────────────────────────── */}
      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AudioLines size={14} style={{ color: '#6366f1' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Orvixa Voice
          </span>
        </div>
        <select
          value={voiceLanguage}
          onChange={(e) => setVoiceLanguage(e.target.value as any)}
          style={{
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '4px 8px',
            outline: 'none',
            fontSize: '0.7rem',
            cursor: 'pointer',
          }}
        >
          <option value="en-US" style={{ background: '#0a0e1a' }}>English</option>
          <option value="hi-IN" style={{ background: '#0a0e1a' }}>हिन्दी</option>
        </select>
      </div>

      {/* ── CENTER: ORB + STATUS ────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px' }}>

        {/* Animated Voice Orb */}
        <div
          className={`voice-orb ${voiceState}`}
          onClick={() => {
            if (voiceState === 'listening') {
              stopListening();
              setVoiceState('idle');
            } else if (voiceState !== 'thinking') {
              setVoiceState('listening');
              startListening((text) => {
                if (!text.trim()) return;
                setTranscribedText(text);
                const cmd = parseVoiceCommand(text);
                if (cmd.type === 'close') { handleClose(); return; }
                if (cmd.type !== 'ai_chat') {
                  const r = executeMediaCommand(cmd);
                  if (r) { setMediaAction(r); speakText(r); }
                  return;
                }
                executeAction({ action_id: 'voice_chat', label: 'Voice Chat', description: text, icon: 'sparkles' });
              });
            }
          }}
          style={{ cursor: voiceState !== 'thinking' ? 'pointer' : 'default' }}
        >
          <div style={{
            width: '88px', height: '88px', borderRadius: '50%',
            backgroundColor: 'rgba(10, 14, 26, 0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 0 2px ${getOrbColor()}33, inset 0 2px 8px rgba(255,255,255,0.05)`,
            zIndex: 2,
            transition: 'box-shadow 0.3s ease',
          }}>
            {voiceState === 'listening' ? (
              <Mic size={30} style={{ color: '#ef4444' }} />
            ) : voiceState === 'speaking' ? (
              <Volume2 size={30} style={{ color: '#10b981' }} />
            ) : (
              <AudioLines size={30} style={{ color: '#6366f1' }} />
            )}
          </div>
        </div>

        {/* Status + Transcription */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '1rem', fontWeight: 600,
            color: hasPermissionError ? '#ef4444' : 'rgba(255,255,255,0.9)',
          }}>
            {getStatusText()}
          </span>

          {mediaAction && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: '10px', padding: '8px 14px',
              fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)',
            }}>
              <ExternalLink size={14} style={{ color: '#ef4444' }} />
              {mediaAction}
            </div>
          )}

          {transcribedText && voiceState === 'thinking' && (
            <span style={{
              fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)',
              textAlign: 'center', maxWidth: '260px', fontStyle: 'italic',
            }}>
              "{transcribedText}"
            </span>
          )}
        </div>

        {/* Quick command hints */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '4px' }}>
          {[
            { icon: '▶', label: 'Gaana bajao' },
            { icon: '🌐', label: 'YouTube kholo' },
            { icon: '❓', label: 'Kuch bhi pucho' },
          ].map(hint => (
            <span key={hint.label} style={{
              fontSize: '0.68rem', padding: '4px 10px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px', color: 'rgba(255,255,255,0.35)',
            }}>
              {hint.icon} {hint.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── CLOSE BUTTON ────────────────────────────────────── */}
      <Button
        onClick={handleClose}
        style={{
          width: '52px', height: '52px', borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.15)';
          e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
        }}
        title="Voice Mode Band Karo"
      >
        <X size={18} />
      </Button>
    </div>
  );
};
