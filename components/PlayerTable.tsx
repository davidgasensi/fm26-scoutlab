"use client";

import { useState, useMemo } from "react";
import { PlayerWithScores } from "@/lib/types";
import { getPositionZone } from "@/lib/positions";
import SearchFilter from "./SearchFilter";
import PlayerRow from "./PlayerRow";

type SortMode = "csv" | "ranking";

interface PlayerTableProps {
  data: PlayerWithScores[];
}

export default function PlayerTable({ data }: PlayerTableProps) {
  const [search, setSearch] = useState("");
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("csv");

  const zoneCounts = useMemo(() => {
    const counts: Record<string, number> = { POR: 0, DEF: 0, MED: 0, ATA: 0 };

    data.forEach((d) => {
      if (search && !d.player.name.toLowerCase().includes(search.toLowerCase())) return;

      const zones = new Set(d.player.positions.map(getPositionZone));
      zones.forEach((zone) => {
        if (zone in counts) {
          counts[zone] += 1;
        }
      });
    });

    return counts;
  }, [data, search]);

  const filtered = useMemo(() => {
    const result = data.filter((d) => {
      if (search && !d.player.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (activeZone) {
        const playerZones = d.player.positions.map(getPositionZone);
        if (!playerZones.includes(activeZone)) return false;
      }
      return true;
    });

    if (sortMode === "ranking") {
      return [...result].sort((a, b) => {
        const scoreA = a.roleScores[0]?.score ?? 0;
        const scoreB = b.roleScores[0]?.score ?? 0;
        return scoreB - scoreA;
      });
    }

    return result;
  }, [data, search, activeZone, sortMode]);

  return (
    <div className="relative z-10 space-y-4">
      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        activeZone={activeZone}
        onZoneChange={setActiveZone}
        zoneCounts={zoneCounts}
      />

      {/* Results count + sort toggle */}
      <div className="flex items-center justify-between">
        <p
          className="text-xs text-[var(--color-text-muted)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {filtered.length} jugador{filtered.length !== 1 ? "es" : ""}
        </p>

        <div className="flex items-center gap-2">
          {(search || activeZone) && (
            <button
              onClick={() => { setSearch(""); setActiveZone(null); }}
              className="focus-accent interactive-press text-xs text-[var(--color-accent)] hover:underline rounded-md px-1.5 py-0.5"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Limpiar filtros
            </button>
          )}

          {/* Sort toggle */}
          <div
            className="flex rounded-lg border border-[var(--color-border-subtle)] overflow-hidden text-xs"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <button
              onClick={() => setSortMode("csv")}
              className="focus-accent interactive-press px-3 py-1.5 transition-colors"
              style={{
                backgroundColor: sortMode === "csv" ? "var(--color-accent)" : "var(--color-bg-card)",
                color: sortMode === "csv" ? "#0a0e17" : "var(--color-text-muted)",
                fontWeight: sortMode === "csv" ? 700 : 400,
              }}
            >
              CSV
            </button>
            <button
              onClick={() => setSortMode("ranking")}
              className="focus-accent interactive-press px-3 py-1.5 transition-colors flex items-center gap-1.5"
              style={{
                backgroundColor: sortMode === "ranking" ? "var(--color-accent)" : "var(--color-bg-card)",
                color: sortMode === "ranking" ? "#0a0e17" : "var(--color-text-muted)",
                fontWeight: sortMode === "ranking" ? 700 : 400,
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
              Power Ranking
            </button>
          </div>
        </div>
      </div>

      {/* Player list */}
      <div className="space-y-2">
        {filtered.map((d, i) => (
          <PlayerRow key={`${i}-${d.player.name}`} data={d} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[var(--color-text-muted)] text-sm">No se encontraron jugadores</p>
        </div>
      )}
    </div>
  );
}
