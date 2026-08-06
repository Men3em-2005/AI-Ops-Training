import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import ReceiptView from "@/app/components/sales/ReceiptView";

export default async function ManagerSaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session?.branchId) redirect("/login");

  const { id } = await params;
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      branch: true,
      employee: true,
      customer: true,
      items: { include: { product: true } },
    },
  });
  if (!sale || sale.branchId !== session.branchId) notFound();

  return (
    <div>
      <PageHeader title="Sale Receipt" />
      <ReceiptView sale={sale} canCancel={sale.status === "COMPLETED"} canRefund={sale.status === "COMPLETED"} />
    </div>
  );
}
