import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { InviteClient } from "./invite-client";

interface InvitePageProps {
  params: Promise<{ code: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { code } = await params;

  const group = await db.groups.findUnique({
    where: { invite_code: code },
    select: { id: true, name: true },
  });

  if (!group) {
    notFound();
  }

  return <InviteClient inviteCode={code} />;
}
