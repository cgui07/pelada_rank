"use server";

import { db } from "@/lib/db";
import { getSession, isAdmin } from "@/lib/auth";
import { createPeladaSchema } from "@/lib/validations";

export async function joinGroupByInviteCode(inviteCode: string): Promise<{
  success: boolean;
  groupId?: string;
  error?: string;
}> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Não autenticado" };
  }

  const group = await db.groups.findUnique({
    where: { invite_code: inviteCode },
  });

  if (!group) {
    return { success: false, error: "Grupo não encontrado" };
  }

  const existing = await db.group_members.findFirst({
    where: { group_id: group.id, user_id: session.userId },
  });

  if (!existing) {
    await db.group_members.create({
      data: { group_id: group.id, user_id: session.userId },
    });
  }

  return { success: true, groupId: group.id };
}

export async function getGroupDetails(groupId: string) {
  const session = await getSession();
  if (!session) return null;

  const membership = await db.group_members.findFirst({
    where: { group_id: groupId, user_id: session.userId },
  });
  if (!membership) return null;

  const group = await db.groups.findUnique({
    where: { id: groupId },
    include: {
      group_members: {
        include: {
          users: { select: { id: true, username: true } },
        },
        orderBy: { joined_at: "asc" },
      },
      peladas: {
        orderBy: { played_at: "desc" },
        include: {
          _count: { select: { pelada_participants: true, ratings: true } },
          users: { select: { username: true } },
        },
      },
    },
  });

  return group;
}

export async function createPelada(formData: {
  groupId: string;
  name: string;
  playedAt?: string;
  participantIds: string[];
}): Promise<{ success: boolean; peladaId?: string; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Não autenticado" };

  if (!isAdmin(session.username)) {
    return { success: false, error: "Apenas admins podem criar peladas" };
  }

  const parsed = createPeladaSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { groupId, name, playedAt, participantIds } = parsed.data;

  const members = await db.group_members.findMany({
    where: { group_id: groupId },
    select: { user_id: true },
  });
  const memberIds = new Set(members.map((m) => m.user_id));

  for (const pid of participantIds) {
    if (!memberIds.has(pid)) {
      return {
        success: false,
        error: "Um ou mais participantes não são membros do grupo",
      };
    }
  }

  const pelada = await db.peladas.create({
    data: {
      group_id: groupId,
      name,
      played_at: playedAt ? new Date(playedAt) : new Date(),
      status: "voting",
      created_by: session.userId,
      pelada_participants: {
        create: participantIds.map((userId) => ({ user_id: userId })),
      },
    },
  });

  return { success: true, peladaId: pelada.id };
}

export async function updatePeladaStatus(
  peladaId: string,
  status: "open" | "voting" | "closed",
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Não autenticado" };

  if (!isAdmin(session.username)) {
    return { success: false, error: "Apenas admins" };
  }

  await db.peladas.update({
    where: { id: peladaId },
    data: {
      status,
      closed_at: status === "closed" ? new Date() : null,
    },
  });

  if (status === "closed") {
    await computeAndStoreResults(peladaId);
  }

  return { success: true };
}

async function computeAndStoreResults(peladaId: string) {
  await db.pelada_results.deleteMany({ where: { pelada_id: peladaId } });

  const participants = await db.pelada_participants.findMany({
    where: { pelada_id: peladaId },
    select: { user_id: true },
  });

  const results: { userId: string; avg: number; total: number }[] = [];

  for (const p of participants) {
    const ratings = await db.ratings.findMany({
      where: { pelada_id: peladaId, target_id: p.user_id },
    });

    const total = ratings.length;
    const avg =
      total > 0 ? ratings.reduce((sum, r) => sum + r.stars, 0) / total : 0;

    results.push({ userId: p.user_id, avg, total });
  }

  results.sort((a, b) => b.avg - a.avg);

  for (let i = 0; i < results.length; i++) {
    await db.pelada_results.create({
      data: {
        pelada_id: peladaId,
        user_id: results[i].userId,
        avg_rating: results[i].avg,
        total_ratings: results[i].total,
        rank: i + 1,
      },
    });
  }
}

export async function getPeladaDetails(peladaId: string) {
  const session = await getSession();
  if (!session) return null;

  const pelada = await db.peladas.findUnique({
    where: { id: peladaId },
    include: {
      groups: { select: { id: true, name: true } },
      users: { select: { username: true } },
      pelada_participants: {
        include: {
          users: { select: { id: true, username: true } },
        },
      },
      pelada_results: {
        orderBy: { rank: "asc" },
        include: {
          users: { select: { id: true, username: true } },
        },
      },
    },
  });

  if (!pelada) return null;

  const membership = await db.group_members.findFirst({
    where: { group_id: pelada.group_id, user_id: session.userId },
  });
  if (!membership) return null;

  const userRatings = await db.ratings.findMany({
    where: { pelada_id: peladaId, evaluator_id: session.userId },
  });

  return { ...pelada, userRatings };
}
