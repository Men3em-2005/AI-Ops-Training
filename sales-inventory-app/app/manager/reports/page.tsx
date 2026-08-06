import Link from "next/link";
import PageHeader from "@/app/components/PageHeader";
import { card } from "@/app/components/ui";

const REPORTS = [
  { href: "/manager/reports/daily-sales", title: "Daily Sales", description: "Your branch's sales by day, last 30 days." },
  { href: "/manager/reports/low-stock", title: "Low Stock", description: "Products below their minimum stock level at your branch." },
  { href: "/manager/reports/movers", title: "Fast / Slow Movers", description: "Which products sell quickly vs. sit on shelves at your branch." },
  { href: "/manager/reports/employee-performance", title: "Employee Performance", description: "Sales contribution by your staff, last 30 days." },
];

export default function ManagerReportsPage() {
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
