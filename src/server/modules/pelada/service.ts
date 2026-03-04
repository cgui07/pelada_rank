import { z } from "zod";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { MAX_STARS, MIN_STARS } from "@/lib/constants";
import { ApiRouteError } from "@/server/lib/api-handler";
import {
  buildPeladaRankingRows,
  computeExpectedRatingsCount,
} from "./ranking";

const MAX_BULK_RATINGS = 200;

const bulkRatingsSchema = z.array(
  z.object({
    targetId: z.string().uuid(),
    stars: z.number().int().min(MIN_STARS).max(MAX_STARS),
  }),
);

export interface ClosePeladaResult {
  status: "closed" | "already_closed";
  participantCount: number;
  expectedRatings: number;
  submittedRatings: number;
}

function normalizeRatings(
  ratings: { targetId: string; stars: number }[],
): { targetId: string; stars: number }[] {
  if (ratings.length > MAX_BULK_RATINGS) {
    throw new ApiRouteError(
      `Quantidade maxima de avaliacoes por envio: ${MAX_BULK_RATINGS}`,
      400,
      "VALIDATION_ERROR",
    );
  }

  const parsed = bulkRatingsSchema.safeParse(ratings);
  if (!parsed.success) {
    throw new ApiRouteError(
      parsed.error.issues[0]?.message || "Dados invalidos",
      400,
      "VALIDATION_ERROR",
      parsed.error.issues,
    );
  }

  const deduplicatedByTarget = new Map<string, number>();

  for (const rating of parsed.data) {
    deduplicatedByTarget.set(rating.targetId, rating.stars);
  }

  return Array.from(deduplicatedByTarget.entries()).map(([targetId, stars]) => ({
    targetId,
    stars,
  }));
}

async function getVotingContext(
  tx: Prisma.TransactionClient,
  peladaId: string,
  evaluatorUserId: string,
) {
  const [pelada, participants] = await Promise.all([
    tx.peladas.findUnique({
      where: { id: peladaId },
      select: { id: true, status: true },
    }),
    tx.pelada_participants.findMany({
      where: { pelada_id: peladaId },
      select: { user_id: true },
    }),
  ]);

  if (!pelada) {
    throw new ApiRouteError("Pelada nao encontrada", 404, "NOT_FOUND");
  }

  if (pelada.status !== "voting") {
    throw new ApiRouteError(
      "Pelada nao esta aberta para votacao",
      409,
      "INVALID_STATUS",
    );
  }

  const participantIds = new Set(participants.map((participant) => participant.user_id));

  if (!participantIds.has(evaluatorUserId)) {
    throw new ApiRouteError(
      "Voce nao e participante desta pelada",
      403,
      "FORBIDDEN",
    );
  }

  return {
    participantIds,
    participantCount: participants.length,
  };
}

async function buildRankingInput(tx: Prisma.TransactionClient, peladaId: string) {
  const [participants, aggregates] = await Promise.all([
    tx.pelada_participants.findMany({
      where: { pelada_id: peladaId },
      select: {
        user_id: true,
        users: { select: { username: true } },
      },
    }),
    tx.ratings.groupBy({
      by: ["target_id"],
      where: { pelada_id: peladaId },
      _avg: { stars: true },
      _count: { _all: true },
    }),
  ]);

  return {
    participants: participants.map((participant) => ({
      userId: participant.user_id,
      username: participant.users.username,
    })),
    aggregates: aggregates.map((aggregate) => ({
      targetId: aggregate.target_id,
      averageStars: Number(aggregate._avg.stars ?? 0),
      totalRatings: aggregate._count._all,
    })),
  };
}

export async function submitRatingsForPelada(
  peladaId: string,
  evaluatorUserId: string,
  ratingsInput: { targetId: string; stars: number }[],
): Promise<void> {
  const ratings = normalizeRatings(ratingsInput);

  await db.$transaction(async (tx) => {
    const { participantIds } = await getVotingContext(tx, peladaId, evaluatorUserId);

    for (const rating of ratings) {
      if (rating.targetId === evaluatorUserId) {
        throw new ApiRouteError(
          "Voce nao pode avaliar a si mesmo",
          400,
          "VALIDATION_ERROR",
        );
      }

      if (!participantIds.has(rating.targetId)) {
        throw new ApiRouteError(
          "Um ou mais jogadores avaliados nao sao participantes",
          400,
          "VALIDATION_ERROR",
        );
      }
    }

    await Promise.all(
      ratings.map((rating) =>
        tx.ratings.upsert({
          where: {
            pelada_id_evaluator_id_target_id: {
              pelada_id: peladaId,
              evaluator_id: evaluatorUserId,
              target_id: rating.targetId,
            },
          },
          create: {
            pelada_id: peladaId,
            evaluator_id: evaluatorUserId,
            target_id: rating.targetId,
            stars: rating.stars,
          },
          update: {
            stars: rating.stars,
          },
        }),
      ),
    );
  });
}

export async function getVotingProgressForPelada(peladaId: string) {
  const [participants, ratingsByEvaluator] = await Promise.all([
    db.pelada_participants.findMany({
      where: { pelada_id: peladaId },
      include: { users: { select: { id: true, username: true } } },
    }),
    db.ratings.groupBy({
      by: ["evaluator_id"],
      where: { pelada_id: peladaId },
      _count: { _all: true },
    }),
  ]);

  const totalParticipants = participants.length;
  const expectedRatings = computeExpectedRatingsCount(totalParticipants);
  const othersToRate = Math.max(totalParticipants - 1, 0);
  const ratingsByEvaluatorMap = new Map(
    ratingsByEvaluator.map((item) => [item.evaluator_id, item._count._all]),
  );
  const submittedRatings = Array.from(ratingsByEvaluatorMap.values()).reduce(
    (sum, value) => sum + value,
    0,
  );

  return {
    totalParticipants,
    expectedRatings,
    submittedRatings,
    participants: participants.map((participant) => {
      const ratedCount = ratingsByEvaluatorMap.get(participant.user_id) ?? 0;

      return {
        userId: participant.user_id,
        username: participant.users.username,
        rated: ratedCount,
        total: othersToRate,
        complete: ratedCount >= othersToRate,
      };
    }),
  };
}

export async function canUserAccessPelada(
  peladaId: string,
  userId: string,
): Promise<boolean> {
  const pelada = await db.peladas.findFirst({
    where: {
      id: peladaId,
      OR: [
        { groups: { owner_id: userId } },
        { groups: { group_members: { some: { user_id: userId } } } },
      ],
    },
    select: { id: true },
  });

  return !!pelada;
}

export async function recomputePeladaResults(
  tx: Prisma.TransactionClient,
  peladaId: string,
): Promise<void> {
  const { participants, aggregates } = await buildRankingInput(tx, peladaId);
  const ranking = buildPeladaRankingRows(participants, aggregates);

  await tx.pelada_results.deleteMany({ where: { pelada_id: peladaId } });

  if (ranking.length === 0) {
    return;
  }

  await tx.pelada_results.createMany({
    data: ranking.map((row) => ({
      pelada_id: peladaId,
      user_id: row.userId,
      avg_rating: row.avgRating,
      total_ratings: row.totalRatings,
      rank: row.rank,
    })),
  });
}

export async function closePeladaAndPersistRanking(params: {
  peladaId: string;
  ownerUserId: string;
  allowCloseWithIncompleteRatings: boolean;
}): Promise<ClosePeladaResult> {
  return db.$transaction(
    async (tx) => {
      const pelada = await tx.peladas.findUnique({
        where: { id: params.peladaId },
        select: {
          id: true,
          status: true,
          groups: { select: { owner_id: true } },
        },
      });

      if (!pelada) {
        throw new ApiRouteError("Pelada nao encontrada", 404, "NOT_FOUND");
      }

      if (pelada.groups.owner_id !== params.ownerUserId) {
        throw new ApiRouteError(
          "Voce nao tem permissao nesta pelada",
          403,
          "FORBIDDEN",
        );
      }

      const participantCount = await tx.pelada_participants.count({
        where: { pelada_id: params.peladaId },
      });

      const expectedRatings = computeExpectedRatingsCount(participantCount);
      const submittedRatings = await tx.ratings.count({
        where: { pelada_id: params.peladaId },
      });

      if (pelada.status === "closed") {
        return {
          status: "already_closed",
          participantCount,
          expectedRatings,
          submittedRatings,
        } satisfies ClosePeladaResult;
      }

      if (pelada.status !== "voting") {
        throw new ApiRouteError(
          "Somente peladas em votacao podem ser encerradas",
          409,
          "INVALID_STATUS",
        );
      }

      if (participantCount < 2) {
        throw new ApiRouteError(
          "Pelada precisa de ao menos 2 participantes para encerrar",
          409,
          "INVALID_STATE",
        );
      }

      if (
        !params.allowCloseWithIncompleteRatings &&
        submittedRatings < expectedRatings
      ) {
        throw new ApiRouteError(
          `Votacao incompleta: ${submittedRatings}/${expectedRatings} avaliacoes`,
          409,
          "INCOMPLETE_VOTING",
          {
            submittedRatings,
            expectedRatings,
          },
        );
      }

      const updated = await tx.peladas.updateMany({
        where: {
          id: params.peladaId,
          status: { not: "closed" },
        },
        data: {
          status: "closed",
          closed_at: new Date(),
        },
      });

      if (updated.count === 0) {
        return {
          status: "already_closed",
          participantCount,
          expectedRatings,
          submittedRatings,
        } satisfies ClosePeladaResult;
      }

      await recomputePeladaResults(tx, params.peladaId);

      return {
        status: "closed",
        participantCount,
        expectedRatings,
        submittedRatings,
      } satisfies ClosePeladaResult;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}
