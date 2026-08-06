import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import SearchInput from "@/app/components/SearchInput";
import { card, tdClass, thClass, trClass } from "@/app/components/ui";

const FREQUENT_THRESHOLD = 3;

export default async function ManagerCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getSession();
  if (!session?.branchId) redirect("/login");
  const { q } = await searchParams;

  const stats = await prisma.sale.groupBy({
    by: ["customerId"],
    where: { branchId: session.branchId, customerId: { not: null }, status: { not: "CANCELLED" } },
    _count: { _all: true },
    _sum: { total: true },
  });

  const customerIds = stats.map((s) => s.customerId).filter((id): id is string => !!id);
  const customers = await prisma.customer.findMany({
    where: {
      id: { in: customerIds },
      ...(q ? { OR: [{ name: { contains: q } }, { phone: { contains: q } }] } : {}),
    },
    orderBy: { name: "asc" },
  });
  const statsMap = new Map(stats.map((s) => [s.customerId, s]));

  return (
    <div>
      <PageHeader
        title="Customers"
        description={`Customers who have purchased at your branch. ${FREQUENT_THRESHOLD}+ purchases are flagged as frequent.`}
      />
      <div className="mb-4">
        <SearchInput placeholder="Search by name or phone..." />
      </div>

      <div className={`${card} overflow-x-auto`}>
        <table className="w-full">
          <thead>
            <tr>
              <th className={thClass}>Name</th>
              <th className={thClass}>Phone</th>
              <th className={thClass}>Purchases</th>
              <th className={thClass}>Lifetime Spend</th>
              <th className={thClass}></th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => {
              const stat = statsMap.get(c.id);
              const count = stat?._count._all ?? 0;
              return (
                <tr key={c.id} className={trClass}>
                  <td className={tdClass}>{c.name}</td>
                  <td className={tdClass}>{c.phone}</td>
                  <td className={tdClass}>{count}</td>
                  <td className={tdClass}>${(stat?._sum.total ?? 0).toFixed(2)}</td>
                  <td className={tdClass}>
                    {count >= FREQUENT_THRESHOLD && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-950 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                        Frequent
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {customers.length === 0 && (
              <tr>
                <td className={tdClass} colSpan={5}>
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
