import PageHeader from "@/app/components/PageHeader";
import ReportTable from "@/app/components/reports/ReportTable";
import ExportLink from "@/app/components/reports/ExportLink";
import { getLowStock } from "@/lib/reports";

export default async function LowStockReportPage() {
  const rows = await getLowStock(null);

  return (
    <div>
      <PageHeader
        title="Low Stock"
        description="Products currently below their minimum stock level, across all branches."
        action={<ExportLink type="low-stock" />}
      />
      <ReportTable
        columns={[
          { key: "branchName", label: "Branch" },
          { key: "productName", label: "Product" },
          { key: "quantity", label: "On Hand" },
          { key: "minStock", label: "Min Stock" },
        ]}
        rows={rows}
      />
    </div>
  );
}
