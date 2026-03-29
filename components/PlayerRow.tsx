"use client";

import { useState } from "react";
import { PlayerWithScores } from "@/lib/types";
import PositionBadge from "./PositionBadge";
import RoleBadge from "./RoleBadge";
import RadarChart from "./RadarChart";

interface PlayerRowProps {
  data: PlayerWithScores;
  index: number;
}

export default function PlayerRow({ data, index }: PlayerRowProps) {
  const [expanded, setExpanded] = useState(false);
  const { player, roleScores } = data;
  const top3 = roleScores.slice(0, 3);
  const rest = roleScores.slice(3);

  const getScoreColor = (s: number) => {
    if (s >= 16) return "#00ff87";
    if (s >= 13) return "#22c55e";
    if (s >= 10) return "#eab308";
    if (s >= 7) return "#f97316";
    return "#ef4444";
  };

  return (
    <div
      className="animate-reveal"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Main row */}
      <div
        className={`
          relative rounded-xl border transition-all duration-200 cursor-pointer
          ${
            expanded
              ? "bg-[var(--color-bg-card-hover)] border-[var(--color-accent)]/20"
              : "bg-[var(--color-bg-card)] border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-card-hover)] hover:border-[var(--color-accent)]/10"
          }
        `}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="p-4 flex flex-col lg:flex-row lg:items-start gap-4">
          {/* Player info */}
          <div className="flex items-center gap-3 lg:w-64 shrink-0">
            {/* Player number */}
            <div
              className="w-8 h-8 shrink-0 rounded-lg bg-[var(--color-bg-primary)] flex items-center justify-center text-xs font-bold"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-muted)",
              }}
            >
              {index + 1}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  className="text-sm font-semibold text-[var(--color-text-primary)] truncate"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {player.name}
                </h3>
                {player.age !== undefined && (
                  <span className="text-[10px] shrink-0 tabular-nums text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>
                    {player.age}a
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {player.positions.map((pos) => (
                  <PositionBadge key={pos} position={pos} />
                ))}
              </div>
            </div>
          </div>

          {/* Top 3 roles */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {top3.map((rs, i) => (
              <RoleBadge key={rs.role.id} roleScore={rs} rank={i + 1} />
            ))}
            {top3.length === 0 && (
              <p
                className="text-xs text-[var(--color-text-muted)] italic col-span-3"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Sin roles disponibles para esta posición
              </p>
            )}
          </div>

          {/* Expand indicator */}
          {rest.length > 0 && (
            <div className="shrink-0 flex items-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-text-muted)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          )}
        </div>

        {/* Expanded section */}
        {expanded && rest.length > 0 && (
          <div className="animate-expand border-t border-[var(--color-border-subtle)]">
            <div className="p-4">
              <p
                className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] mb-3 font-semibold"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Todos los roles ({roleScores.length})
              </p>

              {/* Radar chart for best role */}
              {roleScores[0] && (
                <div className="mb-4 p-4 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]">
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-semibold mb-3" style={{ fontFamily: "var(--font-mono)" }}>
                    Mejor rol — {roleScores[0].role.name}
                  </p>
                  <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                    <div className="shrink-0" style={{ padding: "24px" }}>
                      <RadarChart attributes={roleScores[0].attributeValues} size={200} />
                    </div>
                    <div className="flex-1 space-y-1.5 w-full">
                      {roleScores[0].attributeValues.map((av) => (
                        <div key={av.name} className="flex items-center gap-2 text-xs">
                          <span className="text-[var(--color-text-muted)] w-32 shrink-0 truncate">{av.name}</span>
                          <div className="flex-1 h-1 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${(av.value / 20) * 100}%`, background: getScoreColor(av.value) }} />
                          </div>
                          <span className="font-bold tabular-nums w-5 text-right shrink-0" style={{ fontFamily: "var(--font-mono)", color: getScoreColor(av.value) }}>{av.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {roleScores.map((rs, i) => (
                  <div
                    key={rs.role.id}
                    className="rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] p-3 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                        {rs.role.name}
                      </span>
                      <span
                        className="text-base font-bold tabular-nums"
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: getScoreColor(rs.score),
                        }}
                      >
                        {rs.score.toFixed(1)}
                      </span>
                    </div>

                    {/* Attribute breakdown */}
                    <div className="space-y-1.5 flex-1">
                      {rs.attributeValues.map((av) => (
                        <div
                          key={av.name}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-[var(--color-text-muted)] truncate mr-2">
                            {av.name}
                          </span>
                          <span
                            className="font-bold tabular-nums shrink-0"
                            style={{
                              fontFamily: "var(--font-mono)",
                              color: getScoreColor(av.value),
                            }}
                          >
                            {av.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Mini score bar */}
                    <div className="mt-3 h-1.5 rounded-full bg-[var(--color-bg-secondary)] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(rs.score / 20) * 100}%`,
                          backgroundColor: getScoreColor(rs.score),
                          boxShadow: i === 0 ? `0 0 6px ${getScoreColor(rs.score)}66` : "none",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
