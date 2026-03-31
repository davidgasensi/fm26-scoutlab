"use client";

import { useMemo, useState } from "react";
import { PlayerWithScores } from "@/lib/types";
import { getPositionZone } from "@/lib/positions";
import { getScoreColor, FIELD_POSITIONS } from "@/lib/utils";

interface SquadOverviewProps {
  data: PlayerWithScores[];
}

const ZONE_META = {
  POR: { label: "Portería",   color: "#ff6b35", icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="8" width="20" height="13" rx="1"/><path d="M6 8V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"/>
    </svg>
  )},
  DEF: { label: "Defensa",    color: "#3b82f6", icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7l-9-5z"/>
    </svg>
  )},
  MED: { label: "Mediocampo", color: "#22c55e", icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
    </svg>
  )},
  ATA: { label: "Ataque",     color: "#ef4444", icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  )},
};

function SquadDepth({ data }: { data: PlayerWithScores[] }) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const playersByPosKey = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const row of FIELD_POSITIONS) {
      for (const cell of row) {
        if (!cell) continue;
        const names = data
          .filter((p) => p.player.positions.includes(cell.posKey))
          .map((p) => p.player.name);
        map.set(cell.posKey, names);
      }
    }
    return map;
  }, [data]);

  const getDepthColor = (count: number) => {
    if (count === 0) return "#ef4444";
    if (count === 1) return "#eab308";
    return "var(--color-accent)";
  };

  return (
    <div className="rounded-xl border p-4" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)" }}>
      <p className="text-[10px] uppercase tracking-widest font-bold mb-4" style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent)" }}>
        Profundidad de plantilla
      </p>

      <div
        className="rounded-xl overflow-hidden border border-[var(--color-border-subtle)] p-4 relative"
        style={{ background: "linear-gradient(180deg, #0d2818 0%, #0a1f12 50%, #0d2818 100%)" }}
      >
        {/* Field lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <rect x="2" y="2" width="96" height="96" fill="none" stroke="#ffffff0d" strokeWidth="0.5" />
          <line x1="2" y1="50" x2="98" y2="50" stroke="#ffffff0d" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="12" fill="none" stroke="#ffffff0d" strokeWidth="0.5" />
          <rect x="24" y="2" width="52" height="16" fill="none" stroke="#ffffff0d" strokeWidth="0.5" />
          <rect x="24" y="82" width="52" height="16" fill="none" stroke="#ffffff0d" strokeWidth="0.5" />
        </svg>

        <div className="relative z-10 flex flex-col gap-3 py-2">
          {FIELD_POSITIONS.map((row, ri) => {
            const showBelow = ri < 3;
            return (
              <div key={ri} className="flex justify-center gap-4">
                {row.map((cell, ci) => {
                  if (!cell) return <div key={ci} className="w-16 h-14" />;
                  const players = playersByPosKey.get(cell.posKey) ?? [];
                  const count = players.length;
                  const color = getDepthColor(count);
                  const isHovered = hoveredKey === cell.posKey;
                  return (
                    <div
                      key={ci}
                      className="relative w-16 h-14 rounded-lg flex flex-col items-center justify-center border transition-all cursor-default"
                      style={{
                        background: `${color}18`,
                        borderColor: isHovered ? color : `${color}50`,
                        boxShadow: isHovered ? `0 0 14px ${color}50` : "none",
                      }}
                      onMouseEnter={() => setHoveredKey(cell.posKey)}
                      onMouseLeave={() => setHoveredKey(null)}
                    >
                      <span className="text-[9px] font-bold" style={{ fontFamily: "var(--font-mono)", color }}>{cell.label}</span>
                      <span className="text-lg font-bold tabular-nums leading-tight" style={{ fontFamily: "var(--font-mono)", color }}>{count}</span>

                      {/* Tooltip */}
                      {isHovered && (
                        <div
                          className="absolute left-1/2 -translate-x-1/2 z-30 rounded-lg border px-3 py-2 min-w-max shadow-xl"
                          style={{
                            background: "var(--color-bg-card)",
                            borderColor: "var(--color-border-subtle)",
                            ...(showBelow ? { top: "calc(100% + 8px)" } : { bottom: "calc(100% + 8px)" }),
                          }}
                        >
                          <p className="text-[9px] uppercase tracking-widest font-bold mb-1.5" style={{ fontFamily: "var(--font-mono)", color }}>
                            {cell.label} — {count} jugador{count !== 1 ? "es" : ""}
                          </p>
                          {players.length > 0 ? (
                            <div className="space-y-0.5">
                              {players.map((name) => (
                                <p key={name} className="text-xs text-[var(--color-text-primary)]">{name}</p>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs" style={{ color: "#ef4444" }}>Sin cobertura</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3">
        {[{ color: "#ef4444", label: "Sin cobertura" }, { color: "#eab308", label: "1 jugador" }, { color: "var(--color-accent)", label: "2+ jugadores" }].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-[10px] text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SquadOverview({ data }: SquadOverviewProps) {
  const stats = useMemo(() => {
    const zones: Record<string, PlayerWithScores[]> = { POR: [], DEF: [], MED: [], ATA: [] };

    for (const p of data) {
      const playerZones = new Set(p.player.positions.map(getPositionZone));
      for (const z of playerZones) {
        if (z in zones) zones[z].push(p);
      }
    }

    const zoneAvg = (zone: string) => {
      const players = zones[zone];
      if (!players.length) return 0;
      return players.reduce((s, p) => s + (p.roleScores[0]?.score ?? 0), 0) / players.length;
    };

    const overall = data.reduce((s, p) => s + (p.roleScores[0]?.score ?? 0), 0) / (data.length || 1);

    const bestByZone = (zone: string) =>
      [...zones[zone]].sort((a, b) => (b.roleScores[0]?.score ?? 0) - (a.roleScores[0]?.score ?? 0))[0] ?? null;

    const attrTotals: Record<string, { sum: number; count: number }> = {};
    for (const p of data) {
      for (const [attr, val] of Object.entries(p.player.attributes)) {
        if (!attrTotals[attr]) attrTotals[attr] = { sum: 0, count: 0 };
        attrTotals[attr].sum += val;
        attrTotals[attr].count += 1;
      }
    }
    const attrAvgs = Object.entries(attrTotals)
      .map(([name, { sum, count }]) => ({ name, avg: sum / count }))
      .filter((a) => !["Saque con la mano","Salidas (tendencia)","Salidas","Puños","Uno contra uno","Saques de puerta","Excentricidad","Blocaje","Alcance aéreo","Mando en el área","Comunicación","Reflejos","Saques largos","Saques de banda","Penaltis","Paradas","Saques de esquina","Tiros libres","Córneres","Recuperación física","Liderazgo","Determinación"].includes(a.name))
      .sort((a, b) => b.avg - a.avg);

    const topAttrs = attrAvgs.slice(0, 5);
    const weakAttrs = [...attrAvgs].sort((a, b) => a.avg - b.avg).slice(0, 5);

    const mostVersatile = [...data].sort((a, b) => {
      const aCount = a.roleScores.filter((r) => r.score >= 12).length;
      const bCount = b.roleScores.filter((r) => r.score >= 12).length;
      return bCount - aCount;
    })[0];

    return {
      overall,
      zones,
      zoneAvgs: {
        POR: zoneAvg("POR"),
        DEF: zoneAvg("DEF"),
        MED: zoneAvg("MED"),
        ATA: zoneAvg("ATA"),
      },
      bestByZone: {
        POR: bestByZone("POR"),
        DEF: bestByZone("DEF"),
        MED: bestByZone("MED"),
        ATA: bestByZone("ATA"),
      },
      topAttrs,
      weakAttrs,
      mostVersatile,
    };
  }, [data]);

  const weakestZone = Object.entries(stats.zoneAvgs)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => a - b)[0]?.[0];

  return (
    <div className="relative z-10 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Vista de Equipo</h2>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
          Análisis global de la plantilla por zonas
        </p>
      </div>

      {/* Overall score */}
      <div className="flex items-center gap-4 px-5 py-4 rounded-xl border" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)" }}>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-semibold" style={{ fontFamily: "var(--font-mono)" }}>
            Valoración media plantilla
          </p>
          <p className="text-4xl font-bold tabular-nums mt-1" style={{ fontFamily: "var(--font-mono)", color: getScoreColor(stats.overall) }}>
            {stats.overall.toFixed(1)}
          </p>
        </div>
        <div className="flex-1 h-3 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${(stats.overall / 20) * 100}%`, background: getScoreColor(stats.overall), boxShadow: `0 0 12px ${getScoreColor(stats.overall)}66` }}
          />
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>{data.length} jugadores</p>
        </div>
      </div>

      {/* Zone cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(ZONE_META) as (keyof typeof ZONE_META)[]).map((zone) => {
          const meta = ZONE_META[zone];
          const avg = stats.zoneAvgs[zone];
          const best = stats.bestByZone[zone];
          const count = stats.zones[zone].length;
          const isWeak = zone === weakestZone;
          return (
            <div
              key={zone}
              className="rounded-xl border p-4 space-y-3"
              style={{
                background: "var(--color-bg-card)",
                borderColor: isWeak ? `${meta.color}40` : "var(--color-border-subtle)",
                boxShadow: isWeak ? `0 0 12px ${meta.color}18` : "none",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span style={{ color: meta.color }}>{meta.icon}</span>
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: meta.color, fontFamily: "var(--font-mono)" }}>
                    {zone}
                  </span>
                </div>
                {isWeak && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ background: `${meta.color}20`, color: meta.color, border: `1px solid ${meta.color}40`, fontFamily: "var(--font-mono)" }}>
                    DÉBIL
                  </span>
                )}
              </div>

              <div>
                <p className="text-2xl font-bold tabular-nums" style={{ fontFamily: "var(--font-mono)", color: avg > 0 ? getScoreColor(avg) : "var(--color-text-muted)" }}>
                  {avg > 0 ? avg.toFixed(1) : "—"}
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>{count} jugadores</p>
              </div>

              <div className="h-1.5 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(avg / 20) * 100}%`, background: meta.color }} />
              </div>

              {best && (
                <div className="pt-1 border-t border-[var(--color-border-subtle)]">
                  <p className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">Mejor</p>
                  <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">{best.player.name}</p>
                  <p className="text-[10px]" style={{ fontFamily: "var(--font-mono)", color: getScoreColor(best.roleScores[0]?.score ?? 0) }}>
                    {best.roleScores[0]?.score.toFixed(1)} — {best.roleScores[0]?.role.name}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Squad depth */}
      <SquadDepth data={data} />

      {/* Attributes + versatility */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border p-4" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)" }}>
          <p className="text-[10px] uppercase tracking-widest text-[var(--color-accent)] font-bold mb-3" style={{ fontFamily: "var(--font-mono)" }}>
            Fortalezas del equipo
          </p>
          <div className="space-y-2.5">
            {stats.topAttrs.map((a) => (
              <div key={a.name} className="flex items-center gap-2">
                <span className="text-xs text-[var(--color-text-secondary)] w-28 truncate">{a.name}</span>
                <div className="flex-1 h-1.5 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(a.avg / 20) * 100}%`, background: getScoreColor(a.avg) }} />
                </div>
                <span className="text-xs font-bold tabular-nums w-8 text-right shrink-0" style={{ fontFamily: "var(--font-mono)", color: getScoreColor(a.avg) }}>
                  {a.avg.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border p-4" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)" }}>
          <p className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ fontFamily: "var(--font-mono)", color: "var(--color-amber)" }}>
            Debilidades del equipo
          </p>
          <div className="space-y-2.5">
            {stats.weakAttrs.map((a) => (
              <div key={a.name} className="flex items-center gap-2">
                <span className="text-xs text-[var(--color-text-secondary)] w-28 truncate">{a.name}</span>
                <div className="flex-1 h-1.5 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(a.avg / 20) * 100}%`, background: getScoreColor(a.avg) }} />
                </div>
                <span className="text-xs font-bold tabular-nums w-8 text-right shrink-0" style={{ fontFamily: "var(--font-mono)", color: getScoreColor(a.avg) }}>
                  {a.avg.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border p-4" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)" }}>
          <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-bold mb-3" style={{ fontFamily: "var(--font-mono)" }}>
            Jugador más versátil
          </p>
          {stats.mostVersatile && (
            <div>
              <p className="text-base font-bold text-[var(--color-text-primary)] mb-1">{stats.mostVersatile.player.name}</p>
              <p className="text-xs text-[var(--color-text-muted)] mb-3" style={{ fontFamily: "var(--font-mono)" }}>
                {stats.mostVersatile.roleScores.filter((r) => r.score >= 12).length} roles con puntuación ≥ 12
              </p>
              <div className="space-y-1.5">
                {stats.mostVersatile.roleScores
                  .filter((r) => r.score >= 12)
                  .filter((r, i, arr) => arr.findIndex((x) => x.role.name === r.role.name) === i)
                  .slice(0, 6)
                  .map((rs) => (
                  <div key={rs.role.id} className="flex items-center justify-between">
                    <span className="text-xs text-[var(--color-text-secondary)] truncate">{rs.role.name}</span>
                    <span className="text-xs font-bold tabular-nums ml-2 shrink-0" style={{ fontFamily: "var(--font-mono)", color: getScoreColor(rs.score) }}>
                      {rs.score.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
