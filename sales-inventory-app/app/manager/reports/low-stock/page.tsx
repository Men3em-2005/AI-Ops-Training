import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import PageHeader from "@/app/components/PageHeader";
import ReportTable from "@/app/components/reports/ReportTable";
import ExportLink from "@/app/components/reports/ExportLink";
import { getLowStock } from "@/lib/reports";

export default async function ManagerLowStockReportPage() {
  const session = await getSession();
  if (!session?.branchId) redirect("/login");
  const rows = await getLowStock(session.branchId);

  return (
    <div>
      <PageHeader
        title="Low Stock"
        description="Products currently below their minimum stock level at your branch."
        action={<ExportLink type="low-stock" />}
      />
      <ReportTable
        columns={[
          { key: "productName", label: "Product" },
          { key: "quantity", label: "On Hand" },
          { key: "minStock", label: "Min Stock" },
        ]}
        rows={rows}
      />
    </div>
  );
}
