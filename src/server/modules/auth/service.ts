import { db } from "@/lib/db";
import {
  hashPin,
  verifyPin,
  createSession,
  destroySession,
  getSession,
} from "@/lib/auth";
import { LOGIN_WINDOW_MINUTES, MAX_LOGIN_ATTEMPTS } from "@/lib/constants";
import { ApiRouteError } from "@/server/lib/api-handler";

export interface LoginInput {
  username: string;
  pin: string;
}

export interface RegisterInput {
  username: string;
  pin: string;
  confirmPin: string;
  role: "user" | "admin";
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
): Promise<void> {
  await db.login_attempts.create({
    data: {
      username: username.toLowerCase(),
      ip_address: ip,
      success,
    },
  });
}

export async function checkUsernameAvailability(username: string): Promise<boolean> {
  const existing = await db.users.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
  });

  return !existing;
}

export async function loginUser(data: LoginInput, ip: string): Promise<void> {
  const allowed = await checkRateLimit(data.username, ip);
  if (!allowed) {
    throw new ApiRouteError(
      `Muitas tentativas. Aguarde ${LOGIN_WINDOW_MINUTES} minutos.`,
      429,
    );
  }

  const user = await db.users.findFirst({
    where: { username: { equals: data.username, mode: "insensitive" } },
  });

  if (!user) {
    await recordLoginAttempt(data.username, ip, false);
    throw new ApiRouteError("Usuario ou PIN incorreto", 401);
  }

  const validPin = await verifyPin(data.pin, user.pin_hash);
  if (!validPin) {
    await recordLoginAttempt(data.username, ip, false);
    throw new ApiRouteError("Usuario ou PIN incorreto", 401);
  }

  await recordLoginAttempt(data.username, ip, true);

  await createSession({
    userId: user.id,
    username: user.username,
    isAdmin: user.is_admin,
  });
}

export async function registerUser(data: RegisterInput): Promise<void> {
  const existing = await db.users.findFirst({
    where: { username: { equals: data.username, mode: "insensitive" } },
  });
  if (existing) {
    throw new ApiRouteError(
      "Este nome do usuário já está em uso",
      409,
      "CONFLICT",
    );
  }

  const pinHash = await hashPin(data.pin);
  const isAdmin = data.role === "admin";

  const user = await db.users.create({
    data: {
      username: data.username,
      pin_hash: pinHash,
      is_admin: isAdmin,
    },
  });

  await createSession({
    userId: user.id,
    username: user.username,
    isAdmin: user.is_admin,
  });
}

export async function logoutUser(): Promise<void> {
  await destroySession();
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) {
    return null;
  }

  return db.users.findUnique({
    where: { id: session.userId },
    select: { id: true, username: true, is_admin: true, created_at: true },
  });
}
