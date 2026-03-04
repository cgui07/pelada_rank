import { authRouter } from "@/server/modules/auth/router";
import { handleApiRoute, readJsonBody } from "@/server/lib/api-handler";

export async function POST(request: Request) {
  return handleApiRoute(async () => {
    const body = await readJsonBody(request);

    await authRouter.register(body);
    return null;
  });
}
