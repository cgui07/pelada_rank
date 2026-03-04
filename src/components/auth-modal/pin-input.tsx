"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PinInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  placeholder?: string;
}

export function PinInput({
  id,
  value,
  onChange,
  autoComplete,
  placeholder = "****",
}: PinInputProps) {
  const [showPin, setShowPin] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        type={showPin ? "text" : "password"}
        inputMode="numeric"
        maxLength={4}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
        autoComplete={autoComplete}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShowPin((previous) => !previous)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        aria-label={showPin ? "Ocultar PIN" : "Mostrar PIN"}
      >
        {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

