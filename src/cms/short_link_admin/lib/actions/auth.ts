"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "../prisma";
import { createSession, clearSession, getSession } from "../session";

export interface LoginResult {
  error?: string;
}

export async function loginAction(
  _prev: LoginResult,
  formData: FormData
): Promise<LoginResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const user = await prisma.users.findUnique({ where: { email } });

  if (!user || !user.password_hash) {
    return { error: "Invalid email or password" };
  }

  if (user.role !== "admin" && user.role !== "super_admin") {
    return { error: "Access denied" };
  }

  if (user.status === "suspended") {
    return { error: "Account suspended" };
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return { error: "Invalid email or password" };
  }

  await createSession({
    userId: user.id,
    email: user.email!,
    role: user.role as "admin" | "super_admin",
  });

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/login");
}

export async function getSessionUser() {
  return getSession();
}
