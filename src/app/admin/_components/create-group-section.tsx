"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { createGroup } from "@/lib/api/client/admin-client";
import { CheckCircle, Copy, Plus, XCircle } from "lucide-react";

export function CreateGroupSection() {
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [createdInviteCode, setCreatedInviteCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    setError("");
    setSuccess("");
    setCreatedInviteCode("");

    if (!name.trim() || !inviteCode.trim()) {
      setError("Preencha nome e codigo de convite");
      return;
    }

    startTransition(async () => {
      const result = await createGroup({
        name: name.trim(),
        inviteCode: inviteCode.trim(),
      });
      if (result.success) {
        setCreatedInviteCode(inviteCode.trim());
        setSuccess(`Grupo "${name.trim()}" criado com sucesso`);
        setName("");
        setInviteCode("");
        return;
      }

      setError(result.error || "Erro");
    });
  }

  function copyLink() {
    const link = `${window.location.origin}/invite/${createdInviteCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Plus className="h-5 w-5" />
        Criar Grupo
      </h2>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Nome do grupo</Label>
          <Input
            placeholder="Ex: Pelada de Quinta"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Codigo de convite (usado na URL)</Label>
          <Input
            placeholder="Ex: quinta-2025"
            value={inviteCode}
            onChange={(e) =>
              setInviteCode(e.target.value.replace(/[^a-zA-Z0-9\-_]/g, "").toLowerCase())
            }
          />
          <p className="text-xs text-muted-foreground">
            O link sera: /invite/{inviteCode || "codigo"}
          </p>
        </div>

        {error && (
          <div className="text-sm text-danger flex items-center gap-1.5">
            <XCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm text-success flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4" />
            {success}
          </div>
        )}

        <Button onClick={handleCreate} disabled={isPending}>
          {isPending ? <Spinner size="sm" /> : "Criar Grupo"}
        </Button>

        {createdInviteCode && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-success/10 border border-success/30">
            <div className="flex-1 text-sm truncate">
              <span className="text-muted-foreground">Link: </span>
              <span className="font-mono font-medium">
                {typeof window !== "undefined" ? window.location.origin : ""}/invite/
                {createdInviteCode}
              </span>
            </div>
            <Button size="sm" variant="ghost" onClick={copyLink}>
              {copied ? (
                <CheckCircle className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copiado" : "Copiar"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

