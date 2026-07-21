# BROWSER EXPERIENCE GUIDELINES
*Chrome Extension Shell, Security Isolation & Performance*

---

## 1. EXTENSION INJECTION

- Content scripts must inject the Shadow Host `<ShadowHost />` cleanly.
- The Shadow Root must use `mode: 'closed'` (or Open portal wrapper) to prevent host site scripts from snooping or modifying Orvixa inner context.
- Zero global CSS leak. Styles must be injected dynamically *into* the Shadow Root.

---

## 2. CSP & CROSS-ORIGIN ISOLATION

- **No eval() or inline scripts:** Strictly obey Manifest V3 security rules.
- **Cross-origin protection:** Sandbox any external resources or dynamic frames.
- **Sensitive inputs:** Automatically suppress password, authorization, or credit card inputs.
