import Link from "next/link";
import { prisma } from "@/lib/db";
import { getBranchPerformance } from "@/lib/reports";
import PageHeader from "@/app/components/PageHeader";
import StatCard from "@/app/components/StatCard";
import LowStockBanner from "@/app/components/LowStockBanner";
import { card, tdClass, thClass, trClass } from "@/app/components/ui";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function AdminDashboardPage() {
  const [todaySales, stock, activePOs, pendingTransfers, branchPerformance] = await Promise.all([
    prisma.sale.aggregate({
      where: { createdAt: { gte: startOfToday() }, status: { not: "CANCELLED" } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.stock.findMany(),
    prisma.purchaseOrder.count({ where: { status: { in: ["DRAFT", "SENT", "PARTIALLY_RECEIVED"] } } }),
    prisma.stockTransfer.count({ where: { status: { in: ["REQUESTED", "IN_TRANSIT"] } } }),
    getBranchPerformance(),
  ]);

  const lowStockCount = stock.filter((s) => s.quantity < s.minStock).length;

  return (
    <div>
      <PageHeader title="Dashboard" description="Company-wide overview across all branches." />

      <div className="mb-6">
        <LowStockBanner count={lowStockCount} href="/admin/reports/low-stock" />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Sales Today" value={`$${(todaySales._sum.total ?? 0).toFixed(2)}`} hint={`${todaySales._count} transactions`} />
        <StatCard label="Low Stock Items" value={lowStockCount} tone={lowStockCount > 0 ? "warning" : "default"} />
        <StatCard label="Active Purchase Orders" value={activePOs} />
        <StatCard label="Pending Transfers" value={pendingTransfers} />
      </div>

      <h2 className="mb-3 text-lg font-semibold">Branch Performance (last 30 days)</h2>
      <div className={`${card} overflow-x-auto`}>
        <table className="w-full">
          <thead>
            <tr>
              <th className={thClass}>Branch</th>
              <th className={thClass}>Sales Count</th>
              <th className={thClass}>Sales Total</th>
              <th className={thClass}>Low Stock Items</th>
            </tr>
          </thead>
          <tbody>
            {branchPerformance.map((b) => (
              <tr key={b.branchName} className={trClass}>
                <td className={tdClass}>{b.branchName}</td>
                <td className={tdClass}>{b.salesCount}</td>
                <td className={tdClass}>${b.salesTotal.toFixed(2)}</td>
                <td className={tdClass}>{b.lowStockCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
        See the full <Link href="/admin/reports" className="text-blue-600 dark:text-blue-400 hover:underline">Reports</Link> section for more detail and CSV export.
      </p>
    </div>
  );
}
