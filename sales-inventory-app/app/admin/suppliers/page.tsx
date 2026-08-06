import Link from "next/link";
import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import { toggleSupplierActive } from "@/lib/actions/suppliers";
import { buttonPrimary, card, linkClass, tdClass, thClass, trClass } from "@/app/components/ui";

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader
        title="Suppliers"
        description="Suppliers are contacted directly by phone/email outside this system for V1; the system keeps their contact details and purchase order history."
        action={
          <Link href="/admin/suppliers/new" className={buttonPrimary}>
            New Supplier
          </Link>
        }
      />

      <div className={`${card} overflow-x-auto`}>
        <table className="w-full">
          <thead>
            <tr>
              <th className={thClass}>Name</th>
              <th className={thClass}>Contact Person</th>
              <th className={thClass}>Phone</th>
              <th className={thClass}>Status</th>
              <th className={thClass}></th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id} className={trClass}>
                <td className={tdClass}>{s.name}</td>
                <td className={tdClass}>{s.contactPerson}</td>
                <td className={tdClass}>{s.phone}</td>
                <td className={tdClass}>{s.active ? "Active" : "Inactive"}</td>
                <td className={tdClass}>
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/suppliers/${s.id}/edit`} className={linkClass}>
                      Edit
                    </Link>
                    <form action={toggleSupplierActive.bind(null, s.id)}>
                      <button type="submit" className={linkClass}>
                        {s.active ? "Deactivate" : "Reactivate"}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && (
              <tr>
                <td className={tdClass} colSpan={5}>
                  No suppliers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
