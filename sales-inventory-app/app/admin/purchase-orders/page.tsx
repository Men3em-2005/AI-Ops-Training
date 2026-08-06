import Link from "next/link";
import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import PurchaseOrderTable from "@/app/components/po/PurchaseOrderTable";
import { buttonPrimary } from "@/app/components/ui";

export default async function AdminPurchaseOrdersPage() {
  const purchaseOrders = await prisma.purchaseOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: { supplier: true, branch: true, items: true },
  });

  return (
    <div>
      <PageHeader
        title="Purchase Orders"
        description="All purchase orders across every branch."
        action={
          <Link href="/admin/purchase-orders/new" className={buttonPrimary}>
            New Purchase Order
          </Link>
        }
      />
      <PurchaseOrderTable purchaseOrders={purchaseOrders} basePath="/admin/purchase-orders" showBranch />
    </div>
  );
}
