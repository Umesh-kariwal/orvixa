import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { useVoice } from '@/hooks/useVoice';
import { Button } from '@/components/ui/Button';
import { X, Mic, MicOff, Volume2, AudioLines, ExternalLink, Play, Search, Globe, FileText, ArrowDown, Sparkles, Square } from 'lucide-react';
import {
  parseVoiceCommand,
  executeVoiceAction,
  getCurrentPageContent,
} from '@/hooks/desktopActions';

// ─────────────────────────────────────────────────────────────
// PRO AUDIO EQUALIZER BARS (Visualizer component)
// ─────────────────────────────────────────────────────────────
const EqualizerBars: React.FC<{ active: boolean; color: string }> = ({ active, color }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '24px' }}>
      {[0.4, 0.8, 1.0, 0.6, 0.9, 0.5, 0.7].map((heightScale, i) => (
        <div
          key={i}
          style={{
            width: '3px',
            height: active ? `${heightScale * 22}px` : '4px',
            backgroundColor: color,
            borderRadius: '4px',
            transition: 'height 0.15s ease',
            animation: active ? `equalizerBounce 0.6s ease-in-out infinite alternate` : 'none',
            animationDelay: `${i * 0.08}s`,
          }}
        />
      ))}
    </div>
  );
};

import { env } from '@/config/env';

// ─────────────────────────────────────────────────────────────
// VOICE OVERLAY — PRO LEVEL ULTRA UPGRADE
// ─────────────────────────────────────────────────────────────
export const VoiceOverlay: React.FC = () => {
  const {
    isVoiceModeActive, setIsVoiceModeActive,
    thinkingStep, executeAction, conversationHistory,
  } = useSidePanel();

  const {
    isSpeaking, startListening, stopListening,
    speakText, interruptSpeaking,
    startNewSession, fullCleanup,
    voiceLanguage, setVoiceLanguage, hasPermissionError,
  } = useVoice();

  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [transcribedText, setTranscribedText] = useState('');
  const [lastAiResponse, setLastAiResponse] = useState('');
  const [statusBadge, setStatusBadge] = useState<string | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [activeYouTubeEmbedUrl, setActiveYouTubeEmbedUrl] = useState<string | null>(null);
  const [lastProcessedMsgCount, setLastProcessedMsgCount] = useState(conversationHistory.length);
  const submittedRef = useRef(false);
  const lastExecutedTimeRef = useRef<number>(0);
  const lastExecutedTextRef = useRef<string>('');

  // ── HANDLE USER SPEECH ───────────────────────────────────────
  const handleUserSpeech = useCallback(async (text: string) => {
    const now = Date.now();
    const cleanText = text.trim().toLowerCase();
    if (!cleanText || isMicMuted) return;

    // Strict 2000ms debounce guard to prevent duplicate speech recognition events
    if (now - lastExecutedTimeRef.current < 2000 && lastExecutedTextRef.current === cleanText) {
      return;
    }
    lastExecutedTimeRef.current = now;
    lastExecutedTextRef.current = cleanText;

    setTranscribedText(text);
    setLastAiResponse('');
    setStatusBadge(null);
    submittedRef.current = true;
    setVoiceState('thinking');

    const cmd = parseVoiceCommand(text);

    // Interrupt AI mid-sentence
    interruptSpeaking();

    // Close
    if (cmd.type === 'close_voice') {
      speakText('Voice Mode closed.');
      setTimeout(handleClose, 1000);
      return;
    }

    // Page summarize
    if (cmd.type === 'summarize_page' || cmd.type === 'read_page') {
      speakText('Reading page content...');
      const page = await getCurrentPageContent();
      const prompt = page.content
        ? `Summarize this webpage in 3 clear bullet points in simple Hindi-English mix. Page title: "${page.title}". Content: ${page.content.slice(0, 4000)}`
        : 'No webpage content found. Please navigate to a webpage first.';
      executeAction({ action_id: 'voice_chat', label: 'Voice Chat', description: prompt, icon: 'sparkles' });
      return;
    }

    // Desktop action
    if (cmd.type !== 'ai_chat') {
      if (cmd.type === 'play_on_youtube' && cmd.query) {
        const q = cmd.query;
        const resolveVideo = async () => {
          try {
            const res = await fetch(`${env.apiBaseUrl}/youtube/search?q=${encodeURIComponent(q)}`);
            if (res.ok) {
              const data = await res.json();
              if (data.embedUrl) {
                setActiveYouTubeEmbedUrl(data.embedUrl);
                return;
              }
            }
          } catch {}

          try {
            const res2 = await fetch(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(q)}&filter=music_songs`);
            if (res2.ok) {
              const data2 = await res2.json();
              const item = data2?.items?.[0];
              if (item && item.url) {
                const vidId = item.url.replace('/watch?v=', '');
                setActiveYouTubeEmbedUrl(`https://www.youtube.com/embed/${vidId}?autoplay=1&enablejsapi=1`);
                return;
              }
            }
          } catch {}

          setActiveYouTubeEmbedUrl(`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(q)}&autoplay=1`);
        };
        resolveVideo();
      }
      const responseText = await executeVoiceAction(cmd);
      if (responseText) {
        setStatusBadge(responseText);
        speakText(responseText);
      }
      return;
    }

    // Send to AI
    executeAction({ action_id: 'voice_chat', label: 'Voice Chat', description: text, icon: 'sparkles' });
  }, [isMicMuted, interruptSpeaking, speakText, executeAction]);

  // ── SESSION START ─────────────────────────────────────────
  useEffect(() => {
    if (!isVoiceModeActive) return;

    startNewSession();
    submittedRef.current = false;
    setVoiceState('listening');
    setTranscribedText('');
    setLastAiResponse('');
    setStatusBadge(null);
    setIsMicMuted(false);
    setLastProcessedMsgCount(conversationHistory.length);

    const t = setTimeout(() => startListening(handleUserSpeech), 200);
    return () => { clearTimeout(t); fullCleanup(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVoiceModeActive]);

  // ── SYNC VISUAL STATE ─────────────────────────────────────
  useEffect(() => {
    if (!isVoiceModeActive) return;
    if (thinkingStep !== 'idle') {
      submittedRef.current = false;
      setVoiceState('thinking');
    } else if (isSpeaking) {
      submittedRef.current = false;
      setVoiceState('speaking');
    } else if (!submittedRef.current) {
      setVoiceState('listening');
    }
  }, [thinkingStep, isSpeaking, isVoiceModeActive]);

  // ── READ AI RESPONSES ALOUD ───────────────────────────────
  useEffect(() => {
    if (!isVoiceModeActive) return;
    if (conversationHistory.length <= lastProcessedMsgCount) return;
    const last = conversationHistory[conversationHistory.length - 1];
    if (last?.role === 'assistant') {
      const raw = last.text || '';
      const clean = raw
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]+`/g, '')
        .replace(/\[IMAGE:.*?\]/g, '')
        .replace(/[*#_\\]/g, '')
        .trim();
      const voiceText = clean.length > 500 ? clean.slice(0, 480) + '...' : clean;
      setLastAiResponse(voiceText);
      speakText(raw.includes('Error:') ? 'Kuch issue aa gaya, dobara try karo.' : voiceText);
    }
    setLastProcessedMsgCount(conversationHistory.length);
  }, [conversationHistory, isVoiceModeActive]);

  const handleClose = useCallback(() => {
    fullCleanup();
    setIsVoiceModeActive(false);
  }, [fullCleanup, setIsVoiceModeActive]);

  const toggleMicMute = () => {
    if (isMicMuted) {
      setIsMicMuted(false);
      startListening(handleUserSpeech);
    } else {
      setIsMicMuted(true);
      stopListening();
    }
  };

  const handlePillClick = (promptText: string) => {
    handleUserSpeech(promptText);
  };

  if (!isVoiceModeActive) return null;

  const orbColor = {
    idle: '#6366f1',
    listening: '#ef4444',
    thinking: '#f59e0b',
    speaking: '#10b981',
  }[voiceState];

  const statusLabel = {
    idle: 'Tap mic or speak',
    listening: isMicMuted ? 'Microphone muted' : 'Listening... speak now',
    thinking: 'Orvixa is thinking...',
    speaking: 'Orvixa is speaking',
  }[voiceState];

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(3, 7, 18, 0.96)',
      backdropFilter: 'blur(36px)',
      WebkitBackdropFilter: 'blur(36px)',
      zIndex: 1000000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '28px 24px',
      color: '#ffffff',
      fontFamily: 'var(--font-sans)',
      animation: 'fadeIn 0.25s ease',
      userSelect: 'none',
    }}>

      {/* ── TOP NAV BAR ────────────────────────────────────── */}
      <div style={{ display: 'flex', width: '100%', maxWidth: '800px', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px', padding: '6px 14px',
        }}>
          <Sparkles size={14} style={{ color: '#818cf8' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1.5px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>
            ORVIXA LIVE VOICE PRO
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={voiceLanguage}
            onChange={(e) => setVoiceLanguage(e.target.value as any)}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              color: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              padding: '6px 12px',
              outline: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <option value="en-US" style={{ background: '#030712' }}>🇺🇸 English (Natural)</option>
            <option value="hi-IN" style={{ background: '#030712' }}>🇮🇳 हिन्दी (Natural)</option>
          </select>
        </div>
      </div>

      {/* ── CENTER: PRO VOICE ORB & VISUALIZER ────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', width: '100%', maxWidth: '640px' }}>

        {/* Morphing Siri/Gemini Live 3D Orb */}
        <div
          style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          onClick={() => voiceState === 'speaking' ? interruptSpeaking() : toggleMicMute()}
          title={voiceState === 'speaking' ? 'Tap to stop speaking' : 'Tap to mute/unmute'}
        >
          {/* Ambient Glow Rings */}
          <div style={{
            position: 'absolute',
            width: '180px', height: '180px', borderRadius: '50%',
            background: `radial-gradient(circle, ${orbColor}55 0%, transparent 70%)`,
            animation: 'pulseGlow 2.5s infinite ease-in-out',
            filter: 'blur(20px)',
          }} />

          {/* Outer Pulsing Boundary Ring */}
          <div style={{
            position: 'absolute',
            width: '140px', height: '140px', borderRadius: '50%',
            border: `2px solid ${orbColor}44`,
            animation: voiceState === 'speaking' || voiceState === 'listening' ? 'pingRing 1.8s infinite ease-out' : 'none',
          }} />

          {/* Core Orb Container */}
          <div style={{
            width: '110px', height: '110px', borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, ${orbColor}dd, #030712)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 40px ${orbColor}66, inset 0 2px 10px rgba(255,255,255,0.25)`,
            transition: 'all 0.35s ease',
            zIndex: 2,
          }}>
            {isMicMuted ? (
              <MicOff size={36} style={{ color: '#ef4444' }} />
            ) : voiceState === 'listening' ? (
              <Mic size={36} style={{ color: '#ffffff' }} />
            ) : voiceState === 'speaking' ? (
              <Volume2 size={36} style={{ color: '#ffffff' }} />
            ) : (
              <AudioLines size={36} style={{ color: '#ffffff' }} />
            )}
          </div>
        </div>

        {/* Dynamic Status + Audio Visualizer Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <EqualizerBars active={voiceState === 'speaking' || voiceState === 'listening'} color={orbColor} />
            <span style={{ fontSize: '1rem', fontWeight: 600, color: hasPermissionError ? '#ef4444' : 'rgba(255,255,255,0.9)' }}>
              {statusLabel}
            </span>
          </div>

          {/* User Query Glass Card */}
          {transcribedText && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(16px)',
              borderRadius: '14px',
              padding: '10px 18px',
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.8)',
              fontStyle: 'italic',
              textAlign: 'center',
              maxWidth: '480px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}>
              "{transcribedText}"
            </div>
          )}

          {/* AI Live Response Snippet */}
          {lastAiResponse && voiceState === 'speaking' && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '14px',
              padding: '10px 18px',
              fontSize: '0.85rem',
              color: '#10b981',
              fontWeight: 500,
              textAlign: 'center',
              maxWidth: '520px',
            }}>
              💬 {lastAiResponse}
            </div>
          )}

          {/* Desktop Action Confirmation */}
          {statusBadge && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.28)',
              borderRadius: '12px', padding: '8px 16px',
              fontSize: '0.82rem', color: '#a5b4fc', fontWeight: 500,
            }}>
              <ExternalLink size={14} style={{ color: '#818cf8' }} />
              {statusBadge}
            </div>
          )}

          {/* In-App Pro YouTube Auto-Player Card */}
          {activeYouTubeEmbedUrl && (
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '520px',
              height: '290px',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7)',
              marginTop: '10px',
              background: '#000',
            }}>
              <button
                onClick={() => setActiveYouTubeEmbedUrl(null)}
                style={{
                  position: 'absolute', top: '8px', right: '8px', zIndex: 20,
                  background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%',
                  color: '#fff', width: '28px', height: '28px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                title="Close Player"
              >
                <X size={14} />
              </button>
              <iframe
                src={activeYouTubeEmbedUrl}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                title="Orvixa YouTube Auto-Player"
              />
            </div>
          )}
        </div>

        {/* Pro Quick Action Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '580px' }}>
          {[
            { icon: <Play size={11} />, label: 'Spotify Play', prompt: 'play All Black song on spotify' },
            { icon: <Play size={11} />, label: 'Next Song', prompt: 'Next song change karo' },
            { icon: <Globe size={11} />, label: 'WhatsApp Msg', prompt: 'WhatsApp pe message karo Hello' },
            { icon: <Search size={11} />, label: 'Click Button', prompt: 'Click on Login' },
            { icon: <FileText size={11} />, label: 'Page Summarize', prompt: 'Is page ko summarize karo' },
            { icon: <ArrowDown size={11} />, label: 'YouTube Auto', prompt: 'Chaiyya Chaiyya song bajao' },
          ].map((pill) => (
            <button
              key={pill.label}
              onClick={() => handlePillClick(pill.prompt)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                fontSize: '0.72rem', padding: '5px 12px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                borderRadius: '20px', color: 'rgba(255, 255, 255, 0.55)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.09)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.55)';
              }}
            >
              {pill.icon} {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── BOTTOM DOCK CONTROLS ───────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Mute Mic Toggle */}
        <Button
          onClick={toggleMicMute}
          style={{
            width: '48px', height: '48px', borderRadius: '50%',
            backgroundColor: isMicMuted ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${isMicMuted ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isMicMuted ? '#ef4444' : '#ffffff', cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
        >
          {isMicMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </Button>

        {/* Interrupt / Stop AI Speech */}
        {voiceState === 'speaking' && (
          <Button
            onClick={interruptSpeaking}
            style={{
              height: '48px', borderRadius: '24px', padding: '0 20px',
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              display: 'flex', alignItems: 'center', gap: '8px',
              color: '#f59e0b', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
              transition: 'all 0.15s ease',
            }}
            title="Stop speaking"
          >
            <Square size={16} fill="#f59e0b" /> Stop AI
          </Button>
        )}

        {/* Close Button */}
        <Button
          onClick={handleClose}
          style={{
            width: '48px', height: '48px', borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255, 255, 255, 0.6)', cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            e.currentTarget.style.color = '#ef4444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
          }}
          title="Exit Voice Mode"
        >
          <X size={20} />
        </Button>
      </div>

      {/* Keyframe Animation Styles */}
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.18); opacity: 0.85; }
        }
        @keyframes pingRing {
          0% { transform: scale(0.95); opacity: 0.8; }
          100% { transform: scale(1.45); opacity: 0; }
        }
        @keyframes equalizerBounce {
          0% { height: 4px; }
          100% { height: 22px; }
        }
      `}</style>
    </div>
  );
};
