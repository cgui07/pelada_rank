import { db } from "@/lib/db";
import type { PeladaStatus } from "@/lib/domain/pelada";
import { requireAdminSession, requireGroupOwner, requireSession } from "@/server/lib/authz";
import { serverConfig } from "@/server/lib/config";
import { ApiRouteError } from "@/server/lib/api-handler";
import { closePeladaAndPersistRanking } from "@/server/modules/pelada/service";

export interface CreatePeladaInput {
  groupId: string;
  name: string;
  playedAt?: string;
  participantIds: string[];
}

export async function getGroupByInviteCode(inviteCode: string) {
  return db.groups.findUnique({
    where: { invite_code: inviteCode },
    select: { id: true, name: true },
  });
}

export async function getLatestGroupMembership(userId: string): Promise<string | null> {
  const membership = await db.group_members.findFirst({
    where: { user_id: userId },
    orderBy: { joined_at: "desc" },
    select: { group_id: true },
  });

  return membership?.group_id ?? null;
}

export async function joinGroupByInviteCode(inviteCode: string): Promise<string> {
  const session = await requireSession();

  const group = await db.groups.findUnique({
    where: { invite_code: inviteCode },
    select: { id: true },
  });

  if (!group) {
    throw new ApiRouteError("Grupo nao encontrado", 404, "NOT_FOUND");
  }

  await db.group_members.upsert({
    where: {
      group_id_user_id: {
        group_id: group.id,
        user_id: session.userId,
      },
    },
    update: {},
    create: {
      group_id: group.id,
      user_id: session.userId,
    },
  });

  return group.id;
}

export async function getGroupDetails(groupId: string) {
  const session = await requireSession();

  return db.groups.findFirst({
    where: {
      id: groupId,
      OR: [
        { owner_id: session.userId },
        { group_members: { some: { user_id: session.userId } } },
      ],
    },
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
}

export async function createPelada(data: CreatePeladaInput): Promise<string> {
  const session = await requireAdminSession();
  await requireGroupOwner(data.groupId, session.userId);

  const normalizedParticipantIds = Array.from(
    new Set(data.participantIds.filter(Boolean)),
  );

  if (normalizedParticipantIds.length < 2) {
    throw new ApiRouteError("Minimo 2 participantes", 400, "VALIDATION_ERROR");
  }

  const members = await db.group_members.findMany({
    where: { group_id: data.groupId },
    select: { user_id: true },
  });
  const memberIds = new Set(members.map((member) => member.user_id));

  const allParticipantsAreMembers = normalizedParticipantIds.every((participantId) =>
    memberIds.has(participantId),
  );

  if (!allParticipantsAreMembers) {
    throw new ApiRouteError(
      "Um ou mais participantes nao sao membros do grupo",
      400,
      "VALIDATION_ERROR",
    );
  }

  const pelada = await db.peladas.create({
    data: {
      group_id: data.groupId,
      name: data.name,
      played_at: data.playedAt ? new Date(data.playedAt) : new Date(),
      status: "voting",
      created_by: session.userId,
      pelada_participants: {
        create: normalizedParticipantIds.map((userId) => ({ user_id: userId })),
      },
    },
  });

  return pelada.id;
}

export async function updatePeladaStatus(
  peladaId: string,
  status: PeladaStatus,
): Promise<void> {
  const session = await requireAdminSession();

  if (status === "closed") {
    await closePeladaAndPersistRanking({
      peladaId,
      ownerUserId: session.userId,
      allowCloseWithIncompleteRatings: serverConfig.allowCloseWithIncompleteRatings,
    });
    return;
  }

  const pelada = await db.peladas.findUnique({
    where: { id: peladaId },
    select: {
      id: true,
      status: true,
      groups: { select: { owner_id: true } },
    },
  });

  if (!pelada) {
    throw new ApiRouteError("Pelada nao encontrada", 404, "NOT_FOUND");
  }

  if (pelada.groups.owner_id !== session.userId) {
    throw new ApiRouteError("Voce nao tem permissao nesta pelada", 403, "FORBIDDEN");
  }

  if (pelada.status === "closed") {
    throw new ApiRouteError(
      "Pelada encerrada nao pode mudar de status",
      409,
      "INVALID_STATUS",
    );
  }

  if (pelada.status === status) {
    return;
  }

  await db.peladas.update({
    where: { id: peladaId },
    data: {
      status,
      closed_at: null,
    },
  });
}

export async function getPeladaDetails(peladaId: string) {
  const session = await requireSession();

  const pelada = await db.peladas.findFirst({
    where: {
      id: peladaId,
      OR: [
        { groups: { owner_id: session.userId } },
        { groups: { group_members: { some: { user_id: session.userId } } } },
      ],
    },
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

  const userRatings = await db.ratings.findMany({
    where: { pelada_id: peladaId, evaluator_id: session.userId },
    select: { target_id: true, stars: true },
  });

  return {
    ...pelada,
    userRatings,
  };
}

