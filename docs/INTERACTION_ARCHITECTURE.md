# INTERACTION ARCHITECTURE
*Universal User Interaction Patterns & Signal Flow*

---

## 1. INVOCATION PIPELINE

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                INVOCATION MECHANICS                                     │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│   [Keyboard Shortcut: Ctrl+K / Cmd+K]  OR  [Right Click -> "Ask Orvixa"]                │
│                                           │                                             │
│                                           ▼                                             │
│  [SidePanelProvider] ──────────────> Toggles Dock Open (< 150ms transition)             │
│                                           │                                             │
│                                           ▼                                             │
│  [On-Demand Context Capture] ──────> Captures active selection or editor text           │
│                                           │                                             │
│                                           ▼                                             │
│  [SSE AI Stream] ──────────────────> Streams adaptive learning cards token-by-token      │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. KEYBOARD CONTROLS

- `Ctrl+K` / `Cmd+K`: Toggle Orvixa Dock open/collapsed.
- `Esc`: Close Dock immediately & abort active stream.
- `Tab` / `Shift+Tab`: Navigate focusable learning cards.
