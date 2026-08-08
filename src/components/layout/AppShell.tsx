import React from 'react';
import { SidePanelProvider } from '@/context/SidePanelProvider';
import { WorkspaceLayout } from './WorkspaceLayout';

export const AppShell: React.FC = () => {
  return (
    <SidePanelProvider>
      <WorkspaceLayout />
    </SidePanelProvider>
  );
};

export default AppShell;
