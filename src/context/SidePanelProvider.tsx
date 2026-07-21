import React, { useState, useEffect, useCallback } from 'react';
import { SidePanelStateContext, type PanelState } from './SidePanelStateContext';
import type { ContextIntelligenceResult, RecommendedAction } from '@/types/context';
import { ContextObserverManager } from '@/integration/manager/ContextObserverManager';
import { StreamingService } from '@/services/streamingService';

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
    StreamingService.cancelActiveStream();
  }, []);

  const togglePanel = useCallback(() => {
    setPanelState((prev) => {
      const next = prev === 'COLLAPSED' || prev === 'HIDDEN' ? 'READY' : 'COLLAPSED';
      if (next === 'COLLAPSED') StreamingService.cancelActiveStream();
      return next;
    });
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

    StreamingService.streamIntent({
      contextId: activeContext?.context_id || 'ctx_live',
      intentId: 'intent_' + action.action_id,
      intentType: action.action_id === 'trace_execution' ? 'CODE_DIFF_TRACE' : 'MICRO_SUMMARY',
      action,
      onToken: (tokenText) => {
        setPanelState('STREAMING');
        setStreamingText((prev) => prev + tokenText);
      },
      onFinal: () => {
        setPanelState('READY');
      },
      onError: (err) => {
        setErrorMessage(err);
        setPanelState('ERROR');
      },
    });
  }, [activeContext]);

  // Hook Universal Platform Integration Observers
  useEffect(() => {
    ContextObserverManager.startObserving({
      onContextChange: (normalized) => {
        setActiveContext({
          context_id: 'ctx_' + normalized.timestamp,
          timestamp: normalized.timestamp,
          confidence_tier: normalized.platform.confidence >= 0.85 ? 'HIGH' : normalized.platform.confidence >= 0.6 ? 'MEDIUM' : 'LOW',
          confidence_score: normalized.platform.confidence,
          primary_intent: normalized.platform.name,
          side_panel_state: 'READY',
          redacted: true,
          sanitized_summary: normalized.summary,
          recommended_actions: [
            { action_id: 'explain_code', label: 'Explain Code', description: 'Explains active code snippet in 1 sentence', icon: 'code' },
            { action_id: 'trace_execution', label: 'Trace Execution', description: 'Traces execution flow and variables', icon: 'git-commit' },
            { action_id: 'find_bugs', label: 'Debug & Fix', description: 'Scans selected code for edge-case bugs', icon: 'bug' },
          ],
        });
      },
    });

    return () => ContextObserverManager.stopObserving();
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
