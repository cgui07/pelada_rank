"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { Spinner } from "@/components/ui/spinner";
import { createPelada } from "@/lib/actions/group";
import { ArrowLeft, Zap, XCircle } from "lucide-react";
import Link from "next/link";

interface CreatePeladaClientProps {
  groupId: string;
  groupName: string;
  members: { id: string; username: string }[];
}

export function CreatePeladaClient({
  groupId,
  groupName,
  members,
}: CreatePeladaClientProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [playedAt, setPlayedAt] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedIds, setSelectedIds] = useState<string[]>(
    members.map((m) => m.id),
  );
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const memberOptions = members.map((m) => ({
    value: m.id,
    label: m.username,
  }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Nome da pelada é obrigatório");
      return;
    }
    if (selectedIds.length < 2) {
      setError("Selecione pelo menos 2 participantes");
      return;
    }

    startTransition(async () => {
      const result = await createPelada({
        groupId,
        name: name.trim(),
        playedAt,
        participantIds: selectedIds,
      });

      if (result.success && result.peladaId) {
        router.push(`/pelada/${result.peladaId}`);
      } else {
        setError(result.error || "Erro ao criar pelada");
      }
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link
            href={`/group/${groupId}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {groupName}
          </Link>
          <h1 className="text-xl font-bold">Nova Pelada</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pelada-name">Nome da pelada</Label>
            <Input
              id="pelada-name"
              placeholder="Ex: Pelada de Quinta"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="played-at">Data</Label>
            <Input
              id="played-at"
              type="date"
              value={playedAt}
              onChange={(e) => setPlayedAt(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>
              Participantes ({selectedIds.length} de {members.length})
            </Label>
            <MultiSelect
              options={memberOptions}
              selected={selectedIds}
              onChange={setSelectedIds}
              placeholder="Buscar membros..."
            />
            <p className="text-xs text-muted-foreground">
              Todos os membros são pré-selecionados. Remova quem não participou.
            </p>
          </div>

          {error && (
            <div className="text-sm text-danger flex items-center gap-1.5">
              <XCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <Spinner size="sm" className="text-primary-foreground" />
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Criar Pelada & Abrir Votação
              </>
            )}
          </Button>
        </form>
      </main>
    </div>
  );
}
