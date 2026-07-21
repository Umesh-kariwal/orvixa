import React, { useRef, useCallback, useEffect } from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { TopBar } from './TopBar';
import { ActionPillsRow } from './ActionPillsRow';
import { ContentAreaHost } from './ContentAreaHost';
import { BottomBar } from './BottomBar';
import { AmbientTrigger } from './AmbientTrigger';

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
  } = useSidePanel();

  const isDraggingRef = useRef<boolean>(false);
  const isMovingFloatingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);
  const startWidthRef = useRef<number>(widthPercent);
  const startPosRef = useRef<{ x: number; y: number }>(floatingPosition);

  // 60FPS Drag Resize Handler for Dock Mode
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
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

  const isPanelVisible = panelState !== 'COLLAPSED' && panelState !== 'HIDDEN';
  const effectiveWidth = isExpanded ? '100%' : `${widthPercent}%`;

  // Auto Layout Shift (Webpage auto-resizes in Dock mode without obscuring page content)
  useEffect(() => {
    if (isPanelVisible && panelMode === 'dock' && !isExpanded) {
      document.body.style.marginRight = `${widthPercent}%`;
      document.body.style.transition = 'margin-right 200ms ease';
    } else {
      document.body.style.marginRight = '0px';
    }
    return () => {
      document.body.style.marginRight = '0px';
    };
  }, [isPanelVisible, panelMode, widthPercent, isExpanded]);

  if (!isPanelVisible) {
    return <AmbientTrigger />;
  }

  // FLOATING MODE STYLES
  if (panelMode === 'floating') {
    return (
      <div
        style={{
          position: 'fixed',
          top: `${floatingPosition.y}px`,
          left: `${floatingPosition.x}px`,
          width: `${floatingSize.width}px`,
          height: `${floatingSize.height}px`,
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
        <ActionPillsRow />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <ContentAreaHost />
        </div>
        <BottomBar />
      </div>
    );
  }

  // DOCK MODE STYLES
  return (
    <>
      <AmbientTrigger />
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: effectiveWidth,
          minWidth: isExpanded ? '100%' : '320px',
          maxWidth: isExpanded ? '100%' : '50%',
          backgroundColor: 'var(--bg-glass)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderLeft: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-dock)',
          zIndex: 999990,
          display: 'flex',
          flexDirection: 'column',
          transition: isDraggingRef.current ? 'none' : 'transform 150ms cubic-bezier(0.16, 1, 0.3, 1), width 150ms ease',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {/* 60FPS Resizable Left Edge Drag Handle */}
        {!isExpanded && (
          <div
            onMouseDown={handleMouseDown}
            style={{
              position: 'absolute',
              top: 0,
              left: '-4px',
              width: '8px',
              height: '100%',
              cursor: 'col-resize',
              zIndex: 999999,
              backgroundColor: 'transparent',
            }}
            title="Drag to resize side dock (25% - 50%)"
          />
        )}

        <TopBar />
        <ActionPillsRow />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <ContentAreaHost />
        </div>
        <BottomBar />
      </div>
    </>
  );
};
