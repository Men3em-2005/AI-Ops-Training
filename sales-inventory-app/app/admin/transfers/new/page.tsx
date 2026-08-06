import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import ActionForm from "@/app/components/ActionForm";
import { SelectField } from "@/app/components/FormField";
import TransferItemRows from "@/app/components/transfers/TransferItemRows";
import { card } from "@/app/components/ui";
import { createTransfer } from "@/lib/actions/transfers";

export default async function NewTransferPage() {
  const [branches, products] = await Promise.all([
    prisma.branch.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.product.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title="New Stock Transfer" />
      <div className={`${card} max-w-3xl p-6`}>
        <ActionForm action={createTransfer} submitLabel="Request Transfer">
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="From Branch (sending stock)" name="fromBranchId" required defaultValue="">
              <option value="" disabled>
                Select a branch
              </option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </SelectField>
            <SelectField label="To Branch (receiving stock)" name="toBranchId" required defaultValue="">
              <option value="" disabled>
                Select a branch
              </option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </SelectField>
          </div>
          <TransferItemRows products={products} />
        </ActionForm>
      </div>
    </div>
  );
}
