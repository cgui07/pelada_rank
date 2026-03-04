"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { Spinner } from "@/components/ui/spinner";
import { getPlayerHistory } from "@/lib/actions/history";
import {
  ArrowLeft,
  Star,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
} from "lucide-react";
import Link from "next/link";

interface HistoryClientProps {
  groupId: string;
  groupName: string;
  peladas: {
    id: string;
    name: string;
    playedAt: string;
    participantCount: number;
  }[];
  leaderboard: {
    userId: string;
    username: string;
    avgRating: number;
    gamesPlayed: number;
  }[];
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
    results: {
      peladaId: string;
      peladaName: string;
      playedAt: string;
      avgRating: number;
      rank: number;
      totalRatings: number;
    }[];
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
  }, [selectedPlayer, groupId]);

  const filteredPeladas = dateFilter
    ? peladas.filter((p) => p.playedAt.startsWith(dateFilter))
    : peladas;

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
          <h1 className="text-xl font-bold">Histórico & Rankings</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
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
                  onClick={() =>
                    setSelectedPlayer(
                      selectedPlayer === player.userId ? null : player.userId,
                    )
                  }
                  className={`flex items-center gap-3 p-3 rounded-lg border bg-card w-full text-left transition-colors hover:bg-accent/50 h-auto justify-start ${
                    selectedPlayer === player.userId ? "ring-2 ring-brand" : ""
                  }`}
                >
                  <span className="text-lg font-bold text-muted-foreground w-8 text-center">
                    {idx + 1}º
                  </span>
                  <PlayerAvatar username={player.username} size="sm" />
                  <div className="flex-1">
                    <div className="font-medium">
                      {player.username}
                      {player.userId === currentUserId && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Você
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

        {selectedPlayer && (
          <section className="bg-card border rounded-lg p-4">
            {isPending ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : playerData && playerData.user ? (
              <>
                <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                  <PlayerAvatar username={playerData.user.username} size="sm" />
                  Evolução de {playerData.user.username}
                </h3>
                {playerData.results.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum resultado ainda.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {playerData.results.map((r, idx) => {
                      const prev =
                        idx > 0 ? playerData.results[idx - 1].avgRating : null;
                      const trend =
                        prev !== null
                          ? r.avgRating > prev
                            ? "up"
                            : r.avgRating < prev
                              ? "down"
                              : "same"
                          : "same";

                      return (
                        <Link
                          key={r.peladaId}
                          href={`${routePrefix}/pelada/${r.peladaId}`}
                          className="flex items-center gap-3 p-3 rounded-md border hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {r.peladaName}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(r.playedAt).toLocaleDateString("pt-BR")}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {trend === "up" && (
                                <TrendingUp className="h-4 w-4 text-success" />
                              )}
                              {trend === "down" && (
                                <TrendingDown className="h-4 w-4 text-danger" />
                              )}
                              {trend === "same" && (
                                <Minus className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="text-sm font-semibold flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-star text-star" />
                              {r.avgRating.toFixed(2)}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {r.rank}º
                            </Badge>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Dados não disponíveis.
              </p>
            )}
          </section>
        )}

        <Separator />

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Peladas Encerradas</h2>
            <Input
              type="month"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-sm w-auto"
              aria-label="Filtrar por mês"
            />
          </div>
          {filteredPeladas.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma pelada encerrada
              {dateFilter ? " neste período" : ""}.
            </p>
          ) : (
            <div className="space-y-2">
              {filteredPeladas.map((p) => (
                <Link
                  key={p.id}
                  href={`${routePrefix}/pelada/${p.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div>
                    <div className="font-medium text-sm">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(p.playedAt).toLocaleDateString("pt-BR")} •{" "}
                      {p.participantCount} jogadores
                    </div>
                  </div>
                  <Badge variant="outline">Ver</Badge>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
