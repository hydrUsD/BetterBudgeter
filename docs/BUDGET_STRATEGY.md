# Budget & Notification Strategy

**Version:** 1.0
**Status:** Analysis Complete
**Task:** 6a — Budget & Notification Feature Analysis
**Scope:** MVP Feature Definition (No Implementation)

---

## 1. Purpose & Context

This document defines the Budget and Notification feature for BetterBudget.

Budgets are a **core MVP feature** because they directly support the ADHD-focused design goals:
- They help users notice overspending **before** it becomes a problem
- They provide clear, predictable feedback loops
- They reduce cognitive load by summarizing spending vs. limits

### What This Document Covers

- Budget concept and data model
- ADHD-specific design rationale
- Notification triggers and thresholds
- Data flow and architecture boundaries
- MVP vs. Post-MVP scope

### What This Document Does NOT Cover

- Dashboard visualization (covered in Task 5a)
- Implementation details or code
- Background jobs or scheduled notifications
- Multi-currency budgets

---

## 2. Budget Concept (MVP)

### 2.1 Definition

A **budget** is a user-defined spending limit for a specific expense category over a calendar month.

| Attribute | Description |
|-----------|-------------|
| **Category** | One of the defined expense categories (Food, Rent, Utilities, Transport, Entertainment, Shopping, Other) |
| **Monthly Limit** | The maximum amount the user wants to spend in this category per month |
| **Time Window** | Always calendar month (1st to last day of month) |
| **Currency** | Matches user's display currency (default: EUR) |

### 2.2 Budget Progress

Budget progress is **calculated, not stored**. It is derived from transaction data.

| Field | Calculation |
|-------|-------------|
| **Spent Amount** | Sum of all expense transactions in the budget category for the current month |
| **Remaining Amount** | Monthly Limit - Spent Amount |
| **Usage Percentage** | (Spent Amount / Monthly Limit) × 100 |
| **Status** | Derived from Usage Percentage (see Section 3.3) |

### 2.3 Data Dependencies

Budgets depend **only** on existing transaction data:

| Source | Field | Usage |
|--------|-------|-------|
| `bb_transactions` | `type` | Filter to `expense` only |
| `bb_transactions` | `category` | Match to budget category |
| `bb_transactions` | `amount` | Sum for spent calculation |
| `bb_transactions` | `booking_date` | Filter to current month |

**Key Rule:** Budget logic reads from the database only. It never reads from mock APIs.

### 2.4 What Budgets Do NOT Cover (MVP)

| Excluded Feature | Rationale |
|------------------|-----------|
| Income budgets | Income is generally unpredictable; focus on expense control |
| Multi-month budgets | Adds complexity; monthly is sufficient for MVP |
| Rollover (unused budget) | Requires tracking state across months |
| Shared budgets | No multi-user features in MVP |
| Budget history/trends | Post-MVP analytics feature |
| Custom categories | Categories are fixed in MVP |
| Budget templates | Users set each budget manually |

---

## 3. ADHD-Focused Design Goals

Budgets are specifically designed to help users with ADHD. Each design decision serves a specific purpose.

### 3.1 Problem: Impulsive Spending

**ADHD Challenge:** Difficulty connecting current spending to long-term consequences.

**Budget Solution:**
- Real-time feedback on spending relative to limits
- Warning before hitting 100% (at 80% threshold)
- Visual "traffic light" status (green → yellow → red)

### 3.2 Problem: Loss of Overview

**ADHD Challenge:** Difficulty tracking multiple categories mentally.

**Budget Solution:**
- Simple per-category limits (not complex rules)
- Summary view shows all budgets at once
- Focus on "how much left" rather than raw numbers
- Category icons for quick visual scanning

### 3.3 Problem: Stress from Uncertainty

**ADHD Challenge:** Anxiety about finances without clear status.

**Budget Solution:**
- Three clear states with predictable meanings:

| Status | Condition | User Message | Color |
|--------|-----------|--------------|-------|
| **On Track** | Usage < 80% | "You're doing well" | Green |
| **Warning** | 80% ≤ Usage < 100% | "Watch your spending" | Yellow/Amber |
| **Over Budget** | Usage ≥ 100% | "Budget exceeded" | Red |

- Status is deterministic: same data always produces same status
- No "AI predictions" or probabilistic messaging

### 3.4 Problem: Action Paralysis

**ADHD Challenge:** Knowing something is wrong but not knowing what to do.

**Budget Solution:**
- Notifications are actionable, not just informative
- Clear next step: "You've spent 80% of your Food budget (€160 of €200)"
- No overwhelming detail; summary first, details on demand

### 3.5 Design Principles Summary

| Principle | Implementation |
|-----------|----------------|
| **Predictability** | Same inputs → same outputs; no surprises |
| **Simplicity** | Three states only; no gradients or percentages in primary view |
| **Actionable** | Notifications tell you what happened AND what you can do |
| **Non-judgmental** | "Over budget" not "You failed"; neutral language |
| **Glanceable** | Status visible without reading numbers |

---

## 4. Notification Triggers (Conceptual)

### 4.1 Trigger Events

Notifications are triggered **only** by user-initiated actions, specifically:

| Trigger | Description | When |
|---------|-------------|------|
| **Import Complete** | After transaction import finishes | User clicks "Sync Transactions" |

**Explicitly NOT triggers:**
- Background jobs (not in MVP)
- Scheduled checks (not in MVP)
- Real-time transaction monitoring (not possible with mock API)
- Login events (too frequent, not actionable)

### 4.2 Notification Types

| Type | Condition | Priority |
|------|-----------|----------|
| **Warning** | Budget usage crosses 80% threshold | Medium |
| **Over Budget** | Budget usage crosses 100% threshold | High |
| **Recovered** | Budget usage drops below 100% after being over | Low (Post-MVP) |

### 4.3 Notification Content

Each notification contains:

| Field | Example |
|-------|---------|
| **Title** | "Food budget warning" |
| **Message** | "You've spent €160 of your €200 Food budget (80%)" |
| **Category** | "Food" |
| **Spent** | €160.00 |
| **Limit** | €200.00 |
| **Percentage** | 80% |

### 4.4 Deterministic Behavior

Notifications follow strict rules to ensure predictability:

| Rule | Description |
|------|-------------|
| **Threshold-based** | Notification fires when threshold is crossed |
| **Once per threshold** | Same threshold doesn't re-fire until reset (e.g., new month) |
| **Calculated at import** | Status computed from current DB state after import |
| **No false positives** | Only notify when data actually changed |

### 4.5 Notification Deduplication

To prevent notification spam:

| Scenario | Behavior |
|----------|----------|
| Re-import same data | No new notification (threshold already crossed) |
| Multiple imports in one session | Only notify for newly crossed thresholds |
| New month starts | Thresholds reset; can notify again |

**Implementation hint:** Track last notified threshold per budget per month.

---

## 5. Data & Architecture Boundaries

### 5.1 Data Model (Conceptual)

New table required: `bb_budgets`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to auth.users |
| `category` | TEXT | Expense category |
| `monthly_limit` | DECIMAL(12,2) | Budget amount |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last modified |

**Constraints:**
- `UNIQUE(user_id, category)` — One budget per category per user
- `user_id` required (RLS enforced)
- `category` must be valid expense category

**Note:** This table stores **configuration only**. Progress is calculated from transactions.

### 5.2 Architecture Location

| Component | Location | Responsibility |
|-----------|----------|----------------|
| Budget CRUD | `lib/db/budgets.ts` | Database operations for budget configuration |
| Budget Calculation | `lib/budgets/` | Calculate progress from transactions |
| Notification Logic | `lib/notifications/` | Determine when to notify |
| Budget Display | `components/dashboard/` | UI components (receive data via props) |
| Budget Settings | `app/settings/` | UI for setting budget limits |

### 5.3 Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    BUDGET DATA FLOW                              │
└─────────────────────────────────────────────────────────────────┘

1. USER CONFIGURES BUDGETS
   /settings → lib/db/budgets.ts → bb_budgets table

2. USER IMPORTS TRANSACTIONS
   /dashboard → /api/import → bb_transactions table
                    │
                    ▼
3. BUDGET CALCULATION (after import)
   lib/budgets/ reads:
     - bb_budgets (limits)
     - bb_transactions (current month expenses)
   Returns: BudgetProgress[]
                    │
                    ▼
4. NOTIFICATION CHECK
   lib/notifications/ compares:
     - Previous state (threshold not crossed)
     - Current state (threshold crossed)
   Returns: Notification[] (if any)
                    │
                    ▼
5. UI DISPLAY
   Toast notification (Sonner)
   Dashboard budget cards updated
```

### 5.4 Boundary Rules

| Rule | Enforcement |
|------|-------------|
| Budget logic never calls mock API | Mock API is for import only |
| Dashboard receives calculated data | No calculation in components |
| Notifications are synchronous | Triggered in import response path |
| Budget table has RLS | `user_id = auth.uid()` |
| No cross-feature dependencies | Budgets work even if notifications are disabled |

---

## 6. MVP vs. Post-MVP

### 6.1 MVP Scope

| Feature | Included | Notes |
|---------|----------|-------|
| Per-category monthly budgets | Yes | One budget per expense category |
| Budget CRUD in settings | Yes | Create, update, delete budgets |
| Budget progress calculation | Yes | From transaction data |
| Warning notification (80%) | Yes | Triggered on import |
| Over-budget notification (100%) | Yes | Triggered on import |
| Budget summary on dashboard | Yes | Card per budget with status |
| Traffic light status | Yes | Green/Yellow/Red |
| Toast notifications | Yes | Using Sonner |
| Notification preferences | Yes | Enable/disable budget alerts |

### 6.2 Post-MVP Features

| Feature | Rationale for Exclusion |
|---------|------------------------|
| Budget history/trends | Analytics feature, not core budgeting |
| Multi-month budgets | Adds complexity; monthly is sufficient |
| Budget rollover | Requires state tracking across months |
| Custom categories | Categories are fixed in MVP |
| Budget templates/presets | Nice-to-have, not essential |
| Spending predictions | Requires historical analysis |
| Budget sharing | No multi-user in MVP |
| Email/push notifications | Only in-app toasts for MVP |
| Notification recovery alerts | Low priority; focus on warnings |
| Budget vs. actual charts | Dashboard visualization (Task 5) |

### 6.3 Schema Extension Notes

The budget feature requires a new database table (`bb_budgets`). This is a **schema extension**, not a change to existing tables.

| Existing Table | Impact |
|----------------|--------|
| `bb_accounts` | No change |
| `bb_transactions` | No change (read-only for budgets) |
| `bb_user_settings` | No change |
| `bb_notification_prefs` | Already has `budget_alerts` boolean |

---

## 7. Integration Points

### 7.1 Dashboard Integration

The dashboard will **consume** budget data, not calculate it.

| Dashboard Section | Data Source | Responsibility |
|-------------------|-------------|----------------|
| Budget cards | `lib/budgets/` | Display progress per category |
| Budget status | `lib/budgets/` | Show traffic light color |
| Remaining amount | `lib/budgets/` | Show "€X remaining" |

**Key Rule:** Dashboard page fetches from `lib/budgets/`, which internally queries both `bb_budgets` and `bb_transactions`.

### 7.2 Import Pipeline Integration

After successful import, the pipeline should:

1. Call budget calculation for all user budgets
2. Compare to previous state (if tracked)
3. Generate notifications for newly crossed thresholds
4. Return notifications in import response

**Integration point:** `lib/import/` calls `lib/notifications/` after UPSERT.

### 7.3 Settings Integration

Budget configuration lives in `/settings`:

| Setting | UI Component | Storage |
|---------|--------------|---------|
| Budget limits per category | Form with category dropdown + amount | `bb_budgets` table |
| Enable budget alerts | Toggle | `bb_notification_prefs.budget_alerts` |

---

## 8. Key Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Time window | Calendar month | Simple, predictable, universal |
| Progress storage | Calculated, not stored | Single source of truth (transactions) |
| Notification trigger | Import completion only | No background jobs in MVP |
| Thresholds | 80% warning, 100% over | Industry standard, ADHD-friendly |
| Status model | Three states (green/yellow/red) | Reduces cognitive load |
| Category scope | Expense categories only | Income budgets are unusual |
| Budget granularity | One per category | Simple; no sub-budgets |
| Notification dedup | Per threshold per month | Prevents spam |

---

## 9. Open Questions (Resolved)

| Question | Resolution |
|----------|------------|
| Should budgets support income? | No — expense tracking is primary use case |
| Should thresholds be configurable? | No — fixed 80%/100% for MVP |
| How to handle deleted transactions? | Budget recalculates automatically |
| What if no budget exists for a category? | No tracking for that category (silent) |

---

## 10. Glossary

| Term | Definition |
|------|------------|
| **Budget** | User-defined spending limit for a category |
| **Monthly Limit** | Maximum amount to spend in a category per month |
| **Spent Amount** | Sum of expense transactions in category for current month |
| **Usage Percentage** | Spent / Limit × 100 |
| **Threshold** | Percentage point that triggers a notification (80%, 100%) |
| **Traffic Light** | Visual status indicator (green/yellow/red) |

---

*Document created: Task 6a — Budget & Notification Strategy*