"use client";

import { Star } from "lucide-react";
import type { PeladaResultRow } from "./types";
import { Podium } from "@/components/ui/podium";
import { Separator } from "@/components/ui/separator";
import { PlayerAvatar } from "@/components/ui/player-avatar";

interface PeladaResultsSectionProps {
  results: PeladaResultRow[];
}

export function PeladaResultsSection({ results }: PeladaResultsSectionProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <>
      <section>
        <h2 className="text-lg font-semibold mb-4 text-center">Ranking Final</h2>
        <Podium players={results.slice(0, 3)} />
      </section>

      <Separator />

      <section>
        <h2 className="text-lg font-semibold mb-3">Classificacao Completa</h2>
        <div className="space-y-2">
          {results.map((result) => (
            <div
              key={result.userId}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card"
            >
              <span className="text-lg font-bold text-muted-foreground w-8 text-center">
                {result.rank}o
              </span>
              <PlayerAvatar username={result.username} size="sm" />
              <div className="flex-1">
                <div className="font-medium">{result.username}</div>
                <div className="text-xs text-muted-foreground">
                  {result.totalRatings} avaliacao(oes)
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold">
                <Star className="h-4 w-4 fill-star text-star" />
                {result.avgRating.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

