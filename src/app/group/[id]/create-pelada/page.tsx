import { getGroupDetails } from "@/lib/actions/group";
import { getCurrentUser } from "@/lib/actions/auth";
import { isAdmin } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { CreatePeladaClient } from "./create-pelada-client";

interface CreatePeladaPageProps {
  params: Promise<{ id: string }>;
}

export default async function CreatePeladaPage({
  params,
}: CreatePeladaPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/");
  if (!isAdmin(user.username)) redirect(`/group/${id}`);

  const group = await getGroupDetails(id);
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
    />
  );
}
