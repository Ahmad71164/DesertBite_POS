# Desert Bite ERP & POS — Enterprise Architecture

> Target: Commercial SaaS-grade Restaurant ERP comparable to Foodics, Toast, Square.

## Phase Roadmap

| Phase | Focus | Status |
|-------|-------|--------|
| **1** | Foundation: Schema, UI shell, Customer CRM, Checkout flow, Executive Dashboard | **In Progress** |
| **2** | POS 2.0: Modifiers, combos, hold/resume, split bill, favorites | Planned |
| **3** | KDS 2.0: Real-time, timers, stations, sound alerts | Planned |
| **4** | Inventory + Recipes + Auto deduction | Planned |
| **5** | Finance, Payroll, Purchasing, Suppliers | Planned |
| **6** | Multi-branch, Delivery, Marketing, Loyalty engine | Planned |
| **7** | BI Analytics, ML-ready forecasting, Report scheduler | Planned |
| **8** | Security hardening, Docker, CI/CD, PostgreSQL migration | Planned |

## Monorepo Structure (Target)

```
restaurant-pro-erp-pos/
├── apps/
│   ├── api/                    # Express API v1
│   │   ├── src/
│   │   │   ├── modules/        # Domain modules (orders, customers, inventory...)
│   │   │   ├── middleware/     # auth, rbac, audit, rate-limit
│   │   │   ├── services/       # business logic
│   │   │   └── server.ts
│   │   └── prisma/
│   ├── web/                    # React ERP dashboard
│   └── worker/                 # (Phase 8) Background jobs, reports, notifications
├── packages/
│   ├── shared/                 # Types, validators, calculations
│   └── ui/                     # (Phase 2) Shared component library
├── docker/
├── docs/
└── scripts/
```

## Database Domains

### Core (Phase 1)
- **Identity**: User, Role, Permission, Session, AuditLog
- **Organization**: Branch, RestaurantSettings
- **CRM**: Customer (profile, loyalty, tiers, visit history)
- **Sales**: Order, OrderItem, Payment
- **Menu**: Category, MenuItem, Modifier (Phase 2)
- **Operations**: DiningTable, Reservation (Phase 3)

### Supply Chain (Phase 4–5)
- InventoryItem, Recipe, StockMovement, Supplier, PurchaseOrder, GoodsReceipt

### People (Phase 5)
- EmployeeProfile, Attendance, Shift, PayrollRun, Commission

### Finance (Phase 5)
- Expense, ExpenseCategory, Account, JournalEntry, TaxReport

### Growth (Phase 6)
- Coupon, Campaign, LoyaltyReward, GiftCard, Referral

## API Design

```
/api/v1/auth/*          JWT + refresh tokens (Phase 8)
/api/v1/customers/*     CRM CRUD, search, loyalty
/api/v1/orders/*        POS, hold, merge, split
/api/v1/menu/*
/api/v1/inventory/*
/api/v1/kds/*
/api/v1/reports/*       PDF, Excel, CSV export
/api/v1/analytics/*     BI dashboards
/api/v1/branches/*
/api/v1/audit/*
```

## UI/UX System

- **Stack**: React 18, TailwindCSS, Framer Motion, Lucide icons, Radix primitives
- **Theme**: Light/Dark with CSS variables, glassmorphism accents
- **Patterns**: Page transitions, skeleton loaders, toast notifications, empty/error states
- **Layout**: Collapsible sidebar, module groups, role-based visibility

## POS Checkout Flow (Phase 1)

```
Cart → Pay → Checkout Modal
  ├── Order type (Dine In / Take Away / Delivery)
  ├── Customer details (required for Delivery/Take Away)
  │     Name, Mobile*, Email, Address*, City, Area, Notes
  ├── Payment method + tip
  ├── Discount
  └── Confirm → Upsert Customer → Create Order → Receipt
```

## Security (Target)

- JWT + refresh tokens, RBAC permission matrix
- Audit log on all mutations
- Rate limiting, 2FA (Phase 8)
- Field-level encryption for PII (Phase 8)

## Deployment (Target)

- Docker Compose: api + web + postgres + redis
- Environment-based config
- Automated backups, health checks
- CI: lint → test → build → deploy

## Default Branch

Single branch seeded: **Desert Bite Layyah (Main)** — multi-branch UI ready in Phase 6.
