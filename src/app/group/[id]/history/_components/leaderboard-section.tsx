"use client";

import { Star, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { LeaderboardPlayer } from "./types";
import { PlayerAvatar } from "@/components/ui/player-avatar";

interface LeaderboardSectionProps {
  leaderboard: LeaderboardPlayer[];
  selectedPlayerId: string | null;
  currentUserId: string;
  onSelectPlayer: (userId: string) => void;
}

export function LeaderboardSection({
  leaderboard,
  selectedPlayerId,
  currentUserId,
  onSelectPlayer,
}: LeaderboardSectionProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Trophy className="h-5 w-5" />
        Ranking Geral
      </h2>
      {leaderboard.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nenhum resultado ainda. Encerre peladas para ver o ranking.
        </p>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((player, idx) => (
            <Button
              key={player.userId}
              variant="ghost"
              onClick={() => onSelectPlayer(player.userId)}
              className={`flex items-center gap-3 p-3 rounded-lg border bg-card w-full text-left transition-colors hover:bg-accent/50 h-auto justify-start ${
                selectedPlayerId === player.userId ? "ring-2 ring-brand" : ""
              }`}
            >
              <span className="text-lg font-bold text-muted-foreground w-8 text-center">
                {idx + 1}o
              </span>
              <PlayerAvatar username={player.username} size="sm" />
              <div className="flex-1">
                <div className="font-medium">
                  {player.username}
                  {player.userId === currentUserId && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Voce
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {player.gamesPlayed} pelada(s)
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold">
                <Star className="h-4 w-4 fill-star text-star" />
                {player.avgRating.toFixed(2)}
              </div>
            </Button>
          ))}
        </div>
      )}
    </section>
  );
}

