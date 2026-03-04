import { serverHttpRequest } from "@/lib/api/server-http-client";

export interface AdminGroupDto {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
  _count: {
    group_members: number;
    peladas: number;
  };
}

export async function getAllGroupsServer(): Promise<AdminGroupDto[]> {
  const response = await serverHttpRequest<AdminGroupDto[]>("/api/admin/group");

  if (!response.success) {
    return [];
  }

  return response.data;
}
