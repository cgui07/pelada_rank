"use server";

import { getSession } from "@/lib/auth";
import { ratingSchema } from "@/lib/validations";
import {
  canUserAccessPelada,
  getVotingProgressForPelada,
  submitRatingsForPelada,
} from "@/server/modules/pelada/service";

export async function submitRating(data: {
  peladaId: string;
  targetId: string;
  stars: number;
}): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Nao autenticado" };
  }

  const parsed = ratingSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    await submitRatingsForPelada(parsed.data.peladaId, session.userId, [
      {
        targetId: parsed.data.targetId,
        stars: parsed.data.stars,
      },
    ]);

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Erro ao salvar avaliacao" };
  }
}

export async function submitAllRatings(data: {
  peladaId: string;
  ratings: { targetId: string; stars: number }[];
}): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Nao autenticado" };
  }

  try {
    await submitRatingsForPelada(data.peladaId, session.userId, data.ratings);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Erro ao salvar avaliacoes" };
  }
}

export async function getVotingProgress(peladaId: string) {
  const session = await getSession();
  if (!session) {
    return null;
  }

  const hasAccess = await canUserAccessPelada(peladaId, session.userId);
  if (!hasAccess) {
    return null;
  }

  return getVotingProgressForPelada(peladaId);
}

