import { redirect } from "next/navigation";
import { AdminClient } from "./admin-client";
import { getAllGroupsServer } from "@/lib/api/server/admin-server";
import { getCurrentUserServer } from "@/lib/api/server/auth-server";

export default async function AdminPage() {
  const user = await getCurrentUserServer();
  if (!user || !user.is_admin) redirect("/");

  const groups = await getAllGroupsServer();

  const groupsList = groups.map((g) => ({
    id: g.id,
    name: g.name,
    inviteCode: g.invite_code,
    memberCount: g._count.group_members,
    peladaCount: g._count.peladas,
    createdAt: g.created_at,
  }));

  return (
    <AdminClient currentUsername={user.username} groups={groupsList} />
  );
}
