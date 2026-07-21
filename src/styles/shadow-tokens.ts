export const SHADOW_CSS_TOKENS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

:host {
  all: initial;
  display: block;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.orvixa-shell-root {
  /* Design Tokens */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --bg-primary: #0b0f17;
  --bg-surface: #1e293b;
  --bg-surface-elevated: #334155;
  --bg-glass: rgba(15, 23, 42, 0.92);

  --border-color: rgba(51, 65, 85, 0.8);
  --border-highlight: rgba(99, 102, 241, 0.4);

  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;

  --brand-primary: #6366f1;
  --brand-hover: #4f46e5;
  --brand-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);

  --amber-primary: #f59e0b;
  --amber-bg: rgba(245, 158, 11, 0.12);
  --amber-border: rgba(245, 158, 11, 0.4);

  --emerald-primary: #10b981;
  --emerald-bg: rgba(16, 185, 129, 0.12);
  --emerald-border: rgba(16, 185, 129, 0.4);

  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-pill: 9999px;

  --shadow-dock: -10px 0 25px rgba(0, 0, 0, 0.5);
  --shadow-aura: 0 0 20px rgba(99, 102, 241, 0.4);

  color: var(--text-primary);
  font-family: var(--font-sans);
  box-sizing: border-box;
}

.orvixa-shell-root * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.orvixa-focus-ring:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}
`;
