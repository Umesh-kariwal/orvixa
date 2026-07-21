import React, { useRef, useCallback } from 'react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { TopBar } from './TopBar';
import { ActionPillsRow } from './ActionPillsRow';
import { ContentAreaHost } from './ContentAreaHost';
import { BottomBar } from './BottomBar';
import { AmbientTrigger } from './AmbientTrigger';

export const SidePanelShell: React.FC = () => {
  const { panelState, widthPercent, setWidthPercent, isExpanded } = useSidePanel();
  const isDraggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(widthPercent);

  // 60FPS Drag Resize Handler
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

  const isPanelVisible = panelState !== 'COLLAPSED' && panelState !== 'HIDDEN';
  const effectiveWidth = isExpanded ? '100%' : `${widthPercent}%`;

  return (
    <>
      <AmbientTrigger />

      {isPanelVisible && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            height: '100vh',
            width: effectiveWidth,
            minWidth: isExpanded ? '100%' : '320px',
            maxWidth: isExpanded ? '100%' : '45%',
            backgroundColor: 'var(--bg-glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderLeft: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-dock)',
            zIndex: 999990,
            display: 'flex',
            flexDirection: 'column',
            transition: isDraggingRef.current ? 'none' : 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1), width 200ms ease',
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
              title="Drag to resize panel (25% - 45%)"
            />
          )}

          {/* 1. Top Bar */}
          <TopBar />

          {/* 2. Dynamic Action Pills Row */}
          <ActionPillsRow />

          {/* 3. Typed Intent Content Renderer Host */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <ContentAreaHost />
          </div>

          {/* 4. Minimal Bottom Bar */}
          <BottomBar />
        </div>
      )}
    </>
  );
};
