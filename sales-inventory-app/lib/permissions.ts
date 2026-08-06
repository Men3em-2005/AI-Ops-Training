import type { SessionPayload } from "@/lib/types";

/**
 * Server actions must not trust client-supplied branchId values for
 * Manager/Staff — always resolve the branch to operate on from the
 * session, falling back to an explicit (admin-only) override.
 */
export function resolveBranchId(
  session: SessionPayload,
  requestedBranchId?: string | null
): string {
  if (session.role === "ADMIN") {
    if (!requestedBranchId) {
      throw new Error("Admin actions on branch-scoped data require a branchId");
    }
    return requestedBranchId;
  }

  if (!session.branchId) {
    throw new Error("User has no assigned branch");
  }
  return session.branchId;
}

export function canAccessBranch(session: SessionPayload, branchId: string) {
  return session.role === "ADMIN" || session.branchId === branchId;
}

export function canManageCatalog(session: SessionPayload) {
  return session.role === "ADMIN";
}

export function canManageSuppliers(session: SessionPayload) {
  return session.role === "ADMIN";
}

export function canRefundSale(session: SessionPayload) {
  return session.role === "ADMIN" || session.role === "MANAGER";
}

export function canManageEmployees(session: SessionPayload) {
  return session.role === "ADMIN" || session.role === "MANAGER";
}

export function canEditBranchThreshold(session: SessionPayload) {
  return session.role === "ADMIN" || session.role === "MANAGER";
}
