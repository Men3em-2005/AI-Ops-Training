"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifyPassword, createSessionCookie } from "@/lib/auth";
import type { Role } from "@/lib/types";

const ROLE_HOME: Record<Role, string> = {
  ADMIN: "/admin/dashboard",
  MANAGER: "/manager/dashboard",
  STAFF: "/staff/dashboard",
};

export interface LoginState {
  error?: string;
}

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!email || !password) {
    return { error: "Enter both email and password." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) {
    return { error: "Invalid email or password." };
  }

  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    return { error: "Invalid email or password." };
  }

  const role = user.role as Role;
  await createSessionCookie({
    userId: user.id,
    name: user.name,
    email: user.email,
    role,
    branchId: user.branchId,
  });

  const destination = next && next.startsWith(`/${role.toLowerCase()}`) ? next : ROLE_HOME[role];
  redirect(destination);
}
