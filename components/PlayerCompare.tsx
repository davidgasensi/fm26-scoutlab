"use client";

import { useState, useMemo } from "react";
import { PlayerWithScores } from "@/lib/types";
import { getPositionZone } from "@/lib/positions";
import RadarChart from "./RadarChart";

interface PlayerCompareProps {
  data: PlayerWithScores[];
}

const COMPARE_COLORS = ["#00ff87", "#f97316", "#a78bfa"];

const ZONES = [
  { key: "POR", label: "POR", color: "#ff6b35" },
  { key: "DEF", label: "DEF", color: "#3b82f6" },
  { key: "MED", label: "MED", color: "#22c55e" },
  { key: "ATA", label: "ATA", color: "#eab308" },
];

function getScoreColor(s: number) {
  if (s >= 16) return "#00ff87";
  if (s >= 13) return "#22c55e";
  if (s >= 10) return "#eab308";
  if (s >= 7)  return "#f97316";
  return "#ef4444";
}

export default function PlayerCompare({ data }: PlayerCompareProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return data.filter((d) => {
      if (search && !d.player.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (activeZone) {
        const zones = d.player.positions.map(getPositionZone);
        if (!zones.includes(activeZone)) return false;
      }
      return true;
    });
  }, [data, search, activeZone]);

  const selectedPlayers = useMemo(
    () => selected.map((name) => data.find((d) => d.player.name === name)!).filter(Boolean),
    [selected, data]
  );

  const togglePlayer = (name: string) => {
    if (selected.includes(name)) {
      setSelected(selected.filter((n) => n !== name));
      setSelectedRoleId(null);
    } else if (selected.length < 3) {
      setSelected([...selected, name]);
      setSelectedRoleId(null);
    }
  };

  const availableRoles = useMemo(() => {
    if (selectedPlayers.length < 2) return [];
    const roleMap = new Map<string, string>();
    for (const p of selectedPlayers) {
      for (const rs of p.roleScores) {
        if (!roleMap.has(rs.role.id)) roleMap.set(rs.role.id, rs.role.name);
      }
    }
    return Array.from(roleMap.entries()).map(([id, name]) => ({ id, name }));
  }, [selectedPlayers]);

  const activeRoleId = selectedRoleId ?? selectedPlayers[0]?.roleScores[0]?.role.id ?? null;

  const playersForRole = useMemo(() => {
    return selectedPlayers.map((p) => {
      const rs = p.roleScores.find((r) => r.role.id === activeRoleId) ?? p.roleScores[0];
      return { player: p, rs };
    });
  }, [selectedPlayers, activeRoleId]);

  const sharedAttrs = useMemo(() => {
    if (playersForRole.length < 2) return [];
    const allAttrNames = new Set<string>();
    for (const { rs } of playersForRole) {
      rs?.attributeValues.forEach((av) => allAttrNames.add(av.name));
    }
    return Array.from(allAttrNames);
  }, [playersForRole]);

  return (
    <div className="relative z-10 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Comparador</h2>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
          Filtra por zona y selecciona hasta 3 jugadores para comparar
        </p>
      </div>

      <div className="rounded-xl border p-4 space-y-3" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)" }}>
        <div className="flex gap-2">
          {ZONES.map((z) => {
            const isActive = activeZone === z.key;
            return (
              <button
                key={z.key}
                onClick={() => { setActiveZone(isActive ? null : z.key); setSelected([]); }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all border"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: isActive ? z.color : "var(--color-text-muted)",
                  backgroundColor: isActive ? `${z.color}15` : "var(--color-bg-primary)",
                  borderColor: isActive ? `${z.color}40` : "var(--color-border-subtle)",
                }}
              >
                {z.label}
              </button>
            );
          })}
          {activeZone && (
            <button
              onClick={() => { setActiveZone(null); setSelected([]); }}
              className="ml-auto text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Limpiar
            </button>
          )}
        </div>

        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Buscar jugador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)]/40 transition-all"
            style={{ fontFamily: "var(--font-mono)" }}
          />
        </div>

        <div className="max-h-[320px] overflow-y-auto space-y-1 pr-1">
          {filtered.map((d) => {
            const isSelected = selected.includes(d.player.name);
            const colorIdx = selected.indexOf(d.player.name);
            const color = colorIdx >= 0 ? COMPARE_COLORS[colorIdx] : undefined;
            return (
              <button
                key={d.player.name}
                onClick={() => togglePlayer(d.player.name)}
                disabled={!isSelected && selected.length >= 3}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
                style={{
                  background: isSelected ? `${color}15` : "transparent",
                  border: `1px solid ${isSelected ? `${color}40` : "transparent"}`,
                  opacity: !isSelected && selected.length >= 3 ? 0.4 : 1,
                }}
              >
                <div
                  className="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center"
                  style={{ borderColor: isSelected ? color! : "#ffffff20", background: isSelected ? color! : "transparent" }}
                >
                  {isSelected && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#0a0e17" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                </div>
                <span className="text-sm text-[var(--color-text-primary)] flex-1 truncate">{d.player.name}</span>
                <span className="text-xs shrink-0" style={{ fontFamily: "var(--font-mono)", color: getScoreColor(d.roleScores[0]?.score ?? 0) }}>
                  {d.roleScores[0]?.score.toFixed(1)} — {d.roleScores[0]?.role.name}
                </span>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center text-xs text-[var(--color-text-muted)] py-6">Sin jugadores</p>
          )}
        </div>

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--color-border-subtle)]">
            {selectedPlayers.map((p, i) => (
              <span
                key={p.player.name}
                className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-semibold"
                style={{ background: `${COMPARE_COLORS[i]}20`, color: COMPARE_COLORS[i], border: `1px solid ${COMPARE_COLORS[i]}40` }}
              >
                {p.player.name}
                <button onClick={() => togglePlayer(p.player.name)} className="hover:opacity-70">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {selectedPlayers.length >= 2 && (
        <>
          <div className="rounded-xl border p-4 space-y-4" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-subtle)" }}>
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-semibold" style={{ fontFamily: "var(--font-mono)" }}>
                Comparar como rol — {availableRoles.find((r) => r.id === activeRoleId)?.name ?? "mejor rol"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {availableRoles.map((role) => {
                  const isActive = role.id === activeRoleId;
                  const allHave = selectedPlayers.every((p) => p.roleScores.some((r) => r.role.id === role.id));
                  return (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRoleId(role.id)}
                      className="text-[10px] px-2.5 py-1 rounded-lg font-semibold transition-all border"
                      style={{
                        fontFamily: "var(--font-mono)",
                        background: isActive ? "var(--color-accent)22" : "transparent",
                        color: isActive ? "var(--color-accent)" : allHave ? "var(--color-text-secondary)" : "var(--color-text-muted)",
                        borderColor: isActive ? "var(--color-accent)50" : "var(--color-border-subtle)",
                        opacity: allHave ? 1 : 0.6,
                      }}
                    >
                      {role.name}
                      {!allHave && <span className="ml-1 opacity-50">*</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-[var(--color-border-subtle)] pt-4 flex flex-wrap justify-center gap-8">
              {playersForRole.map(({ player: p, rs }, i) => (
                <div key={p.player.name} className="flex flex-col items-center gap-2">
                  <div style={{ padding: "28px" }}>
                    <RadarChart attributes={rs?.attributeValues ?? []} size={260} color={COMPARE_COLORS[i]} />
                  </div>
                  <p className="text-sm font-bold text-center" style={{ color: COMPARE_COLORS[i] }}>{p.player.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)] text-center">{rs?.role.name}</p>
                  <p className="text-lg font-bold tabular-nums" style={{ fontFamily: "var(--font-mono)", color: getScoreColor(rs?.score ?? 0) }}>
                    {rs?.score.toFixed(1)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--color-border-subtle)" }}>
            <div
              className="grid"
              style={{ gridTemplateColumns: `180px repeat(${selectedPlayers.length}, 1fr)`, background: "var(--color-bg-card)" }}
            >
              <div className="p-3 border-b border-r border-[var(--color-border-subtle)]">
                <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-semibold" style={{ fontFamily: "var(--font-mono)" }}>Atributo</span>
              </div>
              {playersForRole.map(({ player: p, rs }, i) => (
                <div key={p.player.name} className="p-3 border-b border-r border-[var(--color-border-subtle)] last:border-r-0">
                  <p className="text-xs font-bold truncate" style={{ color: COMPARE_COLORS[i] }}>{p.player.name}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] truncate">{rs?.role.name}</p>
                  <p className="text-lg font-bold tabular-nums mt-1" style={{ fontFamily: "var(--font-mono)", color: getScoreColor(rs?.score ?? 0) }}>
                    {rs?.score.toFixed(1)}
                  </p>
                </div>
              ))}
            </div>

            {sharedAttrs.map((attrName, rowIdx) => {
              const vals = playersForRole.map(({ player: p }) => p.player.attributes[attrName] ?? 0);
              const maxVal = Math.max(...vals);
              return (
                <div
                  key={attrName}
                  className="grid"
                  style={{
                    gridTemplateColumns: `180px repeat(${selectedPlayers.length}, 1fr)`,
                    background: rowIdx % 2 === 0 ? "var(--color-bg-primary)" : "var(--color-bg-card)",
                  }}
                >
                  <div className="p-2.5 flex items-center border-r border-[var(--color-border-subtle)]">
                    <span className="text-xs text-[var(--color-text-muted)] truncate">{attrName}</span>
                  </div>
                  {playersForRole.map(({ player: p }, i) => {
                    const val = p.player.attributes[attrName] ?? 0;
                    const isBest = val === maxVal && playersForRole.length > 1;
                    return (
                      <div key={p.player.name} className="p-2.5 flex items-center gap-2 border-r border-[var(--color-border-subtle)] last:border-r-0">
                        <div className="flex-1 h-1.5 rounded-full bg-[var(--color-bg-secondary)] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${(val / 20) * 100}%`, background: isBest ? COMPARE_COLORS[i] : `${COMPARE_COLORS[i]}55` }}
                          />
                        </div>
                        <span
                          className="text-xs tabular-nums w-5 text-right shrink-0"
                          style={{ fontFamily: "var(--font-mono)", color: isBest ? COMPARE_COLORS[i] : "var(--color-text-muted)", fontWeight: isBest ? 700 : 400 }}
                        >
                          {val}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </>
      )}

      {selectedPlayers.length < 2 && (
        <div className="text-center py-12">
          <p className="text-[var(--color-text-muted)] text-sm">Selecciona al menos 2 jugadores para comparar</p>
        </div>
      )}
    </div>
  );
}
