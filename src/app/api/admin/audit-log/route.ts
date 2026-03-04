import { handleApiRoute } from "@/server/lib/api-handler";
import { adminRouter } from "@/server/modules/admin/router";

export async function GET() {
  return handleApiRoute(async () => adminRouter.getAuditLog());
}
