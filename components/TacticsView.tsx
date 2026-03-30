"use client";

import { useState, useMemo } from "react";
import { PlayerWithScores } from "@/lib/types";
import { FORMATIONS } from "@/lib/formations";
import {
  assignBestXI,
  getBestScoreForSlot,
  recommendInstructions,
  SlotAssignment,
  TacticInstruction,
} from "@/lib/tactics";

interface TacticsViewProps {
  data: PlayerWithScores[];
}

function getScoreColor(s: number): string {
  if (s >= 16) return "#00ff87";
  if (s >= 13) return "#22c55e";
  if (s >= 10) return "#eab308";
  if (s >= 7) return "#f97316";
  return "#ef4444";
}

// ─── INSTRUCTION ROW ─────────────────────────────────────────────────────────

function InstructionRow({ instr }: { instr: TacticInstruction }) {
  const isCategorical = instr.options.length > 5;
  const midIdx = Math.floor(instr.options.length / 2);
  const recIdx = instr.options.indexOf(instr.recommendation);
  return (
    <div className="rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] p-3">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-[var(--color-text-primary)]">{instr.name}</span>
        <span className="text-xs font-bold shrink-0 px-2 py-0.5 rounded" style={{ fontFamily: "var(--font-mono)", background: "var(--color-accent)18", color: "var(--color-accent)", border: "1px solid var(--color-accent)30" }}>
          {instr.recommendation}
        </span>
      </div>
      {isCategorical ? (
        <div className="flex flex-wrap gap-1 mb-2">
          {instr.options.map((opt) => {
            const isRec = opt === instr.recommendation;
            return (
              <span key={opt} className="text-[9px] px-1.5 py-0.5 rounded font-medium" style={{ fontFamily: "var(--font-mono)", background: isRec ? "var(--color-accent)22" : "#ffffff08", color: isRec ? "var(--color-accent)" : "var(--color-text-muted)", border: `1px solid ${isRec ? "var(--color-accent)40" : "#ffffff10"}` }}>
                {opt}
              </span>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-1 mb-2">
          {instr.options.map((opt, i) => {
            const isRec = i === recIdx;
            const isMid = i === midIdx;
            return (
              <div key={opt} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-2 h-2 rounded-full border transition-all" style={{ background: isRec ? "var(--color-accent)" : "transparent", borderColor: isRec ? "var(--color-accent)" : isMid ? "#ffffff22" : "#ffffff11", boxShadow: isRec ? "0 0 6px var(--color-accent)" : "none", transform: isRec ? "scale(1.4)" : "scale(1)" }} />
              </div>
            );
          })}
        </div>
      )}
      <p className="text-[10px] text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>{instr.reason}</p>
    </div>
  );
}

// ─── FIELD CANVAS ─────────────────────────────────────────────────────────────

function FieldCanvas({ assignments }: { assignments: SlotAssignment[] }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div
      className="relative w-full rounded-xl overflow-visible border border-[var(--color-border-subtle)]"
      style={{ aspectRatio: "0.65", background: "linear-gradient(180deg, #0d2818 0%, #0a1f12 50%, #0d2818 100%)" }}
    >
      {/* Field lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 154" preserveAspectRatio="none">
        <rect x="2" y="2" width="96" height="150" fill="none" stroke="#ffffff0d" strokeWidth="0.5" />
        <line x1="2" y1="77" x2="98" y2="77" stroke="#ffffff0d" strokeWidth="0.5" />
        <circle cx="50" cy="77" r="12" fill="none" stroke="#ffffff0d" strokeWidth="0.5" />
        <circle cx="50" cy="77" r="0.8" fill="#ffffff0d" />
        <rect x="24" y="2" width="52" height="22" fill="none" stroke="#ffffff0d" strokeWidth="0.5" />
        <rect x="24" y="130" width="52" height="22" fill="none" stroke="#ffffff0d" strokeWidth="0.5" />
        <rect x="36" y="2" width="28" height="9" fill="none" stroke="#ffffff0d" strokeWidth="0.5" />
        <rect x="36" y="143" width="28" height="9" fill="none" stroke="#ffffff0d" strokeWidth="0.5" />
        <circle cx="50" cy="18" r="0.8" fill="#ffffff0d" />
        <circle cx="50" cy="136" r="0.8" fill="#ffffff0d" />
      </svg>

      {assignments.map((a) => {
        const name = a.playerData.player.name;
        const shortName = name.split(" ").slice(-1)[0];
        const color = getScoreColor(a.score);
        const isHovered = hovered === name;
        const xPct = a.slot.x * 100;

        return (
          <div
            key={name}
            className="absolute"
            style={{ left: `${a.slot.x * 100}%`, top: `${a.slot.y * 100}%`, transform: "translate(-50%, -50%)", zIndex: isHovered ? 20 : 10 }}
            onMouseEnter={() => setHovered(name)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Tooltip */}
            {isHovered && (
              <div
                className={`absolute bottom-full mb-2 z-30 whitespace-nowrap rounded-lg border border-[var(--color-border-subtle)] p-2 text-left shadow-xl pointer-events-none ${xPct < 25 ? "left-0" : xPct > 75 ? "right-0" : "left-1/2 -translate-x-1/2"}`}
                style={{ background: "#0a0e17ee", minWidth: "140px" }}
              >
                <p className="text-xs font-bold text-[var(--color-text-primary)] mb-0.5">{name}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] mb-1">{a.bestRoleScore?.role.name ?? "—"}</p>
                <p className="text-xs font-bold" style={{ fontFamily: "var(--font-mono)", color }}>{a.score.toFixed(1)} / 20</p>
              </div>
            )}

            {/* Glow */}
            <div className="absolute inset-0 rounded-full blur-sm pointer-events-none" style={{ background: color, opacity: isHovered ? 0.2 : 0.12, transform: "scale(1.4)" }} />

            {/* Circle */}
            <div
              className="relative w-12 h-12 rounded-full flex items-center justify-center border-2"
              style={{ background: `radial-gradient(circle at 35% 35%, ${color}22, #151d2ecc)`, borderColor: color }}
            >
              <span className="text-[10px] font-bold text-center leading-tight select-none" style={{ color, fontFamily: "var(--font-mono)" }}>
                {shortName.length > 6 ? shortName.slice(0, 6) : shortName}
              </span>
            </div>

            {/* Score label */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-bold tabular-nums px-1 whitespace-nowrap" style={{ color, fontFamily: "var(--font-mono)", textShadow: `0 0 6px ${color}66` }}>
              {a.score.toFixed(1)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function TacticsView({ data }: TacticsViewProps) {
  const [formationId, setFormationId] = useState("433");
  const [showBench, setShowBench] = useState(false);
  const formation = FORMATIONS.find((f) => f.id === formationId) ?? FORMATIONS[0];

  const assignments = useMemo(() => assignBestXI(data, formation), [data, formation]);

  const benchPlayers = useMemo(() => {
    const onField = new Set(assignments.map((a) => a.playerData.player.name));
    return data.filter((p) => !onField.has(p.player.name));
  }, [data, assignments]);

  const benchAssignments = useMemo(() => assignBestXI(benchPlayers, formation), [benchPlayers, formation]);

  const instructions = useMemo(() => recommendInstructions(assignments), [assignments]);
  const possessionInstructions = instructions.filter((i) => i.category === "possession");
  const defenseInstructions = instructions.filter((i) => i.category === "defense");

  const fieldScore = assignments.reduce((s, a) => s + a.score, 0) / (assignments.length || 1);
  const benchScore = benchAssignments.reduce((s, a) => s + a.score, 0) / (benchAssignments.length || 1);
  const activeScore = showBench ? benchScore : fieldScore;
  const accentColor = showBench ? "#a78bfa" : "var(--color-accent)";

  const activeAssignments = showBench ? benchAssignments : assignments;
  const weakSlots = assignments.filter((a) => a.score < 11);

  const avgAge = (() => {
    const ages = activeAssignments.map((a) => a.playerData.player.age).filter((a): a is number => a !== undefined);
    return ages.length ? ages.reduce((s, a) => s + a, 0) / ages.length : null;
  })();

  return (
    <div className="relative z-10 space-y-6">

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Mejor XI &amp; Táctica</h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
            XI generado automáticamente según puntuaciones
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FORMATIONS.map((f) => (
            <button key={f.id} onClick={() => setFormationId(f.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide border transition-all"
              style={{ fontFamily: "var(--font-mono)", background: formationId === f.id ? "var(--color-accent)" : "var(--color-bg-card)", color: formationId === f.id ? "#0a0e17" : "var(--color-text-muted)", borderColor: formationId === f.id ? "var(--color-accent)" : "var(--color-border-subtle)" }}
            >{f.name}</button>
          ))}
        </div>
      </div>

      {/* ─── Score bar ─── */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)" }}>
        <span className="text-xs text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>Valoración XI:</span>
        <span className="text-2xl font-bold tabular-nums" style={{ fontFamily: "var(--font-mono)", color: getScoreColor(activeScore) }}>{activeScore.toFixed(1)}</span>
        <div className="flex-1 h-2 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(activeScore / 20) * 100}%`, background: getScoreColor(activeScore), boxShadow: `0 0 10px ${getScoreColor(activeScore)}66` }} />
        </div>
        <div className="flex rounded-lg overflow-hidden border shrink-0" style={{ borderColor: "var(--color-border-subtle)" }}>
          <button onClick={() => setShowBench(false)} className="px-3 py-1.5 text-xs font-bold transition-all" style={{ fontFamily: "var(--font-mono)", background: !showBench ? "var(--color-accent)" : "transparent", color: !showBench ? "#0a0e17" : "var(--color-text-muted)" }}>Titular</button>
          <button onClick={() => setShowBench(true)} className="px-3 py-1.5 text-xs font-bold transition-all" style={{ fontFamily: "var(--font-mono)", background: showBench ? "#a78bfa" : "transparent", color: showBench ? "#0a0e17" : "var(--color-text-muted)" }}>Suplente</button>
        </div>
      </div>

      {/* ─── Field + list ─── */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full" style={{ background: accentColor }} />
          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)", color: accentColor }}>
            {showBench ? "XI Suplente" : "XI Titular"} — {formation.name}
          </h3>
          {avgAge !== null && (
            <span className="text-xs text-[var(--color-text-muted)] ml-auto" style={{ fontFamily: "var(--font-mono)" }}>
              Edad media: <span className="font-bold text-[var(--color-text-secondary)]">{avgAge.toFixed(1)}</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Field */}
          <div className="lg:col-span-2">
            <FieldCanvas assignments={activeAssignments} />
          </div>

          {/* Player list */}
          <div className="lg:col-span-3 space-y-2">
            {activeAssignments.length === 0 && (
              <p className="text-xs text-[var(--color-text-muted)] italic px-3">Sin jugadores suficientes</p>
            )}
            {activeAssignments.map((a) => {
              const color = getScoreColor(a.score);
              return (
                <div key={a.playerData.player.name} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-[var(--color-bg-card)] border-[var(--color-border-subtle)]">
                  <span className="text-[10px] font-bold w-8 shrink-0 text-center px-1 py-0.5 rounded" style={{ fontFamily: "var(--font-mono)", color, background: `${color}15`, border: `1px solid ${color}30` }}>{a.slot.label}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{a.playerData.player.name}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] truncate">{a.bestRoleScore?.role.name ?? "Sin rol asignado"}</p>
                  </div>
                  <span className="text-sm font-bold tabular-nums shrink-0" style={{ fontFamily: "var(--font-mono)", color }}>{a.score.toFixed(1)}</span>
                  <div className="w-16 h-1.5 rounded-full bg-[var(--color-bg-primary)] overflow-hidden shrink-0">
                    <div className="h-full rounded-full" style={{ width: `${(a.score / 20) * 100}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Instructions ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]" style={{ fontFamily: "var(--font-mono)" }}>Con posesión</h3>
          </div>
          <div className="space-y-2">{possessionInstructions.map((i) => <InstructionRow key={i.name} instr={i} />)}</div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-[var(--color-amber)]" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-amber)]" style={{ fontFamily: "var(--font-mono)" }}>Sin posesión</h3>
          </div>
          <div className="space-y-2">{defenseInstructions.map((i) => <InstructionRow key={i.name} instr={i} />)}</div>
        </div>
      </div>

      {/* ─── Weak slots ─── */}
      {weakSlots.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#ef4444]" style={{ fontFamily: "var(--font-mono)" }}>Necesidades de plantilla</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {weakSlots.map((a) => {
              const color = getScoreColor(a.score);
              return (
                <div key={a.playerData.player.name} className="rounded-lg border p-3" style={{ background: "var(--color-bg-card)", borderColor: "#ef444430" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ fontFamily: "var(--font-mono)", background: "#ef444415", color: "#ef4444", border: "1px solid #ef444430" }}>{a.slot.label}</span>
                    <span className="text-sm font-bold tabular-nums" style={{ fontFamily: "var(--font-mono)", color }}>{a.score.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-primary)] font-semibold truncate">{a.playerData.player.name}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Posiciones: <span style={{ fontFamily: "var(--font-mono)" }}>{a.slot.positionKeys.join(", ")}</span></p>
                  <p className="text-[10px] text-[#ef4444] mt-1" style={{ fontFamily: "var(--font-mono)" }}>Fichar: {a.bestRoleScore?.role.name ?? a.slot.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
