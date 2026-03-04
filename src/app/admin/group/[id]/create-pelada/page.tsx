import { getCurrentUserServer } from "@/lib/api/server/auth-server";
import { getGroupDetailsServer } from "@/lib/api/server/group-server";
import { notFound, redirect } from "next/navigation";
import { CreatePeladaClient } from "@/app/group/[id]/create-pelada/create-pelada-client";

interface AdminCreatePeladaPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCreatePeladaPage({
  params,
}: AdminCreatePeladaPageProps) {
  const { id } = await params;
  const user = await getCurrentUserServer();
  if (!user || !user.is_admin) redirect("/");

  const group = await getGroupDetailsServer(id);
  if (!group) notFound();

  const members = group.group_members.map((gm) => ({
    id: gm.users.id,
    username: gm.users.username,
  }));

  return (
    <CreatePeladaClient
      groupId={group.id}
      groupName={group.name}
      members={members}
      routePrefix="/admin"
    />
  );
}
