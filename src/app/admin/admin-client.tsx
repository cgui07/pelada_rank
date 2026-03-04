"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield } from "lucide-react";
import type { GroupItem } from "./_components/types";
import { Separator } from "@/components/ui/separator";
import { AuditLogSection } from "./_components/audit-log-section";
import { PinResetSection } from "./_components/pin-reset-section";
import { GroupsListSection } from "./_components/groups-list-section";
import { CreateGroupSection } from "./_components/create-group-section";

interface AdminClientProps {
  currentUsername: string;
  groups: GroupItem[];
}

export function AdminClient({ currentUsername, groups }: AdminClientProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Shield className="h-5 w-5 text-brand" />
            <h1 className="text-xl font-bold">Painel Admin</h1>
          </div>
          <Badge variant="secondary">{currentUsername}</Badge>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        <GroupsListSection groups={groups} />
        <Separator />
        <CreateGroupSection />
        <Separator />
        <PinResetSection />
        <Separator />
        <AuditLogSection />
      </main>
    </div>
  );
}
