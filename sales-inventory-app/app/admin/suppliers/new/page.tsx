import PageHeader from "@/app/components/PageHeader";
import ActionForm from "@/app/components/ActionForm";
import { Field } from "@/app/components/FormField";
import { card } from "@/app/components/ui";
import { createSupplier } from "@/lib/actions/suppliers";

export default function NewSupplierPage() {
  return (
    <div>
      <PageHeader title="New Supplier" />
      <div className={`${card} max-w-lg p-6`}>
        <ActionForm action={createSupplier} submitLabel="Create Supplier">
          <Field label="Supplier Name" name="name" required autoFocus />
          <Field label="Contact Person" name="contactPerson" required />
          <Field label="Phone" name="phone" required />
        </ActionForm>
      </div>
    </div>
  );
}
