"use client";

interface SearchFilterProps {
  search: string;
  onSearchChange: (val: string) => void;
  activeZone: string | null;
  onZoneChange: (zone: string | null) => void;
}

const ZONES = [
  { key: "POR", label: "POR", color: "#ff6b35" },
  { key: "DEF", label: "DEF", color: "#3b82f6" },
  { key: "MED", label: "MED", color: "#22c55e" },
  { key: "ATA", label: "ATA", color: "#eab308" },
];

export default function SearchFilter({
  search,
  onSearchChange,
  activeZone,
  onZoneChange,
}: SearchFilterProps) {
  return (
    <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {/* Search input */}
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Buscar jugador..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)]/40 focus:ring-1 focus:ring-[var(--color-accent)]/20 transition-all"
          style={{ fontFamily: "var(--font-mono)" }}
        />
      </div>

      {/* Zone filter buttons */}
      <div className="flex gap-1.5">
        {ZONES.map((zone) => {
          const isActive = activeZone === zone.key;
          return (
            <button
              key={zone.key}
              onClick={() => onZoneChange(isActive ? null : zone.key)}
              className="px-3 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all border"
              style={{
                fontFamily: "var(--font-mono)",
                color: isActive ? zone.color : "var(--color-text-muted)",
                backgroundColor: isActive ? `${zone.color}15` : "var(--color-bg-card)",
                borderColor: isActive ? `${zone.color}40` : "var(--color-border-subtle)",
              }}
            >
              {zone.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
