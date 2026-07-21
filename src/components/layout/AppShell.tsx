import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { Container } from '../ui/Container';
import { SidePanelProvider } from '@/context/SidePanelProvider';
import { ShadowHost } from '@/sdk/ShadowHost';
import { SidePanelShell } from '@/components/shell/SidePanelShell';

export const AppShell: React.FC = () => {
  const isExtensionMode = window.location.search.includes('mode=extension');

  if (isExtensionMode) {
    return (
      <SidePanelProvider>
        {/* In extension mode, render the panel layout directly without mock wrappers */}
        <SidePanelShell />
      </SidePanelProvider>
    );
  }

  return (
    <SidePanelProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <main style={{ flex: 1, padding: '40px 0' }}>
          <Container>
            <Outlet />
          </Container>
        </main>
        <Footer />
      </div>

      {/* Production Closed Shadow DOM Encapsulation Host */}
      <ShadowHost>
        <SidePanelShell />
      </ShadowHost>
    </SidePanelProvider>
  );
};
