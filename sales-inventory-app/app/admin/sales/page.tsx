import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import SalesTable from "@/app/components/sales/SalesTable";

export default async function AdminSalesPage() {
  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: "desc" },
    include: { branch: true, employee: true, customer: true },
    take: 200,
  });

  return (
    <div>
      <PageHeader title="Sales" description="All sales across every branch (most recent 200)." />
      <SalesTable sales={sales} basePath="/admin/sales" showBranch />
    </div>
  );
}
