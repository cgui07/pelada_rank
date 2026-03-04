import type { PeladaStatus } from "@/lib/domain/pelada";
import { getGroupDetails, getPeladaDetails } from "@/server/modules/group/service";

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
    status: PeladaStatus;
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
  status: PeladaStatus;
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
  try {
    const group = await getGroupDetails(groupId);
    if (!group) {
      return null;
    }

    return {
      ...group,
      peladas: group.peladas.map((pelada) => ({
        ...pelada,
        played_at: pelada.played_at.toISOString(),
      })),
    };
  } catch {
    return null;
  }
}

export async function getPeladaDetailsServer(
  peladaId: string,
): Promise<PeladaDetailsDto | null> {
  try {
    const pelada = await getPeladaDetails(peladaId);
    if (!pelada) {
      return null;
    }

    return {
      ...pelada,
      played_at: pelada.played_at.toISOString(),
      pelada_results: pelada.pelada_results.map((result) => ({
        ...result,
        avg_rating: Number(result.avg_rating),
      })),
    };
  } catch {
    return null;
  }
}
