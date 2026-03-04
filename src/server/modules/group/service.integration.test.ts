import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  dbMock,
  requireSessionMock,
  requireAdminSessionMock,
  requireGroupOwnerMock,
  closePeladaAndPersistRankingMock,
} = vi.hoisted(() => ({
  dbMock: {
    groups: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    group_members: {
      upsert: vi.fn(),
      findMany: vi.fn(),
    },
    peladas: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    ratings: {
      findMany: vi.fn(),
    },
  },
  requireSessionMock: vi.fn(),
  requireAdminSessionMock: vi.fn(),
  requireGroupOwnerMock: vi.fn(),
  closePeladaAndPersistRankingMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: dbMock,
}));

vi.mock("@/server/lib/authz", () => ({
  requireSession: requireSessionMock,
  requireAdminSession: requireAdminSessionMock,
  requireGroupOwner: requireGroupOwnerMock,
}));

vi.mock("@/server/lib/config", () => ({
  serverConfig: {
    allowCloseWithIncompleteRatings: false,
  },
}));

vi.mock("@/server/modules/pelada/service", () => ({
  closePeladaAndPersistRanking: closePeladaAndPersistRankingMock,
}));

import { createPelada, joinGroupByInviteCode, updatePeladaStatus } from "./service";

describe("group service integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("joins by invite code with idempotent membership upsert", async () => {
    requireSessionMock.mockResolvedValue({ userId: "u1", username: "user", isAdmin: false });
    dbMock.groups.findUnique.mockResolvedValue({ id: "g1" });

    const groupId = await joinGroupByInviteCode("invite-123");

    expect(groupId).toBe("g1");
    expect(dbMock.group_members.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          group_id_user_id: {
            group_id: "g1",
            user_id: "u1",
          },
        },
      }),
    );
  });

  it("creates pelada with deduplicated participants", async () => {
    requireAdminSessionMock.mockResolvedValue({
      userId: "admin1",
      username: "admin",
      isAdmin: true,
    });
    requireGroupOwnerMock.mockResolvedValue({ id: "g1", owner_id: "admin1" });
    dbMock.group_members.findMany.mockResolvedValue([{ user_id: "u1" }, { user_id: "u2" }]);
    dbMock.peladas.create.mockResolvedValue({ id: "p1" });

    const peladaId = await createPelada({
      groupId: "g1",
      name: "Pelada Teste",
      playedAt: "2026-03-04",
      participantIds: ["u1", "u1", "u2"],
    });

    expect(peladaId).toBe("p1");
    expect(dbMock.peladas.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          pelada_participants: {
            create: [{ user_id: "u1" }, { user_id: "u2" }],
          },
        }),
      }),
    );
  });

  it("delegates closed status update to idempotent close service", async () => {
    requireAdminSessionMock.mockResolvedValue({
      userId: "admin1",
      username: "admin",
      isAdmin: true,
    });
    closePeladaAndPersistRankingMock.mockResolvedValue({
      status: "closed",
      participantCount: 3,
      expectedRatings: 6,
      submittedRatings: 6,
    });

    await updatePeladaStatus("pelada-1", "closed");

    expect(closePeladaAndPersistRankingMock).toHaveBeenCalledWith({
      peladaId: "pelada-1",
      ownerUserId: "admin1",
      allowCloseWithIncompleteRatings: false,
    });
  });
});
