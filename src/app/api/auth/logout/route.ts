import { handleApiRoute } from "@/server/lib/api-handler";
import { authRouter } from "@/server/modules/auth/router";

export async function POST() {
  return handleApiRoute(async () => {
    await authRouter.logout();
    return null;
  });
}
