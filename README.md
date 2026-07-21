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

1. **Invisible by Default:** Summoned only via configurable shortcut (`Ctrl+K` / `Cmd+K`) or Right Click -> `Ask Orvixa`.
2. **First-Time User Onboarding:** Step-by-step introduction view explaining shortcut keys and permissions.
3. **Universal Context Engine:** Cleans noisy DOM elements, masks sensitive PII, and classifies web content into 11 educational categories.
4. **Pedagogical Learning Card Runtime:** Resolves intent mode (Explain, Hint, Teach, Practice) and streams card elements.
5. **Interactive Privacy Dashboard:** Displays permission checks confirming zero background recording or trackers.
6. **AI Provider Portal:** Support for custom Gemini API keys, letting users query models serverless.

---

## 🔒 SECURITY & PRIVACY ARCHITECTURE

Orvixa implements a strict **Zero-Trust Input and Privacy Architecture** designed to protect users and backend APIs from abuse:

- **Input Validation:** Enforces a maximum 50,000-character payload ceiling and UTF-8 encoding checks on all context and query inputs.
- **Prompt Injection Shield:** Neutralizes system override indicators, indirect webpage injections, and invisible Unicode whitespace obfuscation patterns.
- **Privacy Masking PII Filter:** Scans and obfuscates API credentials, credit cards, emails, and SSNs. Captures screen context *only* after explicit user-triggered permissions.
- **Safe DOM Rendering (XSS Protection):** Sanitizes and replaces raw HTML tags before client rendering, avoiding unsafe parser triggers or `dangerouslySetInnerHTML`.
- **IP-Based API Rate Limiter:** Throttles incoming client requests to a maximum of 30 queries per minute to protect the backend from accidental loops or storms.

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
| **MVP-2** | Production AI & Conversation Engine MVP (MVP-002) | ✅ |
| **SP-1** | Mandatory Platform Hardening (SP-001) | ✅ |
| **MVP-3** | **Production Browser Extension & Beta Readiness (MVP-003)** | ✅ |
| **M14** | **Adaptive Learning Card Engine (Programming, Physics, English)** | ⏳ *(Next)* |

- **Current Development Phase:** Phase 2 (Universal AI Learning & Mock Interview Platform)
- **Overall Progress:** `100%` (Beta Core Foundation)
- **Repository Version:** `v0.6.0`
- **Latest Verification:** `29 / 29 Pytest Tests Passed`, `0 oxlint Errors`

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

### Chrome Developer Mode Installation Guide
To load and test the extension directly in your browser:
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable the **Developer Mode** toggle at the top right of the extensions dashboard.
3. Click the **Load unpacked** button at the top left.
4. Select the compiled build output directory `/dist` containing the `manifest.json`.
5. Open any webpage, press `Ctrl + K` (or `Cmd + K` on macOS) to launch the sidebar onboarding view!

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
