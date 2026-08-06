import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import StatCard from "@/app/components/StatCard";
import LowStockBanner from "@/app/components/LowStockBanner";
import { buttonPrimary } from "@/app/components/ui";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function ManagerDashboardPage() {
  const session = await getSession();
  if (!session?.branchId) redirect("/login");
  const branchId = session.branchId;

  const [todaySales, stock, activePOs, pendingTransfers] = await Promise.all([
    prisma.sale.aggregate({
      where: { branchId, createdAt: { gte: startOfToday() }, status: { not: "CANCELLED" } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.stock.findMany({ where: { branchId } }),
    prisma.purchaseOrder.count({ where: { branchId, status: { in: ["DRAFT", "SENT", "PARTIALLY_RECEIVED"] } } }),
    prisma.stockTransfer.count({
      where: {
        status: { in: ["REQUESTED", "IN_TRANSIT"] },
        OR: [{ fromBranchId: branchId }, { toBranchId: branchId }],
      },
    }),
  ]);

  const lowStockCount = stock.filter((s) => s.quantity < s.minStock).length;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your branch at a glance."
        action={
          <Link href="/manager/sales/new" className={buttonPrimary}>
            New Sale
          </Link>
        }
      />

      <div className="mb-6">
        <LowStockBanner count={lowStockCount} href="/manager/reports/low-stock" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Sales Today" value={`$${(todaySales._sum.total ?? 0).toFixed(2)}`} hint={`${todaySales._count} transactions`} />
        <StatCard label="Low Stock Items" value={lowStockCount} tone={lowStockCount > 0 ? "warning" : "default"} />
        <StatCard label="Active Purchase Orders" value={activePOs} />
        <StatCard label="Pending Transfers" value={pendingTransfers} />
      </div>
    </div>
  );
}
