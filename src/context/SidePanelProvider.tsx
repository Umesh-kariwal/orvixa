import React, { useState, useEffect, useCallback } from 'react';
import { SidePanelStateContext, type PanelState } from './SidePanelStateContext';
import type { ContextIntelligenceResult, RecommendedAction } from '@/types/context';

const STORAGE_WIDTH_KEY = 'orvixa_panel_width_percent';
const STORAGE_COLLAPSED_KEY = 'orvixa_panel_collapsed';

export const SidePanelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [panelState, setPanelState] = useState<PanelState>(() => {
    const isCollapsed = localStorage.getItem(STORAGE_COLLAPSED_KEY) === 'true';
    return isCollapsed ? 'COLLAPSED' : 'IDLE';
  });

  const [widthPercent, setWidthPercentState] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_WIDTH_KEY);
    return saved ? Math.min(45, Math.max(25, parseFloat(saved))) : 35; // Default 35%
  });

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeContext, setActiveContext] = useState<ContextIntelligenceResult | null>(null);
  const [selectedAction, setSelectedAction] = useState<RecommendedAction | null>(null);
  const [streamingText, setStreamingText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openPanel = useCallback(() => {
    setPanelState('OPENING');
    setTimeout(() => setPanelState('READY'), 250);
    localStorage.setItem(STORAGE_COLLAPSED_KEY, 'false');
  }, []);

  const closePanel = useCallback(() => {
    setPanelState('COLLAPSED');
    localStorage.setItem(STORAGE_COLLAPSED_KEY, 'true');
  }, []);

  const togglePanel = useCallback(() => {
    setPanelState((prev) => (prev === 'COLLAPSED' || prev === 'HIDDEN' ? 'READY' : 'COLLAPSED'));
  }, []);

  const setWidthPercent = useCallback((width: number) => {
    const clamped = Math.min(45, Math.max(25, width));
    setWidthPercentState(clamped);
    localStorage.setItem(STORAGE_WIDTH_KEY, clamped.toString());
  }, []);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const executeAction = useCallback((action: RecommendedAction) => {
    setSelectedAction(action);
    setPanelState('THINKING');
    setStreamingText('');
    setErrorMessage(null);

    // Simulate real streaming breakdown (in Milestone 5 connected to Gemini streaming)
    setTimeout(() => {
      setPanelState('STREAMING');
      let currentText = '';
      const sampleTokens = [
        `Analyzing ${action.label}... `,
        'Derived intent: Code optimization. ',
        'Found logic trap: Array index out of bounds in loop. ',
        'Suggested Fix: Guard index check before accessing vector element.',
      ];

      let idx = 0;
      const interval = setInterval(() => {
        if (idx < sampleTokens.length) {
          currentText += sampleTokens[idx];
          setStreamingText(currentText);
          idx++;
        } else {
          clearInterval(interval);
          setPanelState('READY');
        }
      }, 300);
    }, 400);
  }, []);

  // Keyboard shortcut trap (Esc closes, Ctrl+K toggles)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && panelState !== 'COLLAPSED' && panelState !== 'HIDDEN') {
        closePanel();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        togglePanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [panelState, closePanel, togglePanel]);

  return (
    <SidePanelStateContext.Provider
      value={{
        panelState,
        widthPercent,
        isExpanded,
        activeContext,
        selectedAction,
        streamingText,
        errorMessage,
        openPanel,
        closePanel,
        togglePanel,
        setWidthPercent,
        toggleExpand,
        setActiveContext,
        executeAction,
      }}
    >
      {children}
    </SidePanelStateContext.Provider>
  );
};
