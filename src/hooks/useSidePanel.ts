import { useContext } from 'react';
import { SidePanelStateContext, type SidePanelStateContextType } from '@/context/SidePanelStateContext';

export const useSidePanel = (): SidePanelStateContextType => {
  const context = useContext(SidePanelStateContext);
  if (!context) {
    throw new Error('useSidePanel must be used within a SidePanelProvider');
  }
  return context;
};
