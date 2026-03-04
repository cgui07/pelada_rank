import { getAllGroups } from "@/server/modules/admin/service";

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
  try {
    const groups = await getAllGroups();
    return groups.map((group) => ({
      ...group,
      created_at: group.created_at.toISOString(),
    }));
  } catch {
    return [];
  }
}
