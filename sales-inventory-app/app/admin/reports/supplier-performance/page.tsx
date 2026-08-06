import PageHeader from "@/app/components/PageHeader";
import ReportTable from "@/app/components/reports/ReportTable";
import ExportLink from "@/app/components/reports/ExportLink";
import { getSupplierPerformance } from "@/lib/reports";

export default async function SupplierPerformanceReportPage() {
  const rows = await getSupplierPerformance();

  return (
    <div>
      <PageHeader
        title="Supplier Performance"
        description="Average delivery lead time for received orders, and orders currently past their expected date."
        action={<ExportLink type="supplier-performance" />}
      />
      <ReportTable
        columns={[
          { key: "supplierName", label: "Supplier" },
          { key: "totalOrders", label: "Total Orders" },
          { key: "receivedOrders", label: "Fully Received" },
          { key: "avgLeadDays", label: "Avg. Lead Time (days)" },
          { key: "lateCount", label: "Currently Late" },
        ]}
        rows={rows}
      />
    </div>
  );
}
