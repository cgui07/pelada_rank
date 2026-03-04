import { groupRouter } from "@/server/modules/group/router";
import { handleApiRoute, readJsonBody } from "@/server/lib/api-handler";

export async function POST(request: Request) {
  return handleApiRoute(async () => {
    const body = await readJsonBody(request);

    return groupRouter.joinByInviteCode(body);
  });
}
