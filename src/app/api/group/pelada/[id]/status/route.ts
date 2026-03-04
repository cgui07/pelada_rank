import { handleApiRoute, readJsonBody } from "@/server/lib/api-handler";
import { groupRouter } from "@/server/modules/group/router";

interface PeladaStatusRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: PeladaStatusRouteContext) {
  return handleApiRoute(async () => {
    const body = await readJsonBody(request);
    const { id } = await context.params;

    await groupRouter.updatePeladaStatus({
      peladaId: id,
      status: (body as { status?: "open" | "voting" | "closed" }).status,
    });

    return null;
  });
}
