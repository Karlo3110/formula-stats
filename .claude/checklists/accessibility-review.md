# Accessibility Review Checklist

> Run for any user-facing UI. Target **WCAG 2.1 AA**. Accessibility is a requirement, not a
> nice-to-have. Backs `rules/frontend/` (React, Tailwind).

## Semantics & Structure
- [ ] Semantic HTML used (`button`, `nav`, `main`, `header`, `ul/li`, `table`) — not
      `div`/`span` with click handlers standing in for real elements.
- [ ] One logical heading order (`h1`→`h2`→…); no skipped levels for styling.
- [ ] Landmarks present (`main`, `nav`, `header`, `footer`) for navigation.
- [ ] Lists, tables, and forms use proper elements and associations.

## Keyboard
- [ ] Every interactive element is reachable and operable by keyboard (Tab/Shift+Tab/Enter/
      Space/Esc/arrows where appropriate).
- [ ] Visible focus state on all focusable elements (`focus-visible:ring-*`).
- [ ] Logical focus order; no keyboard traps. Modals trap focus while open and restore it
      on close.
- [ ] No `tabindex > 0`.

## Forms
- [ ] Every input has an associated `<label>` (or `aria-label`).
- [ ] Errors are programmatically associated (`aria-describedby`) and announced, not
      color-only.
- [ ] Required/invalid states conveyed via `aria-required`/`aria-invalid`.

## ARIA & State
- [ ] Native elements preferred over ARIA; ARIA only where semantics are missing.
- [ ] Dynamic updates announced where needed (`aria-live` for async/loading/errors).
- [ ] Icon-only controls have an accessible name (`aria-label`).
- [ ] Custom widgets follow the correct ARIA pattern (roles/states/keys).

## Visual & Content
- [ ] Text contrast ≥ AA (4.5:1 normal, 3:1 large); UI/graphics ≥ 3:1.
- [ ] Meaning never conveyed by color alone (use text/icon too).
- [ ] Images have meaningful `alt` (or `alt=""` if decorative).
- [ ] Layout works zoomed to 200% and at small viewports; no loss of content/function.
- [ ] Respects `prefers-reduced-motion` for animations.

## States
- [ ] Loading, error, and empty states are perceivable and announced — never a silent blank
      screen (`architecture/frontend-architecture.md`).

## Verification
- [ ] Tested with keyboard only.
- [ ] Run an automated check (axe/Lighthouse) on the happy path; resolve violations.
- [ ] Spot-checked with a screen reader for critical flows.

---
**Gate:** keyboard inoperability, missing labels, and sub-AA contrast are blocking.
