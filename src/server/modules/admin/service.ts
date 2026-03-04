import { db } from "@/lib/db";
import { randomInt } from "node:crypto";
import { hashPin } from "@/lib/auth";
import { requireAdminSession } from "@/server/lib/authz";
import { ApiRouteError } from "@/server/lib/api-handler";

export interface SetPinInput {
  targetUsername: string;
  newPin: string;
}

export interface CreateGroupInput {
  name: string;
  inviteCode: string;
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
    throw new ApiRouteError("Usuario nao encontrado", 404, "NOT_FOUND");
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
    throw new ApiRouteError("Usuario nao encontrado", 404, "NOT_FOUND");
  }

  const newPin = String(randomInt(1000, 10000));
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

  const group = await db.$transaction(async (tx) => {
    const existing = await tx.groups.findUnique({
      where: { invite_code: data.inviteCode },
      select: { id: true },
    });

    if (existing) {
      throw new ApiRouteError("Codigo de convite ja existe", 409, "CONFLICT");
    }

    const createdGroup = await tx.groups.create({
      data: {
        name: data.name,
        invite_code: data.inviteCode,
        owner_id: session.userId,
      },
      select: { id: true },
    });

    await tx.group_members.create({
      data: { group_id: createdGroup.id, user_id: session.userId },
    });

    return createdGroup;
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
