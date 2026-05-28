# Figma Files — BetterBudget

## Design Prototype + Cheat Sheet

- **File**: BetterBudget Design System
- **File Key**: `n3jndGM5claGLux7tWuIWu`
- **URL**: https://www.figma.com/design/n3jndGM5claGLux7tWuIWu

### Pages

| Page | Content |
|------|---------|
| Cheat Sheet | Design kit header, color token chips, master components (Button, Card/Surface, Card/KPI, Input/Text, Layout/PageHeader, List/TransactionItem, List/BudgetStatusRow, Card/Budget (3 variants), Feedback/EmptyState, Nav/TabBar) |
| Prototype | 6 screens: Home (/), Login (/login), Link Bank (/link-bank), Budgets (/budgets), Transactions (/transactions), Settings (/settings) |

### Variable Collections

| Collection | Variables |
|------------|-----------|
| BB Colors | 22 color variables (light + dark modes) |
| BB Spacing | 9 spacing variables (4px-48px) |
| BB Radius | 5 radius variables (6px-9999px) |

---

## Architecture & Documentation Diagrams (FigJam)

- **File**: BetterBudgeter — Architecture & Documentation Diagrams
- **File Key**: `E9fARQDatZcIbXh21I7639`
- **URL**: https://www.figma.com/board/E9fARQDatZcIbXh21I7639

### Diagram Index (28 total)

#### Section A: Architecture (5)
| ID | Name |
|----|------|
| A-1 | C4 Level 1 — System Context |
| A-2 | C4 Level 2 — Container Diagram |
| A-3 | Layer Architecture |
| A-4 | UI Library Boundaries |
| A-5 | Deployment Architecture |

#### Section B: Database Model (3)
| ID | Name |
|----|------|
| B-1 | Full Entity Relationship Diagram |
| B-2 | Budget Domain Model |
| B-3 | RLS Data Isolation |

#### Section C: Routing & Navigation (3)
| ID | Name |
|----|------|
| C-1 | Route Map |
| C-2 | User Journey (New User) |
| C-3 | Middleware Auth Flow |

#### Section D: Core Process Flows (7)
| ID | Name |
|----|------|
| D-1 | Import Pipeline Flow |
| D-2 | Bank Linking Flow |
| D-3 | Authentication Flow |
| D-4 | Budget Notification Trigger |
| D-5 | Dashboard Data Load |
| D-6 | Idempotency Guarantee |
| D-7 | Empty State Decision Tree |

#### Section E: Sequence Diagrams (5)
| ID | Name |
|----|------|
| E-1 | Transaction Import Sequence |
| E-2 | Authentication Sequence |
| E-3 | Dashboard Data Load Sequence |
| E-4 | Mock PSD2 API Sequence |
| E-5 | Budget Notification Trigger Sequence |

#### Section F: State Diagrams (3)
| ID | Name |
|----|------|
| F-1 | Import Button States |
| F-2 | Budget Status States |
| F-3 | Bank Linking States |

#### Section G: Component Structure (2)
| ID | Name |
|----|------|
| G-1 | Dashboard Component Tree |
| G-2 | Settings Component Tree |

---

## Revision History

- **2026-05-29**: M003 fresh rebuild — all 28 FigJam diagrams regenerated (S01), audited (S02), and 6 desktop prototype screens added to Design file (S03). File keys unchanged (rebuilt in-place).
- **2026-05-28**: Initial creation of both Figma files.

Generated: 2026-05-29
