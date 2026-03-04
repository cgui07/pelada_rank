import { db } from "@/lib/db";
import { ApiRouteError } from "@/server/lib/api-handler";
import { getSession, type SessionPayload } from "@/lib/auth";

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();

  if (!session) {
    throw new ApiRouteError("Nao autenticado", 401, "UNAUTHENTICATED");
  }

  return session;
}

export async function requireAdminSession(): Promise<SessionPayload> {
  const session = await requireSession();

  const user = await db.users.findUnique({
    where: { id: session.userId },
    select: { is_admin: true },
  });

  if (!user?.is_admin) {
    throw new ApiRouteError("Apenas admins", 403, "FORBIDDEN");
  }

  return { ...session, isAdmin: true };
}

export async function requireGroupAccess(groupId: string, userId: string) {
  const group = await db.groups.findFirst({
    where: {
      id: groupId,
      OR: [{ owner_id: userId }, { group_members: { some: { user_id: userId } } }],
    },
    select: { id: true, owner_id: true },
  });

  if (!group) {
    throw new ApiRouteError("Grupo nao encontrado ou sem permissao", 404, "NOT_FOUND");
  }

  return group;
}

export async function requireGroupOwner(groupId: string, userId: string) {
  const group = await db.groups.findUnique({
    where: { id: groupId },
    select: { id: true, owner_id: true },
  });

  if (!group) {
    throw new ApiRouteError("Grupo nao encontrado", 404, "NOT_FOUND");
  }

  if (group.owner_id !== userId) {
    throw new ApiRouteError("Voce nao tem permissao neste grupo", 403, "FORBIDDEN");
  }

  return group;
}

export async function requirePeladaOwner(peladaId: string, userId: string) {
  const pelada = await db.peladas.findUnique({
    where: { id: peladaId },
    select: {
      id: true,
      status: true,
      group_id: true,
      groups: { select: { owner_id: true } },
    },
  });

  if (!pelada) {
    throw new ApiRouteError("Pelada nao encontrada", 404, "NOT_FOUND");
  }

  if (pelada.groups.owner_id !== userId) {
    throw new ApiRouteError("Voce nao tem permissao nesta pelada", 403, "FORBIDDEN");
  }

  return pelada;
}

