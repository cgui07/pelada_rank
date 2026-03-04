"use client";

import { Badge } from "@/components/ui/badge";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { Spinner } from "@/components/ui/spinner";
import {
  Calendar,
  Minus,
  Star,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import type { PlayerHistoryResult } from "./types";

interface PlayerHistorySectionProps {
  isPending: boolean;
  playerData: {
    user: { id: string; username: string } | null;
    results: PlayerHistoryResult[];
  } | null;
  routePrefix: string;
}

export function PlayerHistorySection({
  isPending,
  playerData,
  routePrefix,
}: PlayerHistorySectionProps) {
  if (isPending) {
    return (
      <section className="bg-card border rounded-lg p-4">
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      </section>
    );
  }

  if (!playerData || !playerData.user) {
    return (
      <section className="bg-card border rounded-lg p-4">
        <p className="text-sm text-muted-foreground">Dados nao disponiveis.</p>
      </section>
    );
  }

  return (
    <section className="bg-card border rounded-lg p-4">
      <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
        <PlayerAvatar username={playerData.user.username} size="sm" />
        Evolucao de {playerData.user.username}
      </h3>
      {playerData.results.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum resultado ainda.</p>
      ) : (
        <div className="space-y-2">
          {playerData.results.map((result, idx) => {
            const previous = idx > 0 ? playerData.results[idx - 1].avgRating : null;
            const trend =
              previous === null
                ? "same"
                : result.avgRating > previous
                  ? "up"
                  : result.avgRating < previous
                    ? "down"
                    : "same";

            return (
              <Link
                key={result.peladaId}
                href={`${routePrefix}/pelada/${result.peladaId}`}
                className="flex items-center gap-3 p-3 rounded-md border hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium">{result.peladaName}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(result.playedAt).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {trend === "up" && <TrendingUp className="h-4 w-4 text-success" />}
                    {trend === "down" && <TrendingDown className="h-4 w-4 text-danger" />}
                    {trend === "same" && (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-sm font-semibold flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-star text-star" />
                    {result.avgRating.toFixed(2)}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {result.rank}o
                  </Badge>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

