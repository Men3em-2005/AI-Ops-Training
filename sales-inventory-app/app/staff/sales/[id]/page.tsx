import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import ReceiptView from "@/app/components/sales/ReceiptView";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default async function StaffSaleDetailPage({
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

  const canCancel =
    sale.status === "COMPLETED" &&
    sale.employeeId === session.userId &&
    isSameDay(sale.createdAt, new Date());

  return (
    <div>
      <PageHeader title="Sale Receipt" />
      <ReceiptView sale={sale} canCancel={canCancel} canRefund={false} />
    </div>
  );
}
