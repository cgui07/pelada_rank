"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { register } from "@/lib/api/client/auth-client";
import { CheckCircle, UserPlus, XCircle } from "lucide-react";
import { PinInput } from "./pin-input";
import { useUsernameAvailability } from "./use-username-availability";

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const { status: usernameStatus, scheduleCheck } = useUsernameAvailability();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (usernameStatus === "taken") {
      setError("Este nome do usuário já está em uso");
      return;
    }

    startTransition(async () => {
      const result = await register({ username, pin, confirmPin });
      if (result.success) {
        onSuccess();
        return;
      }

      setError(result.error || "Erro ao criar conta");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-username">Nome do usuário</Label>
        <div className="relative">
          <Input
            id="register-username"
            placeholder="Seu nome de usuário"
            value={username}
            onChange={(e) => {
              const normalized = scheduleCheck(e.target.value);
              setUsername(normalized);
            }}
            autoComplete="username"
            autoFocus
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {usernameStatus === "checking" && <Spinner size="sm" />}
            {usernameStatus === "available" && (
              <CheckCircle className="h-4 w-4 text-success" />
            )}
            {usernameStatus === "taken" && (
              <XCircle className="h-4 w-4 text-danger" />
            )}
          </div>
        </div>
        {usernameStatus === "taken" && (
          <p className="text-xs text-danger">
            Nome do usuário já está em uso. Escolha outro.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-pin">PIN (4 digitos)</Label>
        <PinInput
          id="register-pin"
          value={pin}
          onChange={setPin}
          autoComplete="new-password"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-confirm">Confirmar PIN</Label>
        <PinInput
          id="register-confirm"
          value={confirmPin}
          onChange={setConfirmPin}
          autoComplete="new-password"
        />
        {confirmPin.length === 4 && pin !== confirmPin && (
          <p className="text-xs text-danger">PINs nao coincidem</p>
        )}
      </div>

      {error && (
        <div className="text-sm text-danger flex items-center gap-1.5">
          <XCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isPending || usernameStatus === "taken"}
      >
        {isPending ? (
          <Spinner size="sm" className="text-primary-foreground" />
        ) : (
          <>
            <UserPlus className="h-4 w-4 mr-2" />
            Criar conta
          </>
        )}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        Ja tem conta?{" "}
        <Button
          type="button"
          variant="link"
          className="p-0 h-auto text-brand font-medium"
          onClick={onSwitchToLogin}
        >
          Entrar
        </Button>
      </div>
    </form>
  );
}
