"use client";

import { useMemo } from "react";
import { PlayerWithScores } from "@/lib/types";
import { getPositionZone } from "@/lib/positions";

interface SquadOverviewProps {
  data: PlayerWithScores[];
}

const ZONE_META = {
  POR: { label: "Portería",  color: "#ff6b35", icon: "🧤" },
  DEF: { label: "Defensa",   color: "#3b82f6", icon: "🛡️" },
  MED: { label: "Mediocampo",color: "#22c55e", icon: "⚙️" },
  ATA: { label: "Ataque",    color: "#ef4444", icon: "⚡" },
};

function getScoreColor(s: number) {
  if (s >= 16) return "#00ff87";
  if (s >= 13) return "#22c55e";
  if (s >= 10) return "#eab308";
  if (s >= 7)  return "#f97316";
  return "#ef4444";
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
      zones[zone].sort((a, b) => (b.roleScores[0]?.score ?? 0) - (a.roleScores[0]?.score ?? 0))[0] ?? null;

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
                  <span className="text-sm">{meta.icon}</span>
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
                {stats.mostVersatile.roleScores.filter((r) => r.score >= 12).slice(0, 6).map((rs) => (
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
