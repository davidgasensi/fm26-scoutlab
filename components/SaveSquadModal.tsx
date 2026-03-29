"use client";

import { useState } from "react";

interface SaveSquadModalProps {
  onSave: (name: string) => Promise<void>;
  onClose: () => void;
}

export default function SaveSquadModal({ onSave, onClose }: SaveSquadModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSave(name.trim());
      setSaved(true);
      setTimeout(onClose, 1000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,14,23,0.8)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border p-6 space-y-4"
        style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)" }}
      >
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-accent)]" style={{ fontFamily: "var(--font-mono)" }}>
            Guardar equipo
          </p>
          <h3 className="text-base font-bold text-[var(--color-text-primary)] mt-1">
            Nombra esta plantilla
          </h3>
        </div>

        {saved ? (
          <div className="flex items-center gap-2 py-2 text-[var(--color-accent)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-sm font-semibold">Guardado correctamente</span>
          </div>
        ) : (
          <>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
              placeholder="Ej: FC Barcelona 2026"
              autoFocus
              className="w-full px-3 py-2.5 rounded-lg border text-sm text-[var(--color-text-primary)] outline-none transition-colors"
              style={{
                background: "var(--color-bg-primary)",
                borderColor: "var(--color-border-subtle)",
                fontFamily: "var(--font-mono)",
              }}
            />
            <div className="flex gap-2 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-lg border text-sm font-semibold transition-colors"
                style={{
                  borderColor: "var(--color-border-subtle)",
                  color: "var(--color-text-muted)",
                  background: "transparent",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim() || loading}
                className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                style={{
                  background: name.trim() ? "var(--color-accent)" : "var(--color-bg-primary)",
                  color: name.trim() ? "#0a0e17" : "var(--color-text-muted)",
                }}
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
