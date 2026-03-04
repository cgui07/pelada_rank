"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState, useRef, useEffect } from "react";
import { X, ChevronDown, Check } from "lucide-react";
import { Button } from "./button";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Selecionar...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );

  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value));
    } else {
      onChange([...selected, value]);
    }
    setSearch("");
    inputRef.current?.focus();
  }

  function remove(value: string) {
    onChange(selected.filter((s) => s !== value));
  }

  const selectedOptions = options.filter((o) => selected.includes(o.value));

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div
        className={cn(
          "flex flex-wrap items-center gap-1 min-h-10 rounded-md border border-input bg-background px-3 py-2 text-sm cursor-text",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        )}
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
      >
        {selectedOptions.map((opt) => (
          <Badge
            key={opt.value}
            variant="secondary"
            className="gap-1 pr-1 text-xs"
          >
            {opt.label}
            <Button
              variant="ghost"
              className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
              onClick={(e) => {
                e.stopPropagation();
                remove(opt.value);
              }}
              aria-label={`Remover ${opt.label}`}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setOpen(true)}
          className="flex-1 min-w-20 bg-transparent outline-none placeholder:text-muted-foreground"
          placeholder={selected.length === 0 ? placeholder : ""}
          aria-label="Buscar participante"
        />
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95">
          <div className="max-h-60 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Nenhum resultado encontrado.
              </div>
            ) : (
              filtered.map((opt) => {
                const isSelected = selected.includes(opt.value);
                return (
                  <Button
                    key={opt.value}
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus-visible:bg-accent focus-visible:text-accent-foreground",
                      isSelected && "bg-accent/50",
                    )}
                    onClick={() => toggle(opt.value)}
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-sm border",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground/50",
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    {opt.label}
                  </Button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
