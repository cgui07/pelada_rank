import { serverHttpRequest } from "@/lib/api/server-http-client";
import type { CurrentUserDto } from "@/lib/api/client/auth-client";

export async function getCurrentUserServer(): Promise<CurrentUserDto | null> {
  const response = await serverHttpRequest<CurrentUserDto | null>("/api/auth/me");

  if (!response.success) {
    return null;
  }

  return response.data;
}
