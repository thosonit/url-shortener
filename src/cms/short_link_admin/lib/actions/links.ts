"use server";

import { z } from "zod";
import { prisma } from "../prisma";
import { getSession } from "../session";
import { type link_status } from "../generated/prisma/client";

const updateLinkSchema = z.object({
  originalUrl: z.url(),
  expiresAt: z.iso.datetime().nullable(),
});

export interface LinkRow {
  id: string;
  code: string;
  originalUrl: string;
  status: string;
  clickCount: number;
  expiresAt: string | null;
  createdAt: string;
  ownerEmail: string | null;
}

export interface PaginatedLinks {
  items: LinkRow[];
  total: number;
  page: number;
  limit: number;
}

function toLinkRow(
  link: { id: bigint; code: string; original_url: string; status: string; click_count: bigint; expires_at: Date | null; created_at: Date; user: { email: string | null } }
): LinkRow {
  const now = new Date();
  const expired = link.expires_at && link.expires_at <= now;
  return {
    id: link.id.toString(),
    code: link.code,
    originalUrl: link.original_url,
    status: expired ? "expired" : link.status,
    clickCount: Number(link.click_count),
    expiresAt: link.expires_at?.toISOString() ?? null,
    createdAt: link.created_at.toISOString(),
    ownerEmail: link.user.email,
  };
}

export async function getLinks(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<PaginatedLinks> {
  const session = await getSession();
  if (!session) throw new Error("Unauthenticated");

  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (params.search) {
    where.OR = [
      { code: { contains: params.search, mode: "insensitive" } },
      { original_url: { contains: params.search, mode: "insensitive" } },
      { user: { email: { contains: params.search, mode: "insensitive" } } },
    ];
  }

  if (params.status === "expired") {
    where.expires_at = { lte: new Date() };
    where.status = "active";
  } else if (params.status === "active") {
    where.status = "active";
    where.OR_expires = undefined;
    where.AND = [
      { OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }] },
    ];
  } else if (params.status === "disabled") {
    where.status = "disabled";
  }

  const [items, total] = await Promise.all([
    prisma.links.findMany({
      where: where as never,
      include: { user: { select: { email: true } } },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.links.count({ where: where as never }),
  ]);

  return {
    items: items.map(toLinkRow),
    total,
    page,
    limit,
  };
}

export async function patchLink(
  id: string,
  body: { status?: string; forceExpire?: boolean }
): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error("Unauthenticated");

  const data: Record<string, unknown> = {};

  if (body.forceExpire) {
    data.expires_at = new Date();
  }

  if (body.status === "active" || body.status === "disabled") {
    data.status = body.status as link_status;
  }

  await prisma.links.update({
    where: { id: BigInt(id) },
    data: data as never,
  });
}

export async function updateLink(
  id: string,
  body: { originalUrl: string; expiresAt: string | null }
): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error("Unauthenticated");

  const { originalUrl, expiresAt } = updateLinkSchema.parse(body);

  await prisma.links.update({
    where: { id: BigInt(id) },
    data: {
      original_url: originalUrl,
      expires_at: expiresAt ? new Date(expiresAt) : null,
    },
  });
}

export async function deleteLink(id: string): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error("Unauthenticated");

  await prisma.links.delete({ where: { id: BigInt(id) } });
}
