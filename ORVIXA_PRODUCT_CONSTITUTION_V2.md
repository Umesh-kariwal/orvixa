# ORVIXA PRODUCT CONSTITUTION V2
*The Supreme Architectural, Security, and Intent-Rendering Constitution for Orvixa Intelligence Layer*

---

## EXECUTIVE STATEMENT & FOUNDER RESET DIRECTIVE

> **The Supreme Directive:** Orvixa is **NOT** an AI chatbot, **NOT** an LMS, **NOT** an educational website, and **NOT** a standalone application.
> 
> Orvixa is an **Intelligence Layer for the Web**.
> 
> It embeds into any host website (GitHub, Google Docs, Figma, Notion, IDEs, LMS, Banking Portals, Enterprise SaaS, Analytics Dashboards, PDFs) and makes the host platform itself feel hyper-intelligent.
> 
> If a user ever feels that Orvixa is taking them away from the host page, replacing the website, or forcing them into another application, we have failed.

---

## SECTION 1: THE 6 ABSOLUTE PRODUCT LAWS

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              THE 6 ABSOLUTE PRODUCT LAWS                               │
├───────────────────────┬───────────────────────┬────────────────────────────────────────┤
│ LAW 1: Host First     │ LAW 2: Default Invis. │ LAW 3: Side Panel Product              │
│ Host platform is main │ AI exists only when   │ Resizable 30-40% dock. Never forced.   │
│ interface. Never replace│ invited. Zero noise.  │ Expansion is optional.                 │
├───────────────────────┼───────────────────────┼────────────────────────────────────────┤
│ LAW 4: No Forced Chat │ LAW 5: Context > Memory│ LAW 6: Surgical Brevity                │
│ Context first. Chat is│ Solve current page task│ Never generate long text just because  │
│ fallback, not primary.│ exceptionally well.   │ an LLM can. Best = most concise.       │
└───────────────────────┴───────────────────────┴────────────────────────────────────────┘
```

### Law 1: Host Platform First. Orvixa Second.
The host website is always the primary interface. Orvixa never replaces the host page, never hijacks navigation, never redirects the user, and never attempts to become the main screen.

### Law 2: Default State = Invisible.
Orvixa operates silently in the background. No floating chat windows, no invasive modals, no unnecessary notifications, and no AI talking uninvited. The AI wakes up only when invited by user action or explicit friction signals.

### Law 3: The Side Panel IS the Product.
Orvixa renders as a collapsible, resizable side dock occupying 30%–40% of the screen width. Fullscreen expansion is strictly optional and never forced.

### Law 4: Never Force Conversations.
The user should never need to ask "What prompt should I write?". The system derives intent directly from current page context. Chat is a secondary fallback, never the primary workflow.

### Law 5: Current Context > Historical Memory.
Solving the user's immediate task on the active page takes absolute priority over historical logging or long-term over-personalization.

### Law 6: Surgical Brevity.
Output length must be strictly proportional to task requirements. A single sentence, a table, or a micro-checklist is infinitely superior to a 5-paragraph LLM wall of text.

---

## SECTION 2: AUDIT OF OBSOLETE ASSUMPTIONS & ARCHITECTURAL RESET

| Previous Assumption (Obsolete) | Constitution V2 Replacement | Architectural Impact |
| :--- | :--- | :--- |
| **Education & MCQ-Only Focus** | **Universal Web Knowledge Work** (Coding, Docs, GitHub, PDFs, SaaS, Dashboards) | Generalize domain models into `ContextPayload` & `IntentPayload` contracts. |
| **Standalone Fullscreen Canvas (`SCR-03`)** | **Host-First Side Panel (30-40%)** | Decommission standalone canvas overlays. Expand side dock capabilities. |
| **Prompt/Form-First Interaction** | **Context-Driven Intelligence Pipeline** | Page state + user action automatically determines AI intervention without prompt typing. |
| **Verbose Educational Explanations** | **Typed Intent Schema Rendering** | LLM emits structured JSON Intent Schemas rendered consistently by frontend engine. |

---

## SECTION 3: CONTEXT INTELLIGENCE PIPELINE

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                             CONTEXT INTELLIGENCE PIPELINE                               │
│                                                                                         │
│  [Current Host Platform] ──> [Current Screen / View] ──> [Current DOM Object / Text]   │
│                                                                  │                      │
│  [Decide Action / Silence] <── [Confidence Assessment] <── [Detect Current Task / Intent]│
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Current Platform Extraction:** Identify host platform type (e.g. `github`, `google_docs`, `canvas_lms`, `figma`, `monaco_editor`).
2. **Current Screen Mapping:** Detect active view state, route, or document section.
3. **Current Object Inspection:** Extract selected code, highlighted text, active table row, or failed test case.
4. **Task & Intent Derivation:** Infer user goal (e.g., `debug_build_error`, `summarize_pull_request`, `explain_formula`, `diagnose_learning_gap`).
5. **Confidence & Action Trigger:** If confidence >= 0.85, render structured intent in Side Panel; otherwise remain silent or offer micro-nudge indicator.

---

## SECTION 4: SCALABLE INTENT RENDERING ARCHITECTURE

To avoid hardcoded UI templates and prevent LLM HTML injection risks, Orvixa uses a **Typed Intent Schema Architecture**. The AI backend emits structured JSON intent payloads, while the frontend owns rendering consistency via `OrvixaIntentRenderer`.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                          TYPED INTENT RENDERING PIPELINE                                │
│                                                                                         │
│  AI Engine ──> Structured Intent JSON ──> OrvixaIntentRenderer ──> Safe Atomic UI       │
│                                                                                         │
│  Supported Intent UI Primitives:                                                        │
│  - MicroSummary (1-Line Insight)       - StepwiseChecklist (Interactive Task List)      │
│  - ComparisonTable (Side-by-Side)       - CodeDiffTrace (Line-by-Line Fix Preview)        │
│  - SocraticHintLadder (4-Level Nudge)   - KeyMetricsGrid (Data Highlights)              │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Intent Payload Contract Schema (`IntentPayload`)
```json
{
  "intent_type": "CODE_DIFF_TRACE | SOCRATIC_HINT | COMPARISON_TABLE | MICRO_SUMMARY | CHECKLIST",
  "confidence": 0.94,
  "summary": "Concise 1-sentence explanation of current context",
  "data": {
    "steps": ["Step 1: Fix variable scope"],
    "code_diff": { "file": "main.py", "lines": "- x = 5\n+ x = 10" },
    "table": { "headers": ["Option A", "Option B"], "rows": [["Fast", "Slow"]] }
  }
}
```

---

## SECTION 5: SECURITY & SHADOW DOM ISOLATION CONSTITUTION

Because Orvixa operates inside arbitrary third-party web platforms, security is non-negotiable:

1. **Shadow DOM Encapsulation (`<ShadowHost />`):** All Orvixa UI components, styles, and event listeners exist strictly inside an isolated Shadow Root (`attachShadow({ mode: 'closed' })`). Zero CSS leakage into or out of host DOM.
2. **DOM & Prompt Injection Shielding:** Raw LLM outputs are parsed through strict Pydantic/Zod schemas. Freeform HTML injection from LLM outputs is strictly forbidden.
3. **Content Security Policy (CSP) Compliance:** Zero use of `eval()`, `new Function()`, or inline `<script>` tags.
4. **Credential Isolation:** Host platform cookies, auth tokens, and session credentials are never read, transmitted, or logged by Orvixa backend services.
5. **Cross-Origin Storage Protection:** User preferences and tokens are stored in isolated extension storage or origin-bound encrypted storage.

---

## SECTION 6: REVISED SYSTEM ARCHITECTURE & CODE CONTRACTS

### Updated Backend Models (`backend/app/schemas/copilot.py`)

```python
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ContextPayload(BaseModel):
    """Universal web context payload captured from host platform."""

    platform: str = Field(..., example="github", description="Host platform identifier")
    screen: str = Field(..., example="pull_request_view", description="Active screen or route")
    selected_text: Optional[str] = Field(default=None, description="Highlighted text or active code snippet")
    object_metadata: Dict[str, Any] = Field(default_factory=dict, description="Metadata of active DOM element")


class IntentResponse(BaseModel):
    """Structured intent payload returned by AI Engine for frontend rendering."""

    intent_type: str = Field(..., example="CODE_DIFF_TRACE", description="UI rendering intent code")
    confidence: float = Field(..., example=0.95, description="AI confidence score between 0.0 and 1.0")
    summary: str = Field(..., description="Concise 1-sentence diagnostic explanation")
    structured_data: Dict[str, Any] = Field(default_factory=dict, description="Typed data for IntentRenderer")
```

---

## SECTION 7: REVISED ENGINEERING IMPLEMENTATION ROADMAP

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                        REVISED CONSTITUTION V2 ROADMAP                                  │
│                                                                                         │
│  [MS-1: Design Tokens & Base UI Primitives] (Completed)                                 │
│        │                                                                                │
│        ▼                                                                                │
│  [MS-2: Universal Context Intelligence Engine] (Context Payload Parser & Security)       │
│        │                                                                                │
│        ▼                                                                                │
│  [MS-3: Side Panel Product Shell (30-40% Resizable Dock & Shadow DOM)]                  │
│        │                                                                                │
│        ▼                                                                                │
│  [MS-4: Typed Intent Renderer Infrastructure (Zero-HTML LLM Injection Safety)]          │
│        │                                                                                │
│        ▼                                                                                │
│  [MS-5: Real-time Streaming & Intent Pipeline (Gemini 2.5 Flash)]                      │
│        │                                                                                │
│        ▼                                                                                │
│  [MS-6: Universal Web Knowledge Integrations (GitHub, LMS, Docs, Code, PDFs)]           │
│        │                                                                                │
│        ▼                                                                                │
│  [MS-7: Embeddable Browser Extension & Host Script Container]                           │
│        │                                                                                │
│        ▼                                                                                │
│  [MS-8: E2E Security Audit, Cloud Run Deployment & Automated CI/CD]                     │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## CONCLUSION & CONSTITUTION MANDATE

Product Constitution V2 is the **highest-priority document in the Orvixa repository**. All future backend endpoints, application use cases, frontend components, and security models must strictly conform to these 6 Absolute Laws and Context-Driven Architecture.
