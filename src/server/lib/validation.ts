import { z, type ZodTypeAny } from "zod";
import { ApiRouteError } from "@/server/lib/api-handler";

export function parseInput<TSchema extends ZodTypeAny>(
  schema: TSchema,
  input: unknown,
): z.infer<TSchema> {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    throw new ApiRouteError(parsed.error.issues[0]?.message || "Dados invalidos", 400);
  }

  return parsed.data;
}
