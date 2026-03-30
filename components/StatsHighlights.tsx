"use client";

import { useMemo } from "react";
import { PlayerStats } from "@/lib/types";

interface StatsHighlightsProps {
  players: PlayerStats[];
}

const MIN_MINUTES = 90;

function HighlightCard({
  icon,
  label,
  playerName,
  value,
  color,
}: {
  icon: string;
  label: string;
  playerName: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl border p-4 space-y-2"
      style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)" }}
    >
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <p className="text-[10px] uppercase tracking-widest font-bold" style={{ fontFamily: "var(--font-mono)", color }}>
          {label}
        </p>
      </div>
      <p className="text-sm font-bold text-[var(--color-text-primary)] truncate">{playerName}</p>
      <p className="text-2xl font-bold tabular-nums" style={{ fontFamily: "var(--font-mono)", color }}>{value}</p>
    </div>
  );
}

export default function StatsHighlights({ players }: StatsHighlightsProps) {
  const highlights = useMemo(() => {
    const withMinutes = players.filter((p) => p.minutes >= MIN_MINUTES);
    const all = players.filter((p) => p.minutes > 0);

    const topBy = (arr: PlayerStats[], key: keyof PlayerStats) =>
      [...arr].sort((a, b) => (b[key] as number) - (a[key] as number))[0];

    const topGoals    = topBy(all, "goals");
    const topAssists  = topBy(all, "assists");
    const topRating   = topBy(withMinutes, "rating");
    const topXG       = topBy(all, "xG");
    const topMinutes  = topBy(all, "minutes");
    const topXA       = topBy(all, "xA");

    return { topGoals, topAssists, topRating, topXG, topMinutes, topXA };
  }, [players]);

  const { topGoals, topAssists, topRating, topXG, topMinutes, topXA } = highlights;

  const cards = [
    { icon: "⚽", label: "Goleador",     player: topGoals,   value: `${topGoals?.goals ?? 0}`,             color: "var(--color-accent)" },
    { icon: "🎯", label: "Asistencias",  player: topAssists, value: `${topAssists?.assists ?? 0}`,          color: "var(--color-accent)" },
    { icon: "⭐", label: "Calificación", player: topRating,  value: topRating?.rating.toFixed(2) ?? "—",   color: "#eab308" },
    { icon: "🏃", label: "Más minutos",  player: topMinutes, value: `${topMinutes?.minutes ?? 0}'`,         color: "var(--color-text-muted)" },
    { icon: "📊", label: "xG",          player: topXG,      value: topXG?.xG.toFixed(2) ?? "—",           color: "#38bdf8" },
    { icon: "🔑", label: "xA",          player: topXA,      value: topXA?.xA.toFixed(2) ?? "—",           color: "#a78bfa" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Destacados</h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
          Mejores rendimientos de la plantilla
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map(({ icon, label, player, value, color }) => (
          <HighlightCard
            key={label}
            icon={icon}
            label={label}
            playerName={player?.name ?? "—"}
            value={player ? value : "—"}
            color={color}
          />
        ))}
      </div>
    </div>
  );
}
