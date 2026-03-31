"use client";

import React, { useState, useCallback, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { loadSquads, saveSquad, deleteSquad, Squad } from "@/lib/firestore";
import Header from "@/components/Header";
import FileUploader from "@/components/FileUploader";
import PlayerTable from "@/components/PlayerTable";
import TacticsView from "@/components/TacticsView";
import SquadOverview from "@/components/SquadOverview";
import PlayerCompare from "@/components/PlayerCompare";
import PlayerFitView from "@/components/PlayerFitView";
import SquadManager from "@/components/SquadManager";
import SaveSquadModal from "@/components/SaveSquadModal";
import SeasonComparison from "@/components/SeasonComparison";
import StatsSection from "@/components/StatsSection";
import HeatmapView from "@/components/HeatmapView";
import { parseCSV } from "@/lib/csvParser";
import { parseHTML } from "@/lib/htmlParser";
import { calculateAllPlayers } from "@/lib/calculator";
import { ALL_ROLES } from "@/lib/roles";
import { ALL_ROLES_FM24 } from "@/lib/roles-fm24";
import { PlayerWithScores, Player } from "@/lib/types";
import { detectClub } from "@/lib/utils";

type Tab = "analysis" | "squad" | "compare" | "tactics" | "fit" | "heatmap" | "seasons";

export default function Home() {
  const [results, setResults] = useState<PlayerWithScores[] | null>(null);
  const [currentPlayers, setCurrentPlayers] = useState<Player[] | null>(null);
  const [currentVersion, setCurrentVersion] = useState<"FM26" | "FM24" | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("analysis");
  const [gameVersion, setGameVersion] = useState<"FM26" | "FM24" | null>(null);
  const [analysisFileName, setAnalysisFileName] = useState<string | null>(null);

  // Auth & squads
  const [user, setUser] = useState<User | null>(null);
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loadingSquads, setLoadingSquads] = useState(false);
  const [compareIds, setCompareIds] = useState<[string, string] | null>(null);
  const [activeSquadId, setActiveSquadId] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [mode, setMode] = useState<"analysis" | "stats">("analysis");

  useEffect(() => {
    const color = gameVersion === "FM24" ? "#38bdf8" : "#00ff87";
    document.documentElement.style.setProperty("--color-accent", color);
  }, [gameVersion]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        setLoadingSquads(true);
        try {
          const loaded = await loadSquads(u.uid);
          setSquads(loaded);
        } catch (e: any) {
          console.error("Error cargando plantillas:", e);
        } finally {
          setLoadingSquads(false);
        }
      } else {
        setSquads([]);
        setLoadingSquads(false);
      }
    });
    return unsub;
  }, []);

  const handleFileLoaded = useCallback((content: string, filename: string) => {
    const isFm24 = filename.toLowerCase().endsWith(".html");
    const players = isFm24 ? parseHTML(content) : parseCSV(content);
    const roles = isFm24 ? ALL_ROLES_FM24 : ALL_ROLES;
    const version = isFm24 ? "FM24" : "FM26";
    const scored = calculateAllPlayers(players, roles);
    setGameVersion(version);
    setCurrentVersion(version);
    setCurrentPlayers(players);
    setResults(scored);
    setAnalysisFileName(filename);
    setActiveTab("analysis");
    setActiveSquadId(null);
  }, []);

  const handleLoadSquad = useCallback((squad: Squad) => {
    const roles = squad.version === "FM24" ? ALL_ROLES_FM24 : ALL_ROLES;
    const scored = calculateAllPlayers(squad.players, roles);
    setGameVersion(squad.version);
    setCurrentVersion(squad.version);
    setCurrentPlayers(squad.players);
    setResults(scored);
    setAnalysisFileName(null);
    setActiveTab("analysis");
    setActiveSquadId(squad.id);
  }, []);

  const handleSaveSquad = useCallback(async (name: string, club: string) => {
    if (!user || !currentPlayers || !currentVersion) return;
    try {
      const existing = squads.find((s) => s.name === name);
      if (existing) {
        await deleteSquad(user.uid, existing.id);
        setSquads((prev) => prev.filter((s) => s.id !== existing.id));
      }
      const id = await saveSquad(user.uid, name, currentVersion, currentPlayers, club || undefined);
      const newSquad: Squad = {
        id,
        name,
        club: club || undefined,
        version: currentVersion,
        createdAt: new Date(),
        players: currentPlayers,
      };
      setSquads((prev) => [newSquad, ...prev]);
    } catch (e: any) {
      console.error("Error guardando plantilla:", e);
    }
  }, [user, currentPlayers, currentVersion, squads]);

  const handleSquadDeleted = useCallback((squadId: string) => {
    setSquads((prev) => prev.filter((s) => s.id !== squadId));
  }, []);

  const tabs: { id: Tab; label: string; icon: React.ReactNode; requiresAuth?: boolean }[] = [
    { id: "analysis", label: "Análisis de Roles", icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    )},
    { id: "squad",    label: "Vista de Equipo", icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="7" r="3"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
        <circle cx="17" cy="9" r="2.5"/><path d="M21 21v-1.5a3.5 3.5 0 0 0-2.5-3.36"/>
      </svg>
    )},
    { id: "compare",  label: "Comparador", icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="9" r="6"/><circle cx="15" cy="15" r="6"/>
      </svg>
    )},
    { id: "tactics",  label: "Mejor XI & Táctica", icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>
      </svg>
    )},
    { id: "fit",      label: "¿Dónde Encaja?", icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
      </svg>
    )},
    { id: "heatmap",  label: "Heatmap", icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="4" height="4" rx="1"/><rect x="10" y="3" width="4" height="4" rx="1"/><rect x="17" y="3" width="4" height="4" rx="1"/>
        <rect x="3" y="10" width="4" height="4" rx="1"/><rect x="10" y="10" width="4" height="4" rx="1"/><rect x="17" y="10" width="4" height="4" rx="1"/>
        <rect x="3" y="17" width="4" height="4" rx="1"/><rect x="10" y="17" width="4" height="4" rx="1"/><rect x="17" y="17" width="4" height="4" rx="1"/>
      </svg>
    )},
    { id: "seasons",  label: "Temporadas", icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ), requiresAuth: true },
  ];

  const visibleTabs = tabs.filter((t) => {
    if (t.id === "seasons") return user !== null && squads.length >= 2;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} mode={mode} onModeChange={setMode} />

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-8 space-y-6">
        {/* StatsSection always mounted to preserve state when switching modes */}
        <div hidden={mode !== "stats"}>
          <StatsSection user={user} />
        </div>
        {mode === "analysis" && (<>
        <FileUploader
          onFileLoaded={handleFileLoaded}
          version={gameVersion ?? undefined}
          fileName={analysisFileName}
        />

        {activeSquadId && (() => {
          const sq = squads.find((s) => s.id === activeSquadId);
          if (!sq) return null;
          return (
            <div className="relative z-10 flex items-center gap-2 px-3 py-2 rounded-lg border text-xs" style={{ background: "var(--color-accent)0d", borderColor: "var(--color-accent)30", fontFamily: "var(--font-mono)" }}>
              <div className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse" style={{ background: "var(--color-accent)" }} />
              <span className="text-[var(--color-text-muted)]">Analizando:</span>
              <span className="font-bold" style={{ color: "var(--color-accent)" }}>{sq.name}</span>
            </div>
          );
        })()}

        {/* Squad manager — visible when logged in */}
        {user && (
          <div className="space-y-3">
            <SquadManager
              uid={user.uid}
              squads={squads}
              loading={loadingSquads}
              activeSquadId={activeSquadId}
              onLoad={handleLoadSquad}
              onDeleted={(id) => { handleSquadDeleted(id); if (activeSquadId === id) setActiveSquadId(null); }}
              onCompare={(idA, idB) => { setCompareIds([idA, idB]); setActiveTab("seasons"); }}
            />
          </div>
        )}

        {results && (
          <>
            {/* Save button */}
            {user && currentPlayers && (
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
                  Guardar equipo
                </button>
              </div>
            )}

            {/* Tab navigation */}
            <div className="sticky top-3 z-20">
              <div className="relative z-10 flex gap-1 p-1 rounded-xl bg-[var(--color-bg-card)]/90 border border-[var(--color-border-subtle)] overflow-x-auto backdrop-blur-sm shadow-[0_8px_20px_rgba(0,0,0,0.16)]">
              {visibleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    // Limpiar compareIds al salir del tab de temporadas
                    if (tab.id !== "seasons") setCompareIds(null);
                  }}
                  className="focus-accent interactive-press flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap shrink-0"
                  style={{
                    background: activeTab === tab.id ? "var(--color-accent)" : "transparent",
                    color: activeTab === tab.id ? "#0a0e17" : "#748191",
                    boxShadow: activeTab === tab.id ? "0 8px 18px rgba(0, 0, 0, 0.2)" : "none",
                    transform: activeTab === tab.id ? "translateY(-1px)" : "none",
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
              </div>
            </div>

            {/* Tab content */}
            {activeTab === "analysis" && <PlayerTable data={results} />}
            {activeTab === "squad"    && <SquadOverview data={results} />}
            {activeTab === "compare"  && <PlayerCompare data={results} />}
            {activeTab === "tactics"  && <TacticsView data={results} />}
            {activeTab === "fit"      && <PlayerFitView data={results} />}
            {activeTab === "heatmap"  && <HeatmapView data={results} />}
            {activeTab === "seasons"  && user && <SeasonComparison squads={squads} compareIds={compareIds} />}
          </>
        )}

        {/* Seasons tab accessible without loaded file if >=2 squads */}
        {!results && user && squads.length >= 2 && (
          <>
            <div className="relative z-10 flex gap-1 p-1 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-[0_8px_20px_rgba(0,0,0,0.14)]">
              <button
                onClick={() => setActiveTab("seasons")}
                className="focus-accent interactive-press flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold"
                style={{ background: "var(--color-accent)", color: "#0a0e17" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>Temporadas</span>
              </button>
            </div>
            <SeasonComparison squads={squads} compareIds={compareIds} />
          </>
        )}

        {!results && !(user && squads.length >= 2) && (
          <div className="relative z-10 text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <p className="text-[var(--color-text-secondary)] text-sm">
              Sube una exportación de FM26 (CSV) o FM24 (HTML) para analizar tus jugadores
            </p>
            <p className="text-[var(--color-text-muted)]/60 text-xs mt-2" style={{ fontFamily: "var(--font-mono)" }}>
              FM26: separador ; · FM24: exportación HTML de la vista de jugadores
            </p>
          </div>
        )}
        </>)}
      </main>

      <footer className="relative z-10 border-t border-[var(--color-border-subtle)] py-4">
        <p className="text-center text-[10px] text-[var(--color-text-muted)] tracking-wider uppercase" style={{ fontFamily: "var(--font-mono)" }}>
          ScoutLab &mdash; Analizador de roles FM26 &amp; FM24
        </p>
      </footer>

      {showSaveModal && user && currentPlayers && (
        <SaveSquadModal
          clubName={detectClub(currentPlayers)}
          existingSquads={squads}
          onSave={handleSaveSquad}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
}
