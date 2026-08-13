import React, { useEffect, useState, useCallback } from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { useVoice } from '@/hooks/useVoice';
import { Button } from '@/components/ui/Button';
import { X, Mic, Volume2, AudioLines, ExternalLink } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// OPEN URL — bypasses popup blockers from async context
// ─────────────────────────────────────────────────────────────
function safeOpenUrl(url: string) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => document.body.removeChild(a), 300);
}

// ─────────────────────────────────────────────────────────────
// ADVANCED VOICE COMMAND PARSER
// ─────────────────────────────────────────────────────────────
type CommandType =
  | 'youtube_open' | 'youtube_play'
  | 'google_search' | 'open_website'
  | 'close' | 'ai_chat';

interface ParsedCommand {
  type: CommandType;
  query?: string;
  url?: string;
}

function parseVoiceCommand(text: string): ParsedCommand {
  const t = text.toLowerCase().trim();

  // ── CLOSE ───────────────────────────────────────────────────
  if (/\b(close|band karo|band kr|exit|bye|goodbye|stop|ruk ja|chup)\b/.test(t)) {
    return { type: 'close' };
  }

  // ── WEBSITE OPEN ────────────────────────────────────────────
  const websiteMap: Record<string, string> = {
    'google': 'https://www.google.com',
    'gmail': 'https://mail.google.com',
    'facebook': 'https://www.facebook.com',
    'instagram': 'https://www.instagram.com',
    'twitter': 'https://www.twitter.com',
    'whatsapp': 'https://web.whatsapp.com',
    'github': 'https://www.github.com',
    'wikipedia': 'https://www.wikipedia.org',
    'netflix': 'https://www.netflix.com',
    'amazon': 'https://www.amazon.in',
    'flipkart': 'https://www.flipkart.com',
  };

  for (const [site, url] of Object.entries(websiteMap)) {
    if (t.includes(site) && /\b(open|kholo|jao|visit|chalao)\b/.test(t)) {
      return { type: 'open_website', url, query: site };
    }
  }

  // ── YOUTUBE PLAY with song name ──────────────────────────────
  const playPatterns = [
    /(?:play|baja(?:o)?|suna(?:o)?|chala(?:o)?|laga(?:o)?|gao?)\s+(.+)/,
    /(.+?)\s+(?:play karo|bajao|sunao|chalao|lagao|gaao?)\b/,
    /(?:youtube\s+(?:pe|par)\s+)(.+?)\s+(?:bajao|sunao|chalao|search|play)/,
    /(?:mujhe|muje|hame|humko)\s+(.+?)\s+(?:sunao|bajao|sunana|bajana)\b/,
  ];
  for (const pattern of playPatterns) {
    const m = t.match(pattern);
    if (m) {
      const raw = (m[1] || m[2] || '').trim();
      const songName = raw.replace(/\b(youtube|yt|pe|par|ko|bhi|ek|koi|please|plz)\b/g, '').trim();
      if (songName && songName.length > 1) {
        return { type: 'youtube_play', query: songName };
      }
    }
  }

  // Generic "gaana bajao"
  if (/\b(gaana|song|music|gana|playlist)\b/.test(t) && /\b(baja|chala|suna|play|laga|gao)\b/.test(t)) {
    return { type: 'youtube_play', query: 'best hindi songs 2024' };
  }

  // ── GOOGLE SEARCH ────────────────────────────────────────────
  const searchPatterns = [
    /(?:search|dhundo|google karo|google pe dhundo|google me dhundo)\s+(.+)/,
    /(.+?)\s+(?:search karo|dhundo|google karo)\b/,
  ];
  for (const pattern of searchPatterns) {
    const m = t.match(pattern);
    if (m) {
      const query = (m[1] || m[2] || '').trim();
      if (query && query.length > 1) return { type: 'google_search', query };
    }
  }

  // ── YOUTUBE OPEN ─────────────────────────────────────────────
  if (/\byoutube\b/.test(t) && /\b(kholo|open|jao|visit|chalao|pe jao|par jao)\b/.test(t)) {
    return { type: 'youtube_open' };
  }
  if (t === 'youtube' || t === 'open youtube' || t === 'youtube kholo' || t === 'youtube open') {
    return { type: 'youtube_open' };
  }

  return { type: 'ai_chat', query: text };
}

function executeCommand(cmd: ParsedCommand): string | null {
  switch (cmd.type) {
    case 'youtube_open':
      safeOpenUrl('https://www.youtube.com');
      return 'YouTube khol diya!';
    case 'youtube_play':
      safeOpenUrl(`https://www.youtube.com/results?search_query=${encodeURIComponent(cmd.query || '')}`);
      return `"${cmd.query}" YouTube par dhoondh raha hoon!`;
    case 'google_search':
      safeOpenUrl(`https://www.google.com/search?q=${encodeURIComponent(cmd.query || '')}`);
      return `Google par "${cmd.query}" search kar raha hoon!`;
    case 'open_website':
      safeOpenUrl(cmd.url!);
      return `${cmd.query} khol diya!`;
    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────
// VOICE OVERLAY COMPONENT
// ─────────────────────────────────────────────────────────────
export const VoiceOverlay: React.FC = () => {
  const { isVoiceModeActive, setIsVoiceModeActive, thinkingStep, executeAction, conversationHistory } = useSidePanel();

  const {
    isSpeaking, startListening,
    speakText, interruptSpeaking,
    startNewSession, fullCleanup,
    voiceLanguage, setVoiceLanguage, hasPermissionError,
  } = useVoice();

  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [transcribedText, setTranscribedText] = useState('');
  const [mediaAction, setMediaAction] = useState<string | null>(null);
  const [lastProcessedMsgCount, setLastProcessedMsgCount] = useState(conversationHistory.length);

  // ── HANDLE USER SPEECH ───────────────────────────────────────
  const handleUserSpeech = useCallback((text: string) => {
    if (!text.trim()) return;
    setTranscribedText(text);
    setMediaAction(null);

    const cmd = parseVoiceCommand(text);

    // Interrupt AI mid-sentence
    interruptSpeaking();

    if (cmd.type === 'close') {
      handleClose();
      return;
    }

    if (cmd.type !== 'ai_chat') {
      const response = executeCommand(cmd);
      if (response) {
        setMediaAction(response);
        speakText(response);
      }
      return;
    }

    executeAction({ action_id: 'voice_chat', label: 'Voice Chat', description: text, icon: 'sparkles' });
  }, [interruptSpeaking, speakText, executeAction]);

  // ── MOUNT: Start fresh session ───────────────────────────────
  useEffect(() => {
    if (!isVoiceModeActive) return;

    // Kill any zombie audio from previous session FIRST
    startNewSession();

    setVoiceState('listening');
    setTranscribedText('');
    setMediaAction('');
    setLastProcessedMsgCount(conversationHistory.length);

    // Small delay so session is ready
    const t = setTimeout(() => {
      startListening(handleUserSpeech);
    }, 200);

    return () => {
      clearTimeout(t);
      fullCleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const raw = lastMsg.text || '';
      if (raw.includes('Error:') || raw.includes('connection error')) {
        speakText('Kuch technical issue aa gaya. Dobara try karein.');
      } else {
        const sentences = raw.match(/[^.!?\n]+[.!?\n]+/g) || [raw];
        const voiceText = sentences.slice(0, 2).join(' ').trim() || raw.slice(0, 250);
        speakText(voiceText);
      }
    }
    setLastProcessedMsgCount(conversationHistory.length);
  }, [conversationHistory, isVoiceModeActive]);

  const handleClose = useCallback(() => {
    fullCleanup();
    setIsVoiceModeActive(false);
  }, [fullCleanup, setIsVoiceModeActive]);

  if (!isVoiceModeActive) return null;

  const getStatusLabel = () => {
    if (hasPermissionError) return 'Mic permission blocked — browser settings mein allow karo';
    if (voiceState === 'thinking') return 'Soch raha hoon...';
    if (voiceState === 'speaking') return 'Bol raha hoon... (bolo to ruk jaunga)';
    return 'Sun raha hoon — boliye!';
  };

  const orbColor = { idle: '#6366f1', listening: '#ef4444', thinking: '#f59e0b', speaking: '#10b981' }[voiceState];

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

      {/* HEADER */}
      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AudioLines size={14} style={{ color: '#6366f1' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
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

      {/* CENTER */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        {/* Orb — tap to interrupt */}
        <div
          className={`voice-orb ${voiceState}`}
          style={{ cursor: voiceState === 'speaking' ? 'pointer' : 'default' }}
          title={voiceState === 'speaking' ? 'Tap to interrupt' : ''}
          onClick={() => voiceState === 'speaking' && interruptSpeaking()}
        >
          <div style={{
            width: '96px', height: '96px', borderRadius: '50%',
            backgroundColor: 'rgba(6,10,22,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 0 2px ${orbColor}44, 0 0 24px ${orbColor}1a`,
            transition: 'box-shadow 0.4s ease', zIndex: 2,
          }}>
            {voiceState === 'listening' && <Mic size={32} style={{ color: '#ef4444' }} />}
            {voiceState === 'speaking' && <Volume2 size={32} style={{ color: '#10b981' }} />}
            {(voiceState === 'thinking' || voiceState === 'idle') && <AudioLines size={32} style={{ color: '#6366f1' }} />}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: hasPermissionError ? '#ef4444' : 'rgba(255,255,255,0.85)', textAlign: 'center' }}>
            {getStatusLabel()}
          </span>

          {transcribedText && voiceState === 'thinking' && (
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', textAlign: 'center', maxWidth: '260px' }}>
              "{transcribedText}"
            </span>
          )}

          {mediaAction && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(99,102,241,0.09)', border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '10px', padding: '7px 14px',
              fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)',
            }}>
              <ExternalLink size={13} style={{ color: '#818cf8' }} />
              {mediaAction}
            </div>
          )}
        </div>

        {/* Command hints */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['▶ Gaana bajao', '🌐 YouTube kholo', '🔍 Search karo', '🌍 Website kholo', '❓ Kuch bhi pucho'].map(h => (
            <span key={h} style={{
              fontSize: '0.62rem', padding: '3px 8px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '20px', color: 'rgba(255,255,255,0.25)',
            }}>{h}</span>
          ))}
        </div>
      </div>

      {/* CLOSE */}
      <Button
        onClick={handleClose}
        style={{
          width: '52px', height: '52px', borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.09)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.55)', cursor: 'pointer', transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; }}
        title="Band Karo"
      >
        <X size={18} />
      </Button>
    </div>
  );
};
