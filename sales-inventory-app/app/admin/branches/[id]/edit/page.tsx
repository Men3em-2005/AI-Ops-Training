import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import ActionForm from "@/app/components/ActionForm";
import { Field } from "@/app/components/FormField";
import { card } from "@/app/components/ui";
import { updateBranch } from "@/lib/actions/branches";

export default async function EditBranchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const branch = await prisma.branch.findUnique({ where: { id } });
  if (!branch) notFound();

  const action = updateBranch.bind(null, id);

  return (
    <div>
      <PageHeader title="Edit Branch" />
      <div className={`${card} max-w-lg p-6`}>
        <ActionForm action={action} submitLabel="Save Changes">
          <Field label="Branch Name" name="name" defaultValue={branch.name} required autoFocus />
          <Field label="Location" name="location" defaultValue={branch.location} required />
        </ActionForm>
      </div>
    </div>
  );
}
