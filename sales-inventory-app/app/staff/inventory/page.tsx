import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import SearchInput from "@/app/components/SearchInput";
import InventoryTable from "@/app/components/InventoryTable";

export default async function StaffInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getSession();
  if (!session?.branchId) redirect("/login");
  const { q } = await searchParams;

  const stock = await prisma.stock.findMany({
    where: {
      branchId: session.branchId,
      product: q ? { name: { contains: q } } : undefined,
    },
    include: { product: true, branch: true },
    orderBy: { product: { name: "asc" } },
  });

  return (
    <div>
      <PageHeader title="Inventory" description="Stock levels for your branch." />
      <div className="mb-4">
        <SearchInput placeholder="Search products..." />
      </div>
      <InventoryTable stock={stock} showBranch={false} editable={false} />
    </div>
  );
}
