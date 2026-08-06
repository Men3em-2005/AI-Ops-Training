import PageHeader from "@/app/components/PageHeader";
import ActionForm from "@/app/components/ActionForm";
import { Field } from "@/app/components/FormField";
import { card } from "@/app/components/ui";
import { createBranch } from "@/lib/actions/branches";

export default function NewBranchPage() {
  return (
    <div>
      <PageHeader title="New Branch" />
      <div className={`${card} max-w-lg p-6`}>
        <ActionForm action={createBranch} submitLabel="Create Branch">
          <Field label="Branch Name" name="name" required autoFocus />
          <Field label="Location" name="location" placeholder="Address or area" required />
        </ActionForm>
      </div>
    </div>
  );
}
