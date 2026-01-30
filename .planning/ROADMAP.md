# ROADMAP: UI Cleanup & Redesign Preparation

## Milestone 1: UI Cleanup & Redesign Preparation

**Goal:** Prepare codebase for comprehensive UI/UX redesign work in Figma.

**Success:** Clear structural boundaries, consistent library usage, documentation that matches code.

---

## Phases

### Phase 1: Legacy Component Isolation
**Goal:** Structurally separate legacy OopsBudgeter components from BetterBudgeter components.

**Plans:** 2 plans

Plans:
- [x] 01-01-PLAN.md — Move 28 legacy components to components/legacy/ and restore original Logo.tsx
- [x] 01-02-PLAN.md — Rewire all imports to legacy/ paths and verify build

**Deliverables:**
- `components/legacy/` directory with all legacy components
- Updated imports throughout codebase
- No functional changes — just file moves
- Verification that legacy routes still work

**Why first:** Creates mental clarity before making any code changes. Establishes clear "don't touch" zone.

---

### Phase 2: UI Library Strategy
**Goal:** Audit current UI library usage, decide replacement strategy for Tremor, and establish the new component system.

**Status:** COMPLETE (2026-01-28)

**Plans:** 3 plans

Plans:
- [x] 02-01-PLAN.md — Tremor usage audit and stability strategy
- [x] 02-02-PLAN.md — Component inventory and library strategy document
- [x] 02-03-PLAN.md — Migration risk assessment and CLAUDE.md update

**Previous work (02-01-PLAN.md):** Tremor audit completed 2026-01-27. Found only 1 Tremor component (DonutChart). This audit remains valid and informs the new strategy.

**Deliverables:**
- Audit of all current UI library usage (Tremor, Radix, shadcn, Recharts)
- Decision document: new library architecture
- Migration risk assessment

**Key Decisions (locked 2026-01-28):**
- Tremor removed entirely (unmaintained — no commits in over a year)
- shadcn/ui = primary UI framework for BetterBudgeter
- Base UI = headless primitives for new BetterBudgeter components
- Radix UI = stays for legacy OopsBudgeter only (do not touch)
- Charts = shadcn/ui charts (Recharts under the hood)
- animate-ui = deferred to redesign phase (foundation first)

**Why second:** Must decide the library architecture before any migration work.

---

### Phase 3: UI Library Migration
**Goal:** Replace Tremor with shadcn/ui charts, set up Base UI as the primitive layer for new components, and remove Tremor dependency.

**Status:** COMPLETE (2026-01-30)

**Plans:** 2 plans

Plans:
- [x] 03-01-PLAN.md — Install Base UI and migrate SpendingByCategoryChart to shadcn/ui
- [x] 03-02-PLAN.md — Remove Tremor dependency and clean up all Tremor artifacts

**Deliverables:**
- shadcn/ui initialized with Base UI primitives (for new components)
- DonutChart replaced with shadcn/ui chart equivalent (Recharts)
- `@tremor/react` removed from dependencies
- Verification that all charts render correctly
- Legacy components remain untouched on Radix
- Commit after each migration step

**Why third:** Depends on library strategy from Phase 2.

---

### Phase 4: Library Consolidation & Cleanup
**Goal:** Remove unused code, establish clear library boundaries, document the new system.

**Deliverables:**
- Remove unused shadcn chart utilities and old Tremor-related code
- Document library responsibilities in code comments:
  - **shadcn/ui + Base UI** = all new BetterBudgeter components
  - **Radix UI** = legacy OopsBudgeter only
  - **Recharts (via shadcn/ui)** = all charts
  - **Sonner** = notifications
- Verify Sonner integration still works
- Clean up duplicate color definitions or unused dependencies

**Why fourth:** After migration, we can see what's actually used vs unused.

---

### Phase 5: Documentation & Handoff
**Goal:** Prepare documentation for UI audit phase.

**Deliverables:**
- Component inventory (what exists, where, which library)
- Clear "redesign scope" vs "legacy zone" boundaries
- Notes for Figma design work
- Updated CLAUDE.md if needed

**Why last:** Captures final state after all cleanup work.

---

## Phase Status

| Phase | Status | Notes |
|-------|--------|-------|
| 1. Legacy Component Isolation | Complete | 2 plans, verified |
| 2. UI Library Strategy | Complete | 3 plans, verified |
| 3. UI Library Migration | Complete | 2 plans, verified (minor gaps deferred to Phase 4) |
| 4. Library Consolidation & Cleanup | Not Started | Depends on Phase 3 |
| 5. Documentation & Handoff | Not Started | |

---

## Post-Milestone

After this milestone, user will:
1. Conduct comprehensive UI audit (manual)
2. Create redesign scope in Figma
3. Connect Claude to Figma via MCP for design implementation

**Future consideration:** Achievements page research for ADHD engagement (separate project)
