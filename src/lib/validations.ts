import { z } from "zod";
import { PIN_LENGTH, MIN_STARS, MAX_STARS } from "./constants";

export const usernameSchema = z
  .string()
  .min(3, "Username deve ter pelo menos 3 caracteres")
  .max(30, "Username pode ter no máximo 30 caracteres")
  .regex(/^[a-zA-Z0-9_]+$/, "Username pode conter apenas letras, números e _");

export const pinSchema = z
  .string()
  .length(PIN_LENGTH, `PIN deve ter exatamente ${PIN_LENGTH} dígitos`)
  .regex(/^\d+$/, "PIN deve conter apenas números");

export const loginSchema = z.object({
  username: usernameSchema,
  pin: pinSchema,
});

export const registerSchema = z
  .object({
    username: usernameSchema,
    pin: pinSchema,
    confirmPin: pinSchema,
  })
  .refine((data) => data.pin === data.confirmPin, {
    message: "PINs não coincidem",
    path: ["confirmPin"],
  });

export const ratingSchema = z.object({
  peladaId: z.string().uuid(),
  targetId: z.string().uuid(),
  stars: z.number().int().min(MIN_STARS).max(MAX_STARS),
});

export const createPeladaSchema = z.object({
  groupId: z.string().uuid(),
  name: z.string().min(1, "Nome é obrigatório").max(100),
  playedAt: z.string().optional(),
  participantIds: z.array(z.string().uuid()).min(2, "Mínimo 2 participantes"),
});

export const resetPinSchema = z.object({
  targetUsername: usernameSchema,
  newPin: pinSchema,
});
