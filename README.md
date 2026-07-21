# Orvixa: Intelligence Layer for the Web

> Orvixa is an **Intelligence Layer for the Web**. It embeds directly into any host web application (GitHub, Google Docs, Figma, Notion, LeetCode, HackerRank, StackOverflow, Jupyter, IDEs, LMS, Banking Portals, Enterprise SaaS, Analytics Dashboards, PDFs) and makes the host platform itself feel hyper-intelligent.
>
> Governed strictly by **Product Constitution V2** ([ORVIXA_PRODUCT_CONSTITUTION_V2.md](file:///c:/Users/UMESH/Desktop/orvixa/ORVIXA_PRODUCT_CONSTITUTION_V2.md)).
> 
> **The 6 Absolute Laws:**
> 1. **Host Platform First. Orvixa Second.** (Host website is always primary; never replace, hijack, or redirect)
> 2. **Default State = Invisible.** (AI exists only when invited by user action or friction signals)
> 3. **The Side Panel IS the Product.** (Collapsible 30–40% resizable side dock; expansion is optional)
> 4. **Never Force Conversations.** (Context-driven intent pipeline; prompt typing is secondary fallback)
> 5. **Current Context > Historical Memory.** (Solve the immediate page task exceptionally well)
> 6. **Surgical Brevity.** (Outputs are concise, structured intent schemas rendered by frontend engine)

---

## 🎯 System Architecture Overview

Orvixa is built on a 6-layer decoupled architecture:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              ORVIXA SYSTEM ARCHITECTURE                                 │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  [1. Platform Integration Framework] (GitHub / LeetCode / Notion / Docs / Generic Web)  │
│         │                                                                               │
│         ▼                                                                               │
│  [2. Universal Context Intelligence] (PII Redaction + Multi-Stage Intent Scoring)       │
│         │                                                                               │
│         ▼                                                                               │
│  [3. Real-Time AI Streaming Gateway] (Server-Sent Events + AbortController Cancel)     │
│         │                                                                               │
│         ▼                                                                               │
│  [4. Provider-Agnostic AI Layer]     (BaseAIProvider + Google Gemini 2.5 + CircuitBreaker)│
│         │                                                                               │
│         ▼                                                                               │
│  [5. Universal Renderer Runtime]     (Strict Schema Validation + 10 Atomic Renderers)  │
│         │                                                                               │
│         ▼                                                                               │
│  [6. Side Panel Shell in Shadow DOM] (Closed Shadow DOM Isolation + 35% Resizable Dock) │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Production Milestones Completed

- [x] **Milestone 1: Design System & Design Tokens** (Slate/Milk Light & Obsidian Dark themes, atomic UI primitives).
- [x] **Milestone 2: Universal Context Intelligence Engine** (PII redactor, multi-stage intent engine, silence policy).
- [x] **Milestone 3: Side Panel Product Shell** (Closed Shadow DOM container, 35% resizable dock, 10-state machine, Manifest V3 extension).
- [x] **Milestone 4: Typed Intent Renderer & Universal Runtime** (Strict schema validation, O(1) renderer registry, 10 production atomic intent renderers).
- [x] **Milestone 5: Real-Time AI Streaming Platform** (Provider-agnostic `BaseAIProvider`, SSE streaming gateway, circuit breaker, AbortController cancellation).
- [x] **Milestone 6: Universal Platform Integration Framework** (Multi-signal confidence matching, `AdapterRegistry`, selection/editor extractors, GitHub/LeetCode/Notion/Generic adapters).
- [x] **Milestone 7: System Integration & Architectural Hardening** (Cross-milestone audit, zero linter warnings, 100% test pass).

---

## 🚀 Quick Start Guide

### Frontend Setup (React + TypeScript + Vite)
```bash
# 1. Install frontend dependencies
npm install

# 2. Run static linter validation (0 warnings required)
npx oxlint

# 3. Production build verification
npm run build

# 4. Start Vite development server
npm run dev
```

### Backend Setup (FastAPI + Python 3.11)
```bash
# 1. Navigate to backend directory
cd backend

# 2. Activate virtual environment
.\venv\Scripts\activate

# 3. Run Pytest unit and integration test suite
python -m pytest tests/test_streaming_platform.py tests/test_context_engine.py

# 4. Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
