import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import { toggleEmployeeActive } from "@/lib/actions/employees";
import { buttonPrimary, card, linkClass, tdClass, thClass, trClass } from "@/app/components/ui";

export default async function ManagerEmployeesPage() {
  const session = await getSession();
  if (!session?.branchId) redirect("/login");

  const employees = await prisma.user.findMany({
    where: { branchId: session.branchId, role: "STAFF" },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Branch Staff"
        description="Staff assigned to your branch."
        action={
          <Link href="/manager/employees/new" className={buttonPrimary}>
            New Staff
          </Link>
        }
      />

      <div className={`${card} overflow-x-auto`}>
        <table className="w-full">
          <thead>
            <tr>
              <th className={thClass}>Name</th>
              <th className={thClass}>Email</th>
              <th className={thClass}>Status</th>
              <th className={thClass}></th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id} className={trClass}>
                <td className={tdClass}>{e.name}</td>
                <td className={tdClass}>{e.email}</td>
                <td className={tdClass}>{e.active ? "Active" : "Inactive"}</td>
                <td className={tdClass}>
                  <div className="flex items-center gap-3">
                    <Link href={`/manager/employees/${e.id}/edit`} className={linkClass}>
                      Edit
                    </Link>
                    <form action={toggleEmployeeActive.bind(null, e.id)}>
                      <button type="submit" className={linkClass}>
                        {e.active ? "Deactivate" : "Reactivate"}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td className={tdClass} colSpan={4}>
                  No staff yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
