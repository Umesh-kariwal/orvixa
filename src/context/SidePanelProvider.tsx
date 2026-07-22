import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SidePanelStateContext, type PanelState, type LearningMessage, type ActiveView } from './SidePanelStateContext';
import type { ContextIntelligenceResult, RecommendedAction } from '@/types/context';
import { ContextObserverManager } from '@/integration/manager/ContextObserverManager';
import { StreamingService } from '@/services/streamingService';
import { StorageService } from '@/services/storageService';

export const SidePanelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialPrefs = StorageService.getPreferences();

  const [panelState, setPanelState] = useState<PanelState>('HIDDEN');
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

  // MVP-001/002/003/004 Additions
  const [conversationHistory, setConversationHistory] = useState<LearningMessage[]>([]);
  const [thinkingStep, setThinkingStep] = useState<'context' | 'intent' | 'explanation' | 'streaming' | 'idle'>('idle');
  const [currentView, setCurrentViewState] = useState<ActiveView>(
    initialPrefs.onboardingCompleted ? 'learning' : 'onboarding'
  );
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(initialPrefs.onboardingCompleted);
  const [customApiKey, setCustomApiKey] = useState<string>(initialPrefs.customApiKey);

  // Performance Benchmarking state
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    firstOpenTime?: number;
    ttft?: number;
    totalDuration?: number;
  }>({});

  const retryCountRef = useRef<number>(0);
  const accumulatedTextRef = useRef<string>('');
  
  // Track open panel timing
  const openTimeRef = useRef<number>(0);
  const requestStartTimeRef = useRef<number>(0);
  const isFirstTokenRef = useRef<boolean>(true);

  // Load async chrome.storage.local preferences on mount
  useEffect(() => {
    StorageService.loadAsyncPreferences().then((asyncPrefs) => {
      setWidthPercentState(asyncPrefs.dockWidth);
      setPanelMode(asyncPrefs.panelMode);
      setFloatingPositionState(asyncPrefs.floatingPosition);
      setFloatingSizeState(asyncPrefs.floatingSize);
      setIsPinned(asyncPrefs.isPinned);
      setOnboardingCompleted(asyncPrefs.onboardingCompleted);
      setCustomApiKey(asyncPrefs.customApiKey);
      setCurrentViewState(asyncPrefs.onboardingCompleted ? 'learning' : 'onboarding');
    });
  }, []);

  const openPanel = useCallback(() => {
    openTimeRef.current = performance.now();
    setPanelState('OPENING');
    setTimeout(() => {
      setPanelState('READY');
      const openDuration = performance.now() - openTimeRef.current;
      setPerformanceMetrics((prev) => ({ ...prev, firstOpenTime: Math.round(openDuration) }));
    }, 150);
  }, []);

  const closePanel = useCallback(() => {
    setPanelState('HIDDEN');
    StreamingService.cancelActiveStream();
  }, []);

  const togglePanel = useCallback(() => {
    setPanelState((prev) => {
      const next = prev === 'COLLAPSED' || prev === 'HIDDEN' ? 'READY' : 'HIDDEN';
      if (next === 'HIDDEN') {
        StreamingService.cancelActiveStream();
      } else {
        window.parent.postMessage({ source: 'orvixa-copilot', action: 'request_context' }, '*');
        openTimeRef.current = performance.now();
        setTimeout(() => {
          const openDuration = performance.now() - openTimeRef.current;
          setPerformanceMetrics((prevMetrics) => ({ ...prevMetrics, firstOpenTime: Math.round(openDuration) }));
        }, 150);
      }
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
    setPerformanceMetrics({});
    retryCountRef.current = 0;
    accumulatedTextRef.current = '';
  }, []);

  const setCurrentView = useCallback((view: ActiveView) => {
    setCurrentViewState(view);
  }, []);

  const completeOnboarding = useCallback(() => {
    setOnboardingCompleted(true);
    setCurrentViewState('learning');
    StorageService.savePreferences({ onboardingCompleted: true });
  }, []);

  const saveApiKey = useCallback((key: string) => {
    setCustomApiKey(key);
    StorageService.savePreferences({ customApiKey: key });
  }, []);

  const executeAction = useCallback((action: RecommendedAction) => {
    setSelectedAction(action);
    setPanelState('THINKING');
    setThinkingStep('context');
    setStreamingText('');
    accumulatedTextRef.current = '';
    setErrorMessage(null);
    isFirstTokenRef.current = true;
    requestStartTimeRef.current = performance.now();

    let currentHistorySnapshot = [...conversationHistory];

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
        customApiKey: customApiKey,
        onToken: (tokenText) => {
          if (isFirstTokenRef.current) {
            isFirstTokenRef.current = false;
            const latency = performance.now() - requestStartTimeRef.current;
            setPerformanceMetrics((prev) => ({ ...prev, ttft: Math.round(latency) }));
          }
          setPanelState('STREAMING');
          setThinkingStep('streaming');
          accumulatedTextRef.current += tokenText;
          setStreamingText(accumulatedTextRef.current);
        },
        onFinal: () => {
          setPanelState('READY');
          setThinkingStep('idle');
          retryCountRef.current = 0;
          const totalDuration = performance.now() - requestStartTimeRef.current;
          setPerformanceMetrics((prev) => ({ ...prev, totalDuration: Math.round(totalDuration) }));

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
  }, [activeContext, conversationHistory, customApiKey]);

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
          observed_url: normalized.platform.activeUrl,
          observed_title: normalized.title,
          observed_selection: normalized.primarySnippet?.content,
          observed_body_length: normalized.metadata.bodyLength,
          inferred_topic: normalized.metadata.detectedTopic || normalized.title,
          inferred_category: normalized.platform.category,
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
        if (e.shiftKey) {
          e.preventDefault();
          togglePanel();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [panelState, isPinned, closePanel, togglePanel]);

  // Extension mode iframe width postMessage synchronization channel
  useEffect(() => {
    const isExtensionMode = window.location.search.includes('mode=extension');
    if (!isExtensionMode) return;

    let targetWidth = '0px';
    const isVisible = panelState !== 'COLLAPSED' && panelState !== 'HIDDEN';

    if (isVisible) {
      targetWidth = isExpanded ? '100vw' : `${widthPercent}vw`;
    } else {
      targetWidth = '0px';
    }

    window.parent.postMessage(
      { source: 'orvixa-copilot', action: 'resize', width: targetWidth },
      '*'
    );
  }, [panelState, widthPercent, isExpanded]);

  // Listen for forwarded toggling events from Content script
  useEffect(() => {
    const handleContentToggle = (event: MessageEvent) => {
      if (event.data && event.data.source === 'orvixa-content' && event.data.action === 'toggle') {
        togglePanel();
      }
    };
    window.addEventListener('message', handleContentToggle);
    return () => window.removeEventListener('message', handleContentToggle);
  }, [togglePanel]);

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
        currentView,
        onboardingCompleted,
        customApiKey,
        performanceMetrics,
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
        setCurrentView,
        completeOnboarding,
        saveApiKey,
      }}
    >
      {children}
    </SidePanelStateContext.Provider>
  );
};
