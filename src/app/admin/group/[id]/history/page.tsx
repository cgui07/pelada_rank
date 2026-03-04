import { getGroupDetails } from "@/lib/actions/group";
import { getGroupLeaderboard } from "@/lib/actions/history";
import { getCurrentUser } from "@/lib/actions/auth";
import { notFound, redirect } from "next/navigation";
import { HistoryClient } from "@/app/group/[id]/history/history-client";

interface AdminHistoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminHistoryPage({
  params,
}: AdminHistoryPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || !user.is_admin) redirect("/");

  const group = await getGroupDetails(id);
  if (!group) notFound();

  const leaderboard = await getGroupLeaderboard(id);

  const peladas = group.peladas
    .filter((p) => p.status === "closed")
    .map((p) => ({
      id: p.id,
      name: p.name,
      playedAt: p.played_at.toISOString(),
      participantCount: p._count.pelada_participants,
    }));

  return (
    <HistoryClient
      groupId={group.id}
      groupName={group.name}
      peladas={peladas}
      leaderboard={leaderboard || []}
      currentUserId={user.id}
      routePrefix="/admin"
    />
  );
}
