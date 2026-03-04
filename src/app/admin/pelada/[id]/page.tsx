import { getCurrentUserServer } from "@/lib/api/server/auth-server";
import { getPeladaDetailsServer } from "@/lib/api/server/group-server";
import { notFound, redirect } from "next/navigation";
import { PeladaClient } from "@/app/pelada/[id]/pelada-client";

interface AdminPeladaPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPeladaPage({
  params,
}: AdminPeladaPageProps) {
  const { id } = await params;
  const user = await getCurrentUserServer();
  if (!user || !user.is_admin) redirect("/");

  const pelada = await getPeladaDetailsServer(id);
  if (!pelada) notFound();

  const isParticipant = pelada.pelada_participants.some(
    (p) => p.user_id === user.id,
  );

  const participants = pelada.pelada_participants.map((p) => ({
    id: p.users.id,
    username: p.users.username,
  }));

  const existingRatings = pelada.userRatings.reduce(
    (acc, r) => ({ ...acc, [r.target_id]: r.stars }),
    {} as Record<string, number>,
  );

  const results = pelada.pelada_results.map((r) => ({
    userId: r.users.id,
    username: r.users.username,
    avgRating: Number(r.avg_rating),
    rank: r.rank,
    totalRatings: r.total_ratings,
  }));

  return (
    <PeladaClient
      peladaId={pelada.id}
      peladaName={pelada.name}
      playedAt={pelada.played_at}
      status={pelada.status}
      groupId={pelada.groups.id}
      groupName={pelada.groups.name}
      participants={participants}
      currentUserId={user.id}
      currentUsername={user.username}
      isParticipant={isParticipant}
      isCurrentUserAdmin
      existingRatings={existingRatings}
      results={results}
      routePrefix="/admin"
    />
  );
}
