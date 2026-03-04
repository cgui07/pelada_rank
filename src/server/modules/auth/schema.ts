import { z } from "zod";
import { loginSchema, registerSchema, usernameSchema } from "@/lib/validations";

export const checkUsernameInputSchema = z.object({
  username: usernameSchema,
});

export const loginInputSchema = loginSchema;

export const registerInputSchema = registerSchema.extend({
  isAdmin: z.boolean().optional(),
});
