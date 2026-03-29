"use client";

import { useState, useMemo } from "react";
import { Squad } from "@/lib/firestore";
import { getAttrDisplayName } from "@/lib/attributeNames";
import { calculateAllPlayers } from "@/lib/calculator";
import { ALL_ROLES } from "@/lib/roles";
import { ALL_ROLES_FM24 } from "@/lib/roles-fm24";
import { GK_ATTRIBUTES, isGoalkeeper } from "@/lib/positions";

interface SeasonComparisonProps {
  squads: Squad[];
}

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

export default function SeasonComparison({ squads }: SeasonComparisonProps) {
  const [squadAId, setSquadAId] = useState<string>(squads[0]?.id ?? "");
  const [squadBId, setSquadBId] = useState<string>(squads[1]?.id ?? "");
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());

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

      // All attrs including unchanged
      const allAttrs = allAttrNames.map((attr) => ({
        name: attr,
        valA: attrsA[attr] ?? 0,
        valB: attrsB[attr] ?? 0,
        d: (attrsB[attr] ?? 0) - (attrsA[attr] ?? 0),
      })).sort((a, b) => b.d - a.d); // improved first, then unchanged, then declined

      const improved = allAttrs.filter((a) => a.d > 0);
      const declined = allAttrs.filter((a) => a.d < 0);
      const totalUp = improved.reduce((s, a) => s + a.d, 0);
      const totalDown = declined.reduce((s, a) => s + a.d, 0);

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
      });
    }

    const exits = [...mapA.keys()].filter((n) => !mapB.has(n));
    const signings = [...mapB.keys()].filter((n) => !mapA.has(n));

    common.sort((a, b) => Math.abs(b.bestScoreB - b.bestScoreA) - Math.abs(a.bestScoreB - a.bestScoreA));

    return { common, exits, signings };
  }, [squadA, squadB]);

  const selectStyle = {
    background: "var(--color-bg-card)",
    borderColor: "var(--color-border-subtle)",
    color: "var(--color-text-primary)",
    fontFamily: "var(--font-mono)",
  };

  return (
    <div className="relative z-10 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Comparación de temporadas</h2>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
          Evolución de jugadores entre dos plantillas guardadas
        </p>
      </div>

      {/* Squad selectors */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Temporada A", value: squadAId, onChange: setSquadAId },
          { label: "Temporada B", value: squadBId, onChange: setSquadBId },
        ].map(({ label, value, onChange }) => (
          <div key={label}>
            <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-semibold mb-1.5" style={{ fontFamily: "var(--font-mono)" }}>
              {label}
            </p>
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
              style={selectStyle}
            >
              {squads.map((sq) => (
                <option key={sq.id} value={sq.id}>{sq.name}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {squadAId === squadBId && (
        <p className="text-xs text-[var(--color-text-muted)] italic" style={{ fontFamily: "var(--font-mono)" }}>
          Selecciona dos equipos distintos para comparar.
        </p>
      )}

      {comparison && squadAId !== squadBId && (
        <>
          {/* Summary counters */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "En común", value: comparison.common.length, color: "var(--color-accent)" },
              { label: "Salidas", value: comparison.exits.length, color: "#ef4444" },
              { label: "Fichajes", value: comparison.signings.length, color: "#38bdf8" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl border p-4 text-center" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)" }}>
                <p className="text-2xl font-bold tabular-nums" style={{ fontFamily: "var(--font-mono)", color }}>{value}</p>
                <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] mt-1" style={{ fontFamily: "var(--font-mono)" }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Common players */}
          {comparison.common.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-semibold mb-3" style={{ fontFamily: "var(--font-mono)" }}>
                Jugadores en común — evolución
              </p>
              <div className="space-y-2">
                {comparison.common.map((p) => {
                  const isExpanded = expandedPlayers.has(p.name);
                  const scoreDelta = Math.round((p.bestScoreB - p.bestScoreA) * 10) / 10;
                  return (
                    <div
                      key={p.name}
                      className="rounded-xl border overflow-hidden"
                      style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)" }}
                    >
                      {/* Header row — always visible, clickable */}
                      <div
                        className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-[var(--color-bg-card-hover)] transition-colors"
                        onClick={() => togglePlayer(p.name)}
                      >
                        {/* Name + age */}
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

                        {/* Attr change preview */}
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

                        {/* Score */}
                        <div className="flex items-center gap-1.5 shrink-0 text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                          <span style={{ color: getScoreColor(p.bestScoreA) }}>{p.bestScoreA.toFixed(1)}</span>
                          <span className="text-[var(--color-text-muted)]">→</span>
                          <span style={{ color: getScoreColor(p.bestScoreB) }}>{p.bestScoreB.toFixed(1)}</span>
                          {scoreDelta !== 0 && <DeltaBadge d={scoreDelta} />}
                        </div>

                        {/* Chevron */}
                        <svg
                          width="14" height="14" viewBox="0 0 24 24" fill="none"
                          stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          className={`shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>

                      {/* Expanded: all attributes */}
                      {isExpanded && (
                        <div className="border-t px-4 py-4" style={{ borderColor: "var(--color-border-subtle)" }}>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2">
                            {p.allAttrs.map((a) => {
                              const nameColor =
                                a.d > 0 ? "#00ff87" :
                                a.d < 0 ? "#ef4444" :
                                "var(--color-text-muted)";
                              return (
                                <div key={a.name} className="flex items-center justify-between gap-2 text-xs">
                                  <span className="truncate" style={{ color: nameColor }}>
                                    {getAttrDisplayName(a.name)}
                                  </span>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className="tabular-nums text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>
                                      {a.valA}
                                    </span>
                                    <span className="text-[var(--color-text-muted)] text-[10px]">→</span>
                                    <span className="tabular-nums font-semibold" style={{ fontFamily: "var(--font-mono)", color: a.d !== 0 ? nameColor : "var(--color-text-secondary)" }}>
                                      {a.valB}
                                    </span>
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
