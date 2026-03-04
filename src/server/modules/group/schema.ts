import { z } from "zod";
import { createPeladaSchema } from "@/lib/validations";
import { PELADA_STATUS_VALUES } from "@/lib/domain/pelada";

export const joinGroupInputSchema = z.object({
  inviteCode: z.string().trim().min(1, "Codigo de convite obrigatorio"),
});

export const groupIdInputSchema = z.object({
  groupId: z.string().uuid(),
});

export const peladaIdInputSchema = z.object({
  peladaId: z.string().uuid(),
});

export const createPeladaInputSchema = createPeladaSchema;

export const updatePeladaStatusInputSchema = z.object({
  peladaId: z.string().uuid(),
  status: z.enum(PELADA_STATUS_VALUES),
});
