import { getCurrentUser } from "@/lib/actions/auth";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { HomeClient } from "./home-client";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    const membership = await db.group_members.findFirst({
      where: { user_id: user.id },
      orderBy: { joined_at: "desc" },
      select: { group_id: true },
    });

    if (membership) {
      redirect(`/group/${membership.group_id}`);
    }

    return (
      <HomeClient
        isLoggedIn
        username={user.username}
        isUserAdmin={isAdmin(user.username)}
      />
    );
  }

  return <HomeClient isLoggedIn={false} />;
}
