import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import ActionForm from "@/app/components/ActionForm";
import { Field, SelectField } from "@/app/components/FormField";
import PurchaseOrderItemRows from "@/app/components/po/PurchaseOrderItemRows";
import { card } from "@/app/components/ui";
import { createPurchaseOrder } from "@/lib/actions/purchaseOrders";

export default async function NewPurchaseOrderPage() {
  const [suppliers, branches, products] = await Promise.all([
    prisma.supplier.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.branch.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.product.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title="New Purchase Order" />
      <div className={`${card} max-w-3xl p-6`}>
        <ActionForm action={createPurchaseOrder} submitLabel="Create Purchase Order">
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Branch" name="branchId" required defaultValue="">
              <option value="" disabled>
                Select a branch
              </option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </SelectField>
            <SelectField label="Supplier" name="supplierId" required defaultValue="">
              <option value="" disabled>
                Select a supplier
              </option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </SelectField>
          </div>
          <Field label="Expected Date (optional)" name="expectedDate" type="date" />
          <PurchaseOrderItemRows products={products} />
        </ActionForm>
      </div>
    </div>
  );
}
