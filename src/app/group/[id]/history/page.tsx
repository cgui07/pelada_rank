import { getGroupDetailsServer } from "@/lib/api/server/group-server";
import { getGroupLeaderboard } from "@/lib/actions/history";
import { getCurrentUserServer } from "@/lib/api/server/auth-server";
import { notFound, redirect } from "next/navigation";
import { HistoryClient } from "./history-client";

interface HistoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function HistoryPage({ params }: HistoryPageProps) {
  const { id } = await params;
  const user = await getCurrentUserServer();
  if (!user) redirect("/");

  const group = await getGroupDetailsServer(id);
  if (!group) notFound();

  const leaderboard = await getGroupLeaderboard(id);

  const peladas = group.peladas
    .filter((p) => p.status === "closed")
    .map((p) => ({
      id: p.id,
      name: p.name,
      playedAt: p.played_at,
      participantCount: p._count.pelada_participants,
    }));

  return (
    <HistoryClient
      groupId={group.id}
      groupName={group.name}
      peladas={peladas}
      leaderboard={leaderboard || []}
      currentUserId={user.id}
    />
  );
}
