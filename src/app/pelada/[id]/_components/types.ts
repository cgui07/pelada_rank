import type { PeladaStatus } from "@/lib/domain/pelada";

export interface PeladaParticipant {
  id: string;
  username: string;
}

export interface PeladaResultRow {
  userId: string;
  username: string;
  avgRating: number;
  rank: number;
  totalRatings: number;
}

export interface PeladaHeaderProps {
  peladaName: string;
  playedAt: string;
  status: PeladaStatus;
  participantsCount: number;
  groupId: string;
  groupName: string;
  routePrefix?: string;
}

