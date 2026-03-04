import { beforeEach, describe, expect, it, vi } from "vitest";

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

  it("registers a regular user with role 'user'", async () => {
    dbMock.users.findFirst.mockResolvedValue(null);
    dbMock.users.create.mockResolvedValue({
      id: "u1",
      username: "player1",
      is_admin: false,
    });

    await registerUser({
      username: "player1",
      pin: "1234",
      confirmPin: "1234",
      role: "user",
    });

    expect(dbMock.users.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          username: "player1",
          pin_hash: "hash-1234",
          is_admin: false,
        }),
      }),
    );
    expect(createSessionMock).toHaveBeenCalledWith({
      userId: "u1",
      username: "player1",
      isAdmin: false,
    });
  });

  it("registers an admin user with role 'admin'", async () => {
    dbMock.users.findFirst.mockResolvedValue(null);
    dbMock.users.create.mockResolvedValue({
      id: "u2",
      username: "organizer1",
      is_admin: true,
    });

    await registerUser({
      username: "organizer1",
      pin: "5678",
      confirmPin: "5678",
      role: "admin",
    });

    expect(dbMock.users.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          username: "organizer1",
          pin_hash: "hash-5678",
          is_admin: true,
        }),
      }),
    );
    expect(createSessionMock).toHaveBeenCalledWith({
      userId: "u2",
      username: "organizer1",
      isAdmin: true,
    });
  });

  it("logs in valid users and creates session", async () => {
    dbMock.login_attempts.count.mockResolvedValue(0);
    dbMock.users.findFirst.mockResolvedValue({
      id: "u3",
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
      userId: "u3",
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
