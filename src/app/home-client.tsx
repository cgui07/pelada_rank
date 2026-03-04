"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/auth-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, LogIn, Shield, LogOut, Link2 } from "lucide-react";
import { logout } from "@/lib/actions/auth";
import Link from "next/link";

interface HomeClientProps {
  isLoggedIn: boolean;
  username?: string;
  isUserAdmin?: boolean;
}

export function HomeClient({
  isLoggedIn,
  username,
  isUserAdmin,
}: HomeClientProps) {
  const [showAuth, setShowAuth] = useState(false);
  const [inviteInput, setInviteInput] = useState("");
  const router = useRouter();

  function handleJoinByLink() {
    const trimmed = inviteInput.trim();
    if (!trimmed) return;

    const match = trimmed.match(/\/invite\/([A-Za-z0-9_-]+)/);
    if (match) {
      router.push(`/invite/${match[1]}`);
      return;
    }

    router.push(`/invite/${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="h-20 w-20 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto">
          <Trophy className="h-10 w-10 text-brand" />
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pelada Rank</h1>
          <p className="text-muted-foreground mt-2">
            Avalie e ranqueie os jogadores das suas peladas. Entre pelo link de
            convite do seu grupo!
          </p>
        </div>

        {isLoggedIn ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Logado como{" "}
              <span className="font-medium text-foreground">{username}</span>
            </p>

            <div className="rounded-lg border bg-card p-4 space-y-3">
              <p className="text-sm font-medium">Entrar em um grupo</p>
              <p className="text-xs text-muted-foreground">
                Cole o link de convite ou o código recebido pelo WhatsApp
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Link ou código do convite"
                  value={inviteInput}
                  onChange={(e) => setInviteInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleJoinByLink()}
                />
                <Button
                  onClick={handleJoinByLink}
                  disabled={!inviteInput.trim()}
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  Entrar
                </Button>
              </div>
            </div>

            <div className="flex gap-2 justify-center">
              {isUserAdmin && (
                <Link href="/admin">
                  <Button variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                onClick={async () => {
                  await logout();
                  router.refresh();
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Button onClick={() => setShowAuth(true)} className="w-full">
              <LogIn className="h-4 w-4 mr-2" />
              Entrar
            </Button>
            <p className="text-xs text-muted-foreground">
              Ou acesse pelo link de convite enviado pelo WhatsApp
            </p>
          </div>
        )}
      </div>

      <AuthModal
        open={showAuth}
        onSuccess={() => {
          setShowAuth(false);
          router.refresh();
        }}
      />
    </div>
  );
}
