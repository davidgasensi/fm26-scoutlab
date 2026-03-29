"use client";

import { useState, useMemo } from "react";
import { PlayerWithScores } from "@/lib/types";

interface PlayerFitViewProps {
  data: PlayerWithScores[];
}

function getScoreColor(s: number) {
  if (s >= 16) return "#00ff87";
  if (s >= 13) return "#22c55e";
  if (s >= 10) return "#eab308";
  if (s >= 7)  return "#f97316";
  return "#ef4444";
}

const FIELD_POSITIONS: ({ label: string; posKey: string } | null)[][] = [
  [null, { label: "DL(C)", posKey: "DL-C" }, null],
  [{ label: "MP(I)", posKey: "MP-I" }, { label: "MP(C)", posKey: "MP-C" }, { label: "MP(D)", posKey: "MP-D" }],
  [{ label: "ME(I)", posKey: "ME-I" }, { label: "ME(C)", posKey: "ME-C" }, { label: "ME(D)", posKey: "ME-D" }],
  [{ label: "CR(I)", posKey: "CR-I" }, { label: "MC", posKey: "MC" }, { label: "CR(D)", posKey: "CR-D" }],
  [{ label: "DF(I)", posKey: "DF-I" }, { label: "DF(C)", posKey: "DF-C" }, { label: "DF(D)", posKey: "DF-D" }],
  [null, { label: "POR", posKey: "POR" }, null],
];

export default function PlayerFitView({ data }: PlayerFitViewProps) {
  const [search, setSearch] = useState("");
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const filtered = useMemo(
    () => data.filter((d) => d.player.name.toLowerCase().includes(search.toLowerCase())),
    [data, search]
  );

  const selected = useMemo(
    () => data.find((d) => d.player.name === selectedName) ?? null,
    [data, selectedName]
  );

  const scoreByPosKey = useMemo(() => {
    if (!selected) return {};
    const playerPosKeys = new Set(selected.player.positions);
    const map: Record<string, number> = {};
    for (const rs of selected.roleScores) {
      for (const pk of rs.role.positionKeys) {
        if (!playerPosKeys.has(pk)) continue;
        if (map[pk] === undefined || rs.score > map[pk]) {
          map[pk] = rs.score;
        }
      }
    }
    return map;
  }, [selected]);

  const bestPosKey = Object.entries(scoreByPosKey).sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <div className="relative z-10 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">¿Dónde encaja?</h2>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
          Selecciona un jugador para ver en qué posición del campo encaja mejor
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border p-4 space-y-3 self-start" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)" }}>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Buscar jugador..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)]/40 transition-all"
              style={{ fontFamily: "var(--font-mono)" }}
            />
          </div>
          <div className="max-h-[700px] overflow-y-auto space-y-1 pr-1">
            {filtered.map((d) => {
              const isSelected = d.player.name === selectedName;
              const topScore = d.roleScores[0]?.score ?? 0;
              return (
                <button
                  key={d.player.name}
                  onClick={() => setSelectedName(d.player.name)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all border"
                  style={{
                    background: isSelected ? "var(--color-accent)15" : "transparent",
                    borderColor: isSelected ? "var(--color-accent)40" : "transparent",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{d.player.name}</p>
                    {d.player.age !== undefined && (
                      <p className="text-[10px] text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>{d.player.age} años</p>
                    )}
                  </div>
                  <span className="text-xs shrink-0 font-bold tabular-nums" style={{ fontFamily: "var(--font-mono)", color: getScoreColor(topScore) }}>
                    {topScore.toFixed(1)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {selected ? (
            <>
              <div className="rounded-xl border px-4 py-3 flex items-center gap-3" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)" }}>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[var(--color-text-primary)]">{selected.player.name}</p>
                  {selected.player.age !== undefined && (
                    <p className="text-[10px] text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>{selected.player.age} años</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>Mejor posición</p>
                  <p className="text-xs font-bold" style={{ color: "var(--color-accent)", fontFamily: "var(--font-mono)" }}>{bestPosKey ?? "—"}</p>
                </div>
              </div>

              <div
                className="rounded-xl overflow-hidden border border-[var(--color-border-subtle)] p-4 relative"
                style={{ background: "linear-gradient(180deg, #0d2818 0%, #0a1f12 50%, #0d2818 100%)" }}
              >
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <rect x="2" y="2" width="96" height="96" fill="none" stroke="#ffffff0d" strokeWidth="0.5" />
                  <line x1="2" y1="50" x2="98" y2="50" stroke="#ffffff0d" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="12" fill="none" stroke="#ffffff0d" strokeWidth="0.5" />
                  <rect x="24" y="2" width="52" height="16" fill="none" stroke="#ffffff0d" strokeWidth="0.5" />
                  <rect x="24" y="82" width="52" height="16" fill="none" stroke="#ffffff0d" strokeWidth="0.5" />
                </svg>

                <div className="relative z-10 flex flex-col gap-3 py-2">
                  {FIELD_POSITIONS.map((row, ri) => (
                    <div key={ri} className="flex justify-center gap-4">
                      {row.map((cell, ci) => {
                        if (!cell) return <div key={ci} className="w-16 h-14" />;
                        const score = scoreByPosKey[cell.posKey];
                        const isBest = cell.posKey === bestPosKey;
                        const color = score !== undefined ? getScoreColor(score) : "#ffffff18";
                        const hasScore = score !== undefined && score > 0;
                        return (
                          <div
                            key={ci}
                            className="w-16 h-14 rounded-lg flex flex-col items-center justify-center border transition-all"
                            style={{
                              background: hasScore ? `${color}18` : "#ffffff05",
                              borderColor: isBest ? color : hasScore ? `${color}40` : "#ffffff10",
                              boxShadow: isBest ? `0 0 12px ${color}40` : "none",
                            }}
                          >
                            <span className="text-[9px] font-bold" style={{ fontFamily: "var(--font-mono)", color: hasScore ? color : "#ffffff25" }}>
                              {cell.label}
                            </span>
                            {hasScore && (
                              <span className="text-sm font-bold tabular-nums mt-0.5" style={{ fontFamily: "var(--font-mono)", color }}>
                                {score.toFixed(1)}
                              </span>
                            )}
                            {!hasScore && (
                              <span className="text-[9px]" style={{ color: "#ffffff15" }}>—</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border p-3 space-y-2" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)" }}>
                <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-semibold" style={{ fontFamily: "var(--font-mono)" }}>
                  Mejores roles
                </p>
                {selected.roleScores.slice(0, 5).map((rs) => (
                  <div key={rs.role.id} className="flex items-center gap-3">
                    <span className="text-xs text-[var(--color-text-secondary)] flex-1 truncate">{rs.role.name}</span>
                    <div className="w-24 h-1.5 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(rs.score / 20) * 100}%`, background: getScoreColor(rs.score) }} />
                    </div>
                    <span className="text-xs font-bold tabular-nums w-8 text-right" style={{ fontFamily: "var(--font-mono)", color: getScoreColor(rs.score) }}>
                      {rs.score.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-xl border flex items-center justify-center" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)", minHeight: "400px" }}>
              <p className="text-sm text-[var(--color-text-muted)]">Selecciona un jugador</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
