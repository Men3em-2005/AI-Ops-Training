import Link from "next/link";
import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import { buttonPrimary, card, linkClass, tdClass, thClass, trClass } from "@/app/components/ui";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Group products for browsing and reporting."
        action={
          <Link href="/admin/categories/new" className={buttonPrimary}>
            New Category
          </Link>
        }
      />

      <div className={`${card} overflow-x-auto`}>
        <table className="w-full">
          <thead>
            <tr>
              <th className={thClass}>Name</th>
              <th className={thClass}>Products</th>
              <th className={thClass}></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className={trClass}>
                <td className={tdClass}>{c.name}</td>
                <td className={tdClass}>{c._count.products}</td>
                <td className={tdClass}>
                  <Link href={`/admin/categories/${c.id}/edit`} className={linkClass}>
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td className={tdClass} colSpan={3}>
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
