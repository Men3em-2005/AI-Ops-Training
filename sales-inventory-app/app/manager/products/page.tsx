import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import SearchInput from "@/app/components/SearchInput";
import { card, tdClass, thClass, trClass } from "@/app/components/ui";

export default async function ManagerProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(q ? { name: { contains: q } } : {}),
    },
    include: { category: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Products"
        description="Company-wide catalog. Product and category data is maintained by the system administrator."
      />

      <div className="mb-4">
        <SearchInput placeholder="Search products..." />
      </div>

      <div className={`${card} overflow-x-auto`}>
        <table className="w-full">
          <thead>
            <tr>
              <th className={thClass}>Name</th>
              <th className={thClass}>Category</th>
              <th className={thClass}>Unit Price</th>
              <th className={thClass}>Unit</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className={trClass}>
                <td className={tdClass}>{p.name}</td>
                <td className={tdClass}>{p.category.name}</td>
                <td className={tdClass}>${p.unitPrice.toFixed(2)}</td>
                <td className={tdClass}>{p.unitOfMeasure}</td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td className={tdClass} colSpan={4}>
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
