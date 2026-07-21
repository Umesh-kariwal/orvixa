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
}

export const SidePanelStateContext = createContext<SidePanelStateContextType | undefined>(undefined);
