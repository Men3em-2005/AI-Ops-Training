import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import ActionForm from "@/app/components/ActionForm";
import { Field } from "@/app/components/FormField";
import { card } from "@/app/components/ui";
import { updateCategory } from "@/lib/actions/categories";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  const action = updateCategory.bind(null, id);

  return (
    <div>
      <PageHeader title="Edit Category" />
      <div className={`${card} max-w-md p-6`}>
        <ActionForm action={action} submitLabel="Save Changes">
          <Field label="Name" name="name" defaultValue={category.name} required autoFocus />
        </ActionForm>
      </div>
    </div>
  );
}
