import { serverHttpRequest } from "@/lib/api/server-http-client";

export interface GroupDetailsDto {
  id: string;
  name: string;
  invite_code: string;
  owner_id: string | null;
  group_members: {
    user_id: string;
    users: {
      id: string;
      username: string;
    };
  }[];
  peladas: {
    id: string;
    name: string;
    played_at: string;
    status: string;
    users: {
      username: string;
    };
    _count: {
      pelada_participants: number;
      ratings: number;
    };
  }[];
}

export interface PeladaDetailsDto {
  id: string;
  group_id: string;
  name: string;
  played_at: string;
  status: string;
  groups: {
    id: string;
    name: string;
    owner_id: string | null;
  };
  pelada_participants: {
    user_id: string;
    users: {
      id: string;
      username: string;
    };
  }[];
  pelada_results: {
    rank: number;
    total_ratings: number;
    avg_rating: string | number;
    users: {
      id: string;
      username: string;
    };
  }[];
  userRatings: {
    target_id: string;
    stars: number;
  }[];
}

export async function getGroupDetailsServer(
  groupId: string,
): Promise<GroupDetailsDto | null> {
  const response = await serverHttpRequest<GroupDetailsDto | null>(`/api/group/${groupId}`);

  if (!response.success) {
    return null;
  }

  return response.data;
}

export async function getPeladaDetailsServer(
  peladaId: string,
): Promise<PeladaDetailsDto | null> {
  const response = await serverHttpRequest<PeladaDetailsDto | null>(
    `/api/group/pelada/${peladaId}`,
  );

  if (!response.success) {
    return null;
  }

  return response.data;
}
