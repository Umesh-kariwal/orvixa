# ORVIXA SYSTEM ARCHITECTURE
*Universal AI Learning & Interview Copilot*

---

## 1. COMPONENT ARCHITECTURE FLOW

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                            ORVIXA SYSTEM COMPONENT PIPELINE                             │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  [User Selection / On-Demand Screen Scan] ──> Content scripts, closed Shadow DOM        │
│          │                                                                              │
│          ▼                                                                              │
│  [Universal Context Engine] ────────────────> PII masking, noise clean, compression     │
│          │                                                                              │
│          ▼                                                                              │
│  [Intent Engine & Classifier] ──────────────> Resolved Category & Intent Mode           │
│          │                                                                              │
│          ▼                                                                              │
│  [SSE AI Gateway Stream] ───────────────────> Provider-Agnostic LLM Gateway             │
│          │                                                                              │
│          ▼                                                                              │
│  [Typed Intent Renderer Runtime] ───────────> O(1) matching target adaptive cards      │
│          │                                                                              │
│          ▼                                                                              │
│  [Shadow Host Rendering Area] ──────────────> Safe isolated client-side rendering       │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. REUSABLE INFRASTRUCTURE MODULES

- **Closed Shadow DOM Wrapper (`ShadowHost.tsx`):** Isolates Orvixa styling dynamically to prevent CSS leaks.
- **Dynamic Card Renderer Registry (`RendererRegistry.ts`):** O(1) matching of intent schema types to React rendering cards.
- **SSE Streaming Gateway (`gemini_provider.py` & `/stream/intent`):** Handles high-performance SSE streaming with heartbeat and client-side AbortController.
- **Privacy Shield (`privacy.py`):** Scans raw text inputs and redacts passwords, tokens, credit card info, and email addresses.

---

## 3. USER INTERACTION GUIDELINES

- **Invocation:** Toggle via shortcut (`Ctrl+K` / `Cmd+K`) or Right Click -> `Ask Orvixa`.
- **Keyboard navigation:** Full tab index, close via `Esc`, and auto-focus capture.
- **Layout Shift:** Webpage body shifts margin by 35% on panel open to maintain page visibility.

---

## 4. EXTENSION SECURITY & CSP

- Obey Manifest V3 guidelines strictly. Zero dynamic `eval()` execution.
- Strict sandboxing of DOM extraction elements. Redact user credential input fields automatically.
