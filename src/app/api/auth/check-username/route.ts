import { handleApiRoute } from "@/server/lib/api-handler";
import { authRouter } from "@/server/modules/auth/router";

export async function GET(request: Request) {
  return handleApiRoute(async () => {
    const { searchParams } = new URL(request.url);

    return authRouter.checkUsername({
      username: searchParams.get("username") ?? "",
    });
  });
}
