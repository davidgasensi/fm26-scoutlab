"use client";

import { useState, useMemo, useEffect } from "react";
import { Squad } from "@/lib/firestore";
import { getAttrDisplayName } from "@/lib/attributeNames";
import { calculateAllPlayers } from "@/lib/calculator";
import { ALL_ROLES } from "@/lib/roles";
import { ALL_ROLES_FM24 } from "@/lib/roles-fm24";
import { GK_ATTRIBUTES, isGoalkeeper } from "@/lib/positions";

interface SeasonComparisonProps {
  squads: Squad[];
  compareIds?: [string, string] | null;
}

type FilterType = "all" | "improved" | "declined" | "unchanged";

function DeltaBadge({ d, size = "sm" }: { d: number; size?: "sm" | "xs" }) {
  if (d === 0) return null;
  const color = d > 0 ? "#00ff87" : "#ef4444";
  const cls = size === "xs" ? "text-[10px]" : "text-xs";
  return (
    <span className={`font-bold tabular-nums ${cls}`} style={{ fontFamily: "var(--font-mono)", color }}>
      {d > 0 ? "+" : ""}{d}
    </span>
  );
}

function getScoreColor(s: number) {
  if (s >= 16) return "#00ff87";
  if (s >= 13) return "#22c55e";
  if (s >= 10) return "#eab308";
  if (s >= 7) return "#f97316";
  return "#ef4444";
}

function getPositionGroup(positions: string[]): "POR" | "DEF" | "MED" | "ATA" {
  if (positions.includes("POR")) return "POR";
  if (positions.some((p) => p.startsWith("DL") || p.startsWith("MP"))) return "ATA";
  if (positions.some((p) => p === "MC" || p.startsWith("ME"))) return "MED";
  return "DEF";
}

function extractYear(sq: Squad): number {
  const parts = sq.name.trim().split(" ");
  const last = parts[parts.length - 1];
  const y = parseInt(last, 10);
  return isNaN(y) ? 0 : y;
}

function orderedIds(idA: string, idB: string, squads: Squad[]): [string, string] {
  const a = squads.find((s) => s.id === idA);
  const b = squads.find((s) => s.id === idB);
  if (!a || !b) return [idA, idB];
  return extractYear(a) <= extractYear(b) ? [idA, idB] : [idB, idA];
}

/** Returns the two best default IDs: prefer two squads from the same club, ordered by year. */
function defaultPair(squads: Squad[]): [string, string] {
  const getClub = (sq: Squad) => sq.club ?? sq.name;
  const grouped = new Map<string, Squad[]>();
  for (const sq of squads) {
    const club = getClub(sq);
    if (!grouped.has(club)) grouped.set(club, []);
    grouped.get(club)!.push(sq);
  }
  // Find first club with ≥2 squads
  for (const [, members] of grouped) {
    if (members.length >= 2) {
      const sorted = [...members].sort((a, b) => extractYear(a) - extractYear(b));
      return [sorted[0].id, sorted[sorted.length - 1].id];
    }
  }
  // Fallback: first two squads ordered by year
  return orderedIds(squads[0]?.id ?? "", squads[1]?.id ?? "", squads);
}


export default function SeasonComparison({ squads, compareIds }: SeasonComparisonProps) {
  const [squadAId, setSquadAId] = useState<string>(() => {
    if (compareIds) return orderedIds(compareIds[0], compareIds[1], squads)[0];
    return defaultPair(squads)[0];
  });
  const [squadBId, setSquadBId] = useState<string>(() => {
    if (compareIds) return orderedIds(compareIds[0], compareIds[1], squads)[1];
    return defaultPair(squads)[1];
  });
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    if (!compareIds) return;
    const [a, b] = orderedIds(compareIds[0], compareIds[1], squads);
    setSquadAId(a);
    setSquadBId(b);
    setFilter("all");
    setExpandedPlayers(new Set());
  }, [compareIds]);

  const togglePlayer = (name: string) => {
    setExpandedPlayers((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const squadA = squads.find((s) => s.id === squadAId) ?? null;
  const squadB = squads.find((s) => s.id === squadBId) ?? null;

  const comparison = useMemo(() => {
    if (!squadA || !squadB) return null;

    const rolesA = squadA.version === "FM24" ? ALL_ROLES_FM24 : ALL_ROLES;
    const rolesB = squadB.version === "FM24" ? ALL_ROLES_FM24 : ALL_ROLES;

    const scoredA = calculateAllPlayers(squadA.players, rolesA);
    const scoredB = calculateAllPlayers(squadB.players, rolesB);

    const mapA = new Map(scoredA.map((p) => [p.player.name, p]));
    const mapB = new Map(scoredB.map((p) => [p.player.name, p]));

    const common = [];

    for (const [name, pA] of mapA) {
      const pB = mapB.get(name);
      if (!pB) continue;

      const attrsA = pA.player.attributes;
      const attrsB = pB.player.attributes;
      const gk = isGoalkeeper(pA.player.positions) || isGoalkeeper(pB.player.positions);
      const allAttrNames = Array.from(new Set([...Object.keys(attrsA), ...Object.keys(attrsB)]))
        .filter((attr) => gk || !GK_ATTRIBUTES.has(attr));

      const allAttrs = allAttrNames.map((attr) => ({
        name: attr,
        valA: attrsA[attr] ?? 0,
        valB: attrsB[attr] ?? 0,
        d: (attrsB[attr] ?? 0) - (attrsA[attr] ?? 0),
      })).sort((a, b) => a.name.localeCompare(b.name, "es"));

      const improved = allAttrs.filter((a) => a.d > 0);
      const declined = allAttrs.filter((a) => a.d < 0);
      const totalUp = improved.reduce((s, a) => s + a.d, 0);
      const totalDown = declined.reduce((s, a) => s + a.d, 0);
      const netChange = totalUp + totalDown;
      const positionGroup = getPositionGroup(pA.player.positions);

      common.push({
        name,
        ageA: pA.player.age,
        ageB: pB.player.age,
        bestRoleA: pA.roleScores[0]?.role.name ?? "—",
        bestRoleB: pB.roleScores[0]?.role.name ?? "—",
        bestScoreA: pA.roleScores[0]?.score ?? 0,
        bestScoreB: pB.roleScores[0]?.score ?? 0,
        allAttrs,
        improvedCount: improved.length,
        declinedCount: declined.length,
        totalUp,
        totalDown,
        netChange,
        positionGroup,
      });
    }

    const exits = [...mapA.keys()].filter((n) => !mapB.has(n));
    const signings = [...mapB.keys()].filter((n) => !mapA.has(n));

    common.sort((a, b) => Math.abs(b.netChange) - Math.abs(a.netChange));

    // Top 3 improvers and decliners
    const topImprovers = [...common].filter((p) => p.netChange > 0).sort((a, b) => b.netChange - a.netChange).slice(0, 3);
    const topDecliners = [...common].filter((p) => p.netChange < 0).sort((a, b) => a.netChange - b.netChange).slice(0, 3);

    // Position group breakdown
    const groups: Record<string, { count: number; netSum: number }> = { POR: { count: 0, netSum: 0 }, DEF: { count: 0, netSum: 0 }, MED: { count: 0, netSum: 0 }, ATA: { count: 0, netSum: 0 } };
    for (const p of common) {
      groups[p.positionGroup].count++;
      groups[p.positionGroup].netSum += p.netChange;
    }
    const positionBreakdown = Object.entries(groups)
      .filter(([, v]) => v.count > 0)
      .map(([group, { count, netSum }]) => ({
        group,
        count,
        avg: Math.round((netSum / count) * 10) / 10,
      }));

    return { common, exits, signings, topImprovers, topDecliners, positionBreakdown };
  }, [squadA, squadB]);

  const filteredCommon = useMemo(() => {
    if (!comparison) return [];
    switch (filter) {
      case "improved":  return comparison.common.filter((p) => p.netChange > 0);
      case "declined":  return comparison.common.filter((p) => p.netChange < 0);
      case "unchanged": return comparison.common.filter((p) => p.netChange === 0);
      default:          return comparison.common;
    }
  }, [comparison, filter]);

  const filters: { id: FilterType; label: string; color: string }[] = [
    { id: "all",       label: "Todos",        color: "var(--color-text-muted)" },
    { id: "improved",  label: "Mejoraron",    color: "#00ff87" },
    { id: "declined",  label: "Empeoraron",   color: "#ef4444" },
    { id: "unchanged", label: "Sin cambios",  color: "var(--color-text-muted)" },
  ];

  return (
    <div className="relative z-10 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Comparación de temporadas</h2>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
          Evolución de jugadores entre dos plantillas guardadas
        </p>
      </div>

      {/* Selected squads display */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Anterior", id: squadAId },
          { label: "Posterior", id: squadBId },
        ].map(({ label, id }) => {
          const sq = squads.find((s) => s.id === id);
          return (
            <div key={label} className="rounded-lg border px-3 py-2.5" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)" }}>
              <p className="text-[9px] uppercase tracking-widest text-[var(--color-text-muted)] mb-0.5" style={{ fontFamily: "var(--font-mono)" }}>{label}</p>
              <p className="text-sm font-bold text-[var(--color-text-primary)]">{sq?.name ?? "—"}</p>
            </div>
          );
        })}
      </div>

{squadAId !== squadBId && (() => {
        const a = squads.find((s) => s.id === squadAId);
        const b = squads.find((s) => s.id === squadBId);
        const clubA = a?.club ?? a?.name;
        const clubB = b?.club ?? b?.name;
        if (!clubA || !clubB || clubA === clubB) return null;
        return (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs" style={{ background: "#f9731610", borderColor: "#f9731640", color: "#f97316", fontFamily: "var(--font-mono)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>Estás comparando equipos distintos: <strong>{clubA}</strong> vs <strong>{clubB}</strong>.</span>
          </div>
        );
      })()}

      {comparison && squadAId !== squadBId && (
        <>
          {/* Summary counters */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "En común", value: comparison.common.length, color: "var(--color-accent)" },
              { label: "Salidas",  value: comparison.exits.length,  color: "#ef4444" },
              { label: "Fichajes", value: comparison.signings.length, color: "#38bdf8" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl border p-4 text-center" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)" }}>
                <p className="text-2xl font-bold tabular-nums" style={{ fontFamily: "var(--font-mono)", color }}>{value}</p>
                <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] mt-1" style={{ fontFamily: "var(--font-mono)" }}>{label}</p>
              </div>
            ))}
          </div>

          {/* ── Top improvers / decliners ── */}
          {(comparison.topImprovers.length > 0 || comparison.topDecliners.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {comparison.topImprovers.length > 0 && (
                <div className="rounded-xl border p-4" style={{ background: "var(--color-bg-card)", borderColor: "#00ff8720" }}>
                  <p className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ fontFamily: "var(--font-mono)", color: "#00ff87" }}>
                    Mayores mejoras
                  </p>
                  <div className="space-y-2">
                    {comparison.topImprovers.map((p, i) => (
                      <div key={p.name} className="flex items-center gap-2">
                        <span className="text-[10px] w-4 text-center shrink-0 font-bold" style={{ fontFamily: "var(--font-mono)", color: "#00ff8766" }}>{i + 1}</span>
                        <span className="text-xs font-semibold flex-1 truncate text-[var(--color-text-primary)]">{p.name}</span>
                        <span className="text-xs font-bold shrink-0" style={{ fontFamily: "var(--font-mono)", color: "#00ff87" }}>+{p.netChange}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {comparison.topDecliners.length > 0 && (
                <div className="rounded-xl border p-4" style={{ background: "var(--color-bg-card)", borderColor: "#ef444420" }}>
                  <p className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ fontFamily: "var(--font-mono)", color: "#ef4444" }}>
                    Mayores caídas
                  </p>
                  <div className="space-y-2">
                    {comparison.topDecliners.map((p, i) => (
                      <div key={p.name} className="flex items-center gap-2">
                        <span className="text-[10px] w-4 text-center shrink-0 font-bold" style={{ fontFamily: "var(--font-mono)", color: "#ef444466" }}>{i + 1}</span>
                        <span className="text-xs font-semibold flex-1 truncate text-[var(--color-text-primary)]">{p.name}</span>
                        <span className="text-xs font-bold shrink-0" style={{ fontFamily: "var(--font-mono)", color: "#ef4444" }}>{p.netChange}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Common players ── */}
          {comparison.common.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-semibold" style={{ fontFamily: "var(--font-mono)" }}>
                  Jugadores en común — evolución
                </p>
                {/* Filter buttons */}
                <div className="flex gap-1">
                  {filters.map(({ id, label, color }) => {
                    const active = filter === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setFilter(id)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all"
                        style={{
                          fontFamily: "var(--font-mono)",
                          background: active ? `${color}18` : "transparent",
                          color: active ? color : "var(--color-text-muted)",
                          borderColor: active ? `${color}40` : "var(--color-border-subtle)",
                        }}
                      >
                        {label}
                        {id !== "all" && (
                          <span className="ml-1 opacity-60">
                            ({id === "improved" ? comparison.common.filter(p => p.netChange > 0).length
                              : id === "declined" ? comparison.common.filter(p => p.netChange < 0).length
                              : comparison.common.filter(p => p.netChange === 0).length})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                {filteredCommon.map((p) => {
                  const isExpanded = expandedPlayers.has(p.name);
                  return (
                    <div
                      key={p.name}
                      className="rounded-xl border overflow-hidden"
                      style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)" }}
                    >
                      <div
                        className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-[var(--color-bg-card-hover)] transition-colors"
                        onClick={() => togglePlayer(p.name)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[var(--color-text-primary)]">{p.name}</p>
                          <p className="text-[10px] text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>
                            {p.ageA}a → {p.ageB}a
                            {p.bestRoleA !== p.bestRoleB && (
                              <span className="ml-2">
                                <span className="text-[var(--color-text-muted)]">{p.bestRoleA}</span>
                                {" → "}
                                <span style={{ color: "#38bdf8" }}>{p.bestRoleB}</span>
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {p.improvedCount > 0 && (
                            <span className="text-xs font-semibold" style={{ fontFamily: "var(--font-mono)", color: "#00ff87" }}>
                              ↑{p.improvedCount} <span className="opacity-70">(+{p.totalUp})</span>
                            </span>
                          )}
                          {p.declinedCount > 0 && (
                            <span className="text-xs font-semibold" style={{ fontFamily: "var(--font-mono)", color: "#ef4444" }}>
                              ↓{p.declinedCount} <span className="opacity-70">({p.totalDown})</span>
                            </span>
                          )}
                          {p.improvedCount === 0 && p.declinedCount === 0 && (
                            <span className="text-[10px] text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>sin cambios</span>
                          )}
                        </div>

                        <svg
                          width="14" height="14" viewBox="0 0 24 24" fill="none"
                          stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          className={`shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>

                      {isExpanded && (
                        <div className="border-t px-4 py-4" style={{ borderColor: "var(--color-border-subtle)" }}>
                          <div
                            className="grid gap-x-6 gap-y-2"
                            style={{
                              gridTemplateRows: `repeat(${Math.ceil(p.allAttrs.length / 4)}, auto)`,
                              gridAutoFlow: "column",
                              gridTemplateColumns: "repeat(4, 1fr)",
                            }}
                          >
                            {p.allAttrs.map((a) => {
                              const nameColor = a.d > 0 ? "#00ff87" : a.d < 0 ? "#ef4444" : "var(--color-text-secondary)";
                              return (
                                <div key={a.name} className="flex items-center justify-between gap-2 text-xs">
                                  <span className="truncate" style={{ color: nameColor }}>
                                    {getAttrDisplayName(a.name)}
                                  </span>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className="tabular-nums text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>{a.valA}</span>
                                    <span className="text-[var(--color-text-muted)] text-[10px]">→</span>
                                    <span className="tabular-nums font-semibold" style={{ fontFamily: "var(--font-mono)", color: nameColor }}>{a.valB}</span>
                                    {a.d !== 0 && <DeltaBadge d={a.d} size="xs" />}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredCommon.length === 0 && (
                  <p className="text-xs text-[var(--color-text-muted)] italic px-1" style={{ fontFamily: "var(--font-mono)" }}>
                    Ningún jugador coincide con este filtro.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Exits & Signings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {comparison.exits.length > 0 && (
              <div className="rounded-xl border p-4" style={{ background: "var(--color-bg-card)", borderColor: "#ef444430" }}>
                <p className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ fontFamily: "var(--font-mono)", color: "#ef4444" }}>
                  Salidas ({comparison.exits.length})
                </p>
                <div className="space-y-1">
                  {comparison.exits.map((n) => (
                    <p key={n} className="text-xs text-[var(--color-text-secondary)]">{n}</p>
                  ))}
                </div>
              </div>
            )}
            {comparison.signings.length > 0 && (
              <div className="rounded-xl border p-4" style={{ background: "var(--color-bg-card)", borderColor: "#38bdf830" }}>
                <p className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ fontFamily: "var(--font-mono)", color: "#38bdf8" }}>
                  Fichajes ({comparison.signings.length})
                </p>
                <div className="space-y-1">
                  {comparison.signings.map((n) => (
                    <p key={n} className="text-xs text-[var(--color-text-secondary)]">{n}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
