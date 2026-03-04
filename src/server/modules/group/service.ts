import { db } from "@/lib/db";
import { getSession, type SessionPayload } from "@/lib/auth";
import { ApiRouteError } from "@/server/lib/api-handler";

export interface CreatePeladaInput {
  groupId: string;
  name: string;
  playedAt?: string;
  participantIds: string[];
}

async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new ApiRouteError("Nao autenticado", 401);
  }

  return session;
}

async function requireAdminSession(): Promise<SessionPayload> {
  const session = await requireSession();
  if (!session.isAdmin) {
    throw new ApiRouteError("Apenas admins", 403);
  }

  return session;
}

export async function joinGroupByInviteCode(inviteCode: string): Promise<string> {
  const session = await requireSession();

  const group = await db.groups.findUnique({
    where: { invite_code: inviteCode },
  });

  if (!group) {
    throw new ApiRouteError("Grupo nao encontrado", 404);
  }

  const membership = await db.group_members.findFirst({
    where: { group_id: group.id, user_id: session.userId },
  });

  if (!membership) {
    await db.group_members.create({
      data: { group_id: group.id, user_id: session.userId },
    });
  }

  return group.id;
}

export async function getGroupDetails(groupId: string) {
  const session = await requireSession();

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

  if (!group) {
    return null;
  }

  const isOwner = group.owner_id === session.userId;
  const isMember = group.group_members.some((m) => m.user_id === session.userId);

  if (!isOwner && !isMember) {
    return null;
  }

  return group;
}

export async function createPelada(data: CreatePeladaInput): Promise<string> {
  const session = await requireAdminSession();

  const group = await db.groups.findUnique({ where: { id: data.groupId } });
  if (!group || group.owner_id !== session.userId) {
    throw new ApiRouteError("Voce nao tem permissao neste grupo", 403);
  }

  const members = await db.group_members.findMany({
    where: { group_id: data.groupId },
    select: { user_id: true },
  });
  const memberIds = new Set(members.map((member) => member.user_id));

  for (const participantId of data.participantIds) {
    if (!memberIds.has(participantId)) {
      throw new ApiRouteError("Um ou mais participantes nao sao membros do grupo", 400);
    }
  }

  const pelada = await db.peladas.create({
    data: {
      group_id: data.groupId,
      name: data.name,
      played_at: data.playedAt ? new Date(data.playedAt) : new Date(),
      status: "voting",
      created_by: session.userId,
      pelada_participants: {
        create: data.participantIds.map((userId) => ({ user_id: userId })),
      },
    },
  });

  return pelada.id;
}

async function computeAndStoreResults(peladaId: string): Promise<void> {
  await db.pelada_results.deleteMany({ where: { pelada_id: peladaId } });

  const participants = await db.pelada_participants.findMany({
    where: { pelada_id: peladaId },
    select: { user_id: true },
  });

  const results: { userId: string; avg: number; total: number }[] = [];

  for (const participant of participants) {
    const ratings = await db.ratings.findMany({
      where: { pelada_id: peladaId, target_id: participant.user_id },
    });

    const total = ratings.length;
    const avg =
      total > 0 ? ratings.reduce((sum, rating) => sum + rating.stars, 0) / total : 0;

    results.push({
      userId: participant.user_id,
      avg,
      total,
    });
  }

  results.sort((a, b) => b.avg - a.avg);

  for (let i = 0; i < results.length; i += 1) {
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

export async function updatePeladaStatus(
  peladaId: string,
  status: "open" | "voting" | "closed",
): Promise<void> {
  const session = await requireAdminSession();

  const pelada = await db.peladas.findUnique({
    where: { id: peladaId },
    include: { groups: { select: { owner_id: true } } },
  });

  if (!pelada || pelada.groups.owner_id !== session.userId) {
    throw new ApiRouteError("Voce nao tem permissao nesta pelada", 403);
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
}

export async function getPeladaDetails(peladaId: string) {
  const session = await requireSession();

  const pelada = await db.peladas.findUnique({
    where: { id: peladaId },
    include: {
      groups: { select: { id: true, name: true, owner_id: true } },
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

  if (!pelada) {
    return null;
  }

  const isOwner = pelada.groups.owner_id === session.userId;
  const membership = await db.group_members.findFirst({
    where: { group_id: pelada.group_id, user_id: session.userId },
  });

  if (!isOwner && !membership) {
    return null;
  }

  const userRatings = await db.ratings.findMany({
    where: { pelada_id: peladaId, evaluator_id: session.userId },
  });

  return {
    ...pelada,
    userRatings,
  };
}
