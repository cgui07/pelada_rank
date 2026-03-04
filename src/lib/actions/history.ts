"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function getPlayerHistory(groupId: string, userId?: string) {
  const session = await getSession();
  if (!session) return null;

  const targetUserId = userId || session.userId;

  const membership = await db.group_members.findFirst({
    where: { group_id: groupId, user_id: session.userId },
  });
  if (!membership) return null;

  const results = await db.pelada_results.findMany({
    where: {
      user_id: targetUserId,
      peladas: { group_id: groupId },
    },
    include: {
      peladas: { select: { id: true, name: true, played_at: true } },
    },
    orderBy: { peladas: { played_at: "asc" } },
  });

  const user = await db.users.findUnique({
    where: { id: targetUserId },
    select: { id: true, username: true },
  });

  return {
    user,
    results: results.map((r) => ({
      peladaId: r.pelada_id,
      peladaName: r.peladas.name,
      playedAt: r.peladas.played_at.toISOString(),
      avgRating: Number(r.avg_rating),
      rank: r.rank,
      totalRatings: r.total_ratings,
    })),
  };
}

export async function getGroupLeaderboard(groupId: string) {
  const session = await getSession();
  if (!session) return null;

  const membership = await db.group_members.findFirst({
    where: { group_id: groupId, user_id: session.userId },
  });
  if (!membership) return null;

  const results = await db.pelada_results.findMany({
    where: { peladas: { group_id: groupId } },
    include: {
      users: { select: { id: true, username: true } },
    },
  });

  const userMap = new Map<
    string,
    { username: string; totalAvg: number; count: number; userId: string }
  >();

  for (const r of results) {
    const existing = userMap.get(r.user_id);
    if (existing) {
      existing.totalAvg += Number(r.avg_rating);
      existing.count += 1;
    } else {
      userMap.set(r.user_id, {
        userId: r.user_id,
        username: r.users.username,
        totalAvg: Number(r.avg_rating),
        count: 1,
      });
    }
  }

  const leaderboard = Array.from(userMap.values())
    .map((u) => ({
      userId: u.userId,
      username: u.username,
      avgRating: u.totalAvg / u.count,
      gamesPlayed: u.count,
    }))
    .sort((a, b) => b.avgRating - a.avgRating);

  return leaderboard;
}
