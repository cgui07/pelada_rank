import { getCurrentUser } from "@/lib/actions/auth";
import { isAdmin } from "@/lib/auth";
import { getAllGroups } from "@/lib/actions/admin";
import { redirect } from "next/navigation";
import { AdminClient } from "./admin-client";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.username)) redirect("/");

  const groups = await getAllGroups();

  const groupsList = groups.map((g) => ({
    id: g.id,
    name: g.name,
    inviteCode: g.invite_code,
    memberCount: g._count.group_members,
    peladaCount: g._count.peladas,
    createdAt: g.created_at.toISOString(),
  }));

  return (
    <AdminClient currentUsername={user.username} groups={groupsList} />
  );
}
