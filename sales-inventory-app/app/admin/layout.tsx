import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Sidebar from "@/app/components/Sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="ADMIN" name={session.name} branchName="All branches" />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
