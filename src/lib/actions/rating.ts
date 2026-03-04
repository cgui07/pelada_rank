"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ratingSchema } from "@/lib/validations";

export async function submitRating(data: {
  peladaId: string;
  targetId: string;
  stars: number;
}): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Não autenticado" };

  const parsed = ratingSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { peladaId, targetId, stars } = parsed.data;

  if (session.userId === targetId) {
    return { success: false, error: "Você não pode avaliar a si mesmo" };
  }

  const pelada = await db.peladas.findUnique({
    where: { id: peladaId },
  });
  if (!pelada || pelada.status !== "voting") {
    return {
      success: false,
      error: "Pelada não está aberta para votação",
    };
  }

  const isParticipant = await db.pelada_participants.findFirst({
    where: { pelada_id: peladaId, user_id: session.userId },
  });
  if (!isParticipant) {
    return {
      success: false,
      error: "Você não é participante desta pelada",
    };
  }

  const targetParticipant = await db.pelada_participants.findFirst({
    where: { pelada_id: peladaId, user_id: targetId },
  });
  if (!targetParticipant) {
    return { success: false, error: "Jogador alvo não é participante" };
  }

  await db.ratings.upsert({
    where: {
      pelada_id_evaluator_id_target_id: {
        pelada_id: peladaId,
        evaluator_id: session.userId,
        target_id: targetId,
      },
    },
    create: {
      pelada_id: peladaId,
      evaluator_id: session.userId,
      target_id: targetId,
      stars,
    },
    update: {
      stars,
    },
  });

  return { success: true };
}

export async function submitAllRatings(data: {
  peladaId: string;
  ratings: { targetId: string; stars: number }[];
}): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Não autenticado" };

  const { peladaId, ratings } = data;

  const pelada = await db.peladas.findUnique({
    where: { id: peladaId },
  });
  if (!pelada || pelada.status !== "voting") {
    return { success: false, error: "Pelada não está aberta para votação" };
  }

  const isParticipant = await db.pelada_participants.findFirst({
    where: { pelada_id: peladaId, user_id: session.userId },
  });
  if (!isParticipant) {
    return { success: false, error: "Você não é participante desta pelada" };
  }

  for (const rating of ratings) {
    if (session.userId === rating.targetId) continue;
    if (rating.stars < 1 || rating.stars > 5) continue;

    await db.ratings.upsert({
      where: {
        pelada_id_evaluator_id_target_id: {
          pelada_id: peladaId,
          evaluator_id: session.userId,
          target_id: rating.targetId,
        },
      },
      create: {
        pelada_id: peladaId,
        evaluator_id: session.userId,
        target_id: rating.targetId,
        stars: rating.stars,
      },
      update: {
        stars: rating.stars,
      },
    });
  }

  return { success: true };
}

export async function getVotingProgress(peladaId: string) {
  const session = await getSession();
  if (!session) return null;

  const participants = await db.pelada_participants.findMany({
    where: { pelada_id: peladaId },
    include: { users: { select: { id: true, username: true } } },
  });

  const totalParticipants = participants.length;
  const othersToRate = totalParticipants - 1;

  const progress = await Promise.all(
    participants.map(async (p) => {
      const ratedCount = await db.ratings.count({
        where: { pelada_id: peladaId, evaluator_id: p.user_id },
      });
      return {
        userId: p.user_id,
        username: p.users.username,
        rated: ratedCount,
        total: othersToRate,
        complete: ratedCount >= othersToRate,
      };
    }),
  );

  return { participants: progress, totalParticipants };
}
