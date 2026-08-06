import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import PurchaseOrderDetailView from "@/app/components/po/PurchaseOrderDetailView";

export default async function ManagerPurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session?.branchId) redirect("/login");

  const { id } = await params;
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      supplier: true,
      branch: true,
      createdBy: true,
      items: { include: { product: true } },
    },
  });
  if (!po || po.branchId !== session.branchId) notFound();

  return (
    <div>
      <PageHeader title="Purchase Order" />
      <PurchaseOrderDetailView po={po} />
    </div>
  );
}
