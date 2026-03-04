import { adminRouter } from "@/server/modules/admin/router";
import { handleApiRoute, readJsonBody } from "@/server/lib/api-handler";

export async function GET() {
  return handleApiRoute(async () => adminRouter.getAllGroups());
}

export async function POST(request: Request) {
  return handleApiRoute(async () => {
    const body = await readJsonBody(request);

    return adminRouter.createGroup(body);
  });
}
