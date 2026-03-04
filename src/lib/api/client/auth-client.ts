import { httpRequest } from "@/lib/api/http-client";

export interface CurrentUserDto {
  id: string;
  username: string;
  is_admin: boolean;
  created_at: string;
}

export async function checkUsername(username: string): Promise<{
  available: boolean;
  error?: string;
}> {
  const response = await httpRequest<{ available: boolean }>(
    `/api/auth/check-username?username=${encodeURIComponent(username)}`,
  );

  if (!response.success) {
    return { available: false, error: response.error };
  }

  return { available: response.data.available };
}

export async function login(formData: {
  username: string;
  pin: string;
}): Promise<{ success: boolean; error?: string }> {
  const response = await httpRequest<null>("/api/auth/login", {
    method: "POST",
    body: formData,
  });

  if (!response.success) {
    return { success: false, error: response.error };
  }

  return { success: true };
}

export async function register(formData: {
  username: string;
  pin: string;
  confirmPin: string;
  requestAdmin?: boolean;
  adminBootstrapToken?: string;
}): Promise<{ success: boolean; error?: string }> {
  const response = await httpRequest<null>("/api/auth/register", {
    method: "POST",
    body: formData,
  });

  if (!response.success) {
    return { success: false, error: response.error };
  }

  return { success: true };
}

export async function logout(): Promise<void> {
  await httpRequest<null>("/api/auth/logout", { method: "POST" });
}

export async function getCurrentUser(): Promise<CurrentUserDto | null> {
  const response = await httpRequest<CurrentUserDto | null>("/api/auth/me");

  if (!response.success) {
    return null;
  }

  return response.data;
}
