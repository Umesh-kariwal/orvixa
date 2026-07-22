# ORVIXA CHANGELOG

All notable changes to the Orvixa Universal AI Learning & Interview Copilot project will be documented in this file.

---

## [0.7.5] - 2026-07-22
### Changed
- **Context Engine Rebuild (CE-001):**
  - Redesigned the context pipeline around `CurrentContext` as the Single Source of Truth contract.
  - Consolidated all host DOM queries and window selection lookups exclusively to the content script (`contentScript.ts`), resolving sandbox iframe address leak issues.
  - Updated `ContextObserverManager` and all adapters (`GenericWebAdapter`, `GitHubAdapter`, `LeetCodeAdapter`, `NotionAdapter`) to strictly receive and enrich the passed `CurrentContext` payload without query selectors or browser API calls.
  - Configured prompt generator parameters inside `SidePanelProvider.tsx` using verified `pageContext` fields.
  - Implemented an expandable **Developer Diagnostics Details View** inside the side panel displaying the raw synced context parameters (visible in local development DEV mode only).

## [0.7.4] - 2026-07-22
### Fixed
- **Screen Understanding & Product Trust (UX Audit Round 1):**
  - Resolved Extension Sandbox Context Extraction Bypass by implementing cross-origin `postMessage` synchronization between `contentScript.ts` and the React app. The content script now extracts and pushes host tab URL, title, selected text, and body DOM data directly to `ContextObserverManager` in the iframe.
  - Resolved `"Active page: orvixa"` and `"Minimal text"` errors. Adapters now evaluate and extract content using the synchronized host tab context instead of the local iframe document.
  - Implemented custom heuristics classifying: Wikipedia, LeetCode, GitHub, Google Search, YouTube, GeeksForGeeks, API Docs, and Interview Questions.
  - Added dynamic MCQ Question counter verifying quantitative questions on the screen.
  - Designed and added a high-fidelity **Screen Understanding Transparency Card** rendered in the sidebar when idle, separating Actually Observed DOM inputs from AI Inferences and providing Low-Confidence warnings.

## [0.7.3] - 2026-07-22
### Fixed
- **Configuration Trace (ENV-002):**
  - Resolved `.env` file load bypass by explicitly calling `dotenv.load_dotenv()` with resolved absolute paths inside `backend/app/core/config.py` and `backend/app/core/ai/config.py`.
  - Corrected default model typos in both Pydantic configurations and fallbacks, migrating from deprecated models to Google’s active **`gemini-3.6-flash`** workhorse.
  - Eliminated port 8000 lock issues by terminating stale background processes.

## [0.7.2] - 2026-07-22
### Fixed
- **Extension Runtime Debugging (CBF-001):**
  - Resolved `"Could not establish connection. Receiving end does not exist"` by wrapping service worker commands, dynamically injecting `contentScript.js` using `chrome.scripting.executeScript` when no content script listeners are running on the tab.
  - Avoided third-party iframe `localStorage` SecurityError DOMException blocks by wrapping `ThemeProvider` and `StorageService` references in `try-catch` structures.
  - Enhanced state hydration on extension mount by adding an asynchronous `chrome.storage.local` fetch mechanism inside `StorageService`.
  - Registered `GlobalErrorBoundary` on the React mount tree in `main.tsx` capturing and formatting React rendering crashes outside the router.

## [0.7.1] - 2026-07-21
### Fixed
- **Founder Blocking Issues (FL-002):**
  - Replaced `createBrowserRouter` with `createHashRouter` to prevent React Router crashing due to origin pushState limitations inside the `chrome-extension://` protocol scope.
  - Implemented `AppErrorBoundary` root routing fallback, rendering detailed debugger messages and console trace dumps in development, and friendly messages in production.
  - Resolved `Ctrl+K` browser omnibox override collision by migrating to `Ctrl+Shift+K` (or `Cmd+Shift+K` on macOS) configured as a native Manifest V3 command action.
  - Added double-redundancy listeners for the `Ctrl+Shift+K` hotkey combination inside `contentScript.ts` and `SidePanelProvider.tsx`.

## [0.7.0] - 2026-07-21
### Added
- **Engineering Quality, Observability & Beta Validation (MVP-004):**
  - Integrated Playwright automated E2E testing framework configuration.
  - Wrote multi-flow Playwright E2E specs testing onboarding completion, configuration updates, custom API key validation, and privacy dashboard rendering.
  - Implemented structured JSON logs for backend API requests, adding correlation, request, and session tracking IDs.
  - Integrated regex filters automatically scrubbing API keys, credentials, and PII from execution logs.
  - Added unique client Error IDs (e.g. `ERR-XXXX`) and recovery suggestion mappings.
  - Integrated local benchmarking markers tracking First Open, TTFT, and Stream duration inside the development panel.
  - Enforced ARIA labels on TopBar controls for standard accessibility screen-reader support.

## [0.6.0] - 2026-07-21
### Added
- **Production Browser Extension & Beta Readiness (MVP-003):**
  - Designed and built a welcome onboarding view (`OnboardingView.tsx`).
  - Implemented client preference persistence storage integration preserving settings and API keys.
  - Created a professional configuration portal (`SettingsView.tsx`) allowing custom Gemini API keys, dock sizing adjustments, and stickiness toggles.
  - Added an interactive Privacy Dashboard (`PrivacyDashboard.tsx`) with status checks confirming zero microphone/webcam usage or automatic screen capture.
  - Integrated customizable UI view toggles directly inside the TopBar control array.
  - Enhanced error handling providing developer guidelines and configuration troubleshooting aids.

## [0.5.1] - 2026-07-21
### Added
- **Mandatory Platform Hardening (SP-001):**
  - Implemented `InputValidator` checking text length, size, and encoding safety.
  - Implemented `PromptInjectionGuard` detecting and blocking jailbreaks, override tricks, and Unicode whitespace obfuscation patterns.
  - Added backend IP-based request `RateLimiter` preventing client request storms.
  - Shielded production error messages (suppressing stack trace and environment path leaks).
  - Validated client-side rendering protection logic ensuring zero raw DOM html injections.

## [0.5.0] - 2026-07-21
### Added
- **MVP Real AI Integration & Production Conversation Engine (MVP-002):**
  - Connected abstract AI provider to official `google-genai` SDK and Gemini 2.5 Flash.
  - Implemented structured `LearningPromptBuilder` optimizing prompts for token efficiency.
  - Enabled conversation history stream parameters maintaining thread memory.
  - Added robust API error and fallback logging.

## [0.4.0] - 2026-07-21
### Added
- **MVP Real AI Learning Experience (MVP-001):**
  - Integrated complete end-to-end learning context pipeline flow.
  - Short-term conversation history memory in the React UI context.
  - Contextual step loaders displaying progress (analyzing context, intent resolution, etc.).
  - Adaptive follow-up action buttons at the bottom of the conversation thread.
  - Automatic error retry and manual one-click retry trigger buttons.
  - Clean layout updates removing leftover platform branding elements.

## [0.3.0] - 2026-07-21
### Added
- **Universal Context Understanding Engine V1 (Milestone 13):**
  - Unified context processing pipeline (`UniversalContextEngine`).
  - 11-domain educational classification (`ContextClassifier`).
  - Noise filter & boilerplate removal (`ContextCleanerCompressor`).
  - Privacy PII masking integration.
- **Browser Experience Engine V1 (Milestone 12):**
  - Keyboard shortcuts (`Ctrl+K` / `Cmd+K` and `Esc`).
  - Right-click context menu selection handling.
  - Adaptive resizable side dock with automatic layout shift.
  - Floating mode with drag, reposition, and pin controls.
  - On-demand explicit screen scan permission indicator.
- **Learning Experience Runtime V1 (Milestone 11):**
  - Intent detection engine supporting 10 pedagogical intent categories.
  - Subject-specific adaptive learning cards rendering layout.
  - Gemini provider SSE token streaming.

## [0.2.0] - 2026-07-21
### Added
- **GitHub Intelligence Suite & Reasoning Engine (Milestones 8 & 9):**
  - Static repository context builder and unified diff parser.
  - File prioritization ranking files by security and config risk weight.
  - Multi-language stack trace diagnostic analyzer.

## [0.1.0] - 2026-07-21
### Added
- **Foundation Layer (Milestones 1–7):**
  - Ambient Design Token System and component library.
  - Context Intelligence Engine with redaction privacy rules.
  - Resizable Side Panel Shell injected into a Closed Shadow DOM.
  - Typed Intent Renderer Runtime and 10 atomic renderers.
  - Provider-agnostic real-time AI SSE Streaming Gateway.
  - Universal Platform Integration Framework.
