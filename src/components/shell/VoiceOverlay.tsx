import React, { useEffect, useState } from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { useVoice } from '@/hooks/useVoice';
import { Button } from '@/components/ui/Button';
import { X, Mic, Volume2, AudioLines } from 'lucide-react';

export const VoiceOverlay: React.FC = () => {
  const { 
    isVoiceModeActive, 
    setIsVoiceModeActive, 
    thinkingStep, 
    executeAction,
    conversationHistory 
  } = useSidePanel();

  const {
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

  // Poll SpeechSynthesis state directly to sync visual speaking animations
  const [isTTSSpeaking, setIsTTSSpeaking] = useState(false);
  useEffect(() => {
    const checkSpeech = setInterval(() => {
      const speaking = window.speechSynthesis.speaking;
      setIsTTSSpeaking(speaking);
    }, 150);
    return () => clearInterval(checkSpeech);
  }, []);

  // 1. Hands-Free Conversation Cycle state machine
  useEffect(() => {
    if (!isVoiceModeActive) return;

    // A. AI is generating response
    if (thinkingStep !== 'idle') {
      setVoiceState('thinking');
      stopListening();
    }
    // B. AI has finished generating response
    else if (thinkingStep === 'idle') {
      if (isTTSSpeaking) {
        setVoiceState('speaking');
        stopListening();
      } else {
        // C. AI finished speaking, auto-resume listening for next user question
        setVoiceState('listening');
        // Small timeout to prevent mic from picking up final TTS echoes
        const timer = setTimeout(() => {
          startListening((text) => {
            if (text.trim()) {
              setTranscribedText(text);
              executeAction({
                action_id: 'voice_chat',
                label: 'Voice Chat',
                description: text,
                icon: 'sparkles',
              });
            }
          });
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isVoiceModeActive, thinkingStep, isTTSSpeaking, startListening, stopListening, executeAction]);

  // 2. Trigger initial voice recording on mount
  useEffect(() => {
    if (isVoiceModeActive) {
      setVoiceState('listening');
      startListening((text) => {
        if (text.trim()) {
          setTranscribedText(text);
          executeAction({
            action_id: 'voice_chat',
            label: 'Voice Chat',
            description: text,
            icon: 'sparkles',
          });
        }
      });
    }
    return () => {
      stopListening();
      stopSpeaking();
    };
  }, [isVoiceModeActive, startListening, executeAction, stopListening, stopSpeaking]);

  // 3. Detect when a new AI message arrives to read it out loud (ensures TTS triggers in voice overlay mode)
  useEffect(() => {
    if (!isVoiceModeActive) return;
    if (conversationHistory.length > lastProcessedMsgCount) {
      const lastMsg = conversationHistory[conversationHistory.length - 1];
      if (lastMsg.role === 'assistant') {
        const text = lastMsg.text;
        if (text.includes('Gemini Provider Error') || text.includes('Error:') || (text.startsWith('[') && text.includes('Error'))) {
          speakText('Sorry, I encountered a connection error. Please try again.');
        } else {
          speakText(text);
        }
      }
      setLastProcessedMsgCount(conversationHistory.length);
    }
  }, [conversationHistory, lastProcessedMsgCount, speakText, isVoiceModeActive]);

  if (!isVoiceModeActive) return null;

  const getStatusText = () => {
    if (hasPermissionError) return 'Microphone Permission Blocked';
    if (voiceState === 'listening') return 'Listening... Speak now';
    if (voiceState === 'thinking') return 'Orvixa is thinking...';
    if (voiceState === 'speaking') return 'Orvixa is speaking...';
    return 'Tap mic to talk';
  };

  const handleClose = () => {
    stopListening();
    stopSpeaking();
    setIsVoiceModeActive(false);
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.96)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      zIndex: 1000000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '40px 24px',
      color: '#ffffff',
      fontFamily: 'var(--font-sans)',
      animation: 'fadeIn 0.25s ease',
    }}>
      {/* Top Header */}
      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AudioLines size={16} style={{ color: 'var(--brand-primary)' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.5px' }}>
            ORVIXA VOICE MODE
          </span>
        </div>

        {/* Language selector in voice mode */}
        <select 
          value={voiceLanguage}
          onChange={(e) => setVoiceLanguage(e.target.value as any)}
          style={{
            background: 'rgba(255,255,255,0.06)',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px',
            padding: '4px 8px',
            outline: 'none',
            fontSize: '0.7rem',
            cursor: 'pointer',
          }}
        >
          <option value="en-US" style={{ background: '#0f172a' }}>English (US)</option>
          <option value="hi-IN" style={{ background: '#0f172a' }}>Hindi (हिन्दी)</option>
        </select>
      </div>

      {/* Center: Morphing ChatGPT-style Voice Orb */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
        <div 
          className={`voice-orb ${voiceState}`}
          onClick={() => {
            if (voiceState === 'listening') {
              stopListening();
              setVoiceState('idle');
            } else {
              setVoiceState('listening');
              startListening((text) => {
                executeAction({
                  action_id: 'voice_chat',
                  label: 'Voice Chat',
                  description: text,
                  icon: 'sparkles',
                });
              });
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.1)',
            zIndex: 2,
          }}>
            {voiceState === 'listening' ? (
              <Mic size={28} style={{ color: '#ef4444' }} />
            ) : (
              <Volume2 size={28} style={{ color: voiceState === 'speaking' ? '#10b981' : '#3b82f6' }} />
            )}
          </div>
        </div>

        {/* Status indicator */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.5px', color: hasPermissionError ? '#ef4444' : '#ffffff' }}>
            {getStatusText()}
          </span>
          {hasPermissionError ? (
            <div style={{
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.7)',
              textAlign: 'center',
              maxWidth: '300px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              padding: '10px 12px',
              marginTop: '4px',
              lineHeight: '1.4',
            }}>
              To chat with voice, please click the site settings button (lock icon or settings sliders icon) in your browser address bar and toggle **Microphone** to **ALLOW**.<br/><br/>
              *Note: If the error persists, please click the **Orvixa Extension Icon** in your Chrome toolbar (puzzle icon menu) to trigger and allow the native microphone permission.*
            </div>
          ) : (
            transcribedText && voiceState === 'thinking' && (
              <span style={{ 
                fontSize: '0.8rem', 
                color: 'rgba(255,255,255,0.5)', 
                textAlign: 'center', 
                maxWidth: '280px',
                fontStyle: 'italic'
              }}>
                "{transcribedText}"
              </span>
            )
          )}
        </div>
      </div>

      {/* Bottom Close Action Button */}
      <Button
        onClick={handleClose}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          cursor: 'pointer',
          transition: 'background-color 0.15s ease, transform 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title="Exit Voice Mode"
      >
        <X size={20} />
      </Button>
    </div>
  );
};
