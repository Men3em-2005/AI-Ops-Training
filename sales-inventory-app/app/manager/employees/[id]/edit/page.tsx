import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import PageHeader from "@/app/components/PageHeader";
import ActionForm from "@/app/components/ActionForm";
import { Field } from "@/app/components/FormField";
import { card } from "@/app/components/ui";
import { updateEmployee } from "@/lib/actions/employees";

export default async function EditStaffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session?.branchId) redirect("/login");

  const { id } = await params;
  const employee = await prisma.user.findUnique({ where: { id } });
  if (!employee || employee.role !== "STAFF" || employee.branchId !== session.branchId) {
    notFound();
  }

  const action = updateEmployee.bind(null, id);

  return (
    <div>
      <PageHeader title="Edit Staff" />
      <div className={`${card} max-w-lg p-6`}>
        <ActionForm action={action} submitLabel="Save Changes">
          <Field label="Full Name" name="name" defaultValue={employee.name} required autoFocus />
          <Field label="Email" name="email" type="email" defaultValue={employee.email} required />
          <Field
            label="New Password"
            name="password"
            type="password"
            minLength={8}
            placeholder="Leave blank to keep current password"
          />
        </ActionForm>
      </div>
    </div>
  );
}
