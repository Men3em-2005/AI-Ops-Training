import Link from "next/link";
import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import SearchInput from "@/app/components/SearchInput";
import { toggleProductActive } from "@/lib/actions/products";
import {
  buttonPrimary,
  buttonSecondary,
  card,
  linkClass,
  tdClass,
  thClass,
  trClass,
} from "@/app/components/ui";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        ...(q ? { name: { contains: q } } : {}),
        ...(category ? { categoryId: category } : {}),
      },
      include: { category: true },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Products"
        description="Search by name or filter by category. Products are never hard-deleted — deactivate instead to preserve purchase/sales history."
        action={
          <Link href="/admin/products/new" className={buttonPrimary}>
            New Product
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput placeholder="Search products..." />
        <form className="flex items-center gap-2">
          <select
            name="category"
            defaultValue={category ?? ""}
            className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm shadow-sm"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button type="submit" className={buttonSecondary}>
            Filter
          </button>
        </form>
      </div>

      <div className={`${card} overflow-x-auto`}>
        <table className="w-full">
          <thead>
            <tr>
              <th className={thClass}>Name</th>
              <th className={thClass}>Category</th>
              <th className={thClass}>Unit Price</th>
              <th className={thClass}>Unit</th>
              <th className={thClass}>Default Min Stock</th>
              <th className={thClass}>Status</th>
              <th className={thClass}></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className={trClass}>
                <td className={tdClass}>{p.name}</td>
                <td className={tdClass}>{p.category.name}</td>
                <td className={tdClass}>${p.unitPrice.toFixed(2)}</td>
                <td className={tdClass}>{p.unitOfMeasure}</td>
                <td className={tdClass}>{p.defaultMinStock}</td>
                <td className={tdClass}>{p.active ? "Active" : "Inactive"}</td>
                <td className={tdClass}>
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/products/${p.id}/edit`} className={linkClass}>
                      Edit
                    </Link>
                    <form action={toggleProductActive.bind(null, p.id)}>
                      <button type="submit" className={linkClass}>
                        {p.active ? "Deactivate" : "Reactivate"}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td className={tdClass} colSpan={7}>
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
