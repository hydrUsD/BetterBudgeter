---
plan: 06-01
phase: 06-design-tokens
status: complete
commit: d29f790
completed: 2026-05-19
requirements_covered:
  - TOKEN-01
  - TOKEN-02
  - TOKEN-03
---

# Plan 06-01 Summary: Color Tokens

## What Was Built

Added two new CSS blocks to `src/app/globals.css`:

1. **BB `:root` block** — 21 light-mode color tokens
2. **BB `.dark` block** — same 21 tokens with dark-mode overrides

## Token Inventory

### Foundation Colors (TOKEN-01) — 6 tokens
| Token | Light | Dark |
|-------|-------|------|
| `--bb-bg` | `oklch(0.985 0.002 280)` | `oklch(0.155 0.005 280)` |
| `--bb-surface` | `oklch(1 0 0)` | `oklch(0.195 0.005 280)` |
| `--bb-surface-raised` | `oklch(0.975 0.002 280)` | `oklch(0.235 0.006 280)` |
| `--bb-text` | `oklch(0.205 0.006 280)` | `oklch(0.965 0.002 280)` |
| `--bb-text-secondary` | `oklch(0.48 0.012 280)` | `oklch(0.66 0.012 280)` |
| `--bb-border` | `oklch(0.91 0.004 280)` | `oklch(0.28 0.006 280)` |

### Semantic Financial Colors (TOKEN-02) — 8 tokens
`--bb-negative` = soft coral (`oklch(0.58 0.16 25)` light, `oklch(0.68 0.18 25)` dark) — NOT bright red.

### Budget Category Colors (TOKEN-03) — 7 tokens
Same values in light and dark (chart context manages contrast).

## Verification Results

- `grep -c "^  --bb-" globals.css` → **42** (21 :root + 21 .dark ✓)
- Light mode header present ✓
- Dark mode header present ✓
- `--bb-negative: oklch(0.58 0.16 25)` confirmed (soft coral ✓)
- `--bb-cat-entertainment` present ✓
- `--background: oklch(1 0 0)` still present (shadcn :root untouched ✓)
- `--sidebar-ring: oklch(0.442 0.017 285.786)` still present (shadcn .dark untouched ✓)

## Key Decisions

- **Soft coral for `--bb-negative`** — per DESIGN_SYSTEM.md ADHD UX principle: avoid anxiety/shame triggers
- **Category tokens same in dark** — chart contexts manage their own contrast; no dark variants needed
- **All hues anchored at 280** for foundation tokens — cool-neutral violet-gray for palette coherence

## Files Changed

- `src/app/globals.css` — +72 lines (additive only, no modifications to existing content)
