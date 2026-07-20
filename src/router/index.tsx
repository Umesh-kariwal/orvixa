import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Layers, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Card glow style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Layers style={{ color: 'var(--brand-primary)' }} size={28} />
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Frontend Architecture Foundation</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    Orvixa React + TypeScript + Vite Core Infrastructure Initialized
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '16px',
                  marginTop: '12px',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                    <span style={{ fontWeight: 600 }}>Path Aliases & TS</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Configured @/* resolution with strict type checks
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <ShieldCheck size={18} style={{ color: '#10b981' }} />
                    <span style={{ fontWeight: 600 }}>Theme Architecture</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Light / Dark / System mode tokens & state provider
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Zap size={18} style={{ color: '#10b981' }} />
                    <span style={{ fontWeight: 600 }}>App Shell & Routing</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    React Router v7 layout integration & env contracts
                  </span>
                </div>
              </div>
            </Card>
          </div>
        ),
      },
    ],
  },
]);
