import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { useVoice } from '@/hooks/useVoice';
import { Button } from '@/components/ui/Button';
import { X, Mic, Volume2, AudioLines, ExternalLink } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// OPEN URL — browser-safe (avoids popup blocker on async calls)
// ─────────────────────────────────────────────────────────────
function safeOpenUrl(url: string) {
  // Anchor click method bypasses popup blockers from async/timer context
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => document.body.removeChild(a), 200);
}

// ─────────────────────────────────────────────────────────────
// SMART VOICE COMMAND PARSER
// ─────────────────────────────────────────────────────────────
interface CommandResult {
  type: 'youtube_open' | 'youtube_play' | 'close' | 'ai_chat';
  query?: string;
}

function parseVoiceCommand(text: string): CommandResult {
  const t = text.toLowerCase().trim();

  // ── CLOSE ───────────────────────────────────────────────────
  if (/\b(close|band karo|band kr|exit|bye|goodbye|ruk|stop)\b/.test(t)) {
    return { type: 'close' };
  }

  // ── YOUTUBE PLAY with song name ──────────────────────────────
  // handles: "play chaiyya chaiyya", "kesariya bajao", "sunao koi song"
  const playPatterns = [
    /(?:play|baja(?:o)?|suna(?:o)?|chala(?:o)?|laga(?:o)?|search)\s+(.+)/,
    /(.+?)\s+(?:play karo|bajao|sunao|chalao|lagao|gaao?)\b/,
    /(?:youtube\s+pe|youtube\s+par|yt\s+pe)\s+(.+?)\s+(?:bajao|sunao|chalao|search|play)/,
  ];

  for (const pattern of playPatterns) {
    const m = t.match(pattern);
    if (m) {
      const songName = (m[1] || m[2] || '').replace(/\b(youtube|yt|pe|par|ko|bhi)\b/g, '').trim();
      if (songName && songName.length > 1) {
        return { type: 'youtube_play', query: songName };
      }
    }
  }

  // Generic "gaana/song bajao" with no name
  if (/\b(gaana|song|music|gana|playlist)\b/.test(t) && /\b(baja|chala|suna|play|laga)\b/.test(t)) {
    return { type: 'youtube_play', query: 'best hindi songs 2024' };
  }

  // ── YOUTUBE OPEN (no song name) ──────────────────────────────
  // "youtube kholo", "open youtube", "youtube pe jao", "youtube chalao"
  if (/youtube|yt/.test(t)) {
    // If it mentions play/search with a query let play handle it
    if (!/(bajao|sunao|play|search|chalao|laga)/.test(t) || t === 'youtube' || t === 'youtube kholo') {
      return { type: 'youtube_open' };
    }
  }

  return { type: 'ai_chat', query: text };
}

function executeMediaCommand(cmd: CommandResult): string | null {
  if (cmd.type === 'youtube_open') {
    safeOpenUrl('https://www.youtube.com');
    return 'YouTube khol raha hoon!';
  }
  if (cmd.type === 'youtube_play') {
    safeOpenUrl(`https://www.youtube.com/results?search_query=${encodeURIComponent(cmd.query || 'hindi songs')}`);
    return `"${cmd.query}" YouTube par search kar raha hoon!`;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// VOICE OVERLAY — ChatGPT/Gemini style
// ─────────────────────────────────────────────────────────────
export const VoiceOverlay: React.FC = () => {
  const { isVoiceModeActive, setIsVoiceModeActive, thinkingStep, executeAction, conversationHistory } = useSidePanel();

  const {
    isSpeaking, startListening, stopListening, speakText, stopSpeaking,
    interruptSpeaking, voiceLanguage, setVoiceLanguage, hasPermissionError,
  } = useVoice();

  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [transcribedText, setTranscribedText] = useState('');
  const [interimText, setInterimText] = useState('');  // live speech text
  const [mediaAction, setMediaAction] = useState<string | null>(null);
  const [lastProcessedMsgCount, setLastProcessedMsgCount] = useState(conversationHistory.length);
  const listeningActiveRef = useRef(false);

  // ── HANDLE USER VOICE INPUT ──────────────────────────────────
  const handleUserSpeech = useCallback((text: string) => {
    if (!text.trim()) return;

    setTranscribedText(text);
    setInterimText('');
    setMediaAction(null);

    const cmd = parseVoiceCommand(text);

    // If AI is speaking, interrupt immediately
    interruptSpeaking();

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

    // Send to AI
    executeAction({ action_id: 'voice_chat', label: 'Voice Chat', description: text, icon: 'sparkles' });
  }, [interruptSpeaking, speakText, executeAction]);

  // ── CONTINUOUS LISTENING — always on unless AI thinking ───────
  useEffect(() => {
    if (!isVoiceModeActive) return;

    // Start continuous listening
    listeningActiveRef.current = true;
    startListening(handleUserSpeech);

    return () => {
      listeningActiveRef.current = false;
      stopListening();
      stopSpeaking();
    };
  }, [isVoiceModeActive]);

  // ── SYNC VISUAL STATE ────────────────────────────────────────
  useEffect(() => {
    if (!isVoiceModeActive) return;

    if (thinkingStep !== 'idle') {
      setVoiceState('thinking');
    } else if (isSpeaking) {
      setVoiceState('speaking');
    } else {
      setVoiceState('listening');
    }
  }, [thinkingStep, isSpeaking, isVoiceModeActive]);

  // ── READ AI RESPONSES ALOUD ──────────────────────────────────
  useEffect(() => {
    if (!isVoiceModeActive) return;
    if (conversationHistory.length <= lastProcessedMsgCount) return;

    const lastMsg = conversationHistory[conversationHistory.length - 1];
    if (lastMsg?.role === 'assistant') {
      const rawText = lastMsg.text || '';
      if (rawText.includes('Error:') || rawText.includes('connection error')) {
        speakText('Kuch technical issue aa gaya. Dobara try karein.');
      } else {
        // Only read first 2 sentences — avoid textbook reading
        const sentences = rawText.match(/[^.!?\n]+[.!?\n]+/g) || [rawText];
        const voiceText = sentences.slice(0, 2).join(' ').trim() || rawText.slice(0, 250);
        speakText(voiceText);
      }
    }
    setLastProcessedMsgCount(conversationHistory.length);
  }, [conversationHistory]);

  const handleClose = useCallback(() => {
    listeningActiveRef.current = false;
    stopListening();
    stopSpeaking();
    setIsVoiceModeActive(false);
  }, [stopListening, stopSpeaking, setIsVoiceModeActive]);

  if (!isVoiceModeActive) return null;

  const getStatusLabel = () => {
    if (hasPermissionError) return 'Mic permission blocked';
    if (voiceState === 'thinking') return 'Soch raha hoon...';
    if (voiceState === 'speaking') return 'Bol raha hoon... (bolo to ruk jaunga)';
    return 'Sun raha hoon...';
  };

  const orbColor = {
    idle: '#6366f1',
    listening: '#ef4444',
    thinking: '#f59e0b',
    speaking: '#10b981',
  }[voiceState];

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(6, 10, 22, 0.97)',
      backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
      zIndex: 1000000, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'space-between',
      padding: '36px 24px', color: '#ffffff',
      fontFamily: 'var(--font-sans)', animation: 'fadeIn 0.2s ease',
    }}>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AudioLines size={14} style={{ color: '#6366f1' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
            Orvixa Voice
          </span>
        </div>
        <select
          value={voiceLanguage}
          onChange={(e) => setVoiceLanguage(e.target.value as any)}
          style={{
            background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.65)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
            padding: '4px 8px', outline: 'none', fontSize: '0.7rem', cursor: 'pointer',
          }}
        >
          <option value="en-US" style={{ background: '#060a16' }}>English</option>
          <option value="hi-IN" style={{ background: '#060a16' }}>हिन्दी</option>
        </select>
      </div>

      {/* ── CENTER ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>

        {/* Animated Orb */}
        <div
          className={`voice-orb ${voiceState}`}
          style={{ cursor: 'pointer' }}
          onClick={() => voiceState === 'speaking' ? interruptSpeaking() : undefined}
        >
          <div style={{
            width: '96px', height: '96px', borderRadius: '50%',
            backgroundColor: 'rgba(6, 10, 22, 0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 0 2px ${orbColor}44, 0 0 20px ${orbColor}22`,
            transition: 'box-shadow 0.3s ease', zIndex: 2,
          }}>
            {voiceState === 'listening' && <Mic size={32} style={{ color: '#ef4444' }} />}
            {voiceState === 'speaking' && <Volume2 size={32} style={{ color: '#10b981' }} />}
            {(voiceState === 'thinking' || voiceState === 'idle') && <AudioLines size={32} style={{ color: '#6366f1' }} />}
          </div>
        </div>

        {/* Status */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1rem', fontWeight: 600, color: hasPermissionError ? '#ef4444' : 'rgba(255,255,255,0.85)' }}>
            {getStatusLabel()}
          </span>

          {/* Live interim speech transcript */}
          {interimText && (
            <span style={{
              fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic',
              textAlign: 'center', maxWidth: '280px',
            }}>
              {interimText}
            </span>
          )}

          {/* Submitted query while thinking */}
          {!interimText && transcribedText && voiceState === 'thinking' && (
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', textAlign: 'center', maxWidth: '260px', fontStyle: 'italic' }}>
              "{transcribedText}"
            </span>
          )}

          {/* Media action confirmation */}
          {mediaAction && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.22)',
              borderRadius: '10px', padding: '7px 14px',
              fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)',
            }}>
              <ExternalLink size={13} style={{ color: '#818cf8' }} />
              {mediaAction}
            </div>
          )}
        </div>

        {/* Command hints */}
        <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['▶ Gaana bajao', '🌐 YouTube kholo', '❓ Kuch bhi pucho', '✋ Bolo to ruk jaunga'].map(h => (
            <span key={h} style={{
              fontSize: '0.65rem', padding: '3px 9px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '20px', color: 'rgba(255,255,255,0.28)',
            }}>{h}</span>
          ))}
        </div>
      </div>

      {/* ── CLOSE ──────────────────────────────────────────── */}
      <Button
        onClick={handleClose}
        style={{
          width: '52px', height: '52px', borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.12)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
        title="Band Karo"
      >
        <X size={18} />
      </Button>
    </div>
  );
};
