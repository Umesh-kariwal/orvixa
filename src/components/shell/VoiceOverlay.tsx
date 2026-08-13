import React, { useEffect, useState, useCallback } from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { useVoice } from '@/hooks/useVoice';
import { Button } from '@/components/ui/Button';
import { X, Mic, Volume2, AudioLines, ExternalLink } from 'lucide-react';
import {
  parseVoiceCommand,
  executeVoiceAction,
  getCurrentPageContent,
} from '@/hooks/desktopActions';

// ─────────────────────────────────────────────────────────────
export const VoiceOverlay: React.FC = () => {
  const {
    isVoiceModeActive, setIsVoiceModeActive,
    thinkingStep, executeAction, conversationHistory,
  } = useSidePanel();

  const {
    isSpeaking, startListening,
    speakText, interruptSpeaking,
    startNewSession, fullCleanup,
    voiceLanguage, setVoiceLanguage, hasPermissionError,
  } = useVoice();

  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [transcribedText, setTranscribedText] = useState('');
  const [statusBadge, setStatusBadge] = useState<string | null>(null);
  const [lastProcessedMsgCount, setLastProcessedMsgCount] = useState(conversationHistory.length);

  // ── HANDLE USER SPEECH ───────────────────────────────────────
  const handleUserSpeech = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setTranscribedText(text);
    setStatusBadge(null);

    const cmd = parseVoiceCommand(text);

    // Always interrupt AI mid-sentence
    interruptSpeaking();

    // ── Close ──────────────────────────────────────────────
    if (cmd.type === 'close_voice') {
      speakText('Band kar raha hoon. Phir milte hain!');
      setTimeout(handleClose, 1500);
      return;
    }

    // ── Page summarize (needs AI with page content) ─────────
    if (cmd.type === 'summarize_page' || cmd.type === 'read_page') {
      speakText('Is page ka content padh raha hoon...');
      const page = await getCurrentPageContent();
      const prompt = page.content
        ? `Summarize this webpage in 3 bullet points in simple Hindi-English mix. Page title: "${page.title}". Content: ${page.content.slice(0, 4000)}`
        : 'No page content found. Please navigate to a webpage first.';
      executeAction({ action_id: 'voice_chat', label: 'Voice Chat', description: prompt, icon: 'sparkles' });
      return;
    }

    // ── Desktop action ──────────────────────────────────────
    if (cmd.type !== 'ai_chat') {
      const responseText = await executeVoiceAction(cmd);
      if (responseText) {
        setStatusBadge(responseText);
        speakText(responseText);
      }
      return;
    }

    // ── AI Chat ─────────────────────────────────────────────
    executeAction({ action_id: 'voice_chat', label: 'Voice Chat', description: text, icon: 'sparkles' });
  }, [interruptSpeaking, speakText, executeAction]);

  // ── SESSION START ─────────────────────────────────────────
  useEffect(() => {
    if (!isVoiceModeActive) return;

    startNewSession();
    setVoiceState('listening');
    setTranscribedText('');
    setStatusBadge(null);
    setLastProcessedMsgCount(conversationHistory.length);

    const t = setTimeout(() => startListening(handleUserSpeech), 200);
    return () => { clearTimeout(t); fullCleanup(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVoiceModeActive]);

  // ── SYNC VISUAL STATE ─────────────────────────────────────
  useEffect(() => {
    if (!isVoiceModeActive) return;
    if (thinkingStep !== 'idle') setVoiceState('thinking');
    else if (isSpeaking) setVoiceState('speaking');
    else setVoiceState('listening');
  }, [thinkingStep, isSpeaking, isVoiceModeActive]);

  // ── READ AI RESPONSES ALOUD ───────────────────────────────
  useEffect(() => {
    if (!isVoiceModeActive) return;
    if (conversationHistory.length <= lastProcessedMsgCount) return;
    const last = conversationHistory[conversationHistory.length - 1];
    if (last?.role === 'assistant') {
      const raw = last.text || '';
      const sentences = raw.match(/[^.!?\n]+[.!?\n]+/g) || [raw];
      const voice = sentences.slice(0, 2).join(' ').trim() || raw.slice(0, 250);
      speakText(raw.includes('Error:') ? 'Kuch issue aa gaya, dobara try karo.' : voice);
    }
    setLastProcessedMsgCount(conversationHistory.length);
  }, [conversationHistory, isVoiceModeActive]);

  const handleClose = useCallback(() => {
    fullCleanup();
    setIsVoiceModeActive(false);
  }, [fullCleanup, setIsVoiceModeActive]);

  if (!isVoiceModeActive) return null;

  const getStatus = () => {
    if (hasPermissionError) return 'Mic blocked — browser settings mein allow karo';
    if (voiceState === 'thinking') return 'Soch raha hoon...';
    if (voiceState === 'speaking') return 'Bol raha hoon... (bolo to ruk jaunga)';
    return 'Sun raha hoon — boliye!';
  };

  const orbColor = { idle: '#6366f1', listening: '#ef4444', thinking: '#f59e0b', speaking: '#10b981' }[voiceState];

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(5, 8, 20, 0.97)',
      backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
      zIndex: 1000000, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'space-between',
      padding: '32px 20px', color: '#fff',
      fontFamily: 'var(--font-sans)', animation: 'fadeIn 0.2s ease',
    }}>

      {/* HEADER */}
      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <AudioLines size={13} style={{ color: '#6366f1' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.38)', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
            Orvixa Voice
          </span>
        </div>
        <select
          value={voiceLanguage}
          onChange={(e) => setVoiceLanguage(e.target.value as any)}
          style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '7px', padding: '3px 7px', outline: 'none', fontSize: '0.68rem', cursor: 'pointer' }}
        >
          <option value="en-US" style={{ background: '#050814' }}>English</option>
          <option value="hi-IN" style={{ background: '#050814' }}>हिन्दी</option>
        </select>
      </div>

      {/* CENTER */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px' }}>
        {/* Orb */}
        <div
          className={`voice-orb ${voiceState}`}
          style={{ cursor: voiceState === 'speaking' ? 'pointer' : 'default' }}
          title={voiceState === 'speaking' ? 'Tap to interrupt' : ''}
          onClick={() => voiceState === 'speaking' && interruptSpeaking()}
        >
          <div style={{
            width: '94px', height: '94px', borderRadius: '50%',
            backgroundColor: 'rgba(5,8,20,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 0 2px ${orbColor}44, 0 0 20px ${orbColor}1a`,
            transition: 'box-shadow 0.35s ease', zIndex: 2,
          }}>
            {voiceState === 'listening' && <Mic size={30} style={{ color: '#ef4444' }} />}
            {voiceState === 'speaking' && <Volume2 size={30} style={{ color: '#10b981' }} />}
            {(voiceState === 'thinking' || voiceState === 'idle') && <AudioLines size={30} style={{ color: '#6366f1' }} />}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '9px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: hasPermissionError ? '#ef4444' : 'rgba(255,255,255,0.82)', textAlign: 'center' }}>
            {getStatus()}
          </span>

          {transcribedText && voiceState === 'thinking' && (
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.32)', fontStyle: 'italic', textAlign: 'center', maxWidth: '250px' }}>
              "{transcribedText}"
            </span>
          )}

          {statusBadge && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', background: 'rgba(99,102,241,0.09)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: '9px', padding: '6px 12px', fontSize: '0.77rem', color: 'rgba(255,255,255,0.68)' }}>
              <ExternalLink size={12} style={{ color: '#818cf8' }} />
              {statusBadge}
            </div>
          )}
        </div>

        {/* Hint pills */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            '▶ Gaana bajao', '🌐 YouTube kholo', '🔍 Google search',
            '📄 Page summarize', '⬇ Scroll karo', '🛒 Amazon pe dhundo',
          ].map(h => (
            <span key={h} style={{ fontSize: '0.6rem', padding: '2px 7px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', color: 'rgba(255,255,255,0.22)' }}>
              {h}
            </span>
          ))}
        </div>
      </div>

      {/* CLOSE */}
      <Button
        onClick={handleClose}
        style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.15s ease' }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        title="Band Karo"
      >
        <X size={17} />
      </Button>
    </div>
  );
};
