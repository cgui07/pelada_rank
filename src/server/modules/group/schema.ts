import { z } from "zod";
import { createPeladaSchema } from "@/lib/validations";

export const joinGroupInputSchema = z.object({
  inviteCode: z.string().min(1, "Codigo de convite obrigatorio"),
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
  status: z.enum(["open", "voting", "closed"]),
});
