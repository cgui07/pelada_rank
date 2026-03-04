"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle, Copy, KeyRound, Search, Shuffle, XCircle } from "lucide-react";
import { adminGeneratePin, adminSetPin, searchUser } from "@/lib/api/client/admin-client";

export function PinResetSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [foundUser, setFoundUser] = useState<{
    id: string;
    username: string;
    created_at: string;
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
      setError("PIN deve ter exatamente 4 digitos numericos");
      return;
    }

    if (!foundUser) {
      return;
    }

    startTransition(async () => {
      const result = await adminSetPin({
        targetUsername: foundUser.username,
        newPin,
      });
      if (result.success && result.pin) {
        setResultPin(result.pin);
        setSuccess("PIN definido com sucesso");
        setNewPin("");
        return;
      }

      setError(result.error || "Erro");
    });
  }

  function handleGeneratePin() {
    setError("");
    setSuccess("");
    setResultPin("");

    if (!foundUser) {
      return;
    }

    startTransition(async () => {
      const result = await adminGeneratePin(foundUser.username);
      if (result.success && result.pin) {
        setResultPin(result.pin);
        setSuccess("PIN gerado com sucesso");
        return;
      }

      setError(result.error || "Erro");
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
          placeholder="Buscar por nome do usuário..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={isPending || !searchQuery.trim()}>
          {isPending ? <Spinner size="sm" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {notFound && (
        <div className="text-sm text-danger flex items-center gap-1.5 mb-4">
          <XCircle className="h-4 w-4" />
          Usuario nao encontrado
        </div>
      )}

      {foundUser && (
        <div className="border rounded-lg p-4 bg-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{foundUser.username}</div>
              <div className="text-xs text-muted-foreground">
                Criado em {new Date(foundUser.created_at).toLocaleDateString("pt-BR")}
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
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              />
            </div>
            <Button onClick={handleSetPin} disabled={isPending} variant="outline">
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
            Gerar PIN aleatorio
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
                PIN: <span className="font-mono font-bold text-lg">{resultPin}</span>
              </span>
              <Button size="sm" variant="ghost" onClick={copyPin} className="ml-auto">
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
