import PageHeader from "@/app/components/PageHeader";
import { card } from "@/app/components/ui";

const ITEMS = [
  {
    q: "Can products or suppliers be deleted?",
    a: "No hard delete. Products and suppliers can be deactivated (and reactivated) instead, so purchase order and sales history stay intact and reportable.",
  },
  {
    q: "Can sales be cancelled or refunded?",
    a: "Yes, as two distinct actions. CANCELLED: same-day only, can be done by the staff member who recorded the sale, a manager, or an admin; no reason required. REFUNDED: manager or admin only, any time, requires a reason. Both restock the items sold.",
  },
  {
    q: "What purchase order statuses are required?",
    a: "DRAFT → SENT → PARTIALLY_RECEIVED → RECEIVED, or CANCELLED from any state before RECEIVED.",
  },
  {
    q: "How should partial deliveries be handled?",
    a: "Each purchase order line tracks ordered quantity vs. received quantity separately. Receiving a delivery records the quantity actually received per line, updates branch stock immediately, and the order's overall status is derived automatically from its lines.",
  },
  {
    q: "What are the exact employee roles and permissions?",
    a: "Three roles: Administrator (full access, all branches), Branch Manager (full operational access scoped to their branch, plus staff management and refunds), and Staff (day-to-day operations at their branch: sales, stock, purchase orders, transfers). See each role's dashboard and navigation for the exact permission boundaries.",
  },
  {
    q: "Should reports be exportable?",
    a: "Yes. Every report page has a CSV export button, scoped to the same data the viewer sees on screen (company-wide for admins, branch-scoped for managers).",
  },
  {
    q: "How is the minimum stock level determined?",
    a: "Each product has a default minimum stock set when it's created. That default is applied per-branch when the product (or the branch) is created, and can be overridden per branch afterward on the Inventory page — since demand naturally differs by location.",
  },
  {
    q: "How is stock transfer accountability handled?",
    a: "Transfers move through REQUESTED → IN_TRANSIT → COMPLETED. Stock leaves the sending branch's count only when it's marked shipped, and only arrives at the receiving branch's count when that branch confirms receipt — with both branches and the requester recorded, so responsibility for missing stock is traceable instead of disputed.",
  },
];

export default function AssumptionsPage() {
  return (
    <div>
      <PageHeader
        title="Assumptions & Decisions"
        description="The PRD for this system left several behaviors open for the implementation to decide. This page documents the choices made, so they can be revisited deliberately rather than rediscovered by reading code."
      />
      <div className="space-y-4">
        {ITEMS.map((item) => (
          <div key={item.q} className={`${card} p-5`}>
            <h3 className="font-semibold">{item.q}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
