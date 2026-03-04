import { z } from "zod";
import { loginSchema, registerSchema, usernameSchema } from "@/lib/validations";

export const checkUsernameInputSchema = z.object({
  username: usernameSchema,
});

export const loginInputSchema = loginSchema;

export const registerInputSchema = registerSchema.extend({
  requestAdmin: z.boolean().optional(),
  adminBootstrapToken: z.string().trim().min(1).max(200).optional(),
  isAdmin: z.boolean().optional(),
});
