"use client";

import { useState, useEffect } from "react";
import { PlayerWithScores } from "@/lib/types";
import { getScoreColor } from "@/lib/utils";
import { getAttrDisplayName } from "@/lib/attributeNames";
import PositionBadge from "./PositionBadge";
import RoleBadge from "./RoleBadge";
import RadarChart from "./RadarChart";

interface PlayerRowProps {
  data: PlayerWithScores;
  index: number;
}

export default function PlayerRow({ data, index }: PlayerRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [accentColor, setAccentColor] = useState("#00ff87");
  const { player, roleScores } = data;
  const top3 = roleScores.slice(0, 3);
  const bestRole = roleScores[0];
  const bestRoleAttributes = bestRole
    ? [...bestRole.attributeValues].sort((a, b) => {
        if (a.isKey !== b.isKey) return a.isKey ? -1 : 1;
        return b.value - a.value;
      })
    : [];

  useEffect(() => {
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-accent")
      .trim();
    if (color) setAccentColor(color);
  }, []);

  return (
    <div
      className="animate-reveal"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Main row */}
      <button
        type="button"
        aria-expanded={expanded}
        className={`
          w-full text-left relative rounded-xl border transition-all duration-200 cursor-pointer
          ${
            expanded
              ? "bg-[var(--color-bg-card-hover)] border-[var(--color-accent)]/20"
              : "bg-[var(--color-bg-card)] border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-card-hover)] hover:border-[var(--color-accent)]/10"
          }
        `}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="p-4 flex flex-col lg:grid lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)_auto] lg:items-center gap-4">
          {/* Player info */}
          <div className="flex items-center gap-3 min-w-0 shrink-0">
            {/* Player number */}
            <div
              className="w-8 h-8 shrink-0 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] flex items-center justify-center text-xs font-bold"
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
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2.5 lg:border-l lg:border-[var(--color-border-subtle)] lg:pl-4">
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

          {/* Expand indicator — always show when there are any roles */}
          {roleScores.length > 0 && (
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
        {expanded && roleScores.length > 0 && (
          <div className="animate-expand border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/25">
            <div className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <p
                  className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-semibold"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Todos los roles
                </p>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-md border border-[var(--color-border-subtle)] text-[var(--color-text-muted)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {roleScores.length}
                </span>
              </div>

              {/* Radar chart for best role */}
              {bestRole && (
                <div className="mb-4 p-4 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-semibold" style={{ fontFamily: "var(--font-mono)" }}>
                      Mejor rol
                    </p>
                    <span className="text-xs font-semibold text-[var(--color-text-secondary)] truncate">
                      {bestRole.role.name}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                    <div className="shrink-0" style={{ padding: "24px" }}>
                      <RadarChart attributes={bestRole.attributeValues.filter(av => av.isKey).map(av => ({ ...av, name: getAttrDisplayName(av.name) }))} size={200} color={accentColor} />
                    </div>
                    <div className="flex-1 space-y-1.5 w-full">
                      {bestRoleAttributes.map((av) => (
                        <div key={av.name} className="flex items-center gap-2 text-xs">
                          <span className={`w-32 shrink-0 truncate ${av.isKey ? "text-[var(--color-text-secondary)] font-medium" : "text-[var(--color-text-muted)]"}`}>
                            {getAttrDisplayName(av.name)}
                          </span>
                          <div className="flex-1 h-1.5 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${(av.value / 20) * 100}%`, background: getScoreColor(av.value) }} />
                          </div>
                          <span className="font-bold tabular-nums w-5 text-right shrink-0" style={{ fontFamily: "var(--font-mono)", color: getScoreColor(av.value) }}>{av.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
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
                    <div className="space-y-1 flex-1">
                      {rs.attributeValues.map((av) => (
                        <div
                          key={av.name}
                          className="flex items-center justify-between text-[11px]"
                        >
                          <span className="text-[var(--color-text-muted)] truncate mr-2">
                            {getAttrDisplayName(av.name)}
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
                    <div className="mt-3 h-2 rounded-full bg-[var(--color-bg-secondary)] overflow-hidden">
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
      </button>
    </div>
  );
}
