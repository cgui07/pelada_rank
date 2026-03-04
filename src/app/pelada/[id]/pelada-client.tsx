"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { submitAllRatings } from "@/lib/actions/rating";
import { updatePeladaStatus } from "@/lib/api/client/group-client";
import type { PeladaStatus } from "@/lib/domain/pelada";
import { PeladaAdminActions } from "./_components/pelada-admin-actions";
import { PeladaHeader } from "./_components/pelada-header";
import { PeladaResultsSection } from "./_components/pelada-results-section";
import { PeladaVotingSection } from "./_components/pelada-voting-section";
import type { PeladaParticipant, PeladaResultRow } from "./_components/types";

interface PeladaClientProps {
  peladaId: string;
  peladaName: string;
  playedAt: string;
  status: PeladaStatus;
  groupId: string;
  groupName: string;
  participants: PeladaParticipant[];
  currentUserId: string;
  currentUsername: string;
  isParticipant: boolean;
  isCurrentUserAdmin: boolean;
  existingRatings: Record<string, number>;
  results: PeladaResultRow[];
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
  const [ratings, setRatings] = useState<Record<string, number>>(existingRatings);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const othersToRate = participants.filter((participant) => participant.id !== currentUserId);
  const ratedCount = othersToRate.filter((participant) => ratings[participant.id]).length;
  const allRated = ratedCount === othersToRate.length;

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

      if (!result.success) {
        setError(result.error || "Erro ao salvar avaliacoes");
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  function handleCloseVoting() {
    setError("");
    startTransition(async () => {
      const result = await updatePeladaStatus(peladaId, "closed");
      if (!result.success) {
        setError(result.error || "Erro ao encerrar votacao");
        return;
      }

      router.refresh();
    });
  }

  const isVoting = status === "voting";
  const isClosed = status === "closed";

  return (
    <div className="min-h-screen bg-background">
      <PeladaHeader
        peladaName={peladaName}
        playedAt={playedAt}
        status={status}
        participantsCount={participants.length}
        groupId={groupId}
        groupName={groupName}
        routePrefix={routePrefix}
      />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {isClosed && <PeladaResultsSection results={results} />}

        {isVoting && isParticipant && (
          <PeladaVotingSection
            othersToRate={othersToRate}
            ratings={ratings}
            ratedCount={ratedCount}
            allRated={allRated}
            isPending={isPending}
            saved={saved}
            error={error}
            onRatingChange={(targetId, stars) =>
              setRatings((previous) => ({ ...previous, [targetId]: stars }))
            }
            onSave={handleSaveRatings}
          />
        )}

        {isVoting && !isParticipant && (
          <div className="text-center py-12 text-muted-foreground">
            <Lock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Voce nao e participante desta pelada.</p>
            <p className="text-sm mt-1">Apenas participantes podem votar.</p>
          </div>
        )}

        {isVoting && isCurrentUserAdmin && (
          <PeladaAdminActions isPending={isPending} onCloseVoting={handleCloseVoting} />
        )}
      </main>
    </div>
  );
}
