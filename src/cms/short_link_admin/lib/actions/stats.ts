"use server";

import { prisma } from "../prisma";
import { getSession } from "../session";

export interface StatsData {
  totalLinks: number;
  linksToday: number;
  totalUsers: number;
  totalClicks: number;
}

export async function getStats(): Promise<StatsData> {
  const session = await getSession();
  if (!session) throw new Error("Unauthenticated");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [totalLinks, linksToday, totalUsers, clicksResult] = await Promise.all([
    prisma.links.count(),
    prisma.links.count({ where: { created_at: { gte: todayStart } } }),
    prisma.users.count({ where: { role: { not: "anonymous" } } }),
    prisma.links.aggregate({ _sum: { click_count: true } }),
  ]);

  return {
    totalLinks,
    linksToday,
    totalUsers,
    totalClicks: Number(clicksResult._sum.click_count ?? 0),
  };
}
