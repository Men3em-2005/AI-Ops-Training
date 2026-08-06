import PageHeader from "@/app/components/PageHeader";
import ReportTable from "@/app/components/reports/ReportTable";
import ExportLink from "@/app/components/reports/ExportLink";
import { getMovers } from "@/lib/reports";

export default async function MoversReportPage() {
  const rows = await getMovers(null);

  return (
    <div>
      <PageHeader
        title="Fast / Slow Movers"
        description="All-time units sold per product, with a fast/slow classification to inform purchasing decisions."
        action={<ExportLink type="movers" />}
      />
      <ReportTable
        columns={[
          { key: "productName", label: "Product" },
          { key: "unitsSold", label: "Units Sold" },
          { key: "movement", label: "Movement" },
        ]}
        rows={rows}
      />
    </div>
  );
}
