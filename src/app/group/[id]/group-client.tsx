"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import {
  Plus,
  Users,
  Trophy,
  Calendar,
  Copy,
  CheckCircle,
  BarChart3,
  LogOut,
  Clock,
  Vote,
  Lock,
} from "lucide-react";
import { logout } from "@/lib/api/client/auth-client";
import type { PeladaStatus } from "@/lib/domain/pelada";
import Link from "next/link";

interface GroupDashboardClientProps {
  groupId: string;
  groupName: string;
  inviteCode: string;
  members: { id: string; username: string }[];
  peladas: {
    id: string;
    name: string;
    playedAt: string;
    status: PeladaStatus;
    createdBy: string;
    participantCount: number;
    ratingCount: number;
  }[];
  currentUserId: string;
  currentUsername: string;
  isCurrentUserAdmin: boolean;
  routePrefix?: string;
}

const statusConfig: Record<PeladaStatus, { label: string; color: string; icon: React.ReactNode }> = {
  open: {
    label: "Aberta",
    color: "bg-success/10 text-success border-success/30",
    icon: <Clock className="h-3 w-3" />,
  },
  voting: {
    label: "Votando",
    color: "bg-warning/10 text-warning border-warning/30",
    icon: <Vote className="h-3 w-3" />,
  },
  closed: {
    label: "Encerrada",
    color: "bg-muted text-muted-foreground border-border",
    icon: <Lock className="h-3 w-3" />,
  },
};

export function GroupDashboardClient({
  groupId,
  groupName,
  inviteCode,
  members,
  peladas,
  currentUserId,
  currentUsername,
  isCurrentUserAdmin,
  routePrefix = "",
}: GroupDashboardClientProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const groupRoute = `${routePrefix}/group/${groupId}`;
  const createPeladaRoute = `${groupRoute}/create-pelada`;
  const historyRoute = `${groupRoute}/history`;

  function copyInviteLink() {
    const link = `${window.location.origin}/invite/${inviteCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{groupName}</h1>
            <p className="text-sm text-muted-foreground">
              {members.length} membros • Logado como{" "}
              <span className="font-medium text-foreground">
                {currentUsername}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isCurrentUserAdmin && (
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  Admin
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await logout();
                router.push("/");
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-2 p-3 rounded-lg border bg-card">
          <div className="flex-1 text-sm text-muted-foreground truncate">
            Link de convite:{" "}
            <span className="font-mono text-foreground">
              /invite/{inviteCode}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={copyInviteLink}>
            {copied ? (
              <CheckCircle className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copiado!" : "Copiar"}
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {isCurrentUserAdmin && (
            <Link href={createPeladaRoute}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Pelada
              </Button>
            </Link>
          )}
          <Link href={historyRoute}>
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Histórico
            </Button>
          </Link>
        </div>

        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Peladas
          </h2>
          {peladas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card">
              <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma pelada ainda.</p>
              {isCurrentUserAdmin && (
                <p className="text-sm mt-1">Crie a primeira pelada!</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {peladas.map((pelada) => {
                const sc = statusConfig[pelada.status];
                return (
                  <Link
                    key={pelada.id}
                    href={`${routePrefix}/pelada/${pelada.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium">{pelada.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {new Date(pelada.playedAt).toLocaleDateString(
                              "pt-BR",
                            )}
                            <span>•</span>
                            <Users className="h-3 w-3" />
                            {pelada.participantCount} jogadores
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={`gap-1 ${sc.color}`}>
                        {sc.icon}
                        {sc.label}
                      </Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <Separator />

        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Membros ({members.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-2 p-2 rounded-lg border bg-card"
              >
                <PlayerAvatar username={m.username} size="sm" />
                <span className="text-sm font-medium truncate">
                  {m.username}
                </span>
                {m.id === currentUserId && (
                  <Badge variant="secondary" className="text-xs ml-auto">
                    Você
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
