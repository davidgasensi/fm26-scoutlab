"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { User } from "firebase/auth";
import { PlayerStats } from "@/lib/types";
import { parseStatsCSV } from "@/lib/statsParser";
import {
  StatsSeason,
  saveStatsSeason,
  loadStatsSeasons,
  deleteStatsSeason,
} from "@/lib/firestore";
import StatsHighlights from "./StatsHighlights";
import StatsTable from "./StatsTable";
import StatsScatter from "./StatsScatter";
import StatsSeasonCompare from "./StatsSeasonCompare";
import SaveStatsModal from "./SaveStatsModal";
import StatsSeasonManager from "./StatsSeasonManager";

interface StatsSectionProps {
  user: User | null;
}

type StatsTab = "highlights" | "table" | "scatter" | "compare";

function detectClub(players: PlayerStats[]): string {
  const counts = new Map<string, number>();
  for (const p of players) {
    if (p.club) counts.set(p.club, (counts.get(p.club) ?? 0) + 1);
  }
  let best = "";
  let max = 0;
  for (const [club, n] of counts) {
    if (n > max) { max = n; best = club; }
  }
  return best;
}

export default function StatsSection({ user }: StatsSectionProps) {
  const [players, setPlayers] = useState<PlayerStats[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<StatsTab>("highlights");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [seasons, setSeasons] = useState<StatsSeason[]>([]);
  const [loadingSeasons, setLoadingSeasons] = useState(false);
  const [activeSeasonId, setActiveSeasonId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) { setSeasons([]); return; }
    setLoadingSeasons(true);
    loadStatsSeasons(user.uid).then((s) => { setSeasons(s); setLoadingSeasons(false); });
  }, [user]);

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseStatsCSV(text);
      setPlayers(parsed);
      setActiveTab("highlights");
      setActiveSeasonId(null);
    };
    reader.readAsText(file, "utf-8");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".csv")) handleFile(file);
  }, [handleFile]);

  const handleLoadSeason = useCallback((season: StatsSeason) => {
    setPlayers(season.players);
    setFileName(season.name);
    setActiveSeasonId(season.id);
    setActiveTab("highlights");
  }, []);

  const handleSave = useCallback(async (name: string, club: string) => {
    if (!user || !players) return;
    const existing = seasons.find((s) => s.name === name);
    if (existing) {
      await deleteStatsSeason(user.uid, existing.id);
      setSeasons((prev) => prev.filter((s) => s.id !== existing.id));
    }
    const id = await saveStatsSeason(user.uid, name, players, club || undefined);
    const newSeason: StatsSeason = {
      id,
      name,
      club: club || undefined,
      createdAt: new Date(),
      players,
    };
    setSeasons((prev) => [newSeason, ...prev]);
    setActiveSeasonId(id);
  }, [user, players, seasons]);

  const tabs: { id: StatsTab; label: string; icon: string; hidden?: boolean }[] = [
    { id: "highlights", label: "Destacados",  icon: "🏆" },
    { id: "table",      label: "Tabla",       icon: "📊" },
    { id: "scatter",    label: "Dispersión",  icon: "✦" },
    { id: "compare",    label: "Temporadas",  icon: "📅", hidden: !user || seasons.length < 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Uploader */}
      <div
        className="relative z-10 border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 group"
        style={{
          borderColor: isDragging ? "#00ff87" : fileName ? "#00ff8755" : "var(--color-border-subtle)",
          background: isDragging ? "#00ff8708" : "var(--color-bg-card)",
          transform: isDragging ? "scale(1.01)" : undefined,
        }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

        <div
          className="absolute top-3 right-3 px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-widest"
          style={{ fontFamily: "var(--font-mono)", background: "var(--color-accent)", color: "#0a0e17" }}
        >
          STATS
        </div>

        <div
          className="mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center transition-colors"
          style={{ background: "#00ff8718" }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-70 group-hover:opacity-100 transition-opacity"
          >
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        {fileName ? (
          <div>
            <p className="font-semibold text-sm" style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent)" }}>
              {fileName}
            </p>
            <p className="text-[var(--color-text-muted)] text-xs mt-1">
              Arrastra otro fichero para reemplazar
            </p>
          </div>
        ) : (
          <div>
            <p className="text-[var(--color-text-secondary)] font-medium text-sm">
              Arrastra tu exportación de estadísticas aquí o{" "}
              <span className="underline underline-offset-2" style={{ color: "var(--color-accent)" }}>
                haz clic para seleccionar
              </span>
            </p>
            <p className="text-[var(--color-text-muted)] text-xs mt-2" style={{ fontFamily: "var(--font-mono)" }}>
              FM26: CSV de rendimiento (separador ;)
            </p>
          </div>
        )}
      </div>

      {/* Saved seasons manager */}
      {user && (
        <StatsSeasonManager
          uid={user.uid}
          seasons={seasons}
          loading={loadingSeasons}
          activeSeasonId={activeSeasonId}
          onLoad={handleLoadSeason}
          onDeleted={(id) => {
            setSeasons((prev) => prev.filter((s) => s.id !== id));
            if (activeSeasonId === id) setActiveSeasonId(null);
          }}
        />
      )}

      {players && (
        <>
          {/* Save button */}
          {user && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowSaveModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                style={{ background: "var(--color-accent)", color: "#0a0e17", fontFamily: "var(--font-mono)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Guardar estadísticas
              </button>
            </div>
          )}

          {/* Tab nav */}
          <div className="relative z-10 flex gap-1 p-1 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]">
            {tabs.filter((t) => !t.hidden).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  background: activeTab === tab.id ? "var(--color-accent)" : "transparent",
                  color: activeTab === tab.id ? "#0a0e17" : "var(--color-text-muted)",
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {activeTab === "highlights" && <StatsHighlights players={players} />}
          {activeTab === "table"      && <StatsTable players={players} />}
          {activeTab === "scatter"    && <StatsScatter players={players} />}
          {activeTab === "compare"    && <StatsSeasonCompare seasons={seasons} />}
        </>
      )}

      {!players && !user && (
        <div className="relative z-10 text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <p className="text-[var(--color-text-secondary)] text-sm">Sube el CSV de estadísticas para ver el rendimiento de la plantilla</p>
        </div>
      )}

      {showSaveModal && user && players && (
        <SaveStatsModal
          clubName={detectClub(players)}
          existingSeasons={seasons}
          onSave={handleSave}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
}
