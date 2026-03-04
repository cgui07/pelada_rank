"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { login, register, checkUsername } from "@/lib/actions/auth";
import { Shield, LogIn, UserPlus, CheckCircle, XCircle } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onSuccess: () => void;
}

export function AuthModal({ open, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <div className="flex items-center justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-brand" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            {mode === "login" ? "Entrar" : "Criar Conta"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === "login"
              ? "Entre com seu username e PIN de 4 dígitos"
              : "Crie sua conta para participar da pelada"}
          </DialogDescription>
        </DialogHeader>

        {mode === "login" ? (
          <LoginForm
            onSuccess={onSuccess}
            onSwitchToRegister={() => setMode("register")}
          />
        ) : (
          <RegisterForm
            onSuccess={onSuccess}
            onSwitchToLogin={() => setMode("login")}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function LoginForm({
  onSuccess,
  onSwitchToRegister,
}: {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}) {
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
      } else {
        setError(result.error || "Erro ao fazer login");
      }
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
        <Label htmlFor="login-pin">PIN (4 dígitos)</Label>
        <Input
          id="login-pin"
          type="password"
          inputMode="numeric"
          maxLength={4}
          placeholder="••••"
          value={pin}
          onChange={(e) =>
            setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
          }
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
        Não tem conta?{" "}
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

function RegisterForm({
  onSuccess,
  onSwitchToLogin,
}: {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}) {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");

  useEffect(() => {
    if (username.length < 3) {
      setUsernameStatus("idle");
      return;
    }

    setUsernameStatus("checking");
    const timer = setTimeout(async () => {
      const result = await checkUsername(username);
      setUsernameStatus(result.available ? "available" : "taken");
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (usernameStatus === "taken") {
      setError("Este username já está em uso");
      return;
    }

    startTransition(async () => {
      const result = await register({ username, pin, confirmPin });
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Erro ao criar conta");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-username">Username</Label>
        <div className="relative">
          <Input
            id="register-username"
            placeholder="seu_username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))
            }
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
            Username já está em uso. Escolha outro.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-pin">PIN (4 dígitos)</Label>
        <Input
          id="register-pin"
          type="password"
          inputMode="numeric"
          maxLength={4}
          placeholder="••••"
          value={pin}
          onChange={(e) =>
            setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
          }
          autoComplete="new-password"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-confirm">Confirmar PIN</Label>
        <Input
          id="register-confirm"
          type="password"
          inputMode="numeric"
          maxLength={4}
          placeholder="••••"
          value={confirmPin}
          onChange={(e) =>
            setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))
          }
          autoComplete="new-password"
        />
        {confirmPin.length === 4 && pin !== confirmPin && (
          <p className="text-xs text-danger">PINs não coincidem</p>
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
        Já tem conta?{" "}
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
