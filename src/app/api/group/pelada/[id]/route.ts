import { handleApiRoute } from "@/server/lib/api-handler";
import { groupRouter } from "@/server/modules/group/router";

interface PeladaRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, context: PeladaRouteContext) {
  return handleApiRoute(async () => {
    const { id } = await context.params;
    return groupRouter.getPeladaDetails({ peladaId: id });
  });
}
