"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  searchUser,
  adminSetPin,
  adminGeneratePin,
  getAuditLog,
  createGroup,
} from "@/lib/actions/admin";
import {
  Search,
  KeyRound,
  Shuffle,
  Copy,
  CheckCircle,
  XCircle,
  Shield,
  Plus,
  ClipboardList,
  ArrowLeft,
  Users,
  Trophy,
  Calendar,
  FolderOpen,
} from "lucide-react";
import Link from "next/link";

interface GroupItem {
  id: string;
  name: string;
  inviteCode: string;
  memberCount: number;
  peladaCount: number;
  createdAt: string;
}

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
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground"
            >
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

// ─── Groups List Section ───────────────────────────────────
function GroupsListSection({ groups }: { groups: GroupItem[] }) {
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
        <p className="text-sm text-muted-foreground">
          Nenhum grupo criado ainda.
        </p>
      ) : (
        <div className="space-y-2">
          {groups.map((group) => (
            <div
              key={group.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <Link
                href={`/admin/group/${group.id}`}
                className="flex-1 min-w-0"
              >
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

// ─── PIN Reset Section ─────────────────────────────────────
function PinResetSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [foundUser, setFoundUser] = useState<{
    id: string;
    username: string;
    created_at: Date;
  } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [resultPin, setResultPin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSearch() {
    setFoundUser(null);
    setNotFound(false);
    setResultPin("");
    setError("");
    setSuccess("");

    startTransition(async () => {
      const user = await searchUser(searchQuery.trim());
      if (user) {
        setFoundUser(user);
      } else {
        setNotFound(true);
      }
    });
  }

  function handleSetPin() {
    setError("");
    setSuccess("");
    setResultPin("");

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setError("PIN deve ter exatamente 4 dígitos numéricos");
      return;
    }

    startTransition(async () => {
      const result = await adminSetPin({
        targetUsername: foundUser!.username,
        newPin,
      });
      if (result.success && result.pin) {
        setResultPin(result.pin);
        setSuccess("PIN definido com sucesso!");
        setNewPin("");
      } else {
        setError(result.error || "Erro");
      }
    });
  }

  function handleGeneratePin() {
    setError("");
    setSuccess("");
    setResultPin("");

    startTransition(async () => {
      const result = await adminGeneratePin(foundUser!.username);
      if (result.success && result.pin) {
        setResultPin(result.pin);
        setSuccess("PIN gerado com sucesso!");
      } else {
        setError(result.error || "Erro");
      }
    });
  }

  function copyPin() {
    navigator.clipboard.writeText(resultPin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <KeyRound className="h-5 w-5" />
        Resetar PIN
      </h2>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Buscar por username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button
          onClick={handleSearch}
          disabled={isPending || !searchQuery.trim()}
        >
          {isPending ? <Spinner size="sm" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {notFound && (
        <div className="text-sm text-danger flex items-center gap-1.5 mb-4">
          <XCircle className="h-4 w-4" />
          Usuário não encontrado
        </div>
      )}

      {foundUser && (
        <div className="border rounded-lg p-4 bg-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{foundUser.username}</div>
              <div className="text-xs text-muted-foreground">
                Criado em{" "}
                {new Date(foundUser.created_at).toLocaleDateString("pt-BR")}
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Novo PIN manual</Label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="0000"
                value={newPin}
                onChange={(e) =>
                  setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
              />
            </div>
            <Button
              onClick={handleSetPin}
              disabled={isPending}
              variant="outline"
            >
              <KeyRound className="h-4 w-4 mr-1" />
              Definir
            </Button>
          </div>

          <Button
            onClick={handleGeneratePin}
            disabled={isPending}
            variant="secondary"
            className="w-full"
          >
            <Shuffle className="h-4 w-4 mr-2" />
            Gerar PIN Aleatório
          </Button>

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

          {resultPin && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-success/10 border border-success/30">
              <span className="text-sm">
                PIN:{" "}
                <span className="font-mono font-bold text-lg">{resultPin}</span>
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={copyPin}
                className="ml-auto"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ─── Create Group Section ──────────────────────────────────
function CreateGroupSection() {
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
      setError("Preencha nome e código de convite");
      return;
    }

    startTransition(async () => {
      const result = await createGroup({
        name: name.trim(),
        inviteCode: inviteCode.trim(),
      });
      if (result.success) {
        setCreatedInviteCode(inviteCode.trim());
        setSuccess(`Grupo "${name.trim()}" criado com sucesso!`);
        setName("");
        setInviteCode("");
      } else {
        setError(result.error || "Erro");
      }
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
          <Label className="text-xs">Código de convite (usado na URL)</Label>
          <Input
            placeholder="Ex: quinta-2025"
            value={inviteCode}
            onChange={(e) =>
              setInviteCode(
                e.target.value.replace(/[^a-zA-Z0-9\-_]/g, "").toLowerCase(),
              )
            }
          />
          <p className="text-xs text-muted-foreground">
            O link será: /invite/{inviteCode || "codigo"}
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
                {typeof window !== "undefined" ? window.location.origin : ""}
                /invite/{createdInviteCode}
              </span>
            </div>
            <Button size="sm" variant="ghost" onClick={copyLink}>
              {copied ? (
                <CheckCircle className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copiado!" : "Copiar"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Audit Log Section ─────────────────────────────────────
function AuditLogSection() {
  const [logs, setLogs] = useState<
    {
      id: string;
      admin_username: string;
      target_username: string;
      action_type: string;
      created_at: Date;
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
                {" → "}
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
