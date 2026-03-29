"use client";

import { useState } from "react";
import { Squad, deleteSquad } from "@/lib/firestore";

interface SquadManagerProps {
  uid: string;
  squads: Squad[];
  onLoad: (squad: Squad) => void;
  onDeleted: (squadId: string) => void;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

export default function SquadManager({ uid, squads, onLoad, onDeleted }: SquadManagerProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (squadId: string) => {
    if (!confirm("¿Eliminar este equipo?")) return;
    setDeletingId(squadId);
    try {
      await deleteSquad(uid, squadId);
      onDeleted(squadId);
    } finally {
      setDeletingId(null);
    }
  };

  if (!squads.length) {
    return (
      <div
        className="rounded-xl border p-4 text-center"
        style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)" }}
      >
        <p className="text-xs text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>
          Sin equipos guardados
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)" }}
    >
      <div className="px-4 py-3 border-b" style={{ borderColor: "var(--color-border-subtle)" }}>
        <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-accent)]" style={{ fontFamily: "var(--font-mono)" }}>
          Equipos guardados ({squads.length})
        </p>
      </div>
      <div className="divide-y" style={{ borderColor: "var(--color-border-subtle)" }}>
        {squads.map((sq) => (
          <div key={sq.id} className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{sq.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                  style={{
                    background: sq.version === "FM24" ? "#38bdf820" : "#00ff8720",
                    color: sq.version === "FM24" ? "#38bdf8" : "#00ff87",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {sq.version}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>
                  {formatDate(sq.createdAt)}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>
                  · {sq.players.length} jug.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => onLoad(sq)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors"
                style={{
                  background: "var(--color-accent)",
                  color: "#0a0e17",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Cargar
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
        ))}
      </div>
    </div>
  );
}
