import { describe, expect, it } from "vitest";
import { buildPeladaRankingRows, computeExpectedRatingsCount } from "./ranking";

describe("pelada ranking rules", () => {
  it("computes expected ratings as n * (n - 1)", () => {
    expect(computeExpectedRatingsCount(0)).toBe(0);
    expect(computeExpectedRatingsCount(1)).toBe(0);
    expect(computeExpectedRatingsCount(4)).toBe(12);
  });

  it("applies dense ranking and deterministic tie-breakers", () => {
    const ranking = buildPeladaRankingRows(
      [
        { userId: "u1", username: "Bruno" },
        { userId: "u2", username: "Ana" },
        { userId: "u3", username: "Carlos" },
      ],
      [
        { targetId: "u1", averageStars: 4.2, totalRatings: 3 },
        { targetId: "u2", averageStars: 4.2, totalRatings: 3 },
        { targetId: "u3", averageStars: 4.2, totalRatings: 2 },
      ],
    );

    expect(ranking.map((row) => [row.username, row.rank])).toEqual([
      ["Ana", 1],
      ["Bruno", 1],
      ["Carlos", 2],
    ]);
  });

  it("includes unrated participants with zero average", () => {
    const ranking = buildPeladaRankingRows(
      [
        { userId: "u1", username: "Ana" },
        { userId: "u2", username: "Bruno" },
      ],
      [{ targetId: "u1", averageStars: 5, totalRatings: 1 }],
    );

    expect(ranking).toEqual([
      {
        userId: "u1",
        username: "Ana",
        avgRating: 5,
        totalRatings: 1,
        rank: 1,
      },
      {
        userId: "u2",
        username: "Bruno",
        avgRating: 0,
        totalRatings: 0,
        rank: 2,
      },
    ]);
  });
});

