import PageHeader from "@/app/components/PageHeader";
import ActionForm from "@/app/components/ActionForm";
import { Field } from "@/app/components/FormField";
import { card } from "@/app/components/ui";
import { createEmployee } from "@/lib/actions/employees";

export default function NewStaffPage() {
  return (
    <div>
      <PageHeader title="New Staff" description="New staff are added to your branch automatically." />
      <div className={`${card} max-w-lg p-6`}>
        <ActionForm action={createEmployee} submitLabel="Create Staff">
          <Field label="Full Name" name="name" required autoFocus />
          <Field label="Email" name="email" type="email" required />
          <Field label="Temporary Password" name="password" type="password" minLength={8} required />
        </ActionForm>
      </div>
    </div>
  );
}
