import { beforeEach, describe, expect, it, vi } from "vitest";

process.env.ADMIN_ALLOWLIST_USERNAMES = "staff_admin";
process.env.ALLOW_FIRST_ADMIN_BOOTSTRAP = "false";
delete process.env.ADMIN_BOOTSTRAP_TOKEN;

const {
  dbMock,
  hashPinMock,
  verifyPinMock,
  createSessionMock,
  destroySessionMock,
  getSessionMock,
} = vi.hoisted(() => ({
  dbMock: {
    users: {
      findFirst: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
    },
    login_attempts: {
      count: vi.fn(),
      create: vi.fn(),
    },
  },
  hashPinMock: vi.fn(async (pin: string) => `hash-${pin}`),
  verifyPinMock: vi.fn(),
  createSessionMock: vi.fn(),
  destroySessionMock: vi.fn(),
  getSessionMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: dbMock,
}));

vi.mock("@/lib/auth", () => ({
  hashPin: hashPinMock,
  verifyPin: verifyPinMock,
  createSession: createSessionMock,
  destroySession: destroySessionMock,
  getSession: getSessionMock,
}));

import { loginUser, registerUser } from "./service";

describe("auth service integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("grants admin only when registration policy allows", async () => {
    dbMock.users.findFirst.mockResolvedValue(null);
    dbMock.users.create.mockResolvedValue({
      id: "u1",
      username: "staff_admin",
      is_admin: true,
    });

    await registerUser({
      username: "staff_admin",
      pin: "1234",
      confirmPin: "1234",
      requestAdmin: true,
    });

    expect(dbMock.users.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          username: "staff_admin",
          pin_hash: "hash-1234",
          is_admin: true,
        }),
      }),
    );
    expect(createSessionMock).toHaveBeenCalledWith({
      userId: "u1",
      username: "staff_admin",
      isAdmin: true,
    });
  });

  it("blocks unauthorized admin self-registration", async () => {
    dbMock.users.findFirst.mockResolvedValue(null);

    await expect(
      registerUser({
        username: "not_allowlisted",
        pin: "1234",
        confirmPin: "1234",
        requestAdmin: true,
      }),
    ).rejects.toThrow("Registro admin nao autorizado");

    expect(dbMock.users.create).not.toHaveBeenCalled();
  });

  it("logs in valid users and creates session", async () => {
    dbMock.login_attempts.count.mockResolvedValue(0);
    dbMock.users.findFirst.mockResolvedValue({
      id: "u2",
      username: "player1",
      pin_hash: "hash-1234",
      is_admin: false,
    });
    verifyPinMock.mockResolvedValue(true);

    await loginUser(
      {
        username: "player1",
        pin: "1234",
      },
      "127.0.0.1",
    );

    expect(createSessionMock).toHaveBeenCalledWith({
      userId: "u2",
      username: "player1",
      isAdmin: false,
    });
    expect(dbMock.login_attempts.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          username: "player1",
          ip_address: "127.0.0.1",
          success: true,
        }),
      }),
    );
  });
});
