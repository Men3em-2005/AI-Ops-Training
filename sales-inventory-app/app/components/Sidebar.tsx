"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/session-actions";
import type { Role } from "@/lib/types";

interface NavItem {
  href: string;
  label: string;
}

const NAV: Record<Role, NavItem[]> = {
  ADMIN: [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/categories", label: "Categories" },
    { href: "/admin/suppliers", label: "Suppliers" },
    { href: "/admin/purchase-orders", label: "Purchase Orders" },
    { href: "/admin/inventory", label: "Inventory" },
    { href: "/admin/transfers", label: "Stock Transfers" },
    { href: "/admin/sales", label: "Sales" },
    { href: "/admin/customers", label: "Customers" },
    { href: "/admin/employees", label: "Employees" },
    { href: "/admin/branches", label: "Branches" },
    { href: "/admin/reports", label: "Reports" },
    { href: "/admin/assumptions", label: "Assumptions" },
  ],
  MANAGER: [
    { href: "/manager/dashboard", label: "Dashboard" },
    { href: "/manager/products", label: "Products" },
    { href: "/manager/purchase-orders", label: "Purchase Orders" },
    { href: "/manager/inventory", label: "Inventory" },
    { href: "/manager/transfers", label: "Stock Transfers" },
    { href: "/manager/sales", label: "Sales" },
    { href: "/manager/customers", label: "Customers" },
    { href: "/manager/employees", label: "Employees" },
    { href: "/manager/reports", label: "Reports" },
  ],
  STAFF: [
    { href: "/staff/dashboard", label: "Dashboard" },
    { href: "/staff/sales/new", label: "New Sale" },
    { href: "/staff/sales", label: "Sales" },
    { href: "/staff/inventory", label: "Inventory" },
    { href: "/staff/transfers", label: "Stock Transfers" },
    { href: "/staff/purchase-orders", label: "Purchase Orders" },
  ],
};

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Administrator",
  MANAGER: "Branch Manager",
  STAFF: "Staff",
};

export default function Sidebar({
  role,
  name,
  branchName,
}: {
  role: Role;
  name: string;
  branchName?: string | null;
}) {
  const pathname = usePathname();

  return (
    <aside className="print:hidden flex h-full w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="border-b border-slate-200 dark:border-slate-800 px-4 py-4">
        <p className="text-sm font-semibold">BrightWay Retail</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {ROLE_LABEL[role]}
          {branchName ? ` · ${branchName}` : ""}
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {NAV[role].map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 dark:border-slate-800 p-3">
        <p className="truncate px-1 pb-2 text-xs text-slate-500 dark:text-slate-400">
          {name}
        </p>
        <form action={logout}>
          <button
            type="submit"
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
