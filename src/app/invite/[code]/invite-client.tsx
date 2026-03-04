"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/auth-modal";
import { joinGroupByInviteCode } from "@/lib/api/client/group-client";
import { getCurrentUser } from "@/lib/api/client/auth-client";
import { PageLoader } from "@/components/ui/spinner";

interface InviteClientProps {
  inviteCode: string;
}

export function InviteClient({ inviteCode }: InviteClientProps) {
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const joinAndRedirect = useCallback(() => {
    startTransition(async () => {
      const result = await joinGroupByInviteCode(inviteCode);
      if (result.success && result.groupId) {
        router.push(`/group/${result.groupId}`);
      } else {
        setError(result.error || "Erro ao entrar no grupo");
        setLoading(false);
      }
    });
  }, [inviteCode, router, startTransition]);

  useEffect(() => {
    async function check() {
      const user = await getCurrentUser();
      if (user) {
        joinAndRedirect();
      } else {
        setShowAuth(true);
        setLoading(false);
      }
    }
    check();
  }, [joinAndRedirect]);

  function handleAuthSuccess() {
    setShowAuth(false);
    setLoading(true);
    joinAndRedirect();
  }

  if (loading || isPending) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <PageLoader />
        <p className="text-muted-foreground text-sm">Entrando no grupo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold text-danger">Erro</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthModal open={showAuth} onSuccess={handleAuthSuccess} />
    </div>
  );
}
