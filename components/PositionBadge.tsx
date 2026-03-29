"use client";

import { getPositionColor } from "@/lib/positions";

interface PositionBadgeProps {
  position: string;
}

export default function PositionBadge({ position }: PositionBadgeProps) {
  const color = getPositionColor(position);

  // Format display: "DF-D" → "DF(D)", "POR" → "POR", "MC" → "MC"
  const display = position.includes("-")
    ? `${position.split("-")[0]}(${position.split("-")[1]})`
    : position;

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase border"
      style={{
        fontFamily: "var(--font-mono)",
        color: color,
        backgroundColor: `${color}15`,
        borderColor: `${color}30`,
      }}
    >
      {display}
    </span>
  );
}
