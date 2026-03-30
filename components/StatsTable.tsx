"use client";

import { useState, useMemo } from "react";
import { PlayerStats } from "@/lib/types";

interface StatsTableProps {
  players: PlayerStats[];
}

const COLS: { key: keyof PlayerStats; label: string; title: string; decimals?: number }[] = [
  { key: "minutes",       label: "Min",   title: "Minutos jugados" },
  { key: "starts",        label: "Tit",   title: "Partidos como titular" },
  { key: "rating",        label: "Cal",   title: "Calificación media", decimals: 2 },
  { key: "goals",         label: "Gol",   title: "Goles" },
  { key: "assists",       label: "Ast",   title: "Asistencias" },
  { key: "xG",            label: "xG",    title: "Goles esperados", decimals: 2 },
  { key: "xA",            label: "xA",    title: "Asistencias esperadas", decimals: 2 },
  { key: "shots",         label: "Dis",   title: "Disparos totales" },
  { key: "shotsOnTarget", label: "DiP",   title: "Disparos a puerta" },
  { key: "keyPasses",     label: "Clv",   title: "Pases clave" },
  { key: "dribbles",      label: "Reg",   title: "Regates completados" },
  { key: "passRatio",     label: "Pas%",  title: "Precisión de pases (%)", decimals: 1 },
  { key: "tackleCom",     label: "Ent",   title: "Entradas completadas" },
  { key: "clearances",    label: "Clr",   title: "Despejes" },
  { key: "headers",       label: "Cab",   title: "Cabeceos ganados" },
  { key: "distance",      label: "Dist",  title: "Distancia recorrida (km)", decimals: 1 },
  { key: "yellowCards",   label: "TA",    title: "Tarjetas amarillas" },
  { key: "redCards",      label: "TR",    title: "Tarjetas rojas" },
];

function getRatingColor(r: number) {
  if (r >= 7.5) return "#00ff87";
  if (r >= 7.0) return "#22c55e";
  if (r >= 6.5) return "#eab308";
  if (r >= 6.0) return "#f97316";
  return "#ef4444";
}

export default function StatsTable({ players }: StatsTableProps) {
  const [sortKey, setSortKey] = useState<keyof PlayerStats>("minutes");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [search, setSearch] = useState("");

  const sorted = useMemo(() => {
    const filtered = players.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    return [...filtered].sort((a, b) => {
      const av = (a[sortKey] as number) ?? 0;
      const bv = (b[sortKey] as number) ?? 0;
      return sortDir === "desc" ? bv - av : av - bv;
    });
  }, [players, sortKey, sortDir, search]);

  const handleSort = (key: keyof PlayerStats) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative max-w-xs">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Buscar jugador..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 rounded-lg border text-sm text-[var(--color-text-primary)] outline-none transition-all"
          style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)", fontFamily: "var(--font-mono)" }}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--color-border-subtle)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ borderCollapse: "collapse", tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "150px" }} />
              {COLS.map(({ key }) => (
                <col key={key} style={{ width: "52px" }} />
              ))}
            </colgroup>
            <thead>
              <tr style={{ background: "var(--color-bg-primary)" }}>
                <th
                  className="text-left px-4 py-3 font-bold sticky left-0 z-10 select-none"
                  style={{ background: "var(--color-bg-primary)", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)", borderBottom: "1px solid var(--color-border-subtle)" }}
                >
                  Jugador
                </th>
                {COLS.map(({ key, label, title }) => {
                  const isActive = sortKey === key;
                  return (
                    <th
                      key={key}
                      title={title}
                      onClick={() => handleSort(key)}
                      className="py-3 text-center font-bold whitespace-nowrap select-none"
                      style={{
                        cursor: "pointer",
                        color: isActive ? "var(--color-accent)" : "var(--color-text-muted)",
                        fontFamily: "var(--font-mono)",
                        borderBottom: "1px solid var(--color-border-subtle)",
                        userSelect: "none",
                        transition: "color 0.15s",
                      }}
                    >
                      <span className="inline-flex items-center justify-center gap-0.5">
                        {label}
                        <span className="text-[10px] opacity-60 w-3 inline-block text-center">
                          {isActive ? (sortDir === "desc" ? "↓" : "↑") : ""}
                        </span>
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, i) => {
                const rowBg = i % 2 === 0 ? "var(--color-bg-card)" : "var(--color-bg-primary)";
                return (
                  <tr
                    key={p.name}
                    className="transition-colors hover:bg-[var(--color-bg-card-hover)]"
                    style={{ background: rowBg }}
                  >
                    <td
                      className="px-4 py-2.5 sticky left-0 z-10"
                      style={{ background: rowBg, borderBottom: "1px solid var(--color-border-subtle)" }}
                    >
                      <p className="font-semibold text-[var(--color-text-primary)] truncate">{p.name}</p>
                    </td>
                    {COLS.map(({ key, decimals }) => {
                      const val = p[key] as number;
                      const isActive = sortKey === key;
                      const isRating = key === "rating";
                      const display = val === 0
                        ? null
                        : decimals !== undefined
                          ? val.toFixed(decimals)
                          : String(val);
                      const color = isRating && val > 0
                        ? getRatingColor(val)
                        : isActive
                          ? "var(--color-text-primary)"
                          : "var(--color-text-secondary)";
                      return (
                        <td
                          key={key}
                          className="py-2.5 text-center tabular-nums"
                          style={{
                            fontFamily: "var(--font-mono)",
                            color,
                            fontWeight: isActive ? 700 : 400,
                            borderBottom: "1px solid var(--color-border-subtle)",
                            background: isActive ? "var(--color-accent)08" : undefined,
                          }}
                        >
                          {display === null
                            ? <span style={{ color: "var(--color-text-muted)", opacity: 0.35 }}>—</span>
                            : display
                          }
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t" style={{ borderColor: "var(--color-border-subtle)", background: "var(--color-bg-primary)" }}>
          <p className="text-[10px] text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>
            {sorted.length} jugadores · Click en columna para ordenar
          </p>
        </div>
      </div>
    </div>
  );
}
