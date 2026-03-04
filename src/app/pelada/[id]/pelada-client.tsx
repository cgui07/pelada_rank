"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "@/components/ui/star-rating";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { Podium } from "@/components/ui/podium";
import { Spinner } from "@/components/ui/spinner";
import { submitAllRatings } from "@/lib/actions/rating";
import { updatePeladaStatus } from "@/lib/actions/group";
import {
  ArrowLeft,
  Save,
  CheckCircle,
  XCircle,
  Lock,
  Star,
  Calendar,
  Users,
} from "lucide-react";
import Link from "next/link";

interface PeladaClientProps {
  peladaId: string;
  peladaName: string;
  playedAt: string;
  status: string;
  groupId: string;
  groupName: string;
  participants: { id: string; username: string }[];
  currentUserId: string;
  currentUsername: string;
  isParticipant: boolean;
  isCurrentUserAdmin: boolean;
  existingRatings: Record<string, number>;
  results: {
    userId: string;
    username: string;
    avgRating: number;
    rank: number;
    totalRatings: number;
  }[];
  routePrefix?: string;
}

export function PeladaClient({
  peladaId,
  peladaName,
  playedAt,
  status,
  groupId,
  groupName,
  participants,
  currentUserId,
  isParticipant,
  isCurrentUserAdmin,
  existingRatings,
  results,
  routePrefix = "",
}: PeladaClientProps) {
  const router = useRouter();
  const [ratings, setRatings] =
    useState<Record<string, number>>(existingRatings);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const othersToRate = participants.filter((p) => p.id !== currentUserId);
  const ratedCount = othersToRate.filter((p) => ratings[p.id]).length;
  const allRated = ratedCount === othersToRate.length;
  const remaining = othersToRate.length - ratedCount;

  function handleSaveRatings() {
    setError("");
    setSaved(false);

    const ratingsList = Object.entries(ratings).map(([targetId, stars]) => ({
      targetId,
      stars,
    }));

    startTransition(async () => {
      const result = await submitAllRatings({
        peladaId,
        ratings: ratingsList,
      });

      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(result.error || "Erro ao salvar avaliações");
      }
    });
  }

  function handleCloseVoting() {
    startTransition(async () => {
      await updatePeladaStatus(peladaId, "closed");
      router.refresh();
    });
  }

  const isVoting = status === "voting";
  const isClosed = status === "closed";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link
            href={`${routePrefix}/group/${groupId}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {groupName}
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{peladaName}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(playedAt).toLocaleDateString("pt-BR")}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {participants.length} jogadores
                </span>
              </div>
            </div>
            <Badge
              variant="outline"
              className={
                isVoting
                  ? "bg-warning/10 text-warning border-warning/30"
                  : isClosed
                    ? "bg-muted text-muted-foreground"
                    : "bg-success/10 text-success border-success/30"
              }
            >
              {isVoting ? "Votando" : isClosed ? "Encerrada" : "Aberta"}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {isClosed && results.length > 0 && (
          <>
            <section>
              <h2 className="text-lg font-semibold mb-4 text-center">
                🏆 Ranking Final
              </h2>
              <Podium players={results.slice(0, 3)} />
            </section>

            <Separator />

            <section>
              <h2 className="text-lg font-semibold mb-3">
                Classificação Completa
              </h2>
              <div className="space-y-2">
                {results.map((r) => (
                  <div
                    key={r.userId}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                  >
                    <span className="text-lg font-bold text-muted-foreground w-8 text-center">
                      {r.rank}º
                    </span>
                    <PlayerAvatar username={r.username} size="sm" />
                    <div className="flex-1">
                      <div className="font-medium">{r.username}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.totalRatings} avaliação(ões)
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-semibold">
                      <Star className="h-4 w-4 fill-star text-star" />
                      {r.avgRating.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {isVoting && isParticipant && (
          <>
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">
                  Progresso da avaliação
                </span>
                <span className="text-sm text-muted-foreground">
                  {ratedCount}/{othersToRate.length}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-brand rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      othersToRate.length > 0
                        ? (ratedCount / othersToRate.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              {remaining > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Faltam {remaining} avaliação(ões)
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
                      onChange={(stars) =>
                        setRatings((prev) => ({ ...prev, [player.id]: stars }))
                      }
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
                Avaliações salvas com sucesso!
              </div>
            )}

            <Button
              onClick={handleSaveRatings}
              className="w-full"
              disabled={isPending || ratedCount === 0}
            >
              {isPending ? (
                <Spinner size="sm" className="text-primary-foreground" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {allRated ? "Salvar Todas as Avaliações" : "Salvar Progresso"}
                </>
              )}
            </Button>
          </>
        )}

        {isVoting && !isParticipant && (
          <div className="text-center py-12 text-muted-foreground">
            <Lock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Você não é participante desta pelada.</p>
            <p className="text-sm mt-1">Apenas participantes podem votar.</p>
          </div>
        )}

        {isVoting && isCurrentUserAdmin && (
          <>
            <Separator />
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm">Ações do Admin</h3>
              <Button
                variant="destructive"
                onClick={handleCloseVoting}
                disabled={isPending}
                className="w-full"
              >
                {isPending ? (
                  <Spinner size="sm" className="text-danger-foreground" />
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Encerrar Votação & Gerar Ranking
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
