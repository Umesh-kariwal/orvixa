# ORVIXA MASTER ENGINEERING IMPLEMENTATION ROADMAP
*The Definitive Architectural Milestone Guide from Zero to Production*

---

## EXECUTIVE SUMMARY

This roadmap converts the frozen design artifacts (**Product Vision**, **Design System**, **Visual Product Concepts**, and **Design Review Package**) into an actionable, step-by-step engineering execution plan.

The implementation is structured into **8 sequential engineering milestones**. Each milestone delivers a verified, production-ready system component while maintaining 100% adherence to Clean Architecture, SOLID principles, and WCAG 2.1 AA accessibility standards.

---

## MASTER BUILD ORDER AT A GLANCE

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              ENGINEERING BUILD SEQUENCE                                 │
│                                                                                         │
│  [MS-1: Design System & Token Foundation]                                               │
│        │                                                                                │
│        ▼                                                                                │
│  [MS-2: Ambient Cognitive Aura (Surface 1)]                                             │
│        │                                                                                │
│        ▼                                                                                │
│  [MS-3: Socratic Dock Drawer (Surface 2)]                                               │
│        │                                                                                │
│        ▼                                                                                │
│  [MS-4: Real-time Streaming & WebSocket Infrastructure]                                 │
│        │                                                                                │
│        ▼                                                                                │
│  [MS-5: End-to-End Surface 1 & 2 Live API Integration]                                 │
│        │                                                                                │
│        ▼                                                                                │
│  [MS-6: Knowledge Blueprint Canvas (Surface 3)]                                         │
│        │                                                                                │
│        ▼                                                                                │
│  [MS-7: Embeddable Host SDK & Shadow DOM Container]                                     │
│        │                                                                                │
│        ▼                                                                                │
│  [MS-8: Automated E2E Testing, Cloud Observability & CI/CD Deployment]                  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## MILESTONE 1: DESIGN SYSTEM & TOKEN FOUNDATION

### Objective
Establish the complete visual token layer, CSS variable theme engine, typography hierarchy, glassmorphic utility classes, and base atomic UI components matching the approved Design Review Package.

### Deliverables
- `src/styles/theme.css`: Complete CSS variables for Light (*Slate & Milk*) and Dark (*Deep Obsidian*) themes.
- `src/components/ui/`: Atomic UI primitives:
  - `Button.tsx` (Primary, Secondary, Ghost, Glow variants)
  - `Card.tsx` (Default, Glass, Amber Glow, Emerald Glow)
  - `Badge.tsx` (Concept Node, Level Indicator, Action Pill)
  - `Typography.tsx` (Headers, Code Blocks, Body, Subtext)
- `src/context/ThemeContext.ts`: Light/Dark/System theme state provider with persistent local storage.

### Dependencies
- None (Phase 1–2 foundation baseline).

### Risks & Mitigations
- *Risk:* CSS variable bleeding into host application DOM.
- *Mitigation:* Scope all Orvixa CSS variables under `:root` and `.orvixa-theme-container`.

### Acceptance Criteria
- [ ] Theme switches seamlessly between Light (`#F8FAFC`) and Dark (`#0B0F17`) mode without layout shift.
- [ ] All typography uses `Inter` for body and `JetBrains Mono` for code/math blocks.
- [ ] `npx oxlint` and `npm run build` pass with 0 errors and 0 warnings.

### Estimated Complexity
- **Low** (1–2 days)

---

## MILESTONE 2: AMBIENT COGNITIVE AURA (SURFACE 1) COMPONENT & STATE MACHINE

### Objective
Build the floating, non-intrusive Ambient Cognitive Aura overlay component (`<AmbientAura />`) with state machine animation logic (`dormant`, `thinking`, `diagnostic-ready`, `mastery`).

### Deliverables
- `src/components/copilot/AmbientAura.tsx`: Floating overlay component anchored to bottom-right or target element.
- `src/types/aura.ts`: Aura state machine types and props.
- `src/styles/aura.css`: Pulse animations (`cyan-breathing`, `amber-glow`, `emerald-bloom`).
- Micro-callout tooltip popup showing Socratic Nudge previews on hover.

### Dependencies
- Milestone 1 (Design Tokens & UI Primitives).

### Risks & Mitigations
- *Risk:* Fixed positioning obscuring critical buttons on third-party host learning platforms.
- *Mitigation:* Support configurable anchoring (`bottom-right`, `bottom-left`, `inline-anchor`) and drag-to-reposition feature.

### Acceptance Criteria
- [ ] Rendered as fixed overlay with `z-index: 9999` without shifting host page DOM layout.
- [ ] Transitions smoothly between 4 states: Dormant (Gray), Thinking (Cyan Pulse), Diagnostic Ready (Amber Glow), Mastery (Emerald Bloom).
- [ ] Clicking Aura emits toggle event to trigger Socratic Dock.

### Estimated Complexity
- **Medium** (2 days)

---

## MILESTONE 3: SOCRATIC DOCK (SURFACE 2) COMPONENT & INTERACTION DRAWER

### Objective
Implement the 400px slide-out diagnostic drawer (`<SocraticDock />`) hosting the Header Bar, Diagnostic Ribbon, Socratic Dialogue Stream, Concept Scratchpad, and Metacognitive Action Bar.

### Deliverables
- `src/components/copilot/SocraticDock.tsx`: 400px slide-out drawer with 250ms cubic-bezier transition.
- `src/components/copilot/DiagnosticRibbon.tsx`: Diagnostic summary card highlighting deviation step and root misconception.
- `src/components/copilot/SocraticDialogueStream.tsx`: Stream container for step-by-step Socratic hints.
- `src/components/copilot/ConceptScratchpad.tsx`: Micro-editor for testing math steps or code snippets.
- `src/components/copilot/MetacognitiveBar.tsx`: Action bar with Level 1–4 hint revealer, confidence buttons ("Unsure", "Moderate", "Solid"), and submission controls.
- Keyboard shortcut listener (`Ctrl+K` / `Cmd+Shift+O` toggle, `Esc` close).

### Dependencies
- Milestone 1 & 2.

### Risks & Mitigations
- *Risk:* Keyboard focus trapped when drawer is closed.
- *Mitigation:* Implement strict focus trap manager that activates ONLY when drawer is visible.

### Acceptance Criteria
- [ ] Drawer slides out smoothly in 250ms without dropping frames (60fps animation).
- [ ] Pressing `Esc` closes drawer; pressing `Ctrl+K` toggles visibility.
- [ ] Level 1–4 hint ladder buttons reveal progressive guidance steps on tap.
- [ ] Full WCAG 2.1 AA keyboard navigation and focus rings supported.

### Estimated Complexity
- **Medium-High** (3 days)

---

## MILESTONE 4: REAL-TIME STREAMING & WEBSOCKET SERVER PROTOCOL

### Objective
Implement streaming AI pedagogical response infrastructure in FastAPI backend (`backend/app/api/v1/copilot.py`) via Server-Sent Events (SSE) or WebSockets, piping live token chunks from `GoogleGeminiAdapter` to the frontend.

### Deliverables
- `backend/app/api/v1/copilot.py`: Added `POST /api/v1/copilot/stream` endpoint returning `EventSourceResponse` (SSE) or WebSocket route.
- `backend/app/infrastructure/ai/gemini_adapter.py`: Integrated `generate_stream()` for live token streaming.
- `src/api/streaming.ts`: Frontend EventSource / SSE reader handling token-by-token stream parsing.

### Dependencies
- Phase 11 (Google Gemini Integration).

### Risks & Mitigations
- *Risk:* Network drop during live streaming leaving UI in dead state.
- *Mitigation:* Implement automated reconnection logic and fallback to HTTP REST POST if stream fails.

### Acceptance Criteria
- [ ] Backend streams Socratic hints token-by-token with sub-100ms first-token latency.
- [ ] Token usage and finish reasons are captured accurately at end of stream.
- [ ] Graceful fallback to REST endpoint if streaming connection is interrupted.

### Estimated Complexity
- **High** (3 days)

---

## MILESTONE 5: END-TO-END SURFACE 1 & 2 LIVE API INTEGRATION

### Objective
Connect the frontend `<AmbientAura />` and `<SocraticDock />` components to the live backend REST and Streaming API endpoints, executing the complete end-to-end user loop.

### Deliverables
- `src/services/copilotService.ts`: Added `diagnoseAttemptStream()` method binding live stream to Socratic Dialogue Stream.
- `src/views/CopilotHomeView.tsx`: Integrated full state transitions (Attempt Submission → Aura Thinking → Diagnostic Amber → Dock Slide-Out → Socratic Stream → Mastery Emerald).

### Dependencies
- Milestones 2, 3, and 4.

### Risks & Mitigations
- *Risk:* Mismatch between backend DTO payloads and frontend TypeScript interfaces.
- *Mitigation:* Enforce strict typing shared between Pydantic schemas and `src/types/copilot.ts`.

### Acceptance Criteria
- [ ] Submitting a student attempt triggers live AI diagnosis without full page reload.
- [ ] Diagnostic Ribbon displays exact deviation step and misconception returned by Gemini.
- [ ] Socratic hint stream renders live token-by-token with smooth focus highlighting.
- [ ] Re-evaluating a step in Concept Scratchpad updates Diagnostic Ribbon to Emerald Mastery.

### Estimated Complexity
- **Medium** (2 days)

---

## MILESTONE 6: KNOWLEDGE BLUEPRINT CANVAS (SURFACE 3) & INTERACTIVE GRAPH ENGINE

### Objective
Build the fullscreen Knowledge Blueprint Canvas (`<KnowledgeCanvas />`) featuring an interactive 2D concept node graph, Misconception Vault, and Spaced Micro-Recall Deck.

### Deliverables
- `src/components/copilot/KnowledgeCanvas.tsx`: Fullscreen overlay modal.
- `src/components/copilot/ConceptNodeGraph.tsx`: Interactive node graph rendering concept nodes (Green = Mastered, Amber = Weak, Slate = Unexplored).
- `src/components/copilot/MisconceptionVault.tsx`: Catalog of defeated logical traps.
- `src/components/copilot/SpacedRecallDeck.tsx`: 60-second daily active recall card drawer.

### Dependencies
- Milestones 1, 2, 3, 5.

### Risks & Mitigations
- *Risk:* Heavy canvas rendering impacting low-end mobile devices.
- *Mitigation:* Use lightweight SVG / HTML Canvas rendering with virtualized node lists.

### Acceptance Criteria
- [ ] Fullscreen canvas renders concept nodes clearly with color-coded mastery status.
- [ ] Clicking a concept node opens concept details, retention score (e.g. 94%), and misconception history.
- [ ] Spaced Recall Deck allows completing 60-second active recall cards.

### Estimated Complexity
- **High** (4 days)

---

## MILESTONE 7: EMBEDDABLE HOST SDK & SHADOW DOM CONTAINER

### Objective
Package Orvixa as a lightweight embeddable script tag and React wrapper (`<OrvixaCopilotHost />`) that can be injected into any host platform (MockPreps, Testbook, Moodle, Canvas) with zero CSS or DOM pollution.

### Deliverables
- `src/sdk/orvixa.ts`: Embeddable SDK loader script.
- `src/sdk/ShadowHost.tsx`: Shadow DOM container isolating Orvixa CSS styles from host application styles.
- Example integration demos for plain HTML, React, and third-party host environments.

### Dependencies
- Milestones 1–6.

### Risks & Mitigations
- *Risk:* Host application global styles overriding Orvixa button or font styles.
- *Mitigation:* Encapsulate Surface 1, 2, and 3 inside Shadow DOM (`attachShadow({ mode: 'open' })`).

### Acceptance Criteria
- [ ] SDK installs via a single script tag (`<script src=".../orvixa.js"></script>`).
- [ ] Zero CSS style leaks into or out of host application DOM.
- [ ] Global hotkey (`Ctrl+K`) works smoothly inside host application.

### Estimated Complexity
- **Medium-High** (3 days)

---

## MILESTONE 8: AUTOMATED E2E TESTING, CLOUD OBSERVABILITY & CI/CD DEPLOYMENT

### Objective
Establish comprehensive unit, integration, and end-to-end testing, configure cloud observability, and deploy production backend (Google Cloud Run) and frontend (Firebase Hosting) with automated GitHub Actions CI/CD.

### Deliverables
- `backend/tests/`: Pytest suite covering Domain Entities, Use Cases, AI Adapters, and API endpoints.
- `tests/e2e/`: Playwright end-to-end tests for Surface 1, 2, and 3 user flows.
- `.github/workflows/ci.yml`: Updated CI workflow running test suites, oxlint, and build checks.
- Production Cloud Run Dockerfile and Firebase Hosting deployment configuration.

### Dependencies
- Milestones 1–7.

### Risks & Mitigations
- *Risk:* API key exposure or failing CI builds during automated deployment.
- *Mitigation:* Store API keys in GitHub Repository Secrets and GCP Secret Manager.

### Acceptance Criteria
- [ ] All automated Pytest unit tests and Playwright E2E tests pass with 100% success.
- [ ] GitHub Actions CI pipeline builds and tests code automatically on push to `main`.
- [ ] Backend deploys to Google Cloud Run and frontend deploys to Firebase Hosting.

### Estimated Complexity
- **High** (3 days)

---

## SUMMARY OF ESTIMATED TIMELINE & BUILD COMPLEXITY

| Milestone | Focus Area | Complexity | Est. Duration |
| :--- | :--- | :--- | :--- |
| **MS-1** | Design System & Token Foundation | Low | 1–2 Days |
| **MS-2** | Ambient Cognitive Aura (Surface 1) | Medium | 2 Days |
| **MS-3** | Socratic Dock Drawer (Surface 2) | Medium-High | 3 Days |
| **MS-4** | Real-time Streaming & WebSockets | High | 3 Days |
| **MS-5** | End-to-End Live API Integration | Medium | 2 Days |
| **MS-6** | Knowledge Canvas & Node Graph (Surface 3) | High | 4 Days |
| **MS-7** | Embeddable Host SDK & Shadow DOM | Medium-High | 3 Days |
| **MS-8** | Automated Testing, Observability & Cloud CI/CD | High | 3 Days |

**Total Estimated Duration:** ~3 Weeks (21 Days) to full production launch.

---

## CONCLUSION

This roadmap provides an unambiguous, step-by-step engineering execution plan to build Orvixa from zero to production.

Standing by for Founder approval to begin **Milestone 1: Design System & Token Foundation**.
