import { handleApiRoute } from "@/server/lib/api-handler";
import { groupRouter } from "@/server/modules/group/router";

interface GroupRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, context: GroupRouteContext) {
  return handleApiRoute(async () => {
    const { id } = await context.params;
    return groupRouter.getDetails({ groupId: id });
  });
}
