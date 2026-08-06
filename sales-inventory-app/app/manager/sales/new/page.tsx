import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import POSForm from "@/app/components/pos/POSForm";
import { card } from "@/app/components/ui";

export default async function ManagerNewSalePage() {
  const session = await getSession();
  if (!session?.branchId) redirect("/login");

  const stock = await prisma.stock.findMany({
    where: { branchId: session.branchId, quantity: { gt: 0 } },
    include: { product: true },
    orderBy: { product: { name: "asc" } },
  });
  const products = stock.map((s) => ({
    id: s.product.id,
    name: s.product.name,
    unitPrice: s.product.unitPrice,
    unitOfMeasure: s.product.unitOfMeasure,
  }));

  return (
    <div>
      <PageHeader title="New Sale" description="Only products currently in stock at your branch are listed." />
      <div className={`${card} max-w-3xl p-6`}>
        <POSForm products={products} />
      </div>
    </div>
  );
}
