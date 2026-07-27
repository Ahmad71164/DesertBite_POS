# Restaurant Pro ERP & POS

Modern, responsive Restaurant POS and Management Dashboard built as a monorepo:

- `apps/api`: Node.js + Express + Prisma (SQLite local DB, cloud-ready by switching datasource)
- `apps/web`: React + Vite responsive dashboard and POS interface
- `packages/shared`: shared types/constants

## Implemented Modules

- Authentication: login, change password
- RBAC: Super Admin, Owner, Manager, Cashier, Waiter, Kitchen
- Dashboard KPIs: today/weekly/monthly/yearly sales, order counters, AOV
- POS: menu grid, cart, qty controls, line removal, subtotal
- Orders: create order, list orders, update order status
- KDS: kitchen queue endpoint with live statuses
- Tables: create/list dining tables
- Menu: categories and menu items CRUD (core create + list)
- Inventory: add/list inventory with low-stock fields
- Reports: period sales endpoint
- Receipt: thermal-style PDF endpoint (`/api/receipt/:id.pdf`)
- Dark/Light theme + responsive layout

## Setup (Windows)

1. Open PowerShell in the project folder (must contain `package.json`).
2. Run automated setup:
   - `powershell -ExecutionPolicy Bypass -File .\setup.ps1`
3. Start app in **two terminals** (recommended if `npm run dev` fails):
   - Terminal 1: `npm run dev:api`
   - Terminal 2: `npm run dev:web`

### If `npm install` fails with esbuild EBUSY / UNKNOWN

- Close Cursor/VS Code terminals and stop Node: `Get-Process node | Stop-Process -Force`
- Delete `node_modules` folders, then run `setup.ps1` again
- If Windows Defender blocks `esbuild.exe`, add the project folder to exclusions and retry

## Default Credentials

- Email: `admin@restaurant.local`
- Password: `admin123`
- Cashier: `cashier@desertbite.local` / `cashier123`

## Desert Bite Menu (Pre-loaded)

Full menu from your flyers is seeded automatically:
- Burgers, Shawarma, Pratha Rolls
- Pizza (Regular / Special / Over Special) with S/M/L/XL sizes
- Fried Items, Wings, Fries, Sandwiches, Pasta & Rice
- Burger Deals, Pizza Deals, Friends & Family, Super Deals, Birthday Deal

## POS Calculations

- **Subtotal** = sum of (price × qty)
- **Discount** = fixed Rs or % (capped at subtotal)
- **Tax** = (subtotal − discount) × tax rate (default 5%)
- **Service Charge** = subtotal × service rate (default 0%)
- **Total** = subtotal − discount + tax + service charge

Re-seed menu after updates:
```powershell
npm run db:push
npm run db:seed
```

## Cloud-Ready Notes

- Replace Prisma datasource from SQLite to PostgreSQL/MySQL for production cloud DB
- Add Redis pub/sub or WebSocket for real-time kitchen/table/order broadcasting
- Add object storage for menu image uploads (S3-compatible)
- Add worker queue for backup jobs, alerts, and report exports

## Next Production Extensions

- Complete forgot-password flow with token email delivery
- Full CRUD for all management modules (employees, customers, reservations, coupons, loyalty)
- Advanced analytics visualizations and export pipeline (PDF/Excel/CSV)
- Receipt printer integration (ESC/POS)
- Offline synchronization and auto backup scheduler
- Audit log and activity trail pages
