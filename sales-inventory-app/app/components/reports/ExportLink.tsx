import { buttonSecondary } from "@/app/components/ui";

export default function ExportLink({ type }: { type: string }) {
  return (
    <a href={`/api/reports/export?type=${type}`} className={buttonSecondary}>
      Export CSV
    </a>
  );
}
