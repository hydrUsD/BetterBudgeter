# ROADMAP: UI Cleanup & Redesign Preparation

## Milestone 1: UI Cleanup & Redesign Preparation

**Goal:** Prepare codebase for comprehensive UI/UX redesign work in Figma.

**Success:** Clear structural boundaries, consistent library usage, documentation that matches code.

---

## Phases

### Phase 1: Legacy Component Isolation
**Goal:** Structurally separate legacy OopsBudgeter components from BetterBudgeter components.

**Deliverables:**
- `components/legacy/` directory with all legacy components
- Updated imports throughout codebase
- No functional changes — just file moves
- Verification that legacy routes still work

**Why first:** Creates mental clarity before making any code changes. Establishes clear "don't touch" zone.

---

### Phase 2: Tremor Migration Strategy
**Goal:** Create a safe migration plan from Tremor v4 beta to v1.0.0 stable.

**Deliverables:**
- Audit of all Tremor component usage
- API difference documentation (v4 beta vs v1.0.0)
- Step-by-step migration plan
- Risk assessment for each component

**Why second:** Planning before execution prevents breaking changes. User needs docs to match code.

---

### Phase 3: Tremor Migration Execution
**Goal:** Safely migrate all Tremor components to v1.0.0 stable API.

**Deliverables:**
- Updated `@tremor/react` to v1.0.0
- All DonutChart (and other Tremor) components using v1.0.0 API
- Verification that charts render correctly
- Commit after each component migration

**Why third:** Depends on migration strategy from Phase 2.

---

### Phase 4: Library Consolidation
**Goal:** Establish clear library responsibilities and remove unused code.

**Deliverables:**
- Remove unused shadcn chart utilities (if confirmed unused)
- Document library responsibilities in code comments
- Verify Sonner integration still works
- Clean up any duplicate color definitions

**Why fourth:** After Tremor migration, we can see what's actually used vs unused.

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
| 1. Legacy Component Isolation | Not Started | |
| 2. Tremor Migration Strategy | Not Started | |
| 3. Tremor Migration Execution | Not Started | Depends on Phase 2 |
| 4. Library Consolidation | Not Started | Depends on Phase 3 |
| 5. Documentation & Handoff | Not Started | |

---

## Post-Milestone

After this milestone, user will:
1. Conduct comprehensive UI audit (manual)
2. Create redesign scope in Figma
3. Connect Claude to Figma via MCP for design implementation

**Future consideration:** Achievements page research for ADHD engagement (separate project)
