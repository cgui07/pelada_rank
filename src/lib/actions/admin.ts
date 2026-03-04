"use server";

import { db } from "@/lib/db";
import { getSession, hashPin } from "@/lib/auth";
import { resetPinSchema } from "@/lib/validations";

export async function searchUser(username: string) {
  const session = await getSession();
  if (!session || !session.isAdmin) return null;

  const user = await db.users.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
    select: { id: true, username: true, created_at: true },
  });

  return user;
}

export async function adminSetPin(data: {
  targetUsername: string;
  newPin: string;
}): Promise<{ success: boolean; pin?: string; error?: string }> {
  const session = await getSession();
  if (!session || !session.isAdmin) {
    return { success: false, error: "Não autorizado" };
  }

  const parsed = resetPinSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { targetUsername, newPin } = parsed.data;

  const user = await db.users.findFirst({
    where: { username: { equals: targetUsername, mode: "insensitive" } },
  });
  if (!user) {
    return { success: false, error: "Usuário não encontrado" };
  }

  const hash = await hashPin(newPin);
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

  return { success: true, pin: newPin };
}

export async function adminGeneratePin(
  targetUsername: string,
): Promise<{ success: boolean; pin?: string; error?: string }> {
  const session = await getSession();
  if (!session || !session.isAdmin) {
    return { success: false, error: "Não autorizado" };
  }

  const user = await db.users.findFirst({
    where: { username: { equals: targetUsername, mode: "insensitive" } },
  });
  if (!user) {
    return { success: false, error: "Usuário não encontrado" };
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

  return { success: true, pin: newPin };
}

export async function getAuditLog() {
  const session = await getSession();
  if (!session || !session.isAdmin) return [];

  return db.admin_audit_log.findMany({
    orderBy: { created_at: "desc" },
    take: 50,
  });
}

export async function createGroup(data: {
  name: string;
  inviteCode: string;
}): Promise<{ success: boolean; groupId?: string; error?: string }> {
  const session = await getSession();
  if (!session || !session.isAdmin) {
    return { success: false, error: "Não autorizado" };
  }

  const existing = await db.groups.findUnique({
    where: { invite_code: data.inviteCode },
  });
  if (existing) {
    return { success: false, error: "Código de convite já existe" };
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

  return { success: true, groupId: group.id };
}

export async function getAllGroups() {
  const session = await getSession();
  if (!session || !session.isAdmin) return [];

  return db.groups.findMany({
    where: { owner_id: session.userId },
    orderBy: { created_at: "desc" },
    include: {
      _count: { select: { group_members: true, peladas: true } },
    },
  });
}
