import { createContext } from 'react';
import type { ContextIntelligenceResult, RecommendedAction } from '@/types/context';

export type PanelState =
  | 'HIDDEN'
  | 'COLLAPSED'
  | 'OPENING'
  | 'IDLE'
  | 'THINKING'
  | 'STREAMING'
  | 'READY'
  | 'ERROR'
  | 'OFFLINE'
  | 'SILENT';

export type ActiveView = 'learning' | 'onboarding' | 'settings' | 'privacy';

export interface LearningMessage {
  role: 'user' | 'assistant';
  text: string;
  intent_mode?: string;
  timestamp: number;
}

export interface SidePanelStateContextType {
  panelState: PanelState;
  widthPercent: number; // Default 35% (min 25%, max 50%)
  isExpanded: boolean;
  panelMode: 'dock' | 'floating';
  floatingPosition: { x: number; y: number };
  floatingSize: { width: number; height: number };
  isPinned: boolean;
  activeContext: ContextIntelligenceResult | null;
  selectedAction: RecommendedAction | null;
  streamingText: string;
  errorMessage: string | null;
  
  // MVP & Onboarding Additions
  conversationHistory: LearningMessage[];
  thinkingStep: 'context' | 'intent' | 'explanation' | 'streaming' | 'idle';
  currentView: ActiveView;
  onboardingCompleted: boolean;
  customApiKey: string;

  // Actions
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  setWidthPercent: (width: number) => void;
  toggleExpand: () => void;
  togglePanelMode: () => void;
  setFloatingPosition: (pos: { x: number; y: number }) => void;
  setFloatingSize: (size: { width: number; height: number }) => void;
  togglePin: () => void;
  setActiveContext: (context: ContextIntelligenceResult | null) => void;
  executeAction: (action: RecommendedAction) => void;
  resetSession: () => void;
  setCurrentView: (view: ActiveView) => void;
  completeOnboarding: () => void;
  saveApiKey: (key: string) => void;
}

export const SidePanelStateContext = createContext<SidePanelStateContextType | undefined>(undefined);
