import { db } from "@/lib/db";
import { getSession, hashPin, type SessionPayload } from "@/lib/auth";
import { ApiRouteError } from "@/server/lib/api-handler";

export interface SetPinInput {
  targetUsername: string;
  newPin: string;
}

export interface CreateGroupInput {
  name: string;
  inviteCode: string;
}

async function requireAdminSession(): Promise<SessionPayload> {
  const session = await getSession();

  if (!session || !session.isAdmin) {
    throw new ApiRouteError("Nao autorizado", 403);
  }

  return session;
}

export async function searchUser(username: string) {
  await requireAdminSession();

  return db.users.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
    select: { id: true, username: true, created_at: true },
  });
}

export async function adminSetPin(data: SetPinInput): Promise<string> {
  const session = await requireAdminSession();

  const user = await db.users.findFirst({
    where: { username: { equals: data.targetUsername, mode: "insensitive" } },
  });
  if (!user) {
    throw new ApiRouteError("Usuario nao encontrado", 404);
  }

  const hash = await hashPin(data.newPin);
  await db.users.update({
    where: { id: user.id },
    data: { pin_hash: hash, updated_at: new Date() },
  });

  await db.admin_audit_log.create({
    data: {
      admin_username: session.username,
      target_username: user.username,
      action_type: "pin_set",
    },
  });

  return data.newPin;
}

export async function adminGeneratePin(targetUsername: string): Promise<string> {
  const session = await requireAdminSession();

  const user = await db.users.findFirst({
    where: { username: { equals: targetUsername, mode: "insensitive" } },
  });
  if (!user) {
    throw new ApiRouteError("Usuario nao encontrado", 404);
  }

  const newPin = String(Math.floor(1000 + Math.random() * 9000));
  const hash = await hashPin(newPin);

  await db.users.update({
    where: { id: user.id },
    data: { pin_hash: hash, updated_at: new Date() },
  });

  await db.admin_audit_log.create({
    data: {
      admin_username: session.username,
      target_username: user.username,
      action_type: "pin_generate",
    },
  });

  return newPin;
}

export async function getAuditLog() {
  await requireAdminSession();

  return db.admin_audit_log.findMany({
    orderBy: { created_at: "desc" },
    take: 50,
  });
}

export async function createGroup(data: CreateGroupInput): Promise<string> {
  const session = await requireAdminSession();

  const existing = await db.groups.findUnique({
    where: { invite_code: data.inviteCode },
  });
  if (existing) {
    throw new ApiRouteError("Codigo de convite ja existe", 409);
  }

  const group = await db.groups.create({
    data: {
      name: data.name,
      invite_code: data.inviteCode,
      owner_id: session.userId,
    },
  });

  await db.group_members.create({
    data: { group_id: group.id, user_id: session.userId },
  });

  return group.id;
}

export async function getAllGroups() {
  const session = await requireAdminSession();

  return db.groups.findMany({
    where: { owner_id: session.userId },
    orderBy: { created_at: "desc" },
    include: {
      _count: { select: { group_members: true, peladas: true } },
    },
  });
}
