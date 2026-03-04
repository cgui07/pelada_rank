"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
  className,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  const displayValue = hovered || value;

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role="radiogroup"
      aria-label="Avaliação por estrelas"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={cn(
            "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm",
            !readonly && "cursor-pointer hover:scale-110 active:scale-95",
            readonly && "cursor-default",
          )}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" && star < 5) onChange?.(star + 1);
            if (e.key === "ArrowLeft" && star > 1) onChange?.(star - 1);
          }}
          role="radio"
          aria-checked={star === value}
          aria-label={`${star} estrela${star > 1 ? "s" : ""}`}
          tabIndex={star === value ? 0 : -1}
        >
          <Star
            className={cn(
              sizes[size],
              "transition-colors duration-150",
              star <= displayValue
                ? "fill-star text-star"
                : "fill-transparent text-star-empty",
            )}
          />
        </button>
      ))}
    </div>
  );
}
