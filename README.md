# ORVIXA
> **Universal AI Learning & Interview Copilot**  
> *"An AI teacher that appears exactly where learning happens."*

Orvixa is a silent, permission-based browser intelligence layer designed to aid students and developers without pulling them away from their learning environment. The host website is always the hero; Orvixa sits quietly beside it.

---

## 🧭 VISION & CORE IDENTITY

Orvixa is built on a single, uncompromising principle:
**The user should never leave their learning environment to receive intelligent help.**

Instead of forcing users to copy-paste code or context into separate chat interfaces, Orvixa integrates into the active page context, providing progressive Socratic hint ladders, conceptual breakdowns, step-by-step math formulas, and interactive mock interviews on-demand.

---

## ⚡ CORE CAPABILITIES

1. **Invisible by Default:** No flashing widgets, no auto-opening sidebars, and no advertisement noise. Summoned only via configurable shortcut (`Ctrl+K` / `Cmd+K`) or Right Click -> `Ask Orvixa`.
2. **Universal Context Engine:** Cleans noisy DOM elements, masks sensitive PII or credentials, compresses tokens by 35%–45%, and classifies web content into 11 educational categories (e.g. Programming, Physics, Mathematics, English).
3. **Intent-First Learning Card Runtime:** Automatically resolves the pedagogical mode (Explain, Hint, Teach, Practice, Summarize, Interview) and returns beautiful subject-specific cards instead of long walls of text.
4. **Resiliency & Performance:** Sub-150ms opening transitions, 60FPS resize drag handles, closed Shadow DOM protection, and real-time SSE token streaming.
5. **Short-Term Session Memory:** Follow-up questions automatically build on previous context with dynamic, adaptive next-step suggestions.
6. **Real AI Provider Integration:** Connected cleanly to Gemini 2.5 Flash via structured prompt templates and context memory tracking.

---

## 🛠️ TECH STACK

- **Frontend:** React, TypeScript, Vite, Tailwind CSS (optional - vanilla CSS tokens preferred), Lucide Icons.
- **Backend:** FastAPI, Python, Pydantic V2, Uvicorn, pytest.
- **AI Engine:** Official Google GenAI SDK (Gemini 2.5 Flash), Provider-Agnostic Circuit-Breaker Gateway.

---

## 🗺️ PROGRESS TRACKER

| Milestone | Capability Name | Current Status |
| :--- | :--- | :---: |
| **M1** | Design System & Token Engine | ✅ |
| **M2** | Context Intelligence Engine | ✅ |
| **M3** | Side Panel Shell & Closed Shadow DOM | ✅ |
| **M4** | Typed Intent Renderer Runtime & 10 Atomic Renderers | ✅ |
| **M5** | Real-Time AI Streaming Platform & Provider Gateway | ✅ |
| **M6** | Universal Platform Integration Framework | ✅ |
| **M7** | System Integration & Architectural Hardening | ✅ |
| **M8 & M9**| GitHub Intelligence & Reasoning Engine | ✅ *(Preserved)* |
| **M10** | Product Direction Reset & Constitution V3 Architecture | ✅ |
| **M11** | Learning Experience Runtime V1 | ✅ |
| **M12** | Browser Experience Engine V1 | ✅ |
| **M13** | Universal Context Understanding Engine V1 | ✅ |
| **MVP-1** | Real AI Learning Experience MVP (MVP-001) | ✅ |
| **MVP-2** | **Production AI & Conversation Engine MVP (MVP-002)** | ✅ |
| **M14** | **Adaptive Learning Card Engine (Programming, Physics, English)** | ⏳ *(Next)* |

- **Current Development Phase:** Phase 2 (Universal AI Learning & Mock Interview Platform)
- **Overall Progress:** `92%`
- **Repository Version:** `v0.5.0`
- **Latest Verification:** `25 / 25 Pytest Tests Passed`, `0 oxlint Errors`

---

## 📁 REPOSITORY STRUCTURE

```
orvixa/
├── docs/                      # Permanent Documentation
│   ├── ARCHITECTURE.md        # Core Architecture, Interaction Flow & CSP
│   ├── PRODUCT_CONSTITUTION.md# Product Goals, Platform Laws & UX Constraints
│   └── ROADMAP.md             # Project roadmap & milestones
├── backend/                   # FastAPI Server
│   ├── app/
│   │   ├── api/               # API Router and REST Endpoints
│   │   ├── core/              # Context, AI, Learning, and GitHub Engines
│   │   └── schemas/           # Pydantic V2 Contract Schemas
│   └── tests/                 # Pytest Test Suites
├── src/                       # React Side panel Extension UI
│   ├── components/            # Layout components (Shell, TopBar, BottomBar)
│   ├── context/               # Global state contexts
│   ├── integration/           # Platform adapters (GitHub, LeetCode, Notion)
│   ├── rendering/             # Typed renderer Registry and Card components
│   └── services/              # SSE streaming & storage client services
├── CHANGELOG.md               # Version histories
└── LICENSE                    # License information
```

---

## 🚀 INSTALLATION & LOCAL DEVELOPMENT

### Backend Server Setup
1. Navigate to `/backend`:
   ```bash
   cd backend
   ```
2. Setup environment keys:
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY
   ```
3. Run FastAPI backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Panel Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start local development hot reloading server:
   ```bash
   npm run dev
   ```
3. Compile production extension assets:
   ```bash
   npm run build
   ```

---

## 🧪 RUNNING VERIFICATION SUITES

### Run Backend Tests
```bash
pytest
```

### Run Frontend Linter
```bash
npx oxlint
```

---

## 📄 LICENSE

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
