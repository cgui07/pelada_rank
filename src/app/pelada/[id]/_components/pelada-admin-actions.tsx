"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Lock } from "lucide-react";

interface PeladaAdminActionsProps {
  isPending: boolean;
  onCloseVoting: () => void;
}

export function PeladaAdminActions({
  isPending,
  onCloseVoting,
}: PeladaAdminActionsProps) {
  return (
    <>
      <Separator />
      <div className="bg-card border rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-sm">Acoes do Admin</h3>
        <Button
          variant="destructive"
          onClick={onCloseVoting}
          disabled={isPending}
          className="w-full"
        >
          {isPending ? (
            <Spinner size="sm" className="text-danger-foreground" />
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Encerrar Votacao e Gerar Ranking
            </>
          )}
        </Button>
      </div>
    </>
  );
}

