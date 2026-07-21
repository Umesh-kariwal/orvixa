import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SidePanelStateContext, type PanelState, type LearningMessage } from './SidePanelStateContext';
import type { ContextIntelligenceResult, RecommendedAction } from '@/types/context';
import { ContextObserverManager } from '@/integration/manager/ContextObserverManager';
import { StreamingService } from '@/services/streamingService';
import { StorageService } from '@/services/storageService';

export const SidePanelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialPrefs = StorageService.getPreferences();

  const [panelState, setPanelState] = useState<PanelState>('READY');
  const [widthPercent, setWidthPercentState] = useState<number>(initialPrefs.dockWidth);
  const [panelMode, setPanelMode] = useState<'dock' | 'floating'>(initialPrefs.panelMode);
  const [floatingPosition, setFloatingPositionState] = useState<{ x: number; y: number }>(initialPrefs.floatingPosition);
  const [floatingSize, setFloatingSizeState] = useState<{ width: number; height: number }>(initialPrefs.floatingSize);
  const [isPinned, setIsPinned] = useState<boolean>(initialPrefs.isPinned);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeContext, setActiveContext] = useState<ContextIntelligenceResult | null>(null);
  const [selectedAction, setSelectedAction] = useState<RecommendedAction | null>(null);
  const [streamingText, setStreamingText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // MVP-001/002 Additions
  const [conversationHistory, setConversationHistory] = useState<LearningMessage[]>([]);
  const [thinkingStep, setThinkingStep] = useState<'context' | 'intent' | 'explanation' | 'streaming' | 'idle'>('idle');
  const retryCountRef = useRef<number>(0);
  const accumulatedTextRef = useRef<string>('');

  const openPanel = useCallback(() => {
    setPanelState('OPENING');
    setTimeout(() => setPanelState('READY'), 150);
  }, []);

  const closePanel = useCallback(() => {
    setPanelState('COLLAPSED');
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
    const clamped = Math.min(50, Math.max(25, width));
    setWidthPercentState(clamped);
    StorageService.savePreferences({ dockWidth: clamped });
  }, []);

  const togglePanelMode = useCallback(() => {
    setPanelMode((prev) => {
      const next = prev === 'dock' ? 'floating' : 'dock';
      StorageService.savePreferences({ panelMode: next });
      return next;
    });
  }, []);

  const setFloatingPosition = useCallback((pos: { x: number; y: number }) => {
    setFloatingPositionState(pos);
    StorageService.savePreferences({ floatingPosition: pos });
  }, []);

  const setFloatingSize = useCallback((size: { width: number; height: number }) => {
    setFloatingSizeState(size);
    StorageService.savePreferences({ floatingSize: size });
  }, []);

  const togglePin = useCallback(() => {
    setIsPinned((prev) => {
      const next = !prev;
      StorageService.savePreferences({ isPinned: next });
      return next;
    });
  }, []);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const resetSession = useCallback(() => {
    setConversationHistory([]);
    setStreamingText('');
    setErrorMessage(null);
    setPanelState('READY');
    setThinkingStep('idle');
    retryCountRef.current = 0;
    accumulatedTextRef.current = '';
  }, []);

  const executeAction = useCallback((action: RecommendedAction) => {
    setSelectedAction(action);
    setPanelState('THINKING');
    setThinkingStep('context');
    setStreamingText('');
    accumulatedTextRef.current = '';
    setErrorMessage(null);

    // Save history capture state snapshot
    let currentHistorySnapshot = [...conversationHistory];

    // Add user query to conversation history (if detailed description prompt exists)
    if (action.description) {
      const userMsg: LearningMessage = { role: 'user', text: action.description, timestamp: Date.now() };
      currentHistorySnapshot.push(userMsg);
      setConversationHistory(currentHistorySnapshot);
    }

    const startStream = () => {
      setTimeout(() => setThinkingStep('intent'), 150);
      setTimeout(() => setThinkingStep('explanation'), 350);

      StreamingService.streamIntent({
        contextId: activeContext?.context_id || 'ctx_live',
        intentId: 'intent_' + action.action_id,
        intentType: action.action_id === 'trace_execution' ? 'CODE_DIFF_TRACE' : 'MICRO_SUMMARY',
        action,
        contextPayload: {
          page_title: activeContext?.sanitized_summary || 'Universal Page',
          cleaned_content: activeContext?.sanitized_summary || '',
        },
        conversationHistory: currentHistorySnapshot.map((m) => ({ role: m.role, text: m.text })),
        onToken: (tokenText) => {
          setPanelState('STREAMING');
          setThinkingStep('streaming');
          accumulatedTextRef.current += tokenText;
          setStreamingText(accumulatedTextRef.current);
        },
        onFinal: () => {
          setPanelState('READY');
          setThinkingStep('idle');
          retryCountRef.current = 0;

          // Append assistant streamed text back into conversation history memory
          setConversationHistory((prev) => [
            ...prev,
            { role: 'assistant', text: accumulatedTextRef.current, intent_mode: action.action_id, timestamp: Date.now() },
          ]);
        },
        onError: (err) => {
          if (retryCountRef.current < 1) {
            retryCountRef.current += 1;
            setThinkingStep('explanation');
            setTimeout(startStream, 500);
          } else {
            setErrorMessage(err);
            setPanelState('ERROR');
            setThinkingStep('idle');
          }
        },
      });
    };

    setTimeout(startStream, 500);
  }, [activeContext, conversationHistory]);

  // Handle Right Click Context Menu & Selection Dispatch
  useEffect(() => {
    const handleContextMenuQuery = (e: CustomEvent<{ selectionText?: string }>) => {
      openPanel();
      const selection = e.detail?.selectionText || window.getSelection()?.toString() || '';
      executeAction({
        action_id: 'explain',
        label: selection ? 'Explain Selection' : 'Page Context',
        description: selection ? `Selection: ${selection.slice(0, 40)}...` : 'Analyze current active page context',
        icon: 'sparkles',
      });
    };

    window.addEventListener('orvixa:context_query' as any, handleContextMenuQuery);
    return () => window.removeEventListener('orvixa:context_query' as any, handleContextMenuQuery);
  }, [openPanel, executeAction]);

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
            { action_id: 'explain', label: 'Explain', description: 'Explain active concept', icon: 'book' },
            { action_id: 'hint', label: 'Hint', description: 'Socratic hint ladder', icon: 'hint' },
            { action_id: 'teach', label: 'Teach', description: 'Deep walkthrough', icon: 'teach' },
          ],
        });
      },
    });

    return () => ContextObserverManager.stopObserving();
  }, []);

  // Global Keyboard Shortcuts (Ctrl+K / Cmd+K toggle dock, Esc closes dock)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && panelState !== 'COLLAPSED' && panelState !== 'HIDDEN' && !isPinned) {
        closePanel();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        togglePanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [panelState, isPinned, closePanel, togglePanel]);

  return (
    <SidePanelStateContext.Provider
      value={{
        panelState,
        widthPercent,
        isExpanded,
        panelMode,
        floatingPosition,
        floatingSize,
        isPinned,
        activeContext,
        selectedAction,
        streamingText,
        errorMessage,
        conversationHistory,
        thinkingStep,
        resetSession,
        openPanel,
        closePanel,
        togglePanel,
        setWidthPercent,
        toggleExpand,
        togglePanelMode,
        setFloatingPosition,
        setFloatingSize,
        togglePin,
        setActiveContext,
        executeAction,
      }}
    >
      {children}
    </SidePanelStateContext.Provider>
  );
};
