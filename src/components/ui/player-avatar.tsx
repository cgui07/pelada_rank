import { cn } from "@/lib/utils";

interface PlayerAvatarProps {
  username: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const avatarSizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

const colors = [
  "bg-chart-1 text-white",
  "bg-chart-2 text-white",
  "bg-chart-3 text-white",
  "bg-chart-4 text-black",
  "bg-chart-5 text-black",
  "bg-brand text-brand-foreground",
];

function getColorIndex(username: string): number {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % colors.length;
}

export function PlayerAvatar({
  username,
  size = "md",
  className,
}: PlayerAvatarProps) {
  const initials = username.slice(0, 2).toUpperCase();
  const colorClass = colors[getColorIndex(username)];

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-semibold shrink-0",
        avatarSizes[size],
        colorClass,
        className,
      )}
      aria-label={username}
    >
      {initials}
    </div>
  );
}
