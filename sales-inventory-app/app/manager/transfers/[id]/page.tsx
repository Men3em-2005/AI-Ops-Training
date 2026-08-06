import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import TransferDetailView from "@/app/components/transfers/TransferDetailView";

export default async function ManagerTransferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session?.branchId) redirect("/login");

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
  if (!transfer || (transfer.fromBranchId !== session.branchId && transfer.toBranchId !== session.branchId)) {
    notFound();
  }

  return (
    <div>
      <PageHeader title="Stock Transfer" />
      <TransferDetailView
        transfer={transfer}
        canShip={transfer.fromBranchId === session.branchId}
        canReceive={transfer.toBranchId === session.branchId}
        canCancel
      />
    </div>
  );
}
