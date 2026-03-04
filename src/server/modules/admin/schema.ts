import { z } from "zod";
import { resetPinSchema, usernameSchema } from "@/lib/validations";

export const searchUserInputSchema = z.object({
  username: usernameSchema,
});

export const setPinInputSchema = resetPinSchema;

export const generatePinInputSchema = z.object({
  targetUsername: usernameSchema,
});

export const createGroupInputSchema = z.object({
  name: z.string().trim().min(1, "Nome do grupo obrigatorio").max(100),
  inviteCode: z
    .string()
    .trim()
    .min(1, "Codigo de convite obrigatorio")
    .max(20)
    .regex(/^[a-zA-Z0-9_-]+$/, "Codigo de convite invalido"),
});
