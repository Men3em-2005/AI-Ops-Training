import PageHeader from "@/app/components/PageHeader";
import ActionForm from "@/app/components/ActionForm";
import { Field } from "@/app/components/FormField";
import { card } from "@/app/components/ui";
import { createCategory } from "@/lib/actions/categories";

export default function NewCategoryPage() {
  return (
    <div>
      <PageHeader title="New Category" />
      <div className={`${card} max-w-md p-6`}>
        <ActionForm action={createCategory} submitLabel="Create Category">
          <Field label="Name" name="name" required autoFocus />
        </ActionForm>
      </div>
    </div>
  );
}
