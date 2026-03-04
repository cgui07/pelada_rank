import { redirect } from "next/navigation";
import { HomeClient } from "./home-client";
import { getCurrentUserServer } from "@/lib/api/server/auth-server";
import { getLatestGroupMembership } from "@/server/modules/group/service";

export default async function HomePage() {
  const user = await getCurrentUserServer();

  if (user) {
    if (user.is_admin) {
      redirect("/admin");
    }

    const latestGroupId = await getLatestGroupMembership(user.id);

    if (latestGroupId) {
      redirect(`/group/${latestGroupId}`);
    }

    return (
      <HomeClient
        isLoggedIn
        username={user.username}
        isUserAdmin={false}
      />
    );
  }

  return <HomeClient isLoggedIn={false} />;
}
