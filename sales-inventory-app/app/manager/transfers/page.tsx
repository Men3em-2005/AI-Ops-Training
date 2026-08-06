import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import TransferTable from "@/app/components/transfers/TransferTable";
import { buttonPrimary } from "@/app/components/ui";

export default async function ManagerTransfersPage() {
  const session = await getSession();
  if (!session?.branchId) redirect("/login");

  const transfers = await prisma.stockTransfer.findMany({
    where: { OR: [{ fromBranchId: session.branchId }, { toBranchId: session.branchId }] },
    orderBy: { createdAt: "desc" },
    include: { fromBranch: true, toBranch: true, items: true },
  });

  return (
    <div>
      <PageHeader
        title="Stock Transfers"
        description="Incoming and outgoing transfers involving your branch."
        action={
          <Link href="/manager/transfers/new" className={buttonPrimary}>
            New Transfer
          </Link>
        }
      />
      <TransferTable transfers={transfers} basePath="/manager/transfers" />
    </div>
  );
}
