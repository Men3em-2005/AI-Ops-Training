import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import ActionForm from "@/app/components/ActionForm";
import { Field } from "@/app/components/FormField";
import { card } from "@/app/components/ui";
import { updateSupplier } from "@/lib/actions/suppliers";

export default async function EditSupplierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplier = await prisma.supplier.findUnique({ where: { id } });
  if (!supplier) notFound();

  const action = updateSupplier.bind(null, id);

  return (
    <div>
      <PageHeader title="Edit Supplier" />
      <div className={`${card} max-w-lg p-6`}>
        <ActionForm action={action} submitLabel="Save Changes">
          <Field label="Supplier Name" name="name" defaultValue={supplier.name} required autoFocus />
          <Field label="Contact Person" name="contactPerson" defaultValue={supplier.contactPerson} required />
          <Field label="Phone" name="phone" defaultValue={supplier.phone} required />
        </ActionForm>
      </div>
    </div>
  );
}
