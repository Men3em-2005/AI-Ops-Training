import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import PurchaseOrderDetailView from "@/app/components/po/PurchaseOrderDetailView";

export default async function AdminPurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
  if (!po) notFound();

  return (
    <div>
      <PageHeader title="Purchase Order" />
      <PurchaseOrderDetailView po={po} />
    </div>
  );
}
