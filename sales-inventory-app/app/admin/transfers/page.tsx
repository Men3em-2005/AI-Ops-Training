import Link from "next/link";
import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import TransferTable from "@/app/components/transfers/TransferTable";
import { buttonPrimary } from "@/app/components/ui";

export default async function AdminTransfersPage() {
  const transfers = await prisma.stockTransfer.findMany({
    orderBy: { createdAt: "desc" },
    include: { fromBranch: true, toBranch: true, items: true },
  });

  return (
    <div>
      <PageHeader
        title="Stock Transfers"
        description="All stock transfers between branches, with a full audit trail of who requested, shipped, and received each one."
        action={
          <Link href="/admin/transfers/new" className={buttonPrimary}>
            New Transfer
          </Link>
        }
      />
      <TransferTable transfers={transfers} basePath="/admin/transfers" />
    </div>
  );
}
