"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { HistoryPeladaItem } from "./types";

interface ClosedPeladasSectionProps {
  peladas: HistoryPeladaItem[];
  routePrefix: string;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
}

export function ClosedPeladasSection({
  peladas,
  routePrefix,
  dateFilter,
  onDateFilterChange,
}: ClosedPeladasSectionProps) {
  const filteredPeladas = dateFilter
    ? peladas.filter((pelada) => pelada.playedAt.startsWith(dateFilter))
    : peladas;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Peladas Encerradas</h2>
        <Input
          type="month"
          value={dateFilter}
          onChange={(e) => onDateFilterChange(e.target.value)}
          className="text-sm w-auto"
          aria-label="Filtrar por mes"
        />
      </div>
      {filteredPeladas.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhuma pelada encerrada
          {dateFilter ? " neste periodo" : ""}.
        </p>
      ) : (
        <div className="space-y-2">
          {filteredPeladas.map((pelada) => (
            <Link
              key={pelada.id}
              href={`${routePrefix}/pelada/${pelada.id}`}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div>
                <div className="font-medium text-sm">{pelada.name}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(pelada.playedAt).toLocaleDateString("pt-BR")} -{" "}
                  {pelada.participantCount} jogadores
                </div>
              </div>
              <Badge variant="outline">Ver</Badge>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

