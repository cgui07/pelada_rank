import type { CurrentUserDto } from "@/lib/api/client/auth-client";
import { getCurrentUser } from "@/server/modules/auth/service";

export async function getCurrentUserServer(): Promise<CurrentUserDto | null> {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  return {
    ...user,
    created_at: user.created_at.toISOString(),
  };
}
