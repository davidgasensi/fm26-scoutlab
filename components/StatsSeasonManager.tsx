"use client";

import { useState } from "react";
import { StatsSeason, deleteStatsSeason } from "@/lib/firestore";

interface StatsSeasonManagerProps {
  uid: string;
  seasons: StatsSeason[];
  activeSeasonId?: string | null;
  onLoad: (season: StatsSeason) => void;
  onDeleted: (id: string) => void;
}

function getClub(s: StatsSeason): string {
  if (s.club) return s.club;
  const parts = s.name.trim().split(" ");
  const last = parts[parts.length - 1];
  return /^\d{4}$/.test(last) ? parts.slice(0, -1).join(" ") : s.name;
}

function getYear(s: StatsSeason): string | null {
  const parts = s.name.trim().split(" ");
  const last = parts[parts.length - 1];
  return /^\d{4}$/.test(last) ? last : null;
}

export default function StatsSeasonManager({ uid, seasons, activeSeasonId, onLoad, onDeleted }: StatsSeasonManagerProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setConfirmId(null);
    try {
      await deleteStatsSeason(uid, id);
      onDeleted(id);
    } finally {
      setDeletingId(null);
    }
  };

  if (!seasons.length) {
    return (
      <div className="rounded-xl border p-4 text-center" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)" }}>
        <p className="text-xs text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>Sin estadísticas guardadas</p>
      </div>
    );
  }

  const groupMap = new Map<string, StatsSeason[]>();
  for (const s of seasons) {
    const club = getClub(s);
    if (!groupMap.has(club)) groupMap.set(club, []);
    groupMap.get(club)!.push(s);
  }
  const groups = Array.from(groupMap.entries())
    .sort(([a], [b]) => a.localeCompare(b, "es"))
    .map(([club, items]) => ({
      club,
      items: [...items].sort((a, b) => (getYear(b) ?? "0").localeCompare(getYear(a) ?? "0")),
    }));

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)" }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: "var(--color-border-subtle)" }}>
        <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-accent)]" style={{ fontFamily: "var(--font-mono)" }}>
          Estadísticas guardadas ({seasons.length})
        </p>
      </div>

      <div className="divide-y divide-[var(--color-border-subtle)]">
        {groups.map(({ club, items }) => (
          <div key={club}>
            <div className="px-4 py-2" style={{ background: "var(--color-bg-primary)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent)" }}>
                {club}
              </p>
            </div>
            {items.map((s) => {
              const year = getYear(s);
              const isActive = activeSeasonId === s.id;
              const isConfirming = confirmId === s.id;
              const isDeleting = deletingId === s.id;

              return (
                <div
                  key={s.id}
                  className="flex items-center gap-3 px-4 py-2.5 pl-6 transition-colors"
                  style={{
                    background: isConfirming ? "#ef444408" : isActive ? "#00ff8708" : undefined,
                    borderLeft: isActive ? "2px solid var(--color-accent)" : isConfirming ? "2px solid #ef4444" : "2px solid transparent",
                  }}
                >
                  {isConfirming ? (
                    /* ── Inline confirm ── */
                    <>
                      <p className="flex-1 text-xs font-semibold" style={{ color: "#ef4444", fontFamily: "var(--font-mono)" }}>
                        ¿Eliminar <span className="font-bold">{s.name}</span>?
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setConfirmId(null)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors"
                          style={{ borderColor: "var(--color-border-subtle)", color: "var(--color-text-muted)", background: "transparent", fontFamily: "var(--font-mono)" }}
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors"
                          style={{ background: "#ef4444", color: "#fff", fontFamily: "var(--font-mono)" }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </>
                  ) : (
                    /* ── Normal row ── */
                    <>
                      <div
                        className="flex-1 min-w-0 flex items-center gap-3 cursor-pointer"
                        onClick={() => onLoad(s)}
                      >
                        {year
                          ? <span className="text-sm font-bold tabular-nums shrink-0" style={{ fontFamily: "var(--font-mono)", color: isActive ? "var(--color-accent)" : "var(--color-text-primary)" }}>{year}</span>
                          : <p className="text-sm font-semibold truncate" style={{ color: isActive ? "var(--color-accent)" : "var(--color-text-primary)" }}>{s.name}</p>
                        }
                        <span className="text-[10px] text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>
                          {s.players.length} jug.
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => onLoad(s)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors"
                          style={{
                            background: isActive ? "transparent" : "var(--color-accent)",
                            color: isActive ? "var(--color-accent)" : "#0a0e17",
                            fontFamily: "var(--font-mono)",
                            border: isActive ? "1px solid var(--color-accent)" : "none",
                          }}
                        >
                          {isActive ? "Activo" : "Cargar"}
                        </button>
                        <button
                          onClick={() => setConfirmId(s.id)}
                          disabled={isDeleting}
                          className="p-1 rounded-lg transition-colors hover:text-red-400"
                          style={{ color: "var(--color-text-muted)" }}
                          title="Eliminar"
                        >
                          {isDeleting
                            ? <span className="text-[10px]" style={{ fontFamily: "var(--font-mono)" }}>...</span>
                            : (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6M14 11v6" />
                                <path d="M9 6V4h6v2" />
                              </svg>
                            )
                          }
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
