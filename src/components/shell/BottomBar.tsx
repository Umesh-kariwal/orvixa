import React, { useState, useRef, useEffect } from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { Button } from '@/components/ui/Button';
import { 
  CornerDownLeft, 
  Scan, 
  Mic, 
  Paperclip, 
  Link2, 
  Sliders,
  AudioLines
} from 'lucide-react';

export const BottomBar: React.FC = () => {
  const { 
    executeAction, 
    performanceMetrics, 
    activeContext, 
    setActiveContext,
    setIsVoiceModeActive 
  } = useSidePanel();

  const [promptInput, setPromptInput] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [socraticMode, setSocraticMode] = useState<'explain' | 'hint' | 'challenge'>('explain');
  const [showModeMenu, setShowModeMenu] = useState<boolean>(false);
  const [showVoiceAlert, setShowVoiceAlert] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dictation / Speech-to-Text states
  const [isDictating, setIsDictating] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Check if voice Speech Recognition is supported in the active environment
  const isSpeechSupported = typeof window !== 'undefined' && 
    (!!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition);

  const isContextReady = !!(activeContext && activeContext.pageContext && activeContext.observed_title !== 'orvixa' && !activeContext.observed_url?.startsWith('chrome-extension://'));

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const detectedUrlMatch = promptInput.match(urlRegex);
  const detectedUrl = detectedUrlMatch ? detectedUrlMatch[0] : null;

  // Cleanup dictation on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setShowVoiceAlert(true);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let interimTrans = '';
        let finalTrans = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          } else {
            interimTrans += event.results[i][0].transcript;
          }
        }
        if (finalTrans) {
          setPromptInput((prev) => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + finalTrans);
        }
      };

      rec.onerror = (e: any) => {
        console.error('Speech recognition error:', e);
        setIsDictating(false);
      };

      rec.onend = () => {
        setIsDictating(false);
      };

      recognitionRef.current = rec;
      rec.start();
      setIsDictating(true);
    } catch (err) {
      console.error(err);
      setIsDictating(false);
    }
  };

  const stopDictation = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsDictating(false);
  };

  const toggleDictation = () => {
    if (isDictating) {
      stopDictation();
    } else {
      startDictation();
    }
  };

  const handleSend = () => {
    if (!promptInput.trim()) return;

    if (isDictating) {
      stopDictation();
    }

    if (detectedUrl) {
      setUploadStatus('Syncing URL context...');
      const newContext = {
        confidence_tier: 'HIGH' as const,
        confidence_score: 1.0,
        primary_intent: 'study',
        recommended_actions: [],
        side_panel_state: 'OPEN',
        redacted: false,
        sanitized_summary: `URL Context: ${detectedUrl}`,
        pageContext: {
          url: detectedUrl,
          origin: 'https://orvixa-app.com',
          hostname: detectedUrl.replace('https://', '').replace('http://', '').split('/')[0],
          pageTitle: detectedUrl.replace('https://', '').replace('http://', '').split('/')[0],
          pageType: 'webpage',
          platform: 'generic_web',
          language: 'en',
          selectedText: '',
          visibleText: `Simulated document content parsed from ${detectedUrl}. Ready for Socratic learning.`,
          headings: [],
          metadata: { contentType: 'webpage' },
          topic: 'Linked Article Study',
          contentType: 'text/html',
          difficulty: 'medium',
          questionCount: 0,
          confidence: 1.0,
          timestamp: Date.now(),
        }
      };
      setTimeout(() => {
        setActiveContext(newContext);
        setUploadStatus('');
      }, 1000);
    }

    executeAction({
      action_id: socraticMode === 'hint' ? 'hint' : socraticMode === 'challenge' ? 'interview' : 'custom_learning_query',
      label: socraticMode === 'hint' ? 'Socratic Clue' : socraticMode === 'challenge' ? 'Challenge Question' : 'Explainer Note',
      description: promptInput,
      icon: 'sparkles'
    });

    setPromptInput('');
  };

  const handleScanScreen = () => {
    executeAction({
      action_id: 'explain',
      label: 'Scan Screen',
      description: 'Analyze active learning screen content',
      icon: 'sparkles'
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus(`Parsing ${file.name}...`);
    setTimeout(() => {
      const mockContext = {
        confidence_tier: 'HIGH' as const,
        confidence_score: 1.0,
        primary_intent: 'study',
        recommended_actions: [],
        side_panel_state: 'OPEN',
        redacted: false,
        sanitized_summary: `PDF Vault: ${file.name}`,
        pageContext: {
          url: `file:///${file.name}`,
          origin: 'local_filesystem',
          hostname: 'local_storage',
          pageTitle: file.name,
          pageType: 'document',
          platform: 'vault',
          language: 'en',
          selectedText: '',
          visibleText: `Synchronized vault document text parsed from ${file.name}. Fully ready for deep Socratic review.`,
          headings: [],
          metadata: { size: file.size, filename: file.name },
          topic: file.name.split('.')[0],
          contentType: file.type || 'application/pdf',
          difficulty: 'medium',
          questionCount: 0,
          confidence: 1.0,
          timestamp: Date.now(),
        }
      };
      setActiveContext(mockContext);
      setUploadStatus(`Success: ${file.name} synchronized.`);
      setTimeout(() => setUploadStatus(''), 2500);
    }, 1200);
  };

  const renderPerformanceMetrics = () => {
    if (!performanceMetrics || !performanceMetrics.totalDuration) return null;
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        fontSize: '0.62rem',
        color: 'var(--text-muted)',
        paddingTop: '6px',
        opacity: 0.8,
      }}>
        {performanceMetrics.ttft && (
          <span>TTFT: {performanceMetrics.ttft}ms</span>
        )}
        <span>Duration: {performanceMetrics.totalDuration}ms</span>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
      
      {uploadStatus && (
        <div style={{
          fontSize: '0.68rem',
          color: 'var(--brand-primary)',
          backgroundColor: 'rgba(99, 102, 241, 0.05)',
          padding: '6px 12px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(99, 102, 241, 0.1)',
          animation: 'fadeIn var(--motion-fast) ease',
        }}>
          ⚡ {uploadStatus}
        </div>
      )}

      {/* Hidden uploader input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,.txt,.docx,.png,.jpg"
        style={{ display: 'none' }}
      />

      <div style={{
        borderRadius: '16px',
        backgroundColor: 'rgba(10, 10, 15, 0.7)',
        backdropFilter: 'blur(16px)',
        border: isFocused ? '1px solid var(--brand-primary)' : '1px solid var(--border-color)',
        padding: '10px 14px',
        boxShadow: isFocused ? '0 0 15px rgba(99, 102, 241, 0.1)' : 'var(--shadow-md)',
        transition: 'all var(--motion-fast) ease',
      }}>
        {/* URL synchronization tip pill */}
        {detectedUrl && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '20px',
            padding: '4px 10px',
            fontSize: '0.62rem',
            color: 'var(--emerald-primary)',
            fontWeight: 800,
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            <Link2 size={10} /> Auto-Sync Webpage Detected
          </div>
        )}

        <textarea
          placeholder="Ask Orvixa to explain, hint, or teach..."
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            width: '100%',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            outline: 'none',
            fontFamily: 'var(--font-sans)',
            resize: 'none',
            maxHeight: '120px',
            padding: '4px 6px',
            lineHeight: '1.5',
          }}
        />

        {/* Toolbar segment */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginTop: '6px',
          paddingTop: '6px',
          borderTop: '1px solid var(--border-color)',
        }}>
          {/* Left Actions: scan, upload, voice dictation, socratic mode */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
            
            {/* 1. Document / File Uploader */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              title="Upload PDF or document context..."
              style={{ padding: '6px', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}
            >
              <Paperclip size={14} style={{ color: 'var(--text-muted)' }} />
            </Button>

            {/* 2. Screen Scraper */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleScanScreen}
              disabled={!isContextReady}
              title={isContextReady ? "Analyze Screen Content" : "Waiting for page context..."}
              style={{ 
                padding: '6px', 
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                opacity: isContextReady ? 1 : 0.4, 
                cursor: isContextReady ? 'pointer' : 'not-allowed' 
              }}
            >
              <Scan size={14} style={{ color: isContextReady ? 'var(--brand-primary)' : 'var(--text-muted)' }} />
            </Button>

            {/* 3. Voice Input (Speech-to-Text Dictation) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDictation}
              title={isDictating ? "Listening... click to stop" : "Voice Dictation (Speech to Text)"}
              style={{ 
                padding: '6px',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                opacity: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isDictating ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.05)',
                border: isDictating ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(99, 102, 241, 0.15)',
                transition: 'all var(--motion-fast) ease',
              }}
              onMouseEnter={(e) => {
                if (!isDictating) {
                  e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.15)';
                  e.currentTarget.style.transform = 'scale(1.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isDictating) {
                  e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.05)';
                  e.currentTarget.style.transform = 'none';
                }
              }}
            >
              <Mic size={14} style={{ color: isDictating ? '#ef4444' : 'var(--brand-primary)' }} />
            </Button>

            {/* 4. Socratic Mode Selector Dropdown */}
            <div style={{ position: 'relative' }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModeMenu(!showModeMenu)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Sliders size={10} style={{ color: 'var(--brand-primary)' }} />
                <span>
                  {socraticMode === 'hint' ? 'Socratic Hint' : socraticMode === 'challenge' ? 'Challenge' : 'Full Explainer'}
                </span>
              </Button>

              {showModeMenu && (
                <div style={{
                  position: 'absolute',
                  bottom: '36px',
                  left: 0,
                  backgroundColor: '#0a0a10',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 100,
                  width: '140px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
                  animation: 'slideUp var(--motion-fast) ease',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                }}>
                  <button
                    onClick={() => { setSocraticMode('hint'); setShowModeMenu(false); }}
                    style={{
                      padding: '8px 10px',
                      border: 'none',
                      background: 'none',
                      color: socraticMode === 'hint' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      transition: 'all var(--motion-fast) ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    🎯 Socratic Hint
                  </button>
                  <button
                    onClick={() => { setSocraticMode('explain'); setShowModeMenu(false); }}
                    style={{
                      padding: '8px 10px',
                      border: 'none',
                      background: 'none',
                      color: socraticMode === 'explain' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      transition: 'all var(--motion-fast) ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    📖 Full Explainer
                  </button>
                  <button
                    onClick={() => { setSocraticMode('challenge'); setShowModeMenu(false); }}
                    style={{
                      padding: '8px 10px',
                      border: 'none',
                      background: 'none',
                      color: socraticMode === 'challenge' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      transition: 'all var(--motion-fast) ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    🤔 Challenge Mode
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Actions: Voice Assistant & Send button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            
            {/* 3. Voice Assistant (Real-time conversation call) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (isSpeechSupported) {
                  setIsVoiceModeActive(true);
                } else {
                  setShowVoiceAlert(true);
                }
              }}
              title="Voice Assistant (Real-time voice conversation)"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(99, 102, 241, 0.05)',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                transition: 'all var(--motion-fast) ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.15)';
                e.currentTarget.style.transform = 'scale(1.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.05)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <AudioLines size={14} style={{ color: 'var(--brand-primary)' }} />
            </Button>

            {/* Send Arrow Button */}
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleSend} 
              disabled={!promptInput.trim()}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                padding: 0,
                backgroundColor: promptInput.trim() ? 'var(--brand-primary)' : 'var(--border-color)',
                color: promptInput.trim() ? '#ffffff' : 'var(--text-muted)',
                transition: 'all var(--motion-fast) var(--easing-default)',
              }}
            >
              <CornerDownLeft size={13} />
            </Button>
          </div>
        </div>
      </div>

      {/* Voice mode support alert card overlay */}
      {showVoiceAlert && (
        <div style={{
          position: 'absolute',
          bottom: '90px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '380px',
          backgroundColor: '#0a0a10',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          zIndex: 1000,
          animation: 'slideUp var(--motion-fast) ease',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--amber-primary)' }}>
            <Sliders size={14} style={{ color: 'var(--amber-primary)' }} />
            <span style={{ fontWeight: 800, fontSize: '0.78rem' }}>Voice Feature Notice</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
            Voice transcription and conversational features rely on the Chrome Web Speech API. 
            Native WebView2 desktop app wrappers do not support microphone access. 
            To use voice features, open Orvixa in <strong>Google Chrome</strong>!
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button size="sm" variant="ghost" onClick={() => setShowVoiceAlert(false)} style={{ fontSize: '0.7rem' }}>Dismiss</Button>
            <a 
              href="https://orvixa.onrender.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#ffffff',
                backgroundColor: 'var(--brand-primary)',
                padding: '6px 12px',
                borderRadius: '20px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              Open Web App
            </a>
          </div>
        </div>
      )}

      {renderPerformanceMetrics()}
    </div>
  );
};
