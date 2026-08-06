import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import TransferDetailView from "@/app/components/transfers/TransferDetailView";

export default async function AdminTransferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const transfer = await prisma.stockTransfer.findUnique({
    where: { id },
    include: {
      fromBranch: true,
      toBranch: true,
      requestedBy: true,
      items: { include: { product: true } },
    },
  });
  if (!transfer) notFound();

  return (
    <div>
      <PageHeader title="Stock Transfer" />
      <TransferDetailView transfer={transfer} canShip canReceive canCancel />
    </div>
  );
}
