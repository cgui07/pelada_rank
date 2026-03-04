import { notFound } from "next/navigation";
import { InviteClient } from "./invite-client";
import { getGroupByInviteCode } from "@/server/modules/group/service";

interface InvitePageProps {
  params: Promise<{ code: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { code } = await params;

  const group = await getGroupByInviteCode(code);

  if (!group) {
    notFound();
  }

  return <InviteClient inviteCode={code} />;
}
