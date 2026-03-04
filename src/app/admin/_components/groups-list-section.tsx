"use client";

import Link from "next/link";
import { useState } from "react";
import type { GroupItem } from "./types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Copy, FolderOpen, Trophy, Users } from "lucide-react";

interface GroupsListSectionProps {
  groups: GroupItem[];
}

export function GroupsListSection({ groups }: GroupsListSectionProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copyLink(inviteCode: string, groupId: string) {
    const link = `${window.location.origin}/invite/${inviteCode}`;
    navigator.clipboard.writeText(link);
    setCopiedId(groupId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <FolderOpen className="h-5 w-5" />
        Grupos ({groups.length})
      </h2>

      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum grupo criado ainda.</p>
      ) : (
        <div className="space-y-2">
          {groups.map((group) => (
            <div
              key={group.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <Link href={`/admin/group/${group.id}`} className="flex-1 min-w-0">
                <div className="font-medium">{group.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {group.memberCount} membros
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    {group.peladaCount} peladas
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(group.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </Link>
              <div className="flex items-center gap-1 shrink-0">
                <Badge variant="outline" className="text-xs font-mono">
                  {group.inviteCode}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyLink(group.inviteCode, group.id)}
                  title="Copiar link de convite"
                >
                  {copiedId === group.id ? (
                    <CheckCircle className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Link href={`/admin/group/${group.id}`}>
                  <Button size="sm" variant="outline">
                    Abrir
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

