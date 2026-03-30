"use client";

import { useMemo } from "react";
import { PlayerStats } from "@/lib/types";
import { getBadges } from "@/lib/statsBadges";

interface Props {
  player: PlayerStats;
  squad: PlayerStats[];
  onClose: () => void;
}

interface Dim {
  label: string;
  value: (p: PlayerStats) => number;
  maxLabel?: string;
}

const DIMS: Dim[] = [
  { label: "Goles",        value: (p) => p.minutes > 0 ? p.goals    / (p.minutes / 90) : 0 },
  { label: "xG",           value: (p) => p.minutes > 0 ? p.xG       / (p.minutes / 90) : 0 },
  { label: "Asist.",        value: (p) => p.minutes > 0 ? p.assists   / (p.minutes / 90) : 0 },
  { label: "xA",           value: (p) => p.minutes > 0 ? p.xA       / (p.minutes / 90) : 0 },
  { label: "Pase %",       value: (p) => p.passRatio },
  { label: "Regate",       value: (p) => p.minutes > 0 ? p.dribbles  / (p.minutes / 90) : 0 },
  { label: "Ent.+Desp.",   value: (p) => p.minutes > 0 ? (p.tackleCom + p.clearances) / (p.minutes / 90) : 0 },
  { label: "Calificación", value: (p) => p.rating },
];

const N = DIMS.length;
const CX = 178, CY = 155, MAX_R = 100;
const RINGS = [0.25, 0.5, 0.75, 1];

function angle(i: number) {
  return -Math.PI / 2 + (2 * Math.PI * i) / N;
}

function polar(i: number, r: number) {
  return { x: CX + r * Math.cos(angle(i)), y: CY + r * Math.sin(angle(i)) };
}

export default function StatsPerfilModal({ player, squad, onClose }: Props) {
  const normalized = useMemo(() => {
    return DIMS.map((dim) => {
      const vals = squad.map(dim.value);
      const max = Math.max(...vals, 0.001);
      return Math.min(dim.value(player) / max, 1);
    });
  }, [player, squad]);

  const polygonPoints = normalized
    .map((v, i) => {
      const pt = polar(i, v * MAX_R);
      return `${pt.x},${pt.y}`;
    })
    .join(" ");

  const badges = useMemo(() => getBadges(player, squad), [player, squad]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,14,23,0.85)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-6 space-y-4"
        style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-accent)]" style={{ fontFamily: "var(--font-mono)" }}>
              Perfil del jugador
            </p>
            <h3 className="text-lg font-bold text-[var(--color-text-primary)] mt-0.5">{player.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>
                {player.minutes}' · Cal. {player.rating.toFixed(2)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--color-text-muted)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {badges.map((b) => (
              <span
                key={b.label}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold"
                style={{ background: b.color + "18", color: b.color, fontFamily: "var(--font-mono)" }}
              >
                {b.icon} {b.label}
              </span>
            ))}
          </div>
        )}

        {/* Araña */}
        <div className="flex justify-center">
          <svg viewBox="-10 0 380 316" width="320" height="316">
            {/* Rings */}
            {RINGS.map((r) => {
              const pts = Array.from({ length: N }, (_, i) => {
                const p = polar(i, r * MAX_R);
                return `${p.x},${p.y}`;
              }).join(" ");
              return (
                <polygon
                  key={r}
                  points={pts}
                  fill="none"
                  stroke="var(--color-border-subtle)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Axis lines */}
            {DIMS.map((_, i) => {
              const pt = polar(i, MAX_R);
              return <line key={i} x1={CX} y1={CY} x2={pt.x} y2={pt.y} stroke="var(--color-border-subtle)" strokeWidth="1" />;
            })}

            {/* Player polygon */}
            <polygon
              points={polygonPoints}
              fill="var(--color-accent)"
              fillOpacity="0.15"
              stroke="var(--color-accent)"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Player dots */}
            {normalized.map((v, i) => {
              const pt = polar(i, v * MAX_R);
              return <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="var(--color-accent)" />;
            })}

            {/* Labels */}
            {DIMS.map((dim, i) => {
              const pt = polar(i, MAX_R + 22);
              const anchor = pt.x < CX - 5 ? "end" : pt.x > CX + 5 ? "start" : "middle";
              return (
                <text
                  key={i}
                  x={pt.x}
                  y={pt.y + 4}
                  textAnchor={anchor}
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="var(--font-mono)"
                  fill="var(--color-text-secondary)"
                >
                  {dim.label}
                </text>
              );
            })}

            {/* Ring % labels */}
            {RINGS.map((r) => (
              <text
                key={r}
                x={CX + 3}
                y={CY - r * MAX_R + 3}
                fontSize="8"
                fill="var(--color-text-muted)"
                fontFamily="var(--font-mono)"
              >
                {Math.round(r * 100)}%
              </text>
            ))}
          </svg>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-4 gap-2">
          {DIMS.map((dim, i) => (
            <div key={i} className="rounded-lg p-2 text-center" style={{ background: "var(--color-bg-primary)" }}>
              <p className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wide" style={{ fontFamily: "var(--font-mono)" }}>{dim.label}</p>
              <p className="text-xs font-bold mt-0.5" style={{ color: "var(--color-accent)", fontFamily: "var(--font-mono)" }}>
                {dim.value(player).toFixed(dim.label === "Calificación" || dim.label === "Pase %" ? 1 : 2)}
              </p>
              <div className="mt-1 h-0.5 rounded-full" style={{ background: "var(--color-border-subtle)" }}>
                <div className="h-full rounded-full" style={{ background: "var(--color-accent)", width: `${normalized[i] * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
