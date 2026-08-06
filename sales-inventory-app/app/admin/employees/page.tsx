import Link from "next/link";
import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import { toggleEmployeeActive } from "@/lib/actions/employees";
import { buttonPrimary, card, linkClass, tdClass, thClass, trClass } from "@/app/components/ui";

export default async function EmployeesPage() {
  const employees = await prisma.user.findMany({
    orderBy: { name: "asc" },
    include: { branch: true },
  });

  return (
    <div>
      <PageHeader
        title="Employees"
        description="Assign a role and branch to each employee. Employee accounts can be deactivated but are never deleted."
        action={
          <Link href="/admin/employees/new" className={buttonPrimary}>
            New Employee
          </Link>
        }
      />

      <div className={`${card} overflow-x-auto`}>
        <table className="w-full">
          <thead>
            <tr>
              <th className={thClass}>Name</th>
              <th className={thClass}>Email</th>
              <th className={thClass}>Role</th>
              <th className={thClass}>Branch</th>
              <th className={thClass}>Status</th>
              <th className={thClass}></th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id} className={trClass}>
                <td className={tdClass}>{e.name}</td>
                <td className={tdClass}>{e.email}</td>
                <td className={tdClass}>{e.role}</td>
                <td className={tdClass}>{e.branch?.name ?? "—"}</td>
                <td className={tdClass}>{e.active ? "Active" : "Inactive"}</td>
                <td className={tdClass}>
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/employees/${e.id}/edit`} className={linkClass}>
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
