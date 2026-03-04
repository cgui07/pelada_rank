"use client";

import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle, Save, XCircle } from "lucide-react";
import type { PeladaParticipant } from "./types";

interface PeladaVotingSectionProps {
  othersToRate: PeladaParticipant[];
  ratings: Record<string, number>;
  ratedCount: number;
  allRated: boolean;
  isPending: boolean;
  saved: boolean;
  error: string;
  onRatingChange: (targetId: string, stars: number) => void;
  onSave: () => void;
}

export function PeladaVotingSection({
  othersToRate,
  ratings,
  ratedCount,
  allRated,
  isPending,
  saved,
  error,
  onRatingChange,
  onSave,
}: PeladaVotingSectionProps) {
  const remaining = othersToRate.length - ratedCount;

  return (
    <>
      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">Progresso da avaliacao</span>
          <span className="text-sm text-muted-foreground">
            {ratedCount}/{othersToRate.length}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-brand rounded-full transition-all duration-300"
            style={{
              width: `${
                othersToRate.length > 0 ? (ratedCount / othersToRate.length) * 100 : 0
              }%`,
            }}
          />
        </div>
        {remaining > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            Faltam {remaining} avaliacao(oes)
          </p>
        )}
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-3">Avaliar Jogadores</h2>
        <div className="space-y-3">
          {othersToRate.map((player) => (
            <div
              key={player.id}
              className="flex items-center gap-3 p-4 rounded-lg border bg-card"
            >
              <PlayerAvatar username={player.username} />
              <div className="flex-1">
                <div className="font-medium">{player.username}</div>
              </div>
              <StarRating
                value={ratings[player.id] || 0}
                onChange={(stars) => onRatingChange(player.id, stars)}
                size="lg"
              />
            </div>
          ))}
        </div>
      </section>

      {error && (
        <div className="text-sm text-danger flex items-center gap-1.5">
          <XCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {saved && (
        <div className="text-sm text-success flex items-center gap-1.5">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Avaliacoes salvas com sucesso!
        </div>
      )}

      <Button onClick={onSave} className="w-full" disabled={isPending || ratedCount === 0}>
        {isPending ? (
          <Spinner size="sm" className="text-primary-foreground" />
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            {allRated ? "Salvar Todas as Avaliacoes" : "Salvar Progresso"}
          </>
        )}
      </Button>
    </>
  );
}

