import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";

interface PodiumProps {
  players: {
    username: string;
    avgRating: number;
    rank: number;
  }[];
}

const podiumConfig = {
  1: {
    color: "bg-gold text-black",
    height: "h-28",
    icon: "🥇",
    label: "1º Lugar",
  },
  2: {
    color: "bg-silver text-black",
    height: "h-20",
    icon: "🥈",
    label: "2º Lugar",
  },
  3: {
    color: "bg-bronze text-white",
    height: "h-14",
    icon: "🥉",
    label: "3º Lugar",
  },
} as Record<
  number,
  { color: string; height: string; icon: string; label: string }
>;

export function Podium({ players }: PodiumProps) {
  const sorted = [
    players.find((p) => p.rank === 2),
    players.find((p) => p.rank === 1),
    players.find((p) => p.rank === 3),
  ].filter(Boolean) as PodiumProps["players"];

  return (
    <div className="flex items-end justify-center gap-2 sm:gap-4">
      {sorted.map((player) => {
        const config = podiumConfig[player.rank];
        if (!config) return null;

        return (
          <div
            key={player.username}
            className="flex flex-col items-center gap-2"
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl">{config.icon}</span>
              <span className="text-sm font-semibold truncate max-w-20 sm:max-w-30">
                {player.username}
              </span>
              <span className="text-xs text-muted-foreground">
                {player.avgRating.toFixed(2)} ★
              </span>
            </div>
            <div
              className={cn(
                "w-20 sm:w-28 rounded-t-lg flex items-center justify-center",
                config.color,
                config.height,
              )}
            >
              <Trophy className="h-5 w-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
