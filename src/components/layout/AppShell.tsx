import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { Container } from '../ui/Container';

export const AppShell: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: 1, padding: '40px 0' }}>
        <Container>
          <Outlet />
        </Container>
      </main>
      <Footer />
    </div>
  );
};
