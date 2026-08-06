// SQLite has no native enum support (see prisma/schema.prisma), so these
// string-literal unions are the single source of truth for allowed values
// stored in the corresponding `String` columns.

export type Role = "ADMIN" | "MANAGER" | "STAFF";
export const ROLES: Role[] = ["ADMIN", "MANAGER", "STAFF"];

export type PurchaseOrderStatus =
  | "DRAFT"
  | "SENT"
  | "PARTIALLY_RECEIVED"
  | "RECEIVED"
  | "CANCELLED";

export type StockTransferStatus =
  | "REQUESTED"
  | "IN_TRANSIT"
  | "COMPLETED"
  | "CANCELLED";

export type SaleStatus = "COMPLETED" | "CANCELLED" | "REFUNDED";

export type StockMovementType =
  | "SALE"
  | "PURCHASE_RECEIPT"
  | "TRANSFER_IN"
  | "TRANSFER_OUT"
  | "ADJUSTMENT";

export interface ActionState {
  error?: string;
}

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
  role: Role;
  branchId: string | null;
}
