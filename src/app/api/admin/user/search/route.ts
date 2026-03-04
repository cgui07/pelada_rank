import { handleApiRoute } from "@/server/lib/api-handler";
import { adminRouter } from "@/server/modules/admin/router";

export async function GET(request: Request) {
  return handleApiRoute(async () => {
    const { searchParams } = new URL(request.url);

    return adminRouter.searchUser({
      username: searchParams.get("username") ?? "",
    });
  });
}
