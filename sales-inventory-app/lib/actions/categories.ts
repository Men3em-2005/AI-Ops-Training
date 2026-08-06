"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import type { ActionState } from "@/lib/types";

export async function createCategory(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("ADMIN");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Category name is required." };

  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) return { error: "A category with this name already exists." };

  await prisma.category.create({ data: { name } });
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategory(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("ADMIN");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Category name is required." };

  const existing = await prisma.category.findFirst({
    where: { name, id: { not: id } },
  });
  if (existing) return { error: "A category with this name already exists." };

  await prisma.category.update({ where: { id }, data: { name } });
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}
