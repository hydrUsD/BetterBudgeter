# PROJECT STATE

## Project Reference

**Building:** UI Cleanup & Redesign Preparation for BetterBudgeter
**Core Value:** Reduce cognitive load when working on UI — clear boundaries, consistent libraries, matching docs

---

## Current Position

**Milestone:** 1 of 1 — UI Cleanup & Redesign Preparation
**Phase:** 2 of 5 — UI Library Strategy
**Plan:** 0 of ? in current phase
**Status:** Phase restarted — needs planning
**Last activity:** 2026-01-28 - Roadmap updated with new library strategy decisions

**Progress:** [██░░░░░░░░] 20%

---

## Recent Decisions

| Decision | Choice | Date |
|----------|--------|------|
| Project scope | UI/UX only, no backend/routing | 2026-01-24 |
| Legacy isolation approach | Structural (components/legacy/) | 2026-01-24 |
| File move strategy | git mv to preserve history | 2026-01-27 |
| Dual Logo strategy | Maintain both OopsBudgeter and BetterBudgeter versions | 2026-01-27 |
| Import path pattern | Absolute paths (@/components/*) over relative | 2026-01-27 |
| Tremor decision | Remove entirely — unmaintained (no commits in 1+ year) | 2026-01-28 |
| Primary UI framework | shadcn/ui (copy/paste model, actively maintained) | 2026-01-28 |
| New BB primitives | Base UI (modern successor to Radix, v1.0 stable Dec 2025) | 2026-01-28 |
| Legacy primitives | Radix UI stays for legacy OopsBudgeter only | 2026-01-28 |
| Charts | shadcn/ui charts (Recharts under the hood) | 2026-01-28 |
| animate-ui | Deferred to redesign phase (foundation first) | 2026-01-28 |

---

## Pending Todos

_None yet_

---

## Blockers / Concerns

- ~~Tremor v4 beta → v1.0.0 may have significant API changes~~ (SUPERSEDED: Tremor being removed entirely)
- ~~Analytics.tsx is complex legacy code~~ (RESOLVED: Moved to legacy with other components)
- Radix UI maintenance risk — same team left after WorkOS acquisition (long-term concern, not blocking)

---

## Session Continuity

**Last session:** 2026-01-28
**Stopped at:** Roadmap updated — Phases 2-4 rewritten for new library strategy
**Resume file:** None

---

## Quick Context

```
Milestone: UI Cleanup & Redesign Preparation
├── Phase 1: Legacy Component Isolation ✅ COMPLETE
├── Phase 2: UI Library Strategy ← RESTARTED (needs planning)
├── Phase 3: UI Library Migration
├── Phase 4: Library Consolidation & Cleanup
└── Phase 5: Documentation & Handoff
```

**Next action:** Discuss Phase 2 context (/gsd:discuss-phase 2) then plan
