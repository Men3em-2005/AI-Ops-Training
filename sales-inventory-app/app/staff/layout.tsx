import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Sidebar from "@/app/components/Sidebar";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "STAFF") {
    redirect("/login");
  }

  const branch = session.branchId
    ? await prisma.branch.findUnique({ where: { id: session.branchId } })
    : null;

  return (
    <div className="flex min-h-screen">
      <Sidebar role="STAFF" name={session.name} branchName={branch?.name} />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
