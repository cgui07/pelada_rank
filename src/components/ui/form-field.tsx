"use client";

import { Label } from "./label";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { XCircle } from "lucide-react";

interface FormFieldProps {
  id?: string;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

export function FormField({
  id,
  label,
  error,
  helperText,
  required,
  disabled,
  className,
  children,
}: FormFieldProps) {
  return (
    <div
      className={cn("space-y-2", className)}
      data-disabled={disabled || undefined}
    >
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </Label>
      )}
      {children}
      {error && (
        <p className="text-xs text-danger flex items-center gap-1">
          <XCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}
