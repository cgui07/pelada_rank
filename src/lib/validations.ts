import { z } from "zod";
import { PIN_LENGTH, MIN_STARS, MAX_STARS } from "./constants";

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Nome do usuário deve ter pelo menos 3 caracteres")
  .max(30, "Nome do usuário pode ter no maximo 30 caracteres")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Nome do usuário pode conter apenas letras, numeros e sublinhado",
  );

export const pinSchema = z
  .string()
  .length(PIN_LENGTH, `PIN deve ter exatamente ${PIN_LENGTH} digitos`)
  .regex(/^\d+$/, "PIN deve conter apenas numeros");

export const loginSchema = z.object({
  username: usernameSchema,
  pin: pinSchema,
});

export const roleSchema = z.enum(["user", "admin"]);

export const registerSchema = z
  .object({
    username: usernameSchema,
    pin: pinSchema,
    confirmPin: pinSchema,
    role: roleSchema,
  })
  .refine((data) => data.pin === data.confirmPin, {
    message: "PINs nao coincidem",
    path: ["confirmPin"],
  });

export const ratingSchema = z.object({
  peladaId: z.string().uuid(),
  targetId: z.string().uuid(),
  stars: z.number().int().min(MIN_STARS).max(MAX_STARS),
});

export const createPeladaSchema = z.object({
  groupId: z.string().uuid(),
  name: z.string().trim().min(1, "Nome e obrigatorio").max(100),
  playedAt: z.string().optional(),
  participantIds: z
    .array(z.string().uuid())
    .min(2, "Minimo 2 participantes")
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Participantes duplicados nao sao permitidos",
    }),
});

export const resetPinSchema = z.object({
  targetUsername: usernameSchema,
  newPin: pinSchema,
});
