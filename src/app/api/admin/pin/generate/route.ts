import { adminRouter } from "@/server/modules/admin/router";
import { handleApiRoute, readJsonBody } from "@/server/lib/api-handler";

export async function POST(request: Request) {
  return handleApiRoute(async () => {
    const body = await readJsonBody(request);

    return adminRouter.generatePin(body);
  });
}
