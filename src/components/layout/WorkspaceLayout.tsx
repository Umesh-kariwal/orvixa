import React, { useState } from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { 
  GraduationCap, 
  Settings, 
  Shield, 
  TrendingUp, 
  Trash2, 
  MessageSquare,
  Database,
  Sparkles
} from 'lucide-react';
import { ContentAreaHost } from '../shell/ContentAreaHost';
import { BottomBar } from '../shell/BottomBar';
import { DashboardSidebar } from '../shell/DashboardSidebar';
import { SettingsView } from '../views/SettingsView';
import { PrivacyDashboard } from '../views/PrivacyDashboard';
import { MasteryDashboard } from '../views/MasteryDashboard';

export const WorkspaceLayout: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    activeContext,
    setActiveContext,
    resetSession,
    conversationHistory,
  } = useSidePanel();

  const [inputUrl, setInputUrl] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    
    // Simulate loading URL context in independent mode
    setUploadStatus('Syncing URL context...');
    setTimeout(() => {
      // Mock loading context into state via context dispatcher
      const newContext = {
        confidence_tier: 'HIGH' as const,
        confidence_score: 1.0,
        primary_intent: 'study',
        recommended_actions: [],
        side_panel_state: 'OPEN',
        redacted: false,
        sanitized_summary: 'Webpage context synced',
        pageContext: {
          url: inputUrl,
          origin: 'https://orvixa-app.com',
          hostname: 'orvixa-app.com',
          pageTitle: inputUrl.replace('https://', '').split('/')[0],
          pageType: 'webpage',
          platform: 'generic_web',
          language: 'en',
          selectedText: '',
          visibleText: `Simulated document content parsed from ${inputUrl}. Ready for Socratic learning.`,
          headings: [],
          metadata: { contentType: 'webpage' },
          topic: 'General Web Study',
          contentType: 'text/html',
          difficulty: 'medium',
          questionCount: 0,
          confidence: 1.0,
          timestamp: Date.now(),
        }
      };
      setActiveContext(newContext);
      setUploadStatus('Context synchronized successfully!');
      setInputUrl('');
      setTimeout(() => setUploadStatus(''), 2500);
    }, 1500);
  };

  const renderActiveWorkspaceView = () => {
    switch (currentView) {
      case 'dashboard':
        return <MasteryDashboard />;
      case 'settings':
        return <SettingsView />;
      case 'privacy':
        return <PrivacyDashboard />;
      case 'onboarding':
        return <ContentAreaHost />;
      
      case 'learning':
      default:
        return (
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: '100%' }}>
            {/* Center Chat Panel */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              height: '100%',
              backgroundColor: 'rgba(5, 5, 10, 0.2)',
              borderRight: '1px solid var(--border-color)',
            }}>
              {/* Main Chat Thread area */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <ContentAreaHost />
              </div>
              
              {/* ChatGPT style search card at the bottom */}
              <div style={{ padding: '0 24px 20px 24px' }}>
                <BottomBar />
              </div>
            </div>

            {/* Right Panel: Context Intelligence Widgets */}
            <div style={{
              width: '320px',
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.15)',
            }}>
              <DashboardSidebar />
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{
      display: 'flex',
      width: '100vw',
      height: '100vh',
      backgroundColor: '#030304',
      backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(99, 102, 241, 0.08) 0%, transparent 60%)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-sans)',
      overflow: 'hidden',
    }}>
      {/* 1. Left Navigation Sidebar Panel */}
      <div style={{
        width: '260px',
        height: '100%',
        backgroundColor: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        {/* Brand Banner */}
        <div style={{
          padding: '24px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderBottom: '1px solid var(--border-color)',
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            backgroundColor: 'var(--brand-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
          }}>
            <GraduationCap size={16} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Orvixa
            </span>
            <span style={{ fontSize: '0.62rem', color: 'var(--brand-primary)', fontWeight: 800 }}>
              INDEPENDENT SUITE
            </span>
          </div>
        </div>

        {/* Sync Status Badge */}
        <div style={{ padding: '16px 20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: activeContext?.pageContext ? 'rgba(16, 185, 129, 0.06)' : 'rgba(245, 158, 11, 0.06)',
            border: activeContext?.pageContext ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid rgba(245, 158, 11, 0.15)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-lg)',
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: activeContext?.pageContext ? 'var(--emerald-primary)' : 'var(--amber-primary)',
              boxShadow: activeContext?.pageContext ? '0 0 6px var(--emerald-primary)' : '0 0 6px var(--amber-primary)',
            }} />
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Context</span>
              <span style={{
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                fontWeight: 700,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {activeContext?.pageContext ? activeContext.pageContext.pageTitle : 'Ready to Sync'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Item Links */}
        <div style={{
          padding: '10px 12px 0 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          <button
            onClick={() => setCurrentView('learning')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: currentView === 'learning' ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
              color: currentView === 'learning' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: currentView === 'learning' ? 700 : 500,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all var(--motion-fast) ease',
            }}
          >
            <MessageSquare size={14} style={{ color: currentView === 'learning' ? 'var(--brand-primary)' : 'inherit' }} />
            <span>Socratic Workspace</span>
          </button>

          <button
            onClick={() => setCurrentView('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: currentView === 'dashboard' ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
              color: currentView === 'dashboard' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: currentView === 'dashboard' ? 700 : 500,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all var(--motion-fast) ease',
            }}
          >
            <TrendingUp size={14} style={{ color: currentView === 'dashboard' ? 'var(--brand-primary)' : 'inherit' }} />
            <span>Mastery Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentView('settings')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: currentView === 'settings' ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
              color: currentView === 'settings' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: currentView === 'settings' ? 700 : 500,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all var(--motion-fast) ease',
            }}
          >
            <Settings size={14} style={{ color: currentView === 'settings' ? 'var(--brand-primary)' : 'inherit' }} />
            <span>Settings Configuration</span>
          </button>

          <button
            onClick={() => setCurrentView('privacy')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: currentView === 'privacy' ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
              color: currentView === 'privacy' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: currentView === 'privacy' ? 700 : 500,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all var(--motion-fast) ease',
            }}
          >
            <Shield size={14} style={{ color: currentView === 'privacy' ? 'var(--emerald-primary)' : 'inherit' }} />
            <span>Privacy Guard</span>
          </button>
        </div>

        {/* 1.5. Desktop App Download Link Promotion */}
        <div style={{
          margin: '20px 12px 12px 12px',
          padding: '14px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'rgba(99, 102, 241, 0.05)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={12} style={{ color: 'var(--brand-primary)' }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--brand-primary)', textTransform: 'uppercase' }}>Native Desktop Suite</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Get system-wide focus, offline persistence, and auto-updates.
          </p>
          <a
            href="https://github.com/Umesh-kariwal/orvixa/releases/download/app-v0.1.0/Orvixa_0.1.0_x64-setup.exe"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '20px',
              backgroundColor: 'var(--brand-primary)',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              textDecoration: 'none',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)',
              transition: 'transform var(--motion-fast) ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
          >
            Download Desktop (.exe)
          </a>
        </div>

        {/* 2. Socratic Document Vault (Importer Form) */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'rgba(255, 255, 255, 0.01)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <Database size={13} style={{ color: 'var(--brand-primary)' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Document Vault</span>
          </div>

          <form onSubmit={handleUrlSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Paste article URL..."
              style={{
                width: '100%',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.68rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '5px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                fontSize: '0.65rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all var(--motion-fast) ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
            >
              Sync URL
            </button>
          </form>

          {/* Reset button inside sidebar bottom */}
          {conversationHistory.length > 0 && (
            <button
              onClick={resetSession}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '20px',
                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                color: 'var(--rose-primary)',
                fontSize: '0.68rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '4px',
                transition: 'all var(--motion-fast) ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)')}
            >
              <Trash2 size={12} />
              Reset Learning
            </button>
          )}

          {uploadStatus && (
            <div style={{
              fontSize: '0.65rem',
              color: 'var(--emerald-primary)',
              textAlign: 'center',
              fontWeight: 700,
            }}>
              {uploadStatus}
            </div>
          )}
        </div>
      </div>

      {/* 3. Main Workspace Display Area */}
      <div style={{
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}>
        {renderActiveWorkspaceView()}
      </div>
    </div>
  );
};
