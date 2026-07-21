# AI TEACHING ARCHITECTURE
*Pedagogical Reasoning, Intent Engine & Socratic Guidance*

---

## 1. PEDAGOGICAL INTENT DETECTION PIPELINE

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           AI TEACHING REASONING PIPELINE                                │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  [User Action / On-Demand Screen Analysis Trigger]                                       │
│         │                                                                               │
│         ▼                                                                               │
│  [Pedagogical Intent Engine] ────────> Resolves Learner Intent Mode                     │
│         │                               (Answer | Hint | Explain | Teach | Interview)   │
│         ▼                                                                               │
│  [Structured AI Provider Stream] ────> Provider-Agnostic LLM Stream (Gemini 2.5 Flash)  │
│         │                                                                               │
│         ▼                                                                               │
│  [Typed Intent Renderer Runtime] ────> Validates Schema & Resolves Subject Cards        │
│         │                                                                               │
│         ▼                                                                               │
│  [Adaptive Learning Cards UI] ───────> Renders Socratic Hint, Formula, or Code Diff     │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. INTENT MODES & SOCRATIC DISCLOSURE

1. **Answer Only:** Direct solution without unnecessary preamble.
2. **Hint Only:** Progressive Socratic hint ladder (Levels 1–4) revealing clues step-by-step.
3. **Explain:** 1-sentence core concept breakdown with optional visualization.
4. **Teach Deeply:** Stepwise numerical or conceptual walkthrough.
5. **Interview Mode:** Interactive roleplay evaluating student responses against ideal STAR criteria.
