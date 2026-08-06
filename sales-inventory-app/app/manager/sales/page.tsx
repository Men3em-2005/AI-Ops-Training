import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import SalesTable from "@/app/components/sales/SalesTable";
import { buttonPrimary } from "@/app/components/ui";

export default async function ManagerSalesPage() {
  const session = await getSession();
  if (!session?.branchId) redirect("/login");

  const sales = await prisma.sale.findMany({
    where: { branchId: session.branchId },
    orderBy: { createdAt: "desc" },
    include: { branch: true, employee: true, customer: true },
    take: 200,
  });

  return (
    <div>
      <PageHeader
        title="Sales"
        description="Sales recorded at your branch (most recent 200)."
        action={
          <Link href="/manager/sales/new" className={buttonPrimary}>
            New Sale
          </Link>
        }
      />
      <SalesTable sales={sales} basePath="/manager/sales" showBranch={false} />
    </div>
  );
}
