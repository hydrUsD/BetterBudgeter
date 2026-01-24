# PROJECT: UI Cleanup & Redesign Preparation

## What This Is

Preparing the BetterBudgeter codebase for a comprehensive UI/UX redesign by:
1. Structurally isolating legacy components
2. Migrating Tremor to stable v1.0.0 (from v4 beta)
3. Consolidating UI libraries to clear responsibilities
4. Enabling a clean UI audit before Figma design work

**Core Value:** Reduce cognitive load when working on UI — clear boundaries between legacy and new code, consistent library usage, documentation that matches reality.

---

## Requirements

### Validated (confirmed by user)

- [x] Legacy components must be structurally isolated (like legacy routes are)
- [x] Tremor must be migrated to v1.0.0 stable (to match documentation)
- [x] Migration must have a strategy before execution (safe, incremental)
- [x] Library responsibilities must be clear:
  - **Tremor** = all chart components
  - **RadixUI** = UI primitives (dialogs, menus, tooltips, etc.)
  - **shadcn/ui** = only when component doesn't exist in RadixUI or Tremor
- [x] Unused code (e.g., shadcn chart utils) must be removed if not needed
- [x] Legacy OopsBudgeter must remain fully functional
- [x] Achievements page preserved (potential ADHD engagement value, research later)

### Out of Scope

- Backend logic changes
- Routing changes
- Database schema changes
- New feature implementation
- Achievements page redesign (deferred to future research)

---

## Constraints

### Hard Constraints (DO NOT VIOLATE)

1. **UI/UX scope only** — No backend logic or routing changes. If truly necessary: STOP, EXPLAIN, and ASK with at least 2 options, recommendation, and reasoning.

2. **Do not break legacy OopsBudgeter** — All legacy routes and functionality must remain accessible and working.

3. **Incremental changes** — Each phase must leave the app in a working state. No "big bang" refactors.

4. **Commit discipline** — Small, focused commits after each meaningful change.

### Soft Constraints (Prefer but can discuss)

- Prefer moving files over deleting them during isolation
- Prefer explicit imports over barrel files for clarity
- Prefer keeping legacy code untouched when possible (wrap, don't rewrite)

---

## Key Decisions

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| Tremor version | v1.0.0 stable | Matches documentation, easier for first-time users | 2026-01-24 |
| Chart library | Tremor only | Consolidate from dual Tremor+Recharts situation | 2026-01-24 |
| Legacy isolation | Structural (`components/legacy/`) | Mirrors route isolation pattern, reduces mental load | 2026-01-24 |
| shadcn usage | Minimal (Sonner only for now) | Only use when RadixUI/Tremor lack equivalent | 2026-01-24 |

---

## Success Criteria

Project is complete when:

- [ ] Legacy components are in `components/legacy/` directory
- [ ] Tremor is on v1.0.0 stable with working charts
- [ ] No unused shadcn chart utilities in codebase
- [ ] Library responsibilities are documented
- [ ] User can proceed to UI audit with clear boundaries
- [ ] Legacy OopsBudgeter still works (manual verification)

---

## Team Context

- Development team consists of junior developers
- First time working with Tremor library
- Documentation match is critical for productivity
- Clear code comments and explanations required
