# BrightWay Sales & Inventory Management System (V1)

A full-stack web app implementing the V1 PRD for BrightWay Retail Group: products & categories, suppliers, purchase orders, inventory & stock transfers, sales/POS with receipts, customers, employees & branches, reports, and role-based access — built around three role-based points of view: **Administrator**, **Branch Manager**, and **Staff**.

## Tech Stack

- **Next.js 16** (App Router, TypeScript, Turbopack) — pages are server components; mutations are Server Actions.
- **Prisma 7 + SQLite** (via `@prisma/adapter-better-sqlite3`) — single-file database, zero external setup.
- **Custom auth** — bcrypt-hashed passwords + a signed JWT session cookie (`jose`), enforced in `proxy.ts` (Next 16's renamed `middleware.ts`) and re-checked inside every Server Action.
- **Tailwind CSS v4** — light/dark aware throughout.

## Getting Started

```bash
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Then open <http://localhost:3000> — it redirects to `/login`.

> Prisma 7's `migrate dev` does **not** automatically regenerate the client — if you change `prisma/schema.prisma`, run `npx prisma generate` before `npx prisma db seed` or starting the app, or you'll see "column does not exist" errors.

### Demo accounts

All seeded accounts use the password `password123`.

| Role | Email | Scope |
|---|---|---|
| Administrator | `admin@brightway.com` | All branches |
| Branch Manager | `manager.downtown@brightway.com` | Downtown |
| Branch Manager | `manager.uptown@brightway.com` | Uptown |
| Branch Manager | `manager.eastside@brightway.com` | Eastside |
| Staff | `staff.downtown@brightway.com` | Downtown |
| Staff | `staff.uptown@brightway.com` | Uptown |
| Staff | `staff.eastside@brightway.com` | Eastside |

The seed script (`prisma/seed.ts`) also creates 3 branches, 5 categories, 16 products, 3 suppliers, sample purchase orders in every status, sample stock transfers in every status, and ~2 weeks of sales history (including a refunded sale) so every screen has real data on first run.

## Role → Permission Summary

| Area | Admin | Branch Manager | Staff |
|---|---|---|---|
| Products & Categories | full CRUD (deactivate, not delete) | view/search | view/search |
| Suppliers | full CRUD (deactivate, not delete) | view | view |
| Purchase Orders | any branch | own branch | own branch |
| Inventory & thresholds | view/edit any branch | view/edit own branch | view own branch |
| Stock Transfers | any branch | own branch (send/receive) | own branch (send/receive) |
| Sales / POS | view/refund/cancel any | record + view + refund/cancel own branch | record + view own sales, same-day cancel only |
| Customers | company-wide | own branch | — |
| Employees & Branches | full CRUD, any role/branch | manage Staff within own branch | — |
| Reports | company-wide + CSV export | own branch + CSV export | — |

Every one of these boundaries is enforced **server-side** inside the relevant Server Action (`lib/actions/*.ts`) or query — the `proxy.ts` route guard and the UI navigation are a convenience layer on top, not the actual security boundary.

## Where the PRD's Open Questions Were Resolved

The PRD (and the BRD behind it) left several behaviors undefined. This build resolves them with concrete, documented defaults — visible in-app at **Admin → Assumptions** (`/admin/assumptions`) — rather than leaving them unbuilt:

- **Delete vs. deactivate** — products and suppliers are never hard-deleted, only deactivated/reactivated, so purchase order and sales history stays intact.
- **Cancel vs. refund** — `CANCELLED` (same-day, any role, no reason required) vs. `REFUNDED` (manager/admin only, any time, reason required). Both restock the items.
- **Purchase order statuses** — `DRAFT → SENT → PARTIALLY_RECEIVED → RECEIVED`, or `CANCELLED` before `RECEIVED`.
- **Partial deliveries** — each order line tracks ordered vs. received quantity independently; the order's overall status is derived from its lines.
- **Minimum stock level** — a per-product default, applied per-branch, overridable per branch on the Inventory page.
- **Stock transfer accountability** (the BRD's core pain point) — transfers move through `REQUESTED → IN_TRANSIT → COMPLETED`; stock leaves the sender's count only once shipped and arrives at the receiver's count only once confirmed, with both branches and the requester recorded.
- **Reports** — all exportable to CSV, scoped identically to what's on screen.

## Project Structure

```
prisma/schema.prisma      Data model (see file — SQLite has no native enum, so role/status
                           fields are plain strings; allowed values live in lib/types.ts)
prisma/seed.ts             Demo data
lib/db.ts                  Prisma client singleton (better-sqlite3 driver adapter)
lib/auth.ts                Password hashing + JWT session cookie
lib/permissions.ts         Shared role/branch-scoping helpers
lib/reports.ts             Report query functions (shared by pages and the CSV export route)
lib/actions/*.ts           Server Actions, one file per domain (products, sales, transfers, ...)
proxy.ts                   Route guard: redirects to /login or the caller's own role area
app/admin/**  app/manager/**  app/staff/**   Role-scoped route trees
app/components/**          Shared UI (Sidebar, forms, tables, POS form, receipts, reports)
app/api/reports/export     CSV export endpoint
```

## Verifying It Works

This was manually driven end-to-end with Playwright against the dev server: logged in as each role, browsed every nav page, created and sent a purchase order as a manager, and completed + cancelled a sale as staff (stock, receipts, and status transitions all update correctly). `npx tsc --noEmit` and `npx next build` both pass cleanly.
