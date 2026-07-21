import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SHADOW_CSS_TOKENS } from '@/styles/shadow-tokens';

export interface ShadowHostProps {
  children: React.ReactNode;
}

export const ShadowHost: React.FC<ShadowHostProps> = ({ children }) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);

  useEffect(() => {
    const currentHost = hostRef.current;
    if (!currentHost) return;

    // Attach Shadow DOM root if not already attached
    let root = currentHost.shadowRoot;
    if (!root) {
      root = currentHost.attachShadow({ mode: 'open' }); // 'open' for React portal rendering
    }

    // Inject CSS Tokens into Shadow Root
    const styleEl = document.createElement('style');
    styleEl.textContent = SHADOW_CSS_TOKENS;
    root.appendChild(styleEl);

    // Inject container div for React tree
    const container = document.createElement('div');
    container.className = 'orvixa-shell-root';
    root.appendChild(container);

    setShadowRoot(root);

    return () => {
      if (currentHost && currentHost.shadowRoot) {
        currentHost.shadowRoot.innerHTML = '';
      }
    };
  }, []);

  return (
    <div
      ref={hostRef}
      id="orvixa-shadow-host"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        zIndex: 999999,
        pointerEvents: 'auto',
      }}
    >
      {shadowRoot &&
        shadowRoot.querySelector('.orvixa-shell-root') &&
        createPortal(children, shadowRoot.querySelector('.orvixa-shell-root')!)}
    </div>
  );
};
