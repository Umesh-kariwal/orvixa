# ORVIXA DESIGN REVIEW PACKAGE
*The Definitive Visual Product Experience Package & High-Fidelity Interaction Design Manual*

---

## PART 1: COMPLETE PRODUCT STORYBOARD

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                           THE PIXAR-STYLE PRODUCT STORYBOARD                                           │
├───────────────────────────────────────┬───────────────────────────────────────┬───────────────────────────────────────┤
│ SCENE 1: THE AMBIENT ONBOARDING       │ SCENE 2: THE FIRST MISTAKE            │ SCENE 3: THE COGNITIVE INTERVENTION   │
│                                       │                                       │                                       │
│ Learner opens their host exam page.   │ Learner submits an answer to Q14.     │ Ambient Aura pulses Warm Amber.       │
│ Orvixa floats as a subtle, translucent│ Host tags it "Incorrect". Instead of  │ Micro-callout appears:                │
│ Ambient Aura in the margin. Zero noise│ red text, Orvixa glows with empathy.  │ "Spotted a 10-second logic trap..."   │
│                                       │                                       │                                       │
│ [Host Question]         (✦) Aura      │ [Host Question]      (✦) Warm Amber   │ [Host Question]    [✦ Amber Callout]  │
├───────────────────────────────────────┼───────────────────────────────────────┼───────────────────────────────────────┤
│ SCENE 4: THE SOCRATIC GUIDANCE        │ SCENE 5: THE BREAKTHROUGH EPIPHANY    │ SCENE 6: MASTERY BLUEPRINT LOG        │
│                                       │                                       │                                       │
│ Socratic Dock slides in smoothly.     │ Learner self-corrects the equation    │ Emerald particles converge into the   │
│ Level 1 hint isolates the deviation   │ in the scratchpad and hits Submit.    │ Knowledge Blueprint Canvas. Concept   │
│ step without spoiling the answer.     │ Aura pulses Emerald Bloom.            │ Node turns bright green!              │
│                                       │                                       │                                       │
│ ┌───────────────────┬───────────────┐ │ ┌───────────────────┬───────────────┐ │ ┌───────────────────────────────────┐ │
│ │ Host Question     │ Socratic Dock │ │ │ Host Question     │ ✦ (Emerald)   │ │ │ KNOWLEDGE CANVAS                  │ │
│ │                   │ Step 2 hint.. │ │ │                   │ "Spot on!"    │ │ │ [Vector Calculus] ──(Green)       │ │
│ └───────────────────┴───────────────┘ │ └───────────────────┴───────────────┘ │ └───────────────────────────────────┘ │
├───────────────────────────────────────┼───────────────────────────────────────┼───────────────────────────────────────┤
│ SCENE 7: DAILY RETRIEVAL RECALL       │ SCENE 8: THE HABITUAL RETURN          │ SCENE 9: THE UNSTOPPABLE MOMENTUM     │
│                                       │                                       │                                       │
│ Next morning, learner opens platform. │ Learner answers in 10 seconds.       │ Learner looks at their 30-day map:    │
│ Orvixa greets them with a 30-second   │ Retention score hits 100%.            │ 42 misconceptions defeated, 0 cognitive│
│ Micro-Recall Card on yesterday's gap. │ Learner feels immense momentum.       │ fatigue. True mastery achieved.       │
└───────────────────────────────────────┴───────────────────────────────────────┴───────────────────────────────────────┘
```

---

## PART 2: HIGH-FIDELITY DESKTOP SCREENS (`1440px`)

### Screen D1: Surface 1 — Ambient Aura in Flow State (Dormant Mode)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  MOCKPREPS EDTECH PLATFORM                                                      [Courses] [Practice] [User Profile]  │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                      │
│  Physics 101 — Classical Mechanics                                                    Question 14 of 50  [ 02:45 ]  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                                      │
│  A block of mass m = 5 kg slides down an inclined plane of angle theta = 30 degrees.                                 │
│  The coefficient of kinetic friction between the block and incline is mu_k = 0.2.                                    │
│                                                                                                                      │
│  Calculate the acceleration of the block down the incline.                                                           │
│                                                                                                                      │
│  YOUR WORKING STEPS:                                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Step 1: F_parallel = m * g * sin(30) = 5 * 9.8 * 0.5 = 24.5 N                                                 │  │
│  │ Step 2: F_friction = mu_k * m * g * sin(30) = 0.2 * 5 * 9.8 * 0.5 = 4.9 N                                      │  │
│  └────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                      │
│  Select your final answer:                                                                                           │
│  (A) 3.22 m/s^2        (B) 3.92 m/s^2        (C) 4.90 m/s^2        (D) 5.88 m/s^2                                 │
│                                                                                                                      │
│  [ Clear Steps ]                                                                              [ Submit Answer ]      │
│                                                                                                                      │
│                                                                                                                      │
│                                                                                              ┌────────────────────┐  │
│                                                                                              │  (✦) Ambient Aura  │  │
│                                                                                              │  [ z-index: 9999 ] │  │
│                                                                                              └────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Screen D2: Surface 2 — Socratic Dock (Diagnostic Guidance Mode)

```
┌───────────────────────────────────────────────────────────────┬──────────────────────────────────────────────────────┐
│  MOCKPREPS HOST QUESTION                                      │  ORVIXA SOCRATIC DOCK                       [ Esc ]  │
├───────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────┤
│                                                               │  ✦ SOCRATIC COPILOT                       [ Active ] │
│  Calculate the acceleration of the block down the incline.    │  ──────────────────────────────────────────────────  │
│                                                               │                                                      │
│  YOUR WORKING STEPS:                                          │  ┌────────────────────────────────────────────────┐  │
│  ┌─────────────────────────────────────────────────────────┐  │  │ DIAGNOSTIC RIBBON                   [ Level 1 ]│  │
│  │ Step 1: F_parallel = m * g * sin(30) = 24.5 N           │  │  │ Deviation: Normal Force Calculation            │  │
│  │ Step 2: F_friction = mu_k * m * g * sin(30) = 4.9 N    │  │  │ Trap: Confused sin(theta) with cos(theta)     │  │
│  └─────────────────────────────────────────────────────────┘  │  └────────────────────────────────────────────────┘  │
│                                                               │                                                      │
│  [ Submit Answer ]                                            │  SOCRATIC DIALOGUE STREAM                            │
│                                                               │  ┌────────────────────────────────────────────────┐  │
│                                                               │  │ ✦ Orvixa Tutor                                 │  │
│                                                               │  │ Look closely at Step 2 where you calculated    │  │
│                                                               │  │ the Normal Force (N).                          │  │
│                                                               │  │                                                │  │
│                                                               │  │ Which trigonometric component acts             │  │
│                                                               │  │ perpendicular to the inclined surface?         │  │
│                                                               │  └────────────────────────────────────────────────┘  │
│                                                               │                                                      │
│                                                               │  CONCEPT SCRATCHPAD                                  │
│                                                               │  ┌────────────────────────────────────────────────┐  │
│                                                               │  │ N = m * g * cos(30)                            │  │
│                                                               │  └────────────────────────────────────────────────┘  │
│                                                               │                                                      │
│                                                               │  METACOGNITIVE CONFIDENCE                            │
│                                                               │  [ Unsure ]      [ Moderate ]      [ Solid ]         │
│                                                               │                                                      │
│                                                               │  [ Reveal Hint 2 ]           [ Re-evaluate Step ]    │
└───────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────┘
```

---

### Screen D3: Surface 3 — Knowledge Blueprint Canvas (Fullscreen Mesh)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  ORVIXA KNOWLEDGE BLUEPRINT CANVAS                                                    [ Search Node... ]   [ Close X ]│
├──────────────────────┬───────────────────────────────────────────────────────────────────────┬───────────────────────┤
│ TOPIC TREE           │ INTERACTIVE CONCEPT NODE MESH                                         │ CONCEPT DETAILS       │
├──────────────────────┼───────────────────────────────────────────────────────────────────────┼───────────────────────┤
│ ▼ Classical Physics  │                                                                       │ CONCEPT:              │
│   ├── Vector Statics │               (● Vector Statics)                                      │ Normal Force Vectors  │
│   ├── Newton Laws    │                        │                                              │                       │
│   └── Friction Models│                        ▼                                              │ RETENTION: 94%        │
│ ► Thermodynamics     │               [● Normal Force Vectors] ──(Mastered)                   │ STATUS: Strong        │
│ ► Electromagnetism   │                        │                                              │                       │
│                      │                        ▼                                              │ MISCONCEPTIONS FIXED:  │
│                      │               (◯ Inclined Friction) ───[Needs Practice]               │ 1. Sin/Cos swap (3x)  │
│                      │                                                                       │ 2. Kinetic vs Static  │
│                      │                                                                       │                       │
│                      │                                                                       │ [ Practice This Node ]│
└──────────────────────┴───────────────────────────────────────────────────────────────────────┴───────────────────────┘
```

---

## PART 3: TABLET EXPERIENCE (`1024px` Landscape & `768px` Portrait)

### Tablet Landscape View (`1024px`)
```
┌─────────────────────────────────────────────────┬──────────────────────────────────────────────────┐
│  MOCKPREPS HOST QUESTION                        │  ORVIXA SOCRATIC DOCK                    [ X ]   │
├─────────────────────────────────────────────────┼──────────────────────────────────────────────────┤
│  Question 14: Classical Mechanics               │  ┌────────────────────────────────────────────┐  │
│  Calculate acceleration down the incline...     │  │ ✦ DIAGNOSTIC RIBBON             [ Level 1 ]│  │
│                                                 │  │ Deviation in Step 2: Normal Force Equation │  │
│  [ Step 1: F_parallel = m*g*sin(30) ]           │  └────────────────────────────────────────────┘  │
│  [ Step 2: F_friction = mu*m*g*sin(30) ]        │  SOCRATIC DIALOGUE STREAM                        │
│                                                 │  "Which component acts perpendicular to plane?"  │
│  [ Submit Answer ]                              │  [ Reveal Hint 2 ]        [ Re-evaluate Step ]   │
└─────────────────────────────────────────────────┴──────────────────────────────────────────────────┘
```

---

## PART 4: MOBILE EXPERIENCE (`375px` Portrait)

```
┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
│ MOBILE HOST SCREEN (375px)           │  │ MOBILE SOCRATIC DOCK (BOTTOM SHEET)  │
├──────────────────────────────────────┤  ├──────────────────────────────────────┤
│ Q14: Physics Classical Mechanics     │  │ ═══════════ SLIDE HANDLE ═══════════ │
│ Calculate acceleration down incline..│  │ ✦ DIAGNOSTIC BREAKTHROUGH            │
│                                      │  │ Deviation: Normal Force (Step 2)     │
│ [ Step 1: F_parallel = 24.5N ]       │  │ ──────────────────────────────────── │
│ [ Step 2: F_friction = 4.9N  ]       │  │ Orvixa Tutor:                        │
│                                      │  │ "Which component acts perpendicular  │
│ [ Submit Answer ]                    │  │  to the inclined surface?"           │
│                                      │  │                                      │
│ ┌──────────────────────────────────┐ │  │ [ Hint 2 ]       [ Re-evaluate Step ]│
│ │ (✦) Amber Aura: Tap for Hint     │ │  │                                      │
│ └──────────────────────────────────┘ │  │ ─── THUMB REACHABILITY ZONE ───────  │
└──────────────────────────────────────┘  └──────────────────────────────────────┘
```

---

## PART 5: LIGHT THEME VISUAL PACKAGE (Slate & Milk Palette)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ LIGHT THEME COLOR TOKEN MAPPING                                                                                      │
├──────────────────────┬────────────────────────┬──────────────────────────────────────────────────────────────────────┤
│ Surface Component    │ Color Value            │ Visual Intent                                                        │
├──────────────────────┼────────────────────────┼──────────────────────────────────────────────────────────────────────┤
│ Canvas Background    │ #F8FAFC (Slate 50)     │ Crisp, high-contrast daylight study surface.                         │
│ Surface Cards        │ #FFFFFF (Pure White)   │ Clean, elevated card surfaces with subtle soft drop shadows.         │
│ Primary Text         │ #0F172A (Slate 900)    │ Maximum legibility contrast (16:1 ratio).                             │
│ Secondary Text       │ #475569 (Slate 600)    │ Clear supporting hierarchy.                                          │
│ Brand Accent         │ #4F46E5 (Indigo 600)   │ Vibrant, active intelligence highlight.                              │
│ Amber Accent         │ #D97706 (Amber 600)    │ High-visibility diagnostic warning / friction callout.               │
│ Emerald Accent       │ #059669 (Emerald 600)  │ Warm, encouraging mastery indicator.                                 │
└──────────────────────┴────────────────────────┴──────────────────────────────────────────────────────────────────────┘
```

---

## PART 6: DARK THEME VISUAL PACKAGE (Deep Obsidian Palette)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ DARK THEME COLOR TOKEN MAPPING                                                                                       │
├──────────────────────┬────────────────────────┬──────────────────────────────────────────────────────────────────────┤
│ Surface Component    │ Color Value            │ Visual Intent                                                        │
├──────────────────────┼────────────────────────┼──────────────────────────────────────────────────────────────────────┤
│ Canvas Background    │ #0B0F17 (Obsidian Deep)│ Zero eye-strain dark mode for late-night study sessions.             │
│ Surface Cards        │ #1E293B (Slate 800)    │ Subtle glassmorphic cards with translucent glass borders.            │
│ Primary Text         │ #F8FAFC (Slate 50)     │ Luminous white text for low-light reading.                           │
│ Secondary Text       │ #94A3B8 (Slate 400)    │ Soft, non-distracting metadata text.                                 │
│ Brand Accent         │ #6366F1 (Indigo 500)   │ Glowing electric indigo accent.                                       │
│ Amber Accent         │ #F59E0B (Amber 500)    │ Warm, glowing diagnostic friction aura.                              │
│ Emerald Accent       │ #10B981 (Emerald 500)  │ Luminous emerald mastery pulse.                                      │
└──────────────────────┴────────────────────────┴──────────────────────────────────────────────────────────────────────┘
```

---

## PART 7: STATE GALLERY

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                 COMPLETE STATE GALLERY                                               │
├───────────────────────────┬───────────────────────────┬───────────────────────────┬──────────────────────────────────┤
│ STATE 1: EMPTY / QUIET    │ STATE 2: AI THINKING      │ STATE 3: DIAGNOSTIC READY │ STATE 4: HINT LADDER LEVEL 1     │
│                           │                           │                           │                                  │
│ (✦) Neutral Gray          │ (✦) Radial Cyan Pulse     │ (✦) Warm Amber Glow       │ ┌──────────────────────────────┐ │
│ "Watching your reasoning" │ "Analyzing mental model.."│ "10-sec logic trap found" │ │ Level 1: Step 2 Deviation    │ │
│                           │                           │                           │ └──────────────────────────────┘ │
├───────────────────────────┼───────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ STATE 5: HINT LADDER L2   │ STATE 6: HINT LADDER L3   │ STATE 7: HINT LADDER L4   │ STATE 8: CORRECT / MASTERY       │
│                           │                           │                           │                                  │
│ "What is normal force N?" │ "Think of water pressure" │ "Let's isolate equation"  │ (✦) Emerald Bloom                │
│                           │                           │                           │ "Spot on! Concept Mastered."     │
├───────────────────────────┼───────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ STATE 9: MEMORY UPDATE    │ STATE 10: OFFLINE STUB    │ STATE 11: NETWORK ERROR   │ STATE 12: CELEBRATION            │
│                           │                           │                           │                                  │
│ Node -> Green + 100%      │ "Offline Stub Active"     │ [!] Connection Retry      │ ★ Particle Burst Animation       │
└───────────────────────────┴───────────────────────────┴───────────────────────────┴──────────────────────────────────┘
```

---

## PART 8: INTERACTION GALLERY & ANIMATION TIMELINES

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                           ANIMATION & INTERACTION TIMELINES                                           │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Socratic Dock Slide-In Transition (250ms Ease-Out)                                                                │
│    Time (ms): 0ms ─────────── 100ms ─────────── 200ms ─────── 250ms                                                  │
│    Dock Pos:  [Right 400px] ──> [Right 200px] ──> [Right 20px] ─> [Right 0px (Dock Lock)]                            │
│    Opacity:   0.0 ───────────── 0.5 ───────────── 0.9 ────────── 1.0                                                 │
│                                                                                                                      │
│ 2. Ambient Aura Thinking Pulse Animation (1500ms Breathing Cycle)                                                    │
│    Scale:   1.0 ──> 1.15 ──> 1.0 (Repeat)                                                                            │
│    Opacity: 0.6 ──> 1.00 ──> 0.6 (Repeat)                                                                            │
│                                                                                                                      │
│ 3. Keyboard Shortcut System Map                                                                                       │
│    `Ctrl + K` or `Cmd + Shift + O` ──> Toggle Socratic Dock                                                          │
│    `Esc`                           ──> Close Socratic Dock or Canvas                                                 │
│    `Ctrl + Enter`                  ──> Re-evaluate Scratchpad Input                                                  │
│    `1` / `2` / `3` / `4`          ──> Reveal Hint Level 1 / 2 / 3 / 4                                                │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## PART 9: VISUAL SYSTEM CONTRACT

```json
{
  "designSystem": "Orvixa Product Visual System v1.0",
  "typography": {
    "fontFamily": "Inter, system-ui, sans-serif",
    "monoFont": "JetBrains Mono, monospace",
    "scale": {
      "xs": "0.75rem",
      "sm": "0.85rem",
      "base": "0.95rem",
      "lg": "1.15rem",
      "xl": "1.5rem",
      "xxl": "2.0rem"
    }
  },
  "spacing": {
    "gridBase": "4px",
    "paddings": {
      "compact": "8px",
      "default": "16px",
      "spacious": "24px"
    }
  },
  "elevation": {
    "dock": "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)",
    "aura": "0 0 15px rgba(99, 102, 241, 0.4)"
  },
  "radii": {
    "sm": "6px",
    "md": "12px",
    "lg": "20px",
    "pill": "9999px"
  }
}
```

---

## PART 10: ACCESSIBILITY & INCLUSIVITY REVIEW

- **Contrast Validation:** All primary text contrast ratios exceed WCAG 2.1 AAA standard (>= 7:1 for normal text).
- **Screen Reader Announcements:** Socratic Dock uses `aria-live="polite"` to announce diagnostic insights without disrupting speech synthesis.
- **Touch Target Sizes:** All mobile touch targets are formatted to minimum 44px x 44px dimensions within natural thumb reachability zones.
- **Reduced Motion Support:** Obeys `@media (prefers-reduced-motion: reduce)` by disabling spring animations and replacing slide transitions with instant fade-ins.

---

## CONCLUSION & DESIGN PACKAGE APPROVAL

> The **Orvixa Visual Design Review Package** establishes the definitive, pixel-perfect, human-centric design specification for the Orvixa AI Copilot. 
> 
> It transforms product vision into high-fidelity visual visualizers, screen architectures, interaction timelines, and state galleries worthy of Apple, OpenAI, and Linear.
