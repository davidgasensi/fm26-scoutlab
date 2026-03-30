"use client";

import { useState } from "react";
import { Squad, deleteSquad } from "@/lib/firestore";

interface SquadManagerProps {
  uid: string;
  squads: Squad[];
  activeSquadId?: string | null;
  onLoad: (squad: Squad) => void;
  onDeleted: (squadId: string) => void;
  onCompare: (idA: string, idB: string) => void;
}

export default function SquadManager({ uid, squads, activeSquadId, onLoad, onDeleted, onCompare }: SquadManagerProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [compareSelection, setCompareSelection] = useState<string[]>([]);

  const handleDelete = async (squadId: string) => {
    if (!confirm("¿Eliminar este equipo?")) return;
    setDeletingId(squadId);
    try {
      await deleteSquad(uid, squadId);
      onDeleted(squadId);
      setCompareSelection((prev) => prev.filter((id) => id !== squadId));
    } finally {
      setDeletingId(null);
    }
  };

  const toggleCompare = (id: string) => {
    setCompareSelection((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id]; // replace oldest selection
      return [...prev, id];
    });
  };

  const getClub = (sq: Squad) => {
    if (sq.club) return sq.club;
    const parts = sq.name.trim().split(" ");
    const last = parts[parts.length - 1];
    return /^\d{4}$/.test(last) ? parts.slice(0, -1).join(" ") : sq.name;
  };

  const getYear = (sq: Squad) => {
    const parts = sq.name.trim().split(" ");
    const last = parts[parts.length - 1];
    return /^\d{4}$/.test(last) ? last : null;
  };

  if (!squads.length) {
    return (
      <div className="rounded-xl border p-4 text-center" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)" }}>
        <p className="text-xs text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>Sin equipos guardados</p>
      </div>
    );
  }

  const groupMap = new Map<string, Squad[]>();
  for (const sq of squads) {
    const club = getClub(sq);
    if (!groupMap.has(club)) groupMap.set(club, []);
    groupMap.get(club)!.push(sq);
  }
  const groups = Array.from(groupMap.entries())
    .sort(([a], [b]) => a.localeCompare(b, "es"))
    .map(([club, items]) => ({
      club,
      items: [...items].sort((a, b) => (getYear(b) ?? "0").localeCompare(getYear(a) ?? "0")),
    }));

  const selA = squads.find((s) => s.id === compareSelection[0]);
  const selB = squads.find((s) => s.id === compareSelection[1]);

  return (
    <div className="space-y-2">
      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)" }}>
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--color-border-subtle)" }}>
          <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-accent)]" style={{ fontFamily: "var(--font-mono)" }}>
            Equipos guardados ({squads.length})
          </p>
          {compareSelection.length > 0 && (
            <button
              onClick={() => setCompareSelection([])}
              className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Cancelar selección
            </button>
          )}
        </div>

        <div className="divide-y divide-[var(--color-border-subtle)]">
          {groups.map(({ club, items }) => (
            <div key={club}>
              <div className="px-4 py-2" style={{ background: "var(--color-bg-primary)" }}>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent)" }}>
                  {club}
                </p>
              </div>

              {items.map((sq) => {
                const year = getYear(sq);
                const selIdx = compareSelection.indexOf(sq.id);
                const isSelected = selIdx !== -1;
                const isActive = activeSquadId === sq.id;
                return (
                  <div
                    key={sq.id}
                    className="flex items-center gap-3 px-4 py-2.5 pl-6 transition-colors"
                    style={{
                      background: isActive ? "var(--color-accent)0d" : isSelected ? "var(--color-accent)08" : undefined,
                      borderLeft: isActive ? "2px solid var(--color-accent)" : "2px solid transparent",
                    }}
                  >
                    {/* Compare toggle */}
                    <button
                      onClick={() => toggleCompare(sq.id)}
                      title={isSelected ? "Quitar de comparación" : "Seleccionar para comparar"}
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                      style={{
                        borderColor: isSelected ? "var(--color-accent)" : "var(--color-border-subtle)",
                        background: isSelected ? "var(--color-accent)" : "transparent",
                      }}
                    >
                      {isSelected && (
                        <span className="text-[9px] font-black leading-none" style={{ color: "#0a0e17" }}>
                          {selIdx + 1}
                        </span>
                      )}
                    </button>

                    <div
                      className="flex-1 min-w-0 flex items-center gap-3 cursor-pointer"
                      onClick={() => onLoad(sq)}
                    >
                      {year
                        ? <span className="text-sm font-bold tabular-nums shrink-0" style={{ fontFamily: "var(--font-mono)", color: isActive ? "var(--color-accent)" : "var(--color-text-primary)" }}>{year}</span>
                        : <p className="text-sm font-semibold truncate" style={{ color: isActive ? "var(--color-accent)" : "var(--color-text-primary)" }}>{sq.name}</p>
                      }
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ background: sq.version === "FM24" ? "#38bdf820" : "#00ff8720", color: sq.version === "FM24" ? "#38bdf8" : "#00ff87", fontFamily: "var(--font-mono)" }}>
                          {sq.version}
                        </span>
                        <span className="text-[10px] text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>{sq.players.length} jug.</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onLoad(sq)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors"
                        style={{
                          background: isActive ? "transparent" : "var(--color-accent)",
                          color: isActive ? "var(--color-accent)" : "#0a0e17",
                          fontFamily: "var(--font-mono)",
                          border: isActive ? "1px solid var(--color-accent)" : "none",
                        }}
                      >
                        {isActive ? "Activo" : "Analizar"}
                      </button>
                      <button
                        onClick={() => handleDelete(sq.id)}
                        disabled={deletingId === sq.id}
                        className="p-1 rounded-lg transition-colors"
                        style={{ color: "var(--color-text-muted)" }}
                        title="Eliminar"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Compare CTA */}
      {compareSelection.length === 2 && selA && selB && (
        <div
          className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border"
          style={{ background: "var(--color-accent)10", borderColor: "var(--color-accent)30" }}
        >
          <div className="flex items-center gap-2 text-xs min-w-0" style={{ fontFamily: "var(--font-mono)" }}>
            <span className="font-bold shrink-0" style={{ color: "var(--color-accent)" }}>Comparar:</span>
            <span className="text-[var(--color-text-secondary)] truncate">{selA.name}</span>
            <span className="text-[var(--color-text-muted)] shrink-0">vs</span>
            <span className="text-[var(--color-text-secondary)] truncate">{selB.name}</span>
          </div>
          <button
            onClick={() => onCompare(compareSelection[0], compareSelection[1])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all"
            style={{ background: "var(--color-accent)", color: "#0a0e17", fontFamily: "var(--font-mono)" }}
          >
            Ver comparación →
          </button>
        </div>
      )}

      {compareSelection.length === 1 && (
        <p className="text-[10px] text-[var(--color-text-muted)] px-1" style={{ fontFamily: "var(--font-mono)" }}>
          Selecciona otra temporada para comparar
        </p>
      )}
    </div>
  );
}
