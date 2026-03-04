"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { PeladaHeaderProps } from "./types";
import { ArrowLeft, Calendar, Users } from "lucide-react";

export function PeladaHeader({
  peladaName,
  playedAt,
  status,
  participantsCount,
  groupId,
  groupName,
  routePrefix = "",
}: PeladaHeaderProps) {
  const isVoting = status === "voting";
  const isClosed = status === "closed";

  return (
    <header className="border-b bg-card">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <Link
          href={`${routePrefix}/group/${groupId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {groupName}
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{peladaName}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(playedAt).toLocaleDateString("pt-BR")}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {participantsCount} jogadores
              </span>
            </div>
          </div>
          <Badge
            variant="outline"
            className={
              isVoting
                ? "bg-warning/10 text-warning border-warning/30"
                : isClosed
                  ? "bg-muted text-muted-foreground"
                  : "bg-success/10 text-success border-success/30"
            }
          >
            {isVoting ? "Votando" : isClosed ? "Encerrada" : "Aberta"}
          </Badge>
        </div>
      </div>
    </header>
  );
}

