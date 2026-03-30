"use client";

import { useState } from "react";
import { Squad } from "@/lib/firestore";

interface SaveSquadModalProps {
  clubName: string;
  existingSquads: Squad[];
  onSave: (name: string, club: string) => Promise<void>;
  onClose: () => void;
}

export default function SaveSquadModal({ clubName, existingSquads, onSave, onClose }: SaveSquadModalProps) {
  const [year, setYear] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const isValid = /^\d{4}$/.test(year);
  const fullName = isValid ? `${clubName} ${year}` : "";
  const duplicate = isValid ? existingSquads.find((s) => s.name === fullName) : undefined;

  const handleSave = async () => {
    if (!isValid) return;
    if (duplicate && !confirming) {
      setConfirming(true);
      return;
    }
    setLoading(true);
    try {
      await onSave(fullName, clubName);
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
            ¿De qué temporada es?
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
            {/* Club name — read only */}
            <div className="rounded-lg border px-3 py-2.5" style={{ background: "var(--color-bg-primary)", borderColor: "var(--color-border-subtle)" }}>
              <p className="text-[9px] uppercase tracking-widest text-[var(--color-text-muted)] mb-0.5" style={{ fontFamily: "var(--font-mono)" }}>Equipo</p>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{clubName || "Sin equipo"}</p>
            </div>

            {/* Year input */}
            <div>
              <p className="text-[9px] uppercase tracking-widest text-[var(--color-text-muted)] mb-1.5" style={{ fontFamily: "var(--font-mono)" }}>Temporada (año)</p>
              <input
                type="text"
                inputMode="numeric"
                value={year}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setYear(v);
                }}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
                placeholder="2026"
                autoFocus
                maxLength={4}
                className="w-full px-3 py-2.5 rounded-lg border text-sm text-[var(--color-text-primary)] outline-none transition-colors"
                style={{
                  background: "var(--color-bg-primary)",
                  borderColor: isValid ? "var(--color-accent)" : "var(--color-border-subtle)",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.15em",
                }}
              />
              {isValid && !duplicate && (
                <p className="text-[10px] mt-1.5" style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent)" }}>
                  Se guardará como: <span className="font-bold">{fullName}</span>
                </p>
              )}
            </div>

            {/* Overwrite warning */}
            {confirming && duplicate && (
              <div
                className="rounded-lg border px-3 py-2.5 text-xs space-y-1"
                style={{ borderColor: "#f9731640", background: "#f9731610" }}
              >
                <p className="font-bold" style={{ color: "#f97316" }}>Ya existe una plantilla con ese nombre</p>
                <p style={{ color: "var(--color-text-secondary)" }}>
                  Se sobrescribirán los datos de <span className="font-semibold">{fullName}</span>. Esta acción no se puede deshacer.
                </p>
              </div>
            )}

            {!confirming && duplicate && isValid && (
              <p className="text-[10px]" style={{ fontFamily: "var(--font-mono)", color: "#f97316" }}>
                Ya existe una plantilla guardada como <span className="font-bold">{fullName}</span>
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { if (confirming) { setConfirming(false); } else { onClose(); } }}
                className="flex-1 py-2 rounded-lg border text-sm font-semibold transition-colors"
                style={{
                  borderColor: "var(--color-border-subtle)",
                  color: "var(--color-text-muted)",
                  background: "transparent",
                }}
              >
                {confirming ? "Atrás" : "Cancelar"}
              </button>
              <button
                onClick={handleSave}
                disabled={!isValid || loading}
                className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                style={{
                  background: isValid ? (confirming ? "#f97316" : "var(--color-accent)") : "var(--color-bg-primary)",
                  color: isValid ? "#0a0e17" : "var(--color-text-muted)",
                }}
              >
                {loading ? "Guardando..." : confirming ? "Sobrescribir" : "Guardar"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
