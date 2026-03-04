"use client";

import { Input } from "./input";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";
import type { ReactNode } from "react";
import { FormField } from "./form-field";

interface InputFieldProps
  extends Omit<React.ComponentProps<"input">, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
}

export function InputField({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  loading,
  required,
  disabled,
  className,
  id,
  ...inputProps
}: InputFieldProps) {
  return (
    <FormField
      id={id}
      label={label}
      error={error}
      helperText={helperText}
      required={required}
      disabled={disabled}
    >
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}
        <Input
          id={id}
          required={required}
          disabled={disabled}
          className={cn(
            leftIcon && "pl-9",
            (rightIcon || loading) && "pr-9",
            className,
          )}
          {...inputProps}
        />
        {(rightIcon || loading) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {loading ? <Spinner size="sm" /> : rightIcon}
          </div>
        )}
      </div>
    </FormField>
  );
}
