"use client";

import { RoleScore } from "@/lib/types";
import { getScoreColor } from "@/lib/utils";

interface RoleBadgeProps {
  roleScore: RoleScore;
  rank: number;
}

export default function RoleBadge({ roleScore, rank }: RoleBadgeProps) {
  const { role, score } = roleScore;
  const percentage = (score / 20) * 100;

  const color = getScoreColor(score);

  return (
    <div className="flex items-center gap-3 min-w-0">
      {/* Rank number */}
      <span
        className="text-[10px] font-bold w-4 text-right shrink-0"
        style={{
          fontFamily: "var(--font-mono)",
          color: rank === 1 ? "var(--color-accent)" : "var(--color-text-muted)",
        }}
      >
        #{rank}
      </span>

      <div className="flex-1 min-w-0">
        {/* Role name + score */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <span
            className="text-xs font-medium truncate"
            style={{ color: rank === 1 ? "var(--color-text-primary)" : "var(--color-text-secondary)" }}
          >
            {role.name}
          </span>
          <span
            className="text-xs font-bold shrink-0 tabular-nums"
            style={{ fontFamily: "var(--font-mono)", color }}
          >
            {score.toFixed(1)}
          </span>
        </div>

        {/* Score bar */}
        <div className="h-1.5 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
              boxShadow: rank === 1 ? `0 0 8px ${color}66` : "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}
