"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { login } from "@/lib/api/client/auth-client";
import { LogIn, XCircle } from "lucide-react";

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await login({ username, pin });
      if (result.success) {
        onSuccess();
        return;
      }

      setError(result.error || "Erro ao fazer login");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-username">Username</Label>
        <Input
          id="login-username"
          placeholder="seu_username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-pin">PIN (4 digitos)</Label>
        <Input
          id="login-pin"
          type="password"
          inputMode="numeric"
          maxLength={4}
          placeholder="****"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          autoComplete="current-password"
        />
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
            <LogIn className="h-4 w-4 mr-2" />
            Entrar
          </>
        )}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        Nao tem conta?{" "}
        <Button
          type="button"
          variant="link"
          className="p-0 h-auto text-brand font-medium"
          onClick={onSwitchToRegister}
        >
          Criar conta
        </Button>
      </div>
    </form>
  );
}

