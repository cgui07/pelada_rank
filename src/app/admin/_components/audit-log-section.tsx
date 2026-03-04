"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getAuditLog } from "@/lib/api/client/admin-client";
import { ClipboardList } from "lucide-react";

export function AuditLogSection() {
  const [logs, setLogs] = useState<
    {
      id: string;
      admin_username: string;
      target_username: string;
      action_type: string;
      created_at: string;
    }[]
  >([]);
  const [loaded, setLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  function loadLogs() {
    startTransition(async () => {
      const data = await getAuditLog();
      setLogs(data);
      setLoaded(true);
    });
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <ClipboardList className="h-5 w-5" />
        Log de Auditoria
      </h2>

      {!loaded ? (
        <Button variant="outline" onClick={loadLogs} disabled={isPending}>
          {isPending ? <Spinner size="sm" /> : "Carregar Logs"}
        </Button>
      ) : logs.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum registro.</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-2 rounded border bg-card text-sm"
            >
              <div>
                <span className="font-medium">{log.admin_username}</span>
                {" -> "}
                <span className="font-medium">{log.target_username}</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {log.action_type === "pin_set" ? "PIN Manual" : "PIN Gerado"}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(log.created_at).toLocaleString("pt-BR")}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

