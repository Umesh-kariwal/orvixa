# ORVIXA CHANGELOG

All notable changes to the Orvixa Universal AI Learning & Interview Copilot project will be documented in this file.

---

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
