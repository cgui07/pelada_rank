import { handleApiRoute, readJsonBody } from "@/server/lib/api-handler";
import { authRouter } from "@/server/modules/auth/router";

export async function POST(request: Request) {
  return handleApiRoute(async () => {
    const body = await readJsonBody(request);

    await authRouter.login(body, request.headers);
    return null;
  });
}
