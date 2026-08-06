import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import PurchaseOrderTable from "@/app/components/po/PurchaseOrderTable";
import { buttonPrimary } from "@/app/components/ui";

export default async function StaffPurchaseOrdersPage() {
  const session = await getSession();
  if (!session?.branchId) redirect("/login");

  const purchaseOrders = await prisma.purchaseOrder.findMany({
    where: { branchId: session.branchId },
    orderBy: { createdAt: "desc" },
    include: { supplier: true, branch: true, items: true },
  });

  return (
    <div>
      <PageHeader
        title="Purchase Orders"
        description="Purchase orders for your branch."
        action={
          <Link href="/staff/purchase-orders/new" className={buttonPrimary}>
            New Purchase Order
          </Link>
        }
      />
      <PurchaseOrderTable purchaseOrders={purchaseOrders} basePath="/staff/purchase-orders" showBranch={false} />
    </div>
  );
}
