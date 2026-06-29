"use server";

import { prisma } from "../prisma";
import { getSession } from "../session";

export interface UserRow {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  linkCount?: number;
}

export interface PaginatedUsers {
  items: UserRow[];
  total: number;
  page: number;
  limit: number;
}

function toUserRow(u: { id: string; email: string | null; role: string; status: string; created_at: Date; _count?: { links: number } }): UserRow {
  return {
    id: u.id,
    email: u.email ?? "",
    role: u.role,
    status: u.status,
    createdAt: u.created_at.toISOString(),
    linkCount: u._count?.links,
  };
}

export async function getUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedUsers> {
  const session = await getSession();
  if (!session) throw new Error("Unauthenticated");

  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    role: { not: "anonymous" },
  };

  if (params.search) {
    where.email = { contains: params.search, mode: "insensitive" };
  }

  const [items, total] = await Promise.all([
    prisma.users.findMany({
      where: where as never,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.users.count({ where: where as never }),
  ]);

  return {
    items: items.map((u) => toUserRow(u as never)),
    total,
    page,
    limit,
  };
}

export async function getUserDetail(id: string): Promise<UserRow> {
  const session = await getSession();
  if (!session) throw new Error("Unauthenticated");

  const u = await prisma.users.findUniqueOrThrow({
    where: { id },
    include: { _count: { select: { links: true } } },
  });

  return toUserRow(u as never);
}

export async function getUserLinks(
  userId: string,
  params: { page?: number; limit?: number }
): Promise<{ items: Array<{ id: string; code: string; originalUrl: string; clickCount: number; status: string; createdAt: string }>; total: number; page: number; limit: number }> {
  const session = await getSession();
  if (!session) throw new Error("Unauthenticated");

  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.links.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.links.count({ where: { user_id: userId } }),
  ]);

  const now = new Date();
  return {
    items: items.map((l) => ({
      id: l.id.toString(),
      code: l.code,
      originalUrl: l.original_url,
      clickCount: Number(l.click_count),
      status: l.expires_at && l.expires_at <= now ? "expired" : l.status,
      createdAt: l.created_at.toISOString(),
    })),
    total,
    page,
    limit,
  };
}

export async function patchUser(
  id: string,
  body: { status: string }
): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error("Unauthenticated");

  if (body.status !== "active" && body.status !== "suspended") {
    throw new Error("Invalid status");
  }

  await prisma.users.update({
    where: { id },
    data: { status: body.status },
  });
}

export async function assignRole(
  id: string,
  role: string
): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    throw new Error("Forbidden: only super_admin can assign roles");
  }

  if (role !== "user" && role !== "admin" && role !== "super_admin") {
    throw new Error("Invalid role");
  }

  // Prevent self-demotion
  if (session.userId === id && role !== "super_admin") {
    throw new Error("Cannot demote yourself");
  }

  // Prevent removing last super_admin
  if (role !== "super_admin") {
    const target = await prisma.users.findUniqueOrThrow({ where: { id } });
    if (target.role === "super_admin") {
      const superAdminCount = await prisma.users.count({
        where: { role: "super_admin" },
      });
      if (superAdminCount <= 1) {
        throw new Error("Cannot remove the last super_admin");
      }
    }
  }

  await prisma.users.update({
    where: { id },
    data: { role },
  });
}
