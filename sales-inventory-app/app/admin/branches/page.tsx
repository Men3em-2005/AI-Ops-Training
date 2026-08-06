import Link from "next/link";
import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import { toggleBranchActive } from "@/lib/actions/branches";
import { buttonPrimary, card, linkClass, tdClass, thClass, trClass } from "@/app/components/ui";

export default async function BranchesPage() {
  const branches = await prisma.branch.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { users: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Branches"
        description="Every branch gets a stock row (starting at zero) for each active product automatically."
        action={
          <Link href="/admin/branches/new" className={buttonPrimary}>
            New Branch
          </Link>
        }
      />

      <div className={`${card} overflow-x-auto`}>
        <table className="w-full">
          <thead>
            <tr>
              <th className={thClass}>Name</th>
              <th className={thClass}>Location</th>
              <th className={thClass}>Employees</th>
              <th className={thClass}>Status</th>
              <th className={thClass}></th>
            </tr>
          </thead>
          <tbody>
            {branches.map((b) => (
              <tr key={b.id} className={trClass}>
                <td className={tdClass}>{b.name}</td>
                <td className={tdClass}>{b.location}</td>
                <td className={tdClass}>{b._count.users}</td>
                <td className={tdClass}>{b.active ? "Active" : "Inactive"}</td>
                <td className={tdClass}>
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/branches/${b.id}/edit`} className={linkClass}>
                      Edit
                    </Link>
                    <form action={toggleBranchActive.bind(null, b.id)}>
                      <button type="submit" className={linkClass}>
                        {b.active ? "Deactivate" : "Reactivate"}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {branches.length === 0 && (
              <tr>
                <td className={tdClass} colSpan={5}>
                  No branches yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
