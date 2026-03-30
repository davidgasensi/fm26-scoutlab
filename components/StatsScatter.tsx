"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { PlayerStats } from "@/lib/types";

interface StatsScatterProps {
  players: PlayerStats[];
}

interface AxisOption {
  key: string;
  label: string;
  per90?: keyof PlayerStats;
  raw?: keyof PlayerStats;
  fixed?: boolean;
}

const AXES: AxisOption[] = [
  { key: "rating",     label: "Calificación",      raw: "rating",       fixed: true },
  { key: "minutes",    label: "Minutos",            raw: "minutes",      fixed: true },
  { key: "passRatio",  label: "Precisión pase %",   raw: "passRatio",    fixed: true },
  { key: "goals90",    label: "Goles p90",          per90: "goals" },
  { key: "assists90",  label: "Asistencias p90",    per90: "assists" },
  { key: "xG90",       label: "xG p90",             per90: "xG" },
  { key: "xA90",       label: "xA p90",             per90: "xA" },
  { key: "shots90",    label: "Disparos p90",       per90: "shots" },
  { key: "keyPasses90",label: "Pases clave p90",    per90: "keyPasses" },
  { key: "dribbles90", label: "Regates p90",        per90: "dribbles" },
  { key: "tackleCom90",label: "Entradas p90",       per90: "tackleCom" },
  { key: "clearances90",label:"Despejes p90",       per90: "clearances" },
  { key: "headers90",  label: "Cabeceos p90",       per90: "headers" },
  { key: "distance90", label: "Distancia p90",      per90: "distance" },
];

function getAxisValue(p: PlayerStats, axis: AxisOption): number {
  if (axis.fixed && axis.raw) return (p[axis.raw] as number) ?? 0;
  if (axis.per90 && p.minutes > 0) return ((p[axis.per90] as number) ?? 0) / (p.minutes / 90);
  return 0;
}

const PAD = { top: 24, right: 24, bottom: 48, left: 52 };
const W = 800;
const H = 440;
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;

function scale(val: number, min: number, max: number, size: number): number {
  if (max === min) return size / 2;
  return ((val - min) / (max - min)) * size;
}

function niceLabel(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(2).replace(/\.?0+$/, "");
}

export default function StatsScatter({ players }: StatsScatterProps) {
  const [xKey, setXKey] = useState("xG90");
  const [yKey, setYKey] = useState("goals90");
  const [minMinutes, setMinMinutes] = useState(90);
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; flipX: boolean; flipY: boolean; player: PlayerStats; xVal: number; yVal: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const xAxis = AXES.find((a) => a.key === xKey)!;
  const yAxis = AXES.find((a) => a.key === yKey)!;

  const points = useMemo(() => {
    return players
      .filter((p) => p.minutes >= minMinutes)
      .map((p) => ({
        player: p,
        xVal: getAxisValue(p, xAxis),
        yVal: getAxisValue(p, yAxis),
      }));
  }, [players, xAxis, yAxis, minMinutes]);

  const xMin = useMemo(() => Math.min(0, ...points.map((p) => p.xVal)), [points]);
  const xMax = useMemo(() => Math.max(...points.map((p) => p.xVal)) * 1.05 || 1, [points]);
  const yMin = useMemo(() => Math.min(0, ...points.map((p) => p.yVal)), [points]);
  const yMax = useMemo(() => Math.max(...points.map((p) => p.yVal)) * 1.05 || 1, [points]);

  const xAvg = useMemo(() => points.reduce((s, p) => s + p.xVal, 0) / (points.length || 1), [points]);
  const yAvg = useMemo(() => points.reduce((s, p) => s + p.yVal, 0) / (points.length || 1), [points]);

  const toSvg = useCallback((xVal: number, yVal: number) => ({
    cx: PAD.left + scale(xVal, xMin, xMax, INNER_W),
    cy: PAD.top + INNER_H - scale(yVal, yMin, yMax, INNER_H),
  }), [xMin, xMax, yMin, yMax]);

  const xTicks = useMemo(() => {
    const count = 5;
    return Array.from({ length: count + 1 }, (_, i) => xMin + (xMax - xMin) * (i / count));
  }, [xMin, xMax]);

  const yTicks = useMemo(() => {
    const count = 4;
    return Array.from({ length: count + 1 }, (_, i) => yMin + (yMax - yMin) * (i / count));
  }, [yMin, yMax]);

  const avgX = PAD.left + scale(xAvg, xMin, xMax, INNER_W);
  const avgY = PAD.top + INNER_H - scale(yAvg, yMin, yMax, INNER_H);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGCircleElement>, pt: typeof points[0]) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTooltip({ x, y, flipX: x > rect.width * 0.65, flipY: y > rect.height * 0.65, ...pt });
    setHoveredName(pt.player.name);
  }, []);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>Eje X</p>
          <select
            value={xKey}
            onChange={(e) => setXKey(e.target.value)}
            className="px-3 py-1.5 rounded-lg border text-xs text-[var(--color-text-primary)] outline-none"
            style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)", fontFamily: "var(--font-mono)" }}
          >
            {AXES.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>Eje Y</p>
          <select
            value={yKey}
            onChange={(e) => setYKey(e.target.value)}
            className="px-3 py-1.5 rounded-lg border text-xs text-[var(--color-text-primary)] outline-none"
            style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)", fontFamily: "var(--font-mono)" }}
          >
            {AXES.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>Mín. minutos</p>
          <select
            value={minMinutes}
            onChange={(e) => setMinMinutes(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg border text-xs text-[var(--color-text-primary)] outline-none"
            style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)", fontFamily: "var(--font-mono)" }}
          >
            {[0, 90, 270, 450, 900].map((m) => <option key={m} value={m}>{m === 0 ? "Todos" : `${m}'`}</option>)}
          </select>
        </div>
        <p className="text-[10px] text-[var(--color-text-muted)] ml-auto self-end pb-1" style={{ fontFamily: "var(--font-mono)" }}>
          {points.length} jugadores
        </p>
      </div>

      {/* Chart */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)" }}>
        <div className="relative">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            style={{ display: "block" }}
            onMouseLeave={() => { setHoveredName(null); setTooltip(null); }}
          >
            {/* Grid lines */}
            {yTicks.map((v) => {
              const cy = PAD.top + INNER_H - scale(v, yMin, yMax, INNER_H);
              return (
                <g key={v}>
                  <line x1={PAD.left} y1={cy} x2={PAD.left + INNER_W} y2={cy} stroke="var(--color-border-subtle)" strokeWidth="1" />
                  <text x={PAD.left - 6} y={cy + 4} textAnchor="end" fontSize="10" fill="var(--color-text-muted)" fontFamily="var(--font-mono)">
                    {niceLabel(v)}
                  </text>
                </g>
              );
            })}
            {xTicks.map((v) => {
              const cx = PAD.left + scale(v, xMin, xMax, INNER_W);
              return (
                <g key={v}>
                  <line x1={cx} y1={PAD.top} x2={cx} y2={PAD.top + INNER_H} stroke="var(--color-border-subtle)" strokeWidth="1" />
                  <text x={cx} y={PAD.top + INNER_H + 14} textAnchor="middle" fontSize="10" fill="var(--color-text-muted)" fontFamily="var(--font-mono)">
                    {niceLabel(v)}
                  </text>
                </g>
              );
            })}

            {/* Average crosshair */}
            <line x1={avgX} y1={PAD.top} x2={avgX} y2={PAD.top + INNER_H} stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="4 3" opacity="0.35" />
            <line x1={PAD.left} y1={avgY} x2={PAD.left + INNER_W} y2={avgY} stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="4 3" opacity="0.35" />

            {/* Axis labels */}
            <text x={PAD.left + INNER_W / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--color-accent)" fontFamily="var(--font-mono)" fontWeight="700">
              {xAxis.label}
            </text>
            <text
              x={12}
              y={PAD.top + INNER_H / 2}
              textAnchor="middle"
              fontSize="11"
              fill="var(--color-accent)"
              fontFamily="var(--font-mono)"
              fontWeight="700"
              transform={`rotate(-90, 12, ${PAD.top + INNER_H / 2})`}
            >
              {yAxis.label}
            </text>

            {/* Border box */}
            <rect x={PAD.left} y={PAD.top} width={INNER_W} height={INNER_H} fill="none" stroke="var(--color-border-subtle)" strokeWidth="1" />

            {/* Points */}
            {points.map(({ player, xVal, yVal }) => {
              const { cx, cy } = toSvg(xVal, yVal);
              const isHovered = hoveredName === player.name;
              return (
                <g key={player.name}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 7 : 5}
                    fill={isHovered ? "var(--color-accent)" : "#00ff8766"}
                    stroke={isHovered ? "var(--color-accent)" : "#00ff87aa"}
                    strokeWidth={isHovered ? 2 : 1}
                    style={{ cursor: "pointer", transition: "r 0.1s" }}
                    onMouseMove={(e) => handleMouseMove(e, { player, xVal, yVal })}
                  />
                </g>
              );
            })}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="absolute pointer-events-none z-20 rounded-lg border px-3 py-2 text-xs space-y-1"
              style={{
                left:   tooltip.flipX ? undefined : tooltip.x + 14,
                right:  tooltip.flipX ? `calc(100% - ${tooltip.x - 14}px)` : undefined,
                top:    tooltip.flipY ? undefined : tooltip.y - 10,
                bottom: tooltip.flipY ? `calc(100% - ${tooltip.y + 10}px)` : undefined,
                background: "var(--color-bg-card)",
                borderColor: "var(--color-accent)",
                fontFamily: "var(--font-mono)",
                boxShadow: "0 4px 20px #00000040",
                maxWidth: "200px",
              }}
            >
              <p className="font-bold text-[var(--color-text-primary)] truncate">{tooltip.player.name}</p>
              <p style={{ color: "var(--color-accent)" }}>
                {xAxis.label}: <span className="font-bold">{niceLabel(tooltip.xVal)}</span>
              </p>
              <p style={{ color: "var(--color-accent)" }}>
                {yAxis.label}: <span className="font-bold">{niceLabel(tooltip.yVal)}</span>
              </p>
              <p className="text-[var(--color-text-muted)] text-[10px]">{tooltip.player.minutes}' jugados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
