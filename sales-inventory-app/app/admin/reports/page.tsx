import Link from "next/link";
import PageHeader from "@/app/components/PageHeader";
import { card } from "@/app/components/ui";

const REPORTS = [
  { href: "/admin/reports/daily-sales", title: "Daily Sales", description: "Sales by day and branch, last 30 days." },
  { href: "/admin/reports/low-stock", title: "Low Stock", description: "Products below their minimum stock level." },
  { href: "/admin/reports/movers", title: "Fast / Slow Movers", description: "Which products sell quickly vs. sit on shelves." },
  { href: "/admin/reports/branch-performance", title: "Branch Performance", description: "Compare sales and stock health across branches." },
  { href: "/admin/reports/employee-performance", title: "Employee Performance", description: "Sales contribution by employee, last 30 days." },
  { href: "/admin/reports/supplier-performance", title: "Supplier Performance", description: "Delivery lead time and late-order tracking." },
];

export default function AdminReportsPage() {
  return (
    <div>
      <PageHeader title="Reports" description="All reports are exportable to CSV." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((r) => (
          <Link key={r.href} href={r.href} className={`${card} block p-5 hover:border-blue-400`}>
            <h3 className="font-semibold">{r.title}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{r.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
