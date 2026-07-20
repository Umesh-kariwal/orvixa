# ORVIXA PRODUCT DESIGN SYSTEM & EXECUTABLE SPECIFICATION
*The Complete Design System, Information Architecture, Screen-by-Screen UX Specification, and Component Contract*

---

## SECTION 1: INFORMATION ARCHITECTURE & ENTRY POINTS

Orvixa uses a **Triple-Surface Architecture** designed to embed seamlessly into any host web application (Moodle, Canvas, custom React apps, Testbook, MockPreps) without taking learners out of their primary learning environment.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                             INFORMATION ARCHITECTURE TREE                               │
│                                                                                         │
│  [Host Learning Surface] (Host Web Application / Test Prep / LMS)                      │
│       │                                                                                 │
│       ├── Surface 1: Ambient Cognitive Aura (Floating Overlay Container)                │
│       │     ├── Trigger State (Neutral / Thinking / Diagnostic Ready / Mastery)         │
│       │     └── Micro-Callout Badge (1-line Socratic Nudge Banner)                      │
│       │                                                                                 │
│       ├── Surface 2: Socratic Dock (Slide-Out Micro-Workspace | 380px)                 │
│       │     ├── Section A: Diagnostic Ribbon (Deviation Step + Root Misconception)     │
│       │     ├── Section B: Socratic Dialogue Stream (Stepwise Hint Ladder)              │
│       │     ├── Section C: Concept Scratchpad (Interactive Micro-Canvas)               │
│       │     └── Section D: Metacognitive Bar (Confidence Rating + Action Controls)      │
│       │                                                                                 │
│       └── Surface 3: Knowledge Blueprint Canvas (Fullscreen Overlay Space)               │
│             ├── View A: Interactive Concept Node Graph                                  │
│             ├── View B: Misconception Vault                                             │
│             ├── View C: Spaced Recall Queue                                             │
│             └── View D: Cohort Misconception Pulse (Educator View)                      │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Entry Points & Navigation Routes
1. **Embedded Host Injector:** Loaded via lightweight script tag or React Component wrapper (`<OrvixaCopilotHost />`).
2. **Global Hotkey:** `Ctrl + K` or `Cmd + Shift + O` opens/closes the Socratic Dock from anywhere.
3. **Aura Trigger Click:** Clicking the floating Ambient Cognitive Aura toggles the Socratic Dock.
4. **Knowledge Graph Trigger:** Clicking the Concept Node Pill in the Socratic Dock expands the full Knowledge Blueprint Canvas.

---

## SECTION 2: COMPLETE SCREEN INVENTORY

| Screen ID | Screen Name | Surface Type | Primary Purpose | Priority | Target User |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SCR-01** | Ambient Cognitive Aura Overlay | Surface 1 Overlay | Unobtrusive indicator watching student attempt flow | P0 (Critical) | All Learners |
| **SCR-02** | Socratic Dock (Main Workspace) | Surface 2 Slide-Out | 1-on-1 Socratic diagnostic guidance and step-by-step resolution | P0 (Critical) | All Learners |
| **SCR-03** | Knowledge Blueprint Canvas | Surface 3 Fullscreen | Visual conceptual node tree, memory decay map, and mastery tracking | P1 (High) | All Learners |
| **SCR-04** | Misconception Vault | Surface 3 Modal/Sub-View | Archive of defeated logical traps and conceptual self-corrections | P1 (High) | All Learners |
| **SCR-05** | Spaced Micro-Recall Deck | Surface 3 Sub-View | 60-second daily active recall cards tailored to memory decay curves | P2 (Medium) | Returning Learners |
| **SCR-06** | Cohort Misconception Pulse | Surface 3 Educator View | Real-time class-wide diagnostic bottleneck analytics for teachers | P2 (Medium) | Educators / Admins |

---

## SECTION 3: SCREEN-BY-SCREEN UX SPECIFICATION

### SCR-01: Ambient Cognitive Aura Overlay
- **Layout:** Positioned in bottom-right corner (or anchored relative to active question container). Fixed index `z-index: 9999`.
- **Primary Action:** Click aura to open/close Socratic Dock.
- **Secondary Action:** Hover aura to preview micro-diagnostic summary.
- **States:**
  - *Dormant State:* Circular icon (36px x 36px) with translucent glass border (`rgba(255,255,255,0.1)`).
  - *AI Thinking State:* Soft pulsing radial cyan ring (`#38BDF8`) with 1.5s ease-in-out breathing animation.
  - *Diagnostic Ready State:* Warm amber glow (`#F59E0B`) with micro-callout tooltip: *"Spotted a 10-second logic trap. Click to view."*
  - *Mastery State:* Emerald pulse (`#10B981`) with micro particle animation converging into the indicator.

---

### SCR-02: Socratic Dock (Main Diagnostic Workspace)
- **Layout:** Slide-out drawer on right screen edge (Width: 400px fixed, Height: 100vh). Glassmorphic background (`#0B0F17` @ 92% opacity + `backdrop-filter: blur(16px)`).
- **Sections & Hierarchy:**
  1. **Header Bar:** Orvixa status indicator, active concept node badge, close button (`Esc`).
  2. **Diagnostic Ribbon (Top):** Displays deviation step and root misconception in high-contrast card (`rgba(245, 158, 11, 0.1)`).
  3. **Socratic Dialogue Stream (Middle - Scrollable):** Thread of short, formatted Socratic prompts from the AI.
  4. **Concept Scratchpad (Collapsible):** Micro-editor for testing math steps or code snippets.
  5. **Metacognitive Action Bar (Bottom Sticky):** Hint Level Revealer (Step 1-4), Confidence Buttons ("Unsure", "Moderate", "Solid"), Action Button ("Submit Attempt").
- **States:**
  - *Empty/Quiet State:* Shows current question target & message: *"Attempt the question when ready. I'll watch your reasoning."*
  - *AI Thinking State:* Skeleton pulse lines in dialogue stream with message: *"Parsing your step 2 vector math..."*
  - *Error State:* Red tinted banner: *"Network connection lost. Retrying diagnostic link..."* with Manual Retry button.
  - *Success State:* Green check badge with Socratic affirmation and "Next Question" or "View Knowledge Tree" buttons.

---

### SCR-03: Knowledge Blueprint Canvas
- **Layout:** Fullscreen modal workspace overlaying host screen.
- **Sections:**
  1. **Left Sidebar:** Topic hierarchy list & search.
  2. **Central Canvas:** Interactive force-directed node graph representing concepts.
     - Node Color: Green (Mastered), Amber (Weak/Gaps), Slate (Unexplored).
     - Node Size: Proportional to problem volume attempted.
  3. **Right Inspector Panel:** Concept details, memory retention score (e.g. 84% retained), misconception history.
- **Interactions:** Drag canvas, click node to filter questions, click "Practice Gap" to generate targeted micro-session.

---

## SECTION 4: AI INTERACTION SPECIFICATION

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               AI INTERACTION TIMELINE                                  │
│                                                                                        │
│  [Student Submits Answer] ──> [Thinking State (0-500ms)] ──> [Diagnostic Analysis]     │
│                                                                      │                 │
│  [Socratic Prompt Rendered] <── [Select Hint Ladder Level] <─────────┘                 │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Thinking Behavior (0–500ms):**
   - Aura transitions to cyan pulsing ring.
   - Text indicator reads: *"Analyzing mental model..."*
   - Zero blocking modals—student can continue scrolling host page.

2. **Interruption Protocol:**
   - AI NEVER interrupts while student is typing.
   - Intervenes ONLY after 2 failed attempts or 90 seconds of complete idle time on hard questions.

3. **Socratic Hint Ladder Execution:**
   - *Level 1 (Nudge):* Points to deviation location without explaining why.
   - *Level 2 (Conceptual Prompt):* Asks about the underlying physics/math rule.
   - *Level 3 (Parallel Analogy):* Presents a simplified real-world parallel.
   - *Level 4 (Deconstruction):* Breaks the problem into 2 micro-subproblems.

4. **Metacognitive Confidence Follow-Up:**
   - After correct answer, if student selected "Unsure confidence", AI asks: *"You got it right! But you marked 'Unsure'. What part felt like a guess?"*

---

## SECTION 5: COMPLETE USER FLOWS

### User Flow 1: Wrong Answer Diagnostic Loop
1. Student submits incorrect answer on host platform.
2. Host platform records attempt; Orvixa API receives attempt payload.
3. Ambient Aura pulses Warm Amber (`#F59E0B`).
4. Student clicks Aura or presses `Ctrl+K`.
5. Socratic Dock slides open smoothly (250ms cubic-bezier transition).
6. Diagnostic Ribbon displays: *"Deviation in Step 2: Friction sign convention"*.
7. Socratic Dialogue Stream presents Level 1 Nudge.
8. Student types corrected step into Concept Scratchpad and clicks "Re-evaluate".
9. Diagnostic engine confirms fix; Aura transitions to Emerald Bloom (`#10B981`).
10. Knowledge Blueprint Node updates automatically.

### User Flow 2: Daily Spaced Micro-Recall
1. Student opens host platform for morning study session.
2. Ambient Aura displays a subtle badge: *"1-Min Memory Refresh Ready"*.
3. Student clicks badge; Socratic Dock opens directly into Micro-Recall card.
4. AI asks 1 high-yield conceptual retrieval question based on 14-day memory decay.
5. Student answers in 10 seconds; retention score updates to 100%.

---

## SECTION 6: DESIGN TOKENS

```json
{
  "color": {
    "background": {
      "primary": "#0B0F17",
      "surface": "#1E293B",
      "glass": "rgba(15, 23, 42, 0.85)"
    },
    "text": {
      "primary": "#F8FAFC",
      "secondary": "#94A3B8",
      "muted": "#64748B"
    },
    "accent": {
      "brand": "#6366F1",
      "amber": "#F59E0B",
      "emerald": "#10B981",
      "rose": "#F43F5E"
    }
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px"
  },
  "radii": {
    "sm": "6px",
    "md": "12px",
    "lg": "20px",
    "full": "9999px"
  },
  "typography": {
    "fontFamily": "Inter, system-ui, -apple-system, sans-serif",
    "codeFont": "JetBrains Mono, monospace"
  },
  "motion": {
    "durationFast": "150ms",
    "durationNormal": "250ms",
    "easingDefault": "cubic-bezier(0.16, 1, 0.3, 1)"
  }
}
```

---

## SECTION 7: INTERACTION PRINCIPLES

1. **Keyboard-First Navigation:** Every action inside Socratic Dock accessible via keyboard (`Esc` to close, `Tab` traversal, `Ctrl+Enter` to submit).
2. **Zero Cumulative Layout Shift (CLS):** Slide-outs use fixed overlays to prevent disrupting host platform DOM layouts.
3. **Accessibility (WCAG 2.1 AA):** All text contrast ratios >= 4.5:1; interactive elements have visible focus rings (`2px solid #6366F1`).

---

## SECTION 8: COMPONENT LIBRARY CONTRACT

### Component 1: `AmbientAura`
- **Purpose:** Floating state indicator on host page.
- **Variants:** `dormant`, `thinking`, `diagnostic-ready`, `mastery`.
- **States:** Default, Hover (tooltip preview), Active (dock opened).

### Component 2: `SocraticDock`
- **Purpose:** Primary slide-out diagnostic workspace.
- **Variants:** `collapsed`, `expanded-dock`, `fullscreen-canvas`.
- **Behavior:** Trap focus when open; close on backdrop click or `Esc`.

### Component 3: `DiagnosticRibbon`
- **Purpose:** High-contrast diagnostic summary card.
- **Props:** `deviationStep: string`, `rootMisconception: string`, `severity: 'warning' | 'error'`.

### Component 4: `SocraticHintLadder`
- **Purpose:** 4-step progressive hint revealer.
- **Behavior:** Reveals Level 1 by default; Level 2-4 unlocked via student tap.

---

## SECTION 9: IMMUTABLE UX RULES

1. **Rule 1:** Never display a raw answer key without a Socratic prompt.
2. **Rule 2:** Socratic Dock slide animation must execute under 250ms.
3. **Rule 3:** The AI prompt must never exceed 3 sentences in Socratic Dock view.
4. **Rule 4:** Every diagnostic card must link to a concept node in Knowledge Blueprint.
5. **Rule 5:** Zero intrusive modals during active student problem solving.

---

## SECTION 10: PRODUCT ACCEPTANCE CRITERIA (PER SCREEN)

### SCR-01 Acceptance Criteria:
- [ ] Rendered as fixed overlay without shifting host page content.
- [ ] Aura icon pulses cyan during AI processing and turns amber on diagnostic readiness.
- [ ] Clicking aura opens Socratic Dock in under 250ms.

### SCR-02 Acceptance Criteria:
- [ ] Socratic Dock displays Diagnostic Ribbon, Dialogue Stream, Scratchpad, and Action Bar.
- [ ] Level 1-4 Hint Ladder reveals prompts progressively on tap.
- [ ] Re-evaluating student correction updates Diagnostic Ribbon state instantly.
- [ ] Full keyboard navigation supported (`Esc`, `Ctrl+Enter`).

### SCR-03 Acceptance Criteria:
- [ ] Fullscreen Knowledge Graph renders node colors accurately (Green/Amber/Slate).
- [ ] Clicking a node opens concept details and review history in right inspector panel.

---

## CONCLUSION

This document is the **Executable Product Design Specification** for Orvixa. Every visual surface, interaction token, AI response flow, and component contract defined herein provides the blueprint for future engineering implementation.
