import type { PeladaStatus } from "@/lib/domain/pelada";
import { groupRouter } from "@/server/modules/group/router";
import { handleApiRoute, readJsonBody } from "@/server/lib/api-handler";

interface PeladaStatusRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: PeladaStatusRouteContext) {
  return handleApiRoute(async () => {
    const body = await readJsonBody(request);
    const { id } = await context.params;

    await groupRouter.updatePeladaStatus({
      peladaId: id,
      status: (body as { status?: PeladaStatus }).status,
    });

    return null;
  });
}
