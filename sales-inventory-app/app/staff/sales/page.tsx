import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import SalesTable from "@/app/components/sales/SalesTable";
import { buttonPrimary } from "@/app/components/ui";

export default async function StaffSalesPage() {
  const session = await getSession();
  if (!session?.branchId) redirect("/login");

  const sales = await prisma.sale.findMany({
    where: { employeeId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { branch: true, employee: true, customer: true },
    take: 200,
  });

  return (
    <div>
      <PageHeader
        title="My Sales"
        description="Sales you have recorded (most recent 200)."
        action={
          <Link href="/staff/sales/new" className={buttonPrimary}>
            New Sale
          </Link>
        }
      />
      <SalesTable sales={sales} basePath="/staff/sales" showBranch={false} />
    </div>
  );
}
