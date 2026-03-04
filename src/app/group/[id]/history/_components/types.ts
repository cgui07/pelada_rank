export interface HistoryPeladaItem {
  id: string;
  name: string;
  playedAt: string;
  participantCount: number;
}

export interface LeaderboardPlayer {
  userId: string;
  username: string;
  avgRating: number;
  gamesPlayed: number;
}

export interface PlayerHistoryResult {
  peladaId: string;
  peladaName: string;
  playedAt: string;
  avgRating: number;
  rank: number;
  totalRatings: number;
}

