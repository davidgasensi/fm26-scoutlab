"use client";

import { useState, useCallback, useEffect } from "react";
import Header from "@/components/Header";
import FileUploader from "@/components/FileUploader";
import PlayerTable from "@/components/PlayerTable";
import TacticsView from "@/components/TacticsView";
import SquadOverview from "@/components/SquadOverview";
import PlayerCompare from "@/components/PlayerCompare";
import PlayerFitView from "@/components/PlayerFitView";
import { parseCSV } from "@/lib/csvParser";
import { parseHTML } from "@/lib/htmlParser";
import { calculateAllPlayers } from "@/lib/calculator";
import { ALL_ROLES } from "@/lib/roles";
import { ALL_ROLES_FM24 } from "@/lib/roles-fm24";
import { PlayerWithScores } from "@/lib/types";

type Tab = "analysis" | "squad" | "compare" | "tactics" | "fit";

export default function Home() {
  const [results, setResults] = useState<PlayerWithScores[] | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("analysis");
  const [gameVersion, setGameVersion] = useState<"FM26" | "FM24" | null>(null);

  useEffect(() => {
    const color = gameVersion === "FM24" ? "#38bdf8" : "#00ff87";
    document.documentElement.style.setProperty("--color-accent", color);
  }, [gameVersion]);

  const handleFileLoaded = useCallback((content: string, filename: string) => {
    const isFm24 = filename.toLowerCase().endsWith(".html");
    const players = isFm24 ? parseHTML(content) : parseCSV(content);
    const roles = isFm24 ? ALL_ROLES_FM24 : ALL_ROLES;
    const scored = calculateAllPlayers(players, roles);
    setGameVersion(isFm24 ? "FM24" : "FM26");
    setResults(scored);
  }, []);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "analysis", label: "Análisis de Roles",  icon: "📊" },
    { id: "squad",    label: "Vista de Equipo",     icon: "🏟️" },
    { id: "compare",  label: "Comparador",          icon: "⚖️" },
    { id: "tactics",  label: "Mejor XI & Táctica",  icon: "🎯" },
    { id: "fit",      label: "¿Dónde Encaja?",      icon: "📍" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-8 space-y-6">
        <FileUploader onFileLoaded={handleFileLoaded} version={gameVersion ?? undefined} />

        {results && (
          <>
            {/* Tab navigation */}
            <div className="relative z-10 flex gap-1 p-1 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap shrink-0"
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

            {/* Tab content */}
            {activeTab === "analysis" && <PlayerTable data={results} />}
            {activeTab === "squad"    && <SquadOverview data={results} />}
            {activeTab === "compare"  && <PlayerCompare data={results} />}
            {activeTab === "tactics"  && <TacticsView data={results} />}
            {activeTab === "fit"      && <PlayerFitView data={results} />}
          </>
        )}

        {!results && (
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
      </main>

      <footer className="relative z-10 border-t border-[var(--color-border-subtle)] py-4">
        <p className="text-center text-[10px] text-[var(--color-text-muted)] tracking-wider uppercase" style={{ fontFamily: "var(--font-mono)" }}>
          ScoutLab &mdash; Analizador de roles FM26 &amp; FM24
        </p>
      </footer>
    </div>
  );
}
