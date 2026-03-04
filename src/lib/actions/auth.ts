"use server";

import { db } from "@/lib/db";
import {
  hashPin,
  verifyPin,
  createSession,
  destroySession,
  getSession,
} from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validations";
import { MAX_LOGIN_ATTEMPTS, LOGIN_WINDOW_MINUTES } from "@/lib/constants";
import { headers } from "next/headers";

export async function checkUsername(username: string): Promise<{
  available: boolean;
  error?: string;
}> {
  try {
    const existing = await db.users.findFirst({
      where: {
        username: { equals: username, mode: "insensitive" },
      },
    });
    return { available: !existing };
  } catch {
    return { available: false, error: "Erro ao verificar username" };
  }
}

async function checkRateLimit(username: string, ip: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - LOGIN_WINDOW_MINUTES * 60 * 1000);

  const recentAttempts = await db.login_attempts.count({
    where: {
      OR: [
        { username: { equals: username, mode: "insensitive" } },
        { ip_address: ip },
      ],
      attempted_at: { gte: windowStart },
      success: false,
    },
  });

  return recentAttempts < MAX_LOGIN_ATTEMPTS;
}

async function recordLoginAttempt(
  username: string,
  ip: string,
  success: boolean,
) {
  await db.login_attempts.create({
    data: { username: username.toLowerCase(), ip_address: ip, success },
  });
}

function getClientIp(headersList: Headers): string {
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown"
  );
}

export async function login(formData: {
  username: string;
  pin: string;
}): Promise<{ success: boolean; error?: string }> {
  const parsed = loginSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { username, pin } = parsed.data;
  const headersList = await headers();
  const ip = getClientIp(headersList);

  const allowed = await checkRateLimit(username, ip);
  if (!allowed) {
    return {
      success: false,
      error: `Muitas tentativas. Aguarde ${LOGIN_WINDOW_MINUTES} minutos.`,
    };
  }

  const user = await db.users.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
  });

  if (!user) {
    await recordLoginAttempt(username, ip, false);
    return { success: false, error: "Usuário ou PIN incorreto" };
  }

  const valid = await verifyPin(pin, user.pin_hash);
  if (!valid) {
    await recordLoginAttempt(username, ip, false);
    return { success: false, error: "Usuário ou PIN incorreto" };
  }

  await recordLoginAttempt(username, ip, true);
  await createSession({ userId: user.id, username: user.username });

  return { success: true };
}

export async function register(formData: {
  username: string;
  pin: string;
  confirmPin: string;
}): Promise<{ success: boolean; error?: string }> {
  const parsed = registerSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { username, pin } = parsed.data;

  const existing = await db.users.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
  });
  if (existing) {
    return { success: false, error: "Este username já está em uso" };
  }

  const pinHash = await hashPin(pin);

  const user = await db.users.create({
    data: {
      username,
      pin_hash: pinHash,
    },
  });

  await createSession({ userId: user.id, username: user.username });

  return { success: true };
}

export async function logout() {
  await destroySession();
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await db.users.findUnique({
    where: { id: session.userId },
    select: { id: true, username: true, created_at: true },
  });

  return user;
}
