"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import type { ActionState } from "@/lib/types";

function parseBranchForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();

  if (!name) return { error: "Branch name is required." };
  if (!location) return { error: "Location is required." };

  return { data: { name, location } };
}

export async function createBranch(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("ADMIN");
  const parsed = parseBranchForm(formData);
  if ("error" in parsed) return parsed;

  const products = await prisma.product.findMany({ where: { active: true } });

  await prisma.$transaction(async (tx) => {
    const branch = await tx.branch.create({ data: parsed.data });
    if (products.length > 0) {
      await tx.stock.createMany({
        data: products.map((p) => ({
          branchId: branch.id,
          productId: p.id,
          quantity: 0,
          minStock: p.defaultMinStock,
        })),
      });
    }
  });

  revalidatePath("/admin/branches");
  redirect("/admin/branches");
}

export async function updateBranch(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("ADMIN");
  const parsed = parseBranchForm(formData);
  if ("error" in parsed) return parsed;

  await prisma.branch.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/branches");
  redirect("/admin/branches");
}

export async function toggleBranchActive(id: string) {
  await requireRole("ADMIN");
  const branch = await prisma.branch.findUniqueOrThrow({ where: { id } });
  await prisma.branch.update({
    where: { id },
    data: { active: !branch.active },
  });
  revalidatePath("/admin/branches");
}
