import React, { useState, useRef } from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { Button } from '@/components/ui/Button';
import { 
  CornerDownLeft, 
  Scan, 
  Headphones, 
  Paperclip, 
  Link2, 
  Sliders,
  FileText
} from 'lucide-react';

export const BottomBar: React.FC = () => {
  const { 
    executeAction, 
    performanceMetrics, 
    activeContext, 
    setActiveContext,
    isExpanded, 
    setIsVoiceModeActive 
  } = useSidePanel();

  const [promptInput, setPromptInput] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [socraticMode, setSocraticMode] = useState<'explain' | 'hint' | 'challenge'>('explain');
  const [showModeMenu, setShowModeMenu] = useState<boolean>(false);
  const [showVoiceAlert, setShowVoiceAlert] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if voice Speech Recognition is supported in the active environment
  const isSpeechSupported = typeof window !== 'undefined' && 
    (!!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition);

  const isContextReady = !!(activeContext && activeContext.pageContext && activeContext.observed_title !== 'orvixa' && !activeContext.observed_url?.startsWith('chrome-extension://'));

  // Autodetect URL links pasted in input box
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const detectedUrlMatch = promptInput.match(urlRegex);
  const detectedUrl = detectedUrlMatch ? detectedUrlMatch[0] : null;

  const handleSend = () => {
    if (!promptInput.trim()) return;

    // If it's a URL, let's auto-sync the context first!
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
          hostname: 'orvixa-app.com',
          pageTitle: detectedUrl.replace('https://', '').split('/')[0],
          pageType: 'webpage',
          platform: 'generic_web',
          language: 'en',
          selectedText: '',
          visibleText: `Simulated document content parsed from URL: ${detectedUrl}. Ready for learning.`,
          headings: [],
          metadata: { contentType: 'webpage' },
          topic: 'Auto-sync Web Study',
          contentType: 'text/html',
          difficulty: 'medium',
          questionCount: 0,
          confidence: 1.0,
          timestamp: Date.now(),
        }
      };
      setActiveContext(newContext);
      setUploadStatus('Syncing completed!');
      setTimeout(() => setUploadStatus(''), 2000);
    }

    // Map socraticMode to action parameters
    executeAction({
      action_id: socraticMode === 'hint' ? 'hint' : socraticMode === 'challenge' ? 'interview' : 'custom_learning_query',
      label: socraticMode === 'hint' ? 'Socratic Hint' : socraticMode === 'challenge' ? 'Challenge Question' : 'Explainer',
      description: promptInput,
      icon: 'sparkles',
    });
    
    setPromptInput('');
  };

  const handleScanScreen = () => {
    if (!isContextReady) return;
    executeAction({
      action_id: 'explain',
      label: 'Screen Analysis',
      description: 'Analyze active learning screen content',
      icon: 'sparkles',
    });
  };

  // Mock document/file upload uploader handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus(`Uploading ${file.name}...`);
    setTimeout(() => {
      const newContext = {
        confidence_tier: 'HIGH' as const,
        confidence_score: 1.0,
        primary_intent: 'study',
        recommended_actions: [],
        side_panel_state: 'OPEN',
        redacted: false,
        sanitized_summary: `Uploaded File: ${file.name}`,
        pageContext: {
          url: `file://${file.name}`,
          origin: 'local://file',
          hostname: 'localhost',
          pageTitle: file.name,
          pageType: 'document',
          platform: 'local_file',
          language: 'en',
          selectedText: '',
          visibleText: `Loaded local file content from ${file.name}. Prepared for Socratic query tutoring.`,
          headings: [],
          metadata: { contentType: 'document' },
          topic: 'Local File Study',
          contentType: 'text/plain',
          difficulty: 'medium',
          questionCount: 0,
          confidence: 1.0,
          timestamp: Date.now(),
        }
      };
      setActiveContext(newContext);
      setUploadStatus('Document synced successfully!');
      setTimeout(() => setUploadStatus(''), 2500);
    }, 1500);
  };

  const renderPerformanceMetrics = () => {
    if (!import.meta.env.DEV || !performanceMetrics) return null;
    const { firstOpenTime, ttft, totalDuration } = performanceMetrics;
    if (!firstOpenTime && !ttft && !totalDuration) return null;

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        fontSize: '10px',
        color: 'var(--text-secondary)',
        paddingTop: '8px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        width: '100%',
        maxWidth: isExpanded ? '850px' : '100%',
      }}>
        {firstOpenTime && <span>Open: {firstOpenTime}ms</span>}
        {ttft && <span>TTFT: {ttft}ms</span>}
        {totalDuration && <span>Stream: {totalDuration}ms</span>}
      </div>
    );
  };

  return (
    <div style={{
      padding: '16px 20px 24px 20px',
      backgroundColor: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      alignItems: 'center',
      width: '100%',
    }}>
      {/* Hidden file input uploader element */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.txt,.md,.json"
        style={{ display: 'none' }}
      />

      {/* Auto-detected banners or status notifications */}
      {(detectedUrl || uploadStatus) && (
        <div style={{
          width: '100%',
          maxWidth: isExpanded ? '800px' : '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(99, 102, 241, 0.04)',
          border: '1px solid rgba(99, 102, 241, 0.15)',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '0.7rem',
          color: 'var(--brand-primary)',
          fontWeight: 700,
          animation: 'fadeIn 200ms ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {detectedUrl ? <Link2 size={12} /> : <FileText size={12} />}
            <span>
              {uploadStatus || `Pasted URL Detected: ${detectedUrl}. Press Enter to auto-sync!`}
            </span>
          </div>
        </div>
      )}

      {/* Main input card box */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        width: '100%', 
        maxWidth: isExpanded ? '800px' : '100%',
        backgroundColor: 'var(--bg-surface)',
        border: isFocused ? '1px solid var(--brand-primary)' : '1px solid var(--border-color)',
        borderRadius: '20px',
        padding: '8px 12px',
        boxShadow: isFocused ? 'var(--shadow-aura)' : 'var(--shadow-sm)',
        transition: 'all var(--motion-fast) var(--easing-default)',
        position: 'relative',
      }}>
        {/* Text Area Input */}
        <textarea
          rows={1}
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
          {/* Left Actions: scan, upload, voice, socratic mode */}
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

            {/* 3. Voice overlay headphones */}
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
              title={isSpeechSupported ? "Start Voice Session" : "Voice mode is supported in Chrome. Edge WebView2 does not support speech recognition."}
              style={{ 
                padding: '6px',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                opacity: 1
              }}
            >
              <Headphones size={14} style={{ color: 'var(--text-muted)' }} />
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

          {/* Right Send Button */}
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

      {/* Voice mode support alert card overlay */}
      {showVoiceAlert && (
        <div style={{
          position: 'absolute',
          bottom: '90px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '380px',
          backgroundColor: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 1000,
          animation: 'slideUp var(--motion-fast) ease',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--amber-primary)' }}>
            <Sliders size={14} style={{ color: 'var(--amber-primary)' }} />
            <span style={{ fontWeight: 800, fontSize: '0.78rem' }}>Voice Assistant Notice</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
            Voice dictation relies on the Google Chrome Web Speech API. Native WebView2 app containers on Windows do not support it. 
            To use voice commands, open Orvixa in <strong>Google Chrome</strong>!
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
