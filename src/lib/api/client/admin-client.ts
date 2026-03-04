import { httpRequest } from "@/lib/api/http-client";

export interface AdminSearchedUserDto {
  id: string;
  username: string;
  created_at: string;
}

export interface AdminAuditLogDto {
  id: string;
  admin_username: string;
  target_username: string;
  action_type: string;
  created_at: string;
}

export async function searchUser(
  username: string,
): Promise<AdminSearchedUserDto | null> {
  const response = await httpRequest<AdminSearchedUserDto | null>(
    `/api/admin/user/search?username=${encodeURIComponent(username)}`,
  );

  if (!response.success) {
    return null;
  }

  return response.data;
}

export async function adminSetPin(data: {
  targetUsername: string;
  newPin: string;
}): Promise<{ success: boolean; pin?: string; error?: string }> {
  const response = await httpRequest<{ pin: string }>("/api/admin/pin/set", {
    method: "POST",
    body: data,
  });

  if (!response.success) {
    return { success: false, error: response.error };
  }

  return { success: true, pin: response.data.pin };
}

export async function adminGeneratePin(
  targetUsername: string,
): Promise<{ success: boolean; pin?: string; error?: string }> {
  const response = await httpRequest<{ pin: string }>("/api/admin/pin/generate", {
    method: "POST",
    body: { targetUsername },
  });

  if (!response.success) {
    return { success: false, error: response.error };
  }

  return { success: true, pin: response.data.pin };
}

export async function getAuditLog(): Promise<AdminAuditLogDto[]> {
  const response = await httpRequest<AdminAuditLogDto[]>("/api/admin/audit-log");

  if (!response.success) {
    return [];
  }

  return response.data;
}

export async function createGroup(data: {
  name: string;
  inviteCode: string;
}): Promise<{ success: boolean; groupId?: string; error?: string }> {
  const response = await httpRequest<{ groupId: string }>("/api/admin/group", {
    method: "POST",
    body: data,
  });

  if (!response.success) {
    return { success: false, error: response.error };
  }

  return { success: true, groupId: response.data.groupId };
}
