"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { getPlayerHistory } from "@/lib/actions/history";
import { useEffect, useState, useTransition } from "react";
import { LeaderboardSection } from "./_components/leaderboard-section";
import { ClosedPeladasSection } from "./_components/closed-peladas-section";
import { PlayerHistorySection } from "./_components/player-history-section";
import type {
  HistoryPeladaItem,
  LeaderboardPlayer,
  PlayerHistoryResult,
} from "./_components/types";

interface HistoryClientProps {
  groupId: string;
  groupName: string;
  peladas: HistoryPeladaItem[];
  leaderboard: LeaderboardPlayer[];
  currentUserId: string;
  routePrefix?: string;
}

export function HistoryClient({
  groupId,
  groupName,
  peladas,
  leaderboard,
  currentUserId,
  routePrefix = "",
}: HistoryClientProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [playerData, setPlayerData] = useState<{
    user: { id: string; username: string } | null;
    results: PlayerHistoryResult[];
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    if (!selectedPlayer) {
      return;
    }

    startTransition(async () => {
      const data = await getPlayerHistory(groupId, selectedPlayer);
      setPlayerData(data);
    });
  }, [groupId, selectedPlayer]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href={`${routePrefix}/group/${groupId}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {groupName}
          </Link>
          <h1 className="text-xl font-bold">Historico e Rankings</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        <LeaderboardSection
          leaderboard={leaderboard}
          selectedPlayerId={selectedPlayer}
          currentUserId={currentUserId}
          onSelectPlayer={(userId) => {
            setSelectedPlayer((previous) => {
              const nextSelected = previous === userId ? null : userId;
              if (!nextSelected) {
                setPlayerData(null);
              }
              return nextSelected;
            });
          }}
        />

        {selectedPlayer && (
          <PlayerHistorySection
            isPending={isPending}
            playerData={playerData}
            routePrefix={routePrefix}
          />
        )}

        <Separator />

        <ClosedPeladasSection
          peladas={peladas}
          routePrefix={routePrefix}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
        />
      </main>
    </div>
  );
}
