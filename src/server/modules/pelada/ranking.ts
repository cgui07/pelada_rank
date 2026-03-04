export interface RankingParticipant {
  userId: string;
  username: string;
}

export interface RankingAggregate {
  targetId: string;
  averageStars: number;
  totalRatings: number;
}

export interface PeladaRankingRow {
  userId: string;
  username: string;
  avgRating: number;
  totalRatings: number;
  rank: number;
}

function roundRating(value: number): number {
  return Math.round(value * 100) / 100;
}

function isSameRankBucket(a: PeladaRankingRow, b: PeladaRankingRow): boolean {
  return a.avgRating === b.avgRating && a.totalRatings === b.totalRatings;
}

export function computeExpectedRatingsCount(participantCount: number): number {
  if (participantCount <= 1) {
    return 0;
  }

  return participantCount * (participantCount - 1);
}

export function buildPeladaRankingRows(
  participants: RankingParticipant[],
  aggregates: RankingAggregate[],
): PeladaRankingRow[] {
  const aggregateByTarget = new Map(aggregates.map((item) => [item.targetId, item]));

  const rows = participants.map((participant) => {
    const aggregate = aggregateByTarget.get(participant.userId);

    return {
      userId: participant.userId,
      username: participant.username,
      avgRating: roundRating(aggregate?.averageStars ?? 0),
      totalRatings: aggregate?.totalRatings ?? 0,
      rank: 0,
    } satisfies PeladaRankingRow;
  });

  rows.sort((a, b) => {
    if (b.avgRating !== a.avgRating) {
      return b.avgRating - a.avgRating;
    }

    if (b.totalRatings !== a.totalRatings) {
      return b.totalRatings - a.totalRatings;
    }

    return a.username.localeCompare(b.username, "pt-BR", { sensitivity: "base" });
  });

  let denseRank = 0;
  let previous: PeladaRankingRow | null = null;

  return rows.map((row) => {
    if (!previous || !isSameRankBucket(previous, row)) {
      denseRank += 1;
      previous = row;
    }

    return {
      ...row,
      rank: denseRank,
    };
  });
}

