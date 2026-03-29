"use client";

import { useState, useMemo } from "react";
import { PlayerWithScores } from "@/lib/types";
import { getPositionZone } from "@/lib/positions";

interface HeatmapViewProps {
  data: PlayerWithScores[];
}

const FIELD_ATTRS = [
  "Marcaje","Regate","Fuerza","Resistencia","Velocidad","Aceleración",
  "Agilidad","Equilibrio","Alcance de salto","Sacrificio","Visión",
  "Trabajo de equipo","Colocación","Desmarques","Decisiones","Concentración",
  "Serenidad","Anticipación","Valentía","Agresividad","Centros","Remate",
  "Cabeceo","Tiros lejanos","Pases","Entradas","Técnica","Talento",
  "Determinación","Liderazgo","Recuperación física",
];

const GK_ATTRS = [
  "Blocaje","Alcance aéreo","Mando en el área","Comunicación","Colocación",
  "Reflejos","Agilidad","Concentración","Saques de puerta","Saques largos",
  "Uno contra uno","Determinación",
];

const ZONES = [
  { key: "ALL", label: "Todos" },
  { key: "POR", label: "POR" },
  { key: "DEF", label: "DEF" },
  { key: "MED", label: "MED" },
  { key: "ATA", label: "ATA" },
];

function cellColor(val: number): string {
  if (val >= 16) return "#00ff87";
  if (val >= 14) return "#22c55e";
  if (val >= 12) return "#84cc16";
  if (val >= 10) return "#eab308";
  if (val >= 8)  return "#f97316";
  if (val >= 6)  return "#ef4444";
  return "#7f1d1d";
}

function cellBg(val: number): string {
  if (val >= 16) return "#00ff8720";
  if (val >= 14) return "#22c55e18";
  if (val >= 12) return "#84cc1614";
  if (val >= 10) return "#eab30814";
  if (val >= 8)  return "#f9731614";
  if (val >= 6)  return "#ef444414";
  return "#7f1d1d14";
}

export default function HeatmapView({ data }: HeatmapViewProps) {
  const [activeZone, setActiveZone] = useState("ALL");
  const [sortBy, setSortBy] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (activeZone === "ALL") return data;
    return data.filter((d) => d.player.positions.map(getPositionZone).includes(activeZone));
  }, [data, activeZone]);

  const attrs = activeZone === "POR" ? GK_ATTRS : FIELD_ATTRS;

  const sorted = useMemo(() => {
    if (!sortBy) return filtered;
    return [...filtered].sort((a, b) =>
      (b.player.attributes[sortBy] ?? 0) - (a.player.attributes[sortBy] ?? 0)
    );
  }, [filtered, sortBy]);

  return (
    <div className="relative z-10 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Mapa de Calor</h2>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
          Atributos clave por jugador · haz clic en una columna para ordenar
        </p>
      </div>

      <div className="flex gap-2">
        {ZONES.map((z) => (
          <button
            key={z.key}
            onClick={() => { setActiveZone(z.key); setSortBy(null); }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider border transition-all"
            style={{
              fontFamily: "var(--font-mono)",
              background: activeZone === z.key ? "var(--color-accent)" : "var(--color-bg-card)",
              color: activeZone === z.key ? "#0a0e17" : "var(--color-text-muted)",
              borderColor: activeZone === z.key ? "var(--color-accent)" : "var(--color-border-subtle)",
            }}
          >
            {z.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border overflow-auto" style={{ borderColor: "var(--color-border-subtle)" }}>
        <table className="w-full border-collapse text-xs" style={{ minWidth: `${180 + attrs.length * 44}px` }}>
          <thead>
            <tr style={{ background: "var(--color-bg-card)" }}>
              <th
                className="sticky left-0 z-10 px-3 py-2.5 text-left font-semibold border-b border-r"
                style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)", color: "var(--color-text-muted)", minWidth: "160px" }}
              >
                Jugador
              </th>
              {attrs.map((attr) => (
                <th
                  key={attr}
                  onClick={() => setSortBy(sortBy === attr ? null : attr)}
                  className="px-1 py-2 border-b border-r cursor-pointer select-none"
                  style={{
                    borderColor: "var(--color-border-subtle)",
                    color: sortBy === attr ? "var(--color-accent)" : "var(--color-text-muted)",
                    minWidth: "40px",
                    width: "40px",
                  }}
                  title={attr}
                >
                  <div className="flex items-end justify-center" style={{ height: "72px" }}>
                    <span
                      style={{
                        writingMode: "vertical-rl",
                        transform: "rotate(180deg)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "9px",
                        fontWeight: sortBy === attr ? 700 : 400,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {attr}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((d, rowIdx) => (
              <tr
                key={d.player.name}
                style={{ background: rowIdx % 2 === 0 ? "var(--color-bg-primary)" : "var(--color-bg-card)" }}
              >
                <td
                  className="sticky left-0 z-10 px-3 py-2 border-r border-b font-semibold truncate"
                  style={{
                    borderColor: "var(--color-border-subtle)",
                    background: rowIdx % 2 === 0 ? "var(--color-bg-primary)" : "var(--color-bg-card)",
                    color: "var(--color-text-primary)",
                    maxWidth: "160px",
                  }}
                >
                  <span className="truncate block" title={d.player.name}>{d.player.name}</span>
                  {d.player.age !== undefined && (
                    <span className="text-[9px] text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>{d.player.age}a</span>
                  )}
                </td>
                {attrs.map((attr) => {
                  const val = d.player.attributes[attr] ?? 0;
                  const isSort = sortBy === attr;
                  return (
                    <td
                      key={attr}
                      className="text-center border-r border-b tabular-nums font-bold"
                      style={{
                        borderColor: "var(--color-border-subtle)",
                        color: cellColor(val),
                        background: cellBg(val),
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        outline: isSort ? "1px solid var(--color-accent)30" : "none",
                        padding: "6px 2px",
                      }}
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
