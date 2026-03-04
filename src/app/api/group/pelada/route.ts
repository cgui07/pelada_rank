import { handleApiRoute, readJsonBody } from "@/server/lib/api-handler";
import { groupRouter } from "@/server/modules/group/router";

export async function POST(request: Request) {
  return handleApiRoute(async () => {
    const body = await readJsonBody(request);

    return groupRouter.createPelada(body);
  });
}
