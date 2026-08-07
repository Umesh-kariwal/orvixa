import React, { useRef, useCallback, useEffect } from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { TopBar } from './TopBar';

import { ContentAreaHost } from './ContentAreaHost';
import { BottomBar } from './BottomBar';
import { DashboardSidebar } from './DashboardSidebar';
import { VoiceOverlay } from './VoiceOverlay';
import { SettingsView } from '../views/SettingsView';
import { PrivacyDashboard } from '../views/PrivacyDashboard';

export const SidePanelShell: React.FC = () => {
  const {
    panelState,
    widthPercent,
    setWidthPercent,
    isExpanded,
    panelMode,
    floatingPosition,
    setFloatingPosition,
    floatingSize,
    currentView,
    setCurrentView,
    conversationHistory,
    streamingText,
  } = useSidePanel();

  const isDraggingRef = useRef<boolean>(false);
  const isMovingFloatingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);
  const startWidthRef = useRef<number>(widthPercent);
  const startPosRef = useRef<{ x: number; y: number }>(floatingPosition);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [conversationHistory, streamingText, panelState]);

  // 60FPS Drag Resize Handler for Dock Mode
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      const isExtension = window.location.search.includes('mode=extension');
      if (isExtension) {
        window.parent.postMessage({
          source: 'orvixa-copilot',
          action: 'dock_resize_start',
          startX: e.screenX,
          currentWidthPercent: widthPercent
        }, '*');
        return;
      }

      isDraggingRef.current = true;
      startXRef.current = e.clientX;
      startWidthRef.current = widthPercent;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isDraggingRef.current) return;
        const deltaX = startXRef.current - moveEvent.clientX; // Drag left increases width
        const deltaPercent = (deltaX / window.innerWidth) * 100;
        const newWidth = startWidthRef.current + deltaPercent;
        setWidthPercent(newWidth);
      };

      const handleMouseUp = () => {
        isDraggingRef.current = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [widthPercent, setWidthPercent]
  );

  // Drag Move Handler for Floating Mode
  const handleFloatingHeaderMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (panelMode !== 'floating') return;

      // Ignore drag if clicking interactive elements (buttons, inputs, etc.)
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('input') || target.closest('select') || target.closest('a') || target.closest('[role="button"]')) {
        return;
      }

      const isExtension = window.location.search.includes('mode=extension');
      if (isExtension) {
        e.preventDefault();
        window.parent.postMessage({
          source: 'orvixa-copilot',
          action: 'drag_start',
          startX: e.screenX,
          startY: e.screenY,
          currentX: floatingPosition.x,
          currentY: floatingPosition.y
        }, '*');
        return;
      }

      isMovingFloatingRef.current = true;
      startXRef.current = e.clientX;
      startYRef.current = e.clientY;
      startPosRef.current = { ...floatingPosition };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isMovingFloatingRef.current) return;
        const deltaX = moveEvent.clientX - startXRef.current;
        const deltaY = moveEvent.clientY - startYRef.current;
        setFloatingPosition({
          x: Math.max(10, Math.min(window.innerWidth - 300, startPosRef.current.x + deltaX)),
          y: Math.max(10, Math.min(window.innerHeight - 200, startPosRef.current.y + deltaY)),
        });
      };

      const handleMouseUp = () => {
        isMovingFloatingRef.current = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [panelMode, floatingPosition, setFloatingPosition]
  );

  // Resize Handler for Floating Mode (Extension mode)
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, direction: string) => {
      e.preventDefault();
      e.stopPropagation();

      const isExtension = window.location.search.includes('mode=extension');
      if (isExtension) {
        window.parent.postMessage({
          source: 'orvixa-copilot',
          action: 'resize_start',
          direction,
          startX: e.screenX,
          startY: e.screenY,
          currentWidth: floatingSize.width,
          currentHeight: floatingSize.height,
          currentX: floatingPosition.x,
          currentY: floatingPosition.y
        }, '*');
      }
    },
    [floatingSize, floatingPosition]
  );

  const isPanelVisible = panelState !== 'COLLAPSED' && panelState !== 'HIDDEN';
  
  const isExtension = window.location.search.includes('mode=extension');
  const effectiveWidth = isExtension ? '100%' : (isExpanded ? '100%' : `${widthPercent}%`);
  const effectivePosition = isExtension ? 'absolute' : 'fixed';

  // Auto Layout Shift (Webpage auto-resizes in Dock mode without obscuring page content)
  useEffect(() => {
    if (isExtension) return; // Do not resize body inside iframe context itself
    if (isPanelVisible && panelMode === 'dock' && !isExpanded) {
      document.body.style.marginRight = `${widthPercent}%`;
      document.body.style.transition = 'margin-right 200ms ease';
    } else {
      document.body.style.marginRight = '0px';
    }
    return () => {
      document.body.style.marginRight = '0px';
    };
  }, [isPanelVisible, panelMode, widthPercent, isExpanded, isExtension]);

  if (!isPanelVisible) {
    return null;
  }

  const renderOverlayDrawer = () => {
    if (currentView !== 'settings' && currentView !== 'privacy') return null;
    return (
      <div 
        onClick={() => setCurrentView('learning')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1000000,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '85%',
            maxWidth: '320px',
            height: '100%',
            backgroundColor: 'var(--bg-surface)',
            borderLeft: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
          }}
        >
          {currentView === 'settings' ? <SettingsView /> : <PrivacyDashboard />}
        </div>
      </div>
    );
  };

  const isLearning = currentView === 'learning' || currentView === 'settings' || currentView === 'privacy';

  // FLOATING MODE STYLES
  if (panelMode === 'floating') {
    return (
      <div
        style={{
          position: effectivePosition,
          top: isExtension ? '0px' : `${floatingPosition.y}px`,
          right: isExtension ? '0px' : 'auto',
          left: isExtension ? '0px' : `${floatingPosition.x}px`,
          width: isExtension ? '100%' : `${floatingSize.width}px`,
          height: isExtension ? '100%' : `${floatingSize.height}px`,
          backgroundColor: 'var(--bg-glass)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-dock)',
          zIndex: 999990,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'var(--font-sans)',
          overflow: 'hidden',
        }}
      >
        <div onMouseDown={handleFloatingHeaderMouseDown} style={{ cursor: 'move' }}>
          <TopBar />
        </div>

        <div ref={scrollAreaRef} style={{ flex: 1, overflowY: 'auto' }}>
          <ContentAreaHost />
        </div>
        {isLearning && <BottomBar />}

        {/* Resize Handles (w, e, s, sw, se) for Floating Mode (Extension mode) */}
        {isExtension && (
          <>
            {/* Left Edge resize handle */}
            <div
              onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
              style={{
                position: 'absolute',
                top: '12px',
                left: 0,
                width: '6px',
                height: 'calc(100% - 24px)',
                cursor: 'w-resize',
                zIndex: 999999,
                backgroundColor: 'transparent',
              }}
            />
            {/* Right Edge resize handle */}
            <div
              onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
              style={{
                position: 'absolute',
                top: '12px',
                right: 0,
                width: '6px',
                height: 'calc(100% - 24px)',
                cursor: 'e-resize',
                zIndex: 999999,
                backgroundColor: 'transparent',
              }}
            />
            {/* Bottom Edge resize handle */}
            <div
              onMouseDown={(e) => handleResizeMouseDown(e, 's')}
              style={{
                position: 'absolute',
                bottom: 0,
                left: '12px',
                right: '12px',
                height: '6px',
                cursor: 's-resize',
                zIndex: 999999,
                backgroundColor: 'transparent',
              }}
            />
            {/* Bottom-Left corner resize handle */}
            <div
              onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
              style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                width: '16px',
                height: '16px',
                cursor: 'sw-resize',
                zIndex: 999999,
                background: 'linear-gradient(225deg, transparent 70%, var(--border-color) 70%, var(--border-color) 75%, transparent 75%, transparent 80%, var(--border-color) 80%, var(--border-color) 85%, transparent 85%)',
                borderBottomLeftRadius: 'var(--radius-lg)',
                opacity: 0.6,
                transition: 'opacity 150ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
              title="Drag to resize floating panel (SW)"
            />
            {/* Bottom-Right corner resize handle */}
            <div
              onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '16px',
                height: '16px',
                cursor: 'se-resize',
                zIndex: 999999,
                background: 'linear-gradient(135deg, transparent 70%, var(--border-color) 70%, var(--border-color) 75%, transparent 75%, transparent 80%, var(--border-color) 80%, var(--border-color) 85%, transparent 85%)',
                borderBottomRightRadius: 'var(--radius-lg)',
                opacity: 0.6,
                transition: 'opacity 150ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
              title="Drag to resize floating panel (SE)"
            />
          </>
        )}
        {renderOverlayDrawer()}
      </div>
    );
  }

  // DOCK MODE STYLES
  return (
    <div
        style={{
          position: effectivePosition,
          top: 0,
          right: 0,
          height: '100vh',
          width: effectiveWidth,
          minWidth: isExtension ? 'auto' : (isExpanded ? '100%' : '320px'),
          maxWidth: isExtension ? 'auto' : (isExpanded ? '100%' : '50%'),
          backgroundColor: 'var(--bg-glass)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderLeft: isExtension ? 'none' : '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-dock)',
          zIndex: 999990,
          display: 'flex',
          flexDirection: 'column',
          transition: isDraggingRef.current ? 'none' : 'transform 150ms cubic-bezier(0.16, 1, 0.3, 1), width 150ms ease',
          fontFamily: 'var(--font-sans)',
          overflow: 'hidden',
        }}
      >
        {/* 60FPS Resizable Left Edge Drag Handle */}
        {!isExpanded && (
          <div
            onMouseDown={handleMouseDown}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '8px',
              height: '100%',
              cursor: 'col-resize',
              zIndex: 999999,
              backgroundColor: 'transparent',
              transition: 'background-color 150ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            title="Drag to resize side dock (25% - 50%)"
          />
        )}

        <TopBar />
        {isExpanded ? (
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden', width: '100%' }}>
            {/* Left Column: Chat Area */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, height: '100%' }}>

              <div ref={scrollAreaRef} style={{ flex: 1, overflowY: 'auto' }}>
                <ContentAreaHost />
              </div>
              {isLearning && <BottomBar />}
            </div>
            
            {/* Right Column: Interactive Dashboard Sidebar Widgets */}
            <DashboardSidebar />
          </div>
        ) : (
          <>

            <div ref={scrollAreaRef} style={{ flex: 1, overflowY: 'auto' }}>
              <ContentAreaHost />
            </div>
            {isLearning && <BottomBar />}
          </>
        )}
        <VoiceOverlay />
        {renderOverlayDrawer()}
      </div>
  );
};
