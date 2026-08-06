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

export default async function StaffDashboardPage() {
  const session = await getSession();
  if (!session?.branchId) redirect("/login");
  const branchId = session.branchId;

  const [mySalesToday, stock] = await Promise.all([
    prisma.sale.aggregate({
      where: {
        employeeId: session.userId,
        createdAt: { gte: startOfToday() },
        status: { not: "CANCELLED" },
      },
      _sum: { total: true },
      _count: true,
    }),
    prisma.stock.findMany({ where: { branchId } }),
  ]);

  const lowStockCount = stock.filter((s) => s.quantity < s.minStock).length;

  return (
    <div>
      <PageHeader
        title={`Welcome, ${session.name}`}
        description="Ready to start ringing up sales."
        action={
          <Link href="/staff/sales/new" className={buttonPrimary}>
            New Sale
          </Link>
        }
      />

      <div className="mb-6">
        <LowStockBanner count={lowStockCount} href="/staff/inventory" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="My Sales Today"
          value={`$${(mySalesToday._sum.total ?? 0).toFixed(2)}`}
          hint={`${mySalesToday._count} transactions`}
        />
        <StatCard label="Low Stock Items at Branch" value={lowStockCount} tone={lowStockCount > 0 ? "warning" : "default"} />
      </div>
    </div>
  );
}
