"use client";

import { useState, useMemo, useEffect } from "react";
import { StatsSeason } from "@/lib/firestore";
import { PlayerStats } from "@/lib/types";

interface Props {
  seasons: StatsSeason[];
}

interface DeltaCol {
  key: keyof PlayerStats;
  label: string;
  decimals: number;
  higherIsBetter: boolean;
}

const COLS: DeltaCol[] = [
  { key: "minutes",   label: "Min",  decimals: 0, higherIsBetter: true },
  { key: "rating",    label: "Cal",  decimals: 2, higherIsBetter: true },
  { key: "goals",     label: "Gol",  decimals: 0, higherIsBetter: true },
  { key: "assists",   label: "Ast",  decimals: 0, higherIsBetter: true },
  { key: "xG",        label: "xG",   decimals: 2, higherIsBetter: true },
  { key: "xA",        label: "xA",   decimals: 2, higherIsBetter: true },
  { key: "passRatio", label: "Pas%", decimals: 1, higherIsBetter: true },
];

function deltaColor(delta: number, higherIsBetter: boolean, accent: string) {
  if (Math.abs(delta) < 0.01) return "var(--color-text-muted)";
  const positive = higherIsBetter ? delta > 0 : delta < 0;
  return positive ? accent : "#ef4444";
}

function deltaArrow(delta: number) {
  if (Math.abs(delta) < 0.01) return "—";
  return delta > 0 ? "▲" : "▼";
}

export default function StatsSeasonCompare({ seasons }: Props) {
  const [seasonAId, setSeasonAId] = useState<string>(seasons[0]?.id ?? "");
  const [seasonBId, setSeasonBId] = useState<string>(seasons[1]?.id ?? "");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (seasonAId && !seasons.find((s) => s.id === seasonAId)) {
      setSeasonAId(seasons[0]?.id ?? "");
    }
    if (seasonBId && !seasons.find((s) => s.id === seasonBId)) {
      setSeasonBId(seasons[1]?.id ?? "");
    }
  }, [seasons]);

  const seasonA = seasons.find((s) => s.id === seasonAId);
  const seasonB = seasons.find((s) => s.id === seasonBId);

  const rows = useMemo(() => {
    if (!seasonA || !seasonB) return [];

    const mapA = new Map(seasonA.players.map((p) => [p.name.toLowerCase(), p]));
    const mapB = new Map(seasonB.players.map((p) => [p.name.toLowerCase(), p]));

    const names = new Set([...mapA.keys(), ...mapB.keys()]);
    return Array.from(names)
      .filter((name) => name.includes(search.toLowerCase()))
      .map((name) => ({ pA: mapA.get(name), pB: mapB.get(name), name }))
      .sort((a, b) => {
        const rA = a.pB?.rating ?? a.pA?.rating ?? 0;
        const rB = b.pB?.rating ?? b.pA?.rating ?? 0;
        return rB - rA;
      });
  }, [seasonA, seasonB, search]);

  if (seasons.length < 2) {
    return (
      <div className="rounded-xl border p-8 text-center" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)" }}>
        <p className="text-sm text-[var(--color-text-secondary)]">Necesitas al menos 2 temporadas guardadas para comparar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Season selectors */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>Temporada A (base)</p>
          <select
            value={seasonAId}
            onChange={(e) => setSeasonAId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border text-xs text-[var(--color-text-primary)] outline-none"
            style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)", fontFamily: "var(--font-mono)" }}
          >
            {seasons.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex items-end pb-1.5">
          <span className="text-[var(--color-text-muted)] font-bold text-sm">→</span>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>Temporada B (nueva)</p>
          <select
            value={seasonBId}
            onChange={(e) => setSeasonBId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border text-xs text-[var(--color-text-primary)] outline-none"
            style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)", fontFamily: "var(--font-mono)" }}
          >
            {seasons.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="relative ml-auto">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-lg border text-xs text-[var(--color-text-primary)] outline-none"
            style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)", fontFamily: "var(--font-mono)", width: "160px" }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--color-border-subtle)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--color-bg-primary)" }}>
                <th className="text-left px-4 py-3 font-bold sticky left-0 z-10" style={{ background: "var(--color-bg-primary)", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)", borderBottom: "1px solid var(--color-border-subtle)", minWidth: "140px" }}>
                  Jugador
                </th>
                <th className="px-3 py-3 text-center font-bold" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)", borderBottom: "1px solid var(--color-border-subtle)", minWidth: "60px" }}>
                  Estado
                </th>
                {COLS.map((col) => (
                  <th key={col.key} className="px-2 py-3 text-center font-bold" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)", borderBottom: "1px solid var(--color-border-subtle)", minWidth: "80px" }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ pA, pB, name }, i) => {
                const isNew  = !pA && !!pB;
                const isGone = !!pA && !pB;
                const rowBg = i % 2 === 0 ? "var(--color-bg-card)" : "var(--color-bg-primary)";
                const displayName = pB?.name ?? pA?.name ?? name;
                return (
                  <tr key={name} style={{ background: rowBg }}>
                    <td className="px-4 py-2.5 sticky left-0 z-10 font-semibold text-[var(--color-text-primary)]" style={{ background: rowBg, borderBottom: "1px solid var(--color-border-subtle)" }}>
                      {displayName}
                    </td>
                    <td className="px-3 py-2.5 text-center" style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
                      {isNew  && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: "#00ff8720", color: "#00ff87", fontFamily: "var(--font-mono)" }}>NUEVO</span>}
                      {isGone && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: "#ef444420", color: "#ef4444", fontFamily: "var(--font-mono)" }}>SALIÓ</span>}
                      {!isNew && !isGone && <span className="text-[var(--color-text-muted)] text-[10px]">—</span>}
                    </td>
                    {COLS.map((col) => {
                      const valA = (pA?.[col.key] as number) ?? null;
                      const valB = (pB?.[col.key] as number) ?? null;
                      const delta = valA !== null && valB !== null ? valB - valA : null;
                      const accent = "var(--color-accent)";
                      return (
                        <td key={col.key} className="px-2 py-2.5 text-center tabular-nums" style={{ fontFamily: "var(--font-mono)", borderBottom: "1px solid var(--color-border-subtle)" }}>
                          {valB !== null ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[var(--color-text-primary)] font-semibold">{valB.toFixed(col.decimals)}</span>
                              {delta !== null && (
                                <span className="text-[9px] font-bold" style={{ color: deltaColor(delta, col.higherIsBetter, accent) }}>
                                  {deltaArrow(delta)} {Math.abs(delta) >= 0.01 ? Math.abs(delta).toFixed(col.decimals) : ""}
                                </span>
                              )}
                            </div>
                          ) : valA !== null ? (
                            <span className="text-[var(--color-text-muted)] opacity-40">{valA.toFixed(col.decimals)}</span>
                          ) : (
                            <span className="text-[var(--color-text-muted)] opacity-30">—</span>
                          )}
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
            {rows.filter((r) => r.pA && r.pB).length} jugadores en ambas · {rows.filter((r) => !r.pA).length} nuevos · {rows.filter((r) => !r.pB).length} salieron
          </p>
        </div>
      </div>
    </div>
  );
}
