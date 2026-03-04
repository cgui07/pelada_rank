"use client";

import { useState } from "react";
import { Shield } from "lucide-react";
import { LoginForm } from "@/components/auth-modal/login-form";
import { RegisterForm } from "@/components/auth-modal/register-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
              ? "Entre com seu nome de usuário e PIN de 4 digitos"
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
