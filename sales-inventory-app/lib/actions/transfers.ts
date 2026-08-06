"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { canAccessBranch, resolveBranchId } from "@/lib/permissions";
import type { ActionState } from "@/lib/types";

function rolePath(session: { role: string }) {
  return session.role === "ADMIN"
    ? "/admin/transfers"
    : session.role === "MANAGER"
    ? "/manager/transfers"
    : "/staff/transfers";
}

export async function createTransfer(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole("ADMIN", "MANAGER", "STAFF");

  let toBranchId: string;
  try {
    toBranchId = resolveBranchId(session, String(formData.get("toBranchId") ?? ""));
  } catch (e) {
    return { error: (e as Error).message };
  }

  const fromBranchId = String(formData.get("fromBranchId") ?? "");
  if (!fromBranchId) return { error: "Choose the branch to request stock from." };
  if (fromBranchId === toBranchId) return { error: "Source and destination branches must differ." };

  const productIds = formData.getAll("productId").map(String);
  const quantities = formData.getAll("quantity").map(Number);

  const items = productIds
    .map((productId, i) => ({ productId, quantity: quantities[i] }))
    .filter((i) => i.productId && i.quantity > 0);

  if (items.length === 0) return { error: "Add at least one product line with a quantity." };

  const transfer = await prisma.stockTransfer.create({
    data: {
      fromBranchId,
      toBranchId,
      requestedById: session.userId,
      status: "REQUESTED",
      items: { create: items },
    },
  });

  revalidatePath(rolePath(session));
  redirect(`${rolePath(session)}/${transfer.id}`);
}

export async function markInTransit(id: string) {
  const session = await requireRole("ADMIN", "MANAGER", "STAFF");
  const transfer = await prisma.stockTransfer.findUniqueOrThrow({
    where: { id },
    include: { items: true },
  });

  if (!canAccessBranch(session, transfer.fromBranchId)) {
    throw new Error("Only the sending branch can mark this transfer as shipped.");
  }
  if (transfer.status !== "REQUESTED") {
    throw new Error("Only requested transfers can be marked as shipped.");
  }

  await prisma.$transaction(async (tx) => {
    for (const item of transfer.items) {
      const stock = await tx.stock.findUnique({
        where: { branchId_productId: { branchId: transfer.fromBranchId, productId: item.productId } },
      });
      if (!stock || stock.quantity < item.quantity) {
        throw new Error("Insufficient stock at the sending branch to fulfill this transfer.");
      }
    }

    for (const item of transfer.items) {
      await tx.stock.update({
        where: { branchId_productId: { branchId: transfer.fromBranchId, productId: item.productId } },
        data: { quantity: { decrement: item.quantity } },
      });
      await tx.stockMovement.create({
        data: {
          branchId: transfer.fromBranchId,
          productId: item.productId,
          type: "TRANSFER_OUT",
          quantity: -item.quantity,
          referenceId: transfer.id,
        },
      });
    }

    await tx.stockTransfer.update({ where: { id }, data: { status: "IN_TRANSIT" } });
  });

  revalidatePath(`${rolePath(session)}/${id}`);
}

export async function markCompleted(id: string) {
  const session = await requireRole("ADMIN", "MANAGER", "STAFF");
  const transfer = await prisma.stockTransfer.findUniqueOrThrow({
    where: { id },
    include: { items: true },
  });

  if (!canAccessBranch(session, transfer.toBranchId)) {
    throw new Error("Only the receiving branch can confirm this transfer.");
  }
  if (transfer.status !== "IN_TRANSIT") {
    throw new Error("Only in-transit transfers can be received.");
  }

  await prisma.$transaction(async (tx) => {
    for (const item of transfer.items) {
      await tx.stock.upsert({
        where: { branchId_productId: { branchId: transfer.toBranchId, productId: item.productId } },
        create: {
          branchId: transfer.toBranchId,
          productId: item.productId,
          quantity: item.quantity,
          minStock: 10,
        },
        update: { quantity: { increment: item.quantity } },
      });
      await tx.stockMovement.create({
        data: {
          branchId: transfer.toBranchId,
          productId: item.productId,
          type: "TRANSFER_IN",
          quantity: item.quantity,
          referenceId: transfer.id,
        },
      });
    }

    await tx.stockTransfer.update({
      where: { id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
  });

  revalidatePath(`${rolePath(session)}/${id}`);
}

export async function cancelTransfer(id: string) {
  const session = await requireRole("ADMIN", "MANAGER", "STAFF");
  const transfer = await prisma.stockTransfer.findUniqueOrThrow({
    where: { id },
    include: { items: true },
  });

  const canCancel =
    session.role === "ADMIN" ||
    canAccessBranch(session, transfer.fromBranchId) ||
    canAccessBranch(session, transfer.toBranchId);
  if (!canCancel) throw new Error("You do not have access to this transfer.");

  if (transfer.status === "REQUESTED") {
    await prisma.stockTransfer.update({ where: { id }, data: { status: "CANCELLED" } });
  } else if (transfer.status === "IN_TRANSIT") {
    await prisma.$transaction(async (tx) => {
      for (const item of transfer.items) {
        await tx.stock.update({
          where: { branchId_productId: { branchId: transfer.fromBranchId, productId: item.productId } },
          data: { quantity: { increment: item.quantity } },
        });
        await tx.stockMovement.create({
          data: {
            branchId: transfer.fromBranchId,
            productId: item.productId,
            type: "ADJUSTMENT",
            quantity: item.quantity,
            referenceId: transfer.id,
          },
        });
      }
      await tx.stockTransfer.update({ where: { id }, data: { status: "CANCELLED" } });
    });
  } else {
    throw new Error("Completed or already-cancelled transfers cannot be cancelled.");
  }

  revalidatePath(`${rolePath(session)}/${id}`);
}
