import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import SearchInput from "@/app/components/SearchInput";
import InventoryTable from "@/app/components/InventoryTable";
import { buttonSecondary } from "@/app/components/ui";

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; branch?: string }>;
}) {
  const { q, branch } = await searchParams;

  const [stock, branches] = await Promise.all([
    prisma.stock.findMany({
      where: {
        ...(branch ? { branchId: branch } : {}),
        product: q ? { name: { contains: q } } : undefined,
      },
      include: { product: true, branch: true },
      orderBy: [{ branch: { name: "asc" } }, { product: { name: "asc" } }],
    }),
    prisma.branch.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Stock levels across every branch. Minimum stock is a per-branch, per-product threshold set here or when the product is created."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput placeholder="Search products..." />
        <form className="flex items-center gap-2">
          <select
            name="branch"
            defaultValue={branch ?? ""}
            className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm shadow-sm"
          >
            <option value="">All branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <button type="submit" className={buttonSecondary}>
            Filter
          </button>
        </form>
      </div>

      <InventoryTable stock={stock} showBranch editable />
    </div>
  );
}
