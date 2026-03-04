import { beforeEach, describe, expect, it, vi } from "vitest";

const { txMock, dbMock } = vi.hoisted(() => ({
  txMock: {
    peladas: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
    },
    pelada_participants: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    ratings: {
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    pelada_results: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
  },
  dbMock: {
    $transaction: vi.fn(async (callback: (tx: unknown) => unknown) => callback(txMock)),
    pelada_participants: {
      findMany: vi.fn(),
    },
    ratings: {
      groupBy: vi.fn(),
    },
    peladas: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("@/lib/db", () => ({
  db: dbMock,
}));

import { closePeladaAndPersistRanking } from "./service";

describe("pelada service integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks close when voting is incomplete and policy is strict", async () => {
    txMock.peladas.findUnique.mockResolvedValue({
      id: "p1",
      status: "voting",
      groups: { owner_id: "owner-1" },
    });
    txMock.pelada_participants.count.mockResolvedValue(3);
    txMock.ratings.count.mockResolvedValue(5);

    await expect(
      closePeladaAndPersistRanking({
        peladaId: "p1",
        ownerUserId: "owner-1",
        allowCloseWithIncompleteRatings: false,
      }),
    ).rejects.toThrow("Votacao incompleta");
  });

  it("is idempotent when pelada is already closed", async () => {
    txMock.peladas.findUnique.mockResolvedValue({
      id: "p1",
      status: "closed",
      groups: { owner_id: "owner-1" },
    });
    txMock.pelada_participants.count.mockResolvedValue(3);
    txMock.ratings.count.mockResolvedValue(6);

    const result = await closePeladaAndPersistRanking({
      peladaId: "p1",
      ownerUserId: "owner-1",
      allowCloseWithIncompleteRatings: false,
    });

    expect(result.status).toBe("already_closed");
    expect(txMock.peladas.updateMany).not.toHaveBeenCalled();
  });

  it("closes pelada and persists ranking without N+1 queries", async () => {
    txMock.peladas.findUnique.mockResolvedValue({
      id: "p1",
      status: "voting",
      groups: { owner_id: "owner-1" },
    });
    txMock.pelada_participants.count.mockResolvedValue(3);
    txMock.ratings.count.mockResolvedValue(6);
    txMock.peladas.updateMany.mockResolvedValue({ count: 1 });
    txMock.pelada_participants.findMany.mockResolvedValue([
      { user_id: "u1", users: { username: "Ana" } },
      { user_id: "u2", users: { username: "Bruno" } },
      { user_id: "u3", users: { username: "Carlos" } },
    ]);
    txMock.ratings.groupBy.mockResolvedValue([
      { target_id: "u1", _avg: { stars: 4.5 }, _count: { _all: 2 } },
      { target_id: "u2", _avg: { stars: 4.5 }, _count: { _all: 2 } },
      { target_id: "u3", _avg: { stars: 3.0 }, _count: { _all: 2 } },
    ]);

    const result = await closePeladaAndPersistRanking({
      peladaId: "p1",
      ownerUserId: "owner-1",
      allowCloseWithIncompleteRatings: false,
    });

    expect(result.status).toBe("closed");
    expect(txMock.pelada_results.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          expect.objectContaining({ user_id: "u1", rank: 1 }),
          expect.objectContaining({ user_id: "u2", rank: 1 }),
          expect.objectContaining({ user_id: "u3", rank: 2 }),
        ],
      }),
    );
  });
});
