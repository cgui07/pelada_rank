"use client";

import { Input } from "./input";
import { useState } from "react";
import { FormField } from "./form-field";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "./button";

interface PinFieldProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  autoComplete: string;
  placeholder?: string;
  disabled?: boolean;
}

export function PinField({
  id,
  label,
  value,
  onChange,
  error,
  helperText,
  autoComplete,
  placeholder = "****",
  disabled,
}: PinFieldProps) {
  const [showPin, setShowPin] = useState(false);

  return (
    <FormField
      id={id}
      label={label}
      error={error}
      helperText={helperText}
      disabled={disabled}
    >
      <div className="relative">
        <Input
          id={id}
          type={showPin ? "text" : "password"}
          inputMode="numeric"
          maxLength={4}
          placeholder={placeholder}
          value={value}
          onChange={(e) =>
            onChange(e.target.value.replace(/\D/g, "").slice(0, 4))
          }
          autoComplete={autoComplete}
          disabled={disabled}
          className="pr-10"
        />
        <Button
          variant="ghost"
          onClick={() => setShowPin((prev) => !prev)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={showPin ? "Ocultar PIN" : "Mostrar PIN"}
        >
          {showPin ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
    </FormField>
  );
}
