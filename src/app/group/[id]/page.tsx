import { getGroupDetails } from "@/lib/actions/group";
import { getCurrentUser } from "@/lib/actions/auth";
import { notFound, redirect } from "next/navigation";
import { GroupDashboardClient } from "./group-client";
import { isAdmin } from "@/lib/auth";

interface GroupPageProps {
  params: Promise<{ id: string }>;
}

export default async function GroupPage({ params }: GroupPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const group = await getGroupDetails(id);
  if (!group) notFound();

  const members = group.group_members.map((gm) => ({
    id: gm.users.id,
    username: gm.users.username,
  }));

  const peladas = group.peladas.map((p) => ({
    id: p.id,
    name: p.name,
    playedAt: p.played_at.toISOString(),
    status: p.status,
    createdBy: p.users.username,
    participantCount: p._count.pelada_participants,
    ratingCount: p._count.ratings,
  }));

  return (
    <GroupDashboardClient
      groupId={group.id}
      groupName={group.name}
      inviteCode={group.invite_code}
      members={members}
      peladas={peladas}
      currentUserId={user.id}
      currentUsername={user.username}
      isCurrentUserAdmin={isAdmin(user.username)}
    />
  );
}
