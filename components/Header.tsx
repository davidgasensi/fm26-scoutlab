"use client";

import { User } from "firebase/auth";
import AuthButton from "./AuthButton";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  user: User | null;
  mode: "analysis" | "stats";
  onModeChange: (mode: "analysis" | "stats") => void;
}

export default function Header({ user, mode, onModeChange }: HeaderProps) {
  return (
    <header className="relative z-10 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 py-5 flex items-center gap-4">
        {/* Logo icon */}
        <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
          </svg>
          <div className="absolute inset-0 rounded-lg bg-[var(--color-accent)]/5 blur-md" />
        </div>

        <div className="flex-1">
          <h1
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="text-[var(--color-accent)]">FM26</span>{" "}
            <span className="text-[var(--color-text-primary)]">ScoutLab</span>
          </h1>
          <p
            className="text-xs text-[var(--color-text-muted)] tracking-wide uppercase"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Analizador de roles
          </p>
        </div>
        {/* Mode switcher */}
        <div className="flex gap-1 p-1 rounded-lg border" style={{ background: "var(--color-bg-primary)", borderColor: "var(--color-border-subtle)" }}>
          {(["analysis", "stats"] as const).map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className="focus-accent interactive-press px-3 py-1.5 rounded-md text-[11px] font-bold tracking-wide transition-all"
              style={{
                fontFamily: "var(--font-mono)",
                background: mode === m ? "var(--color-accent)" : "transparent",
                color: mode === m ? "#0a0e17" : "var(--color-text-muted)",
              }}
            >
              {m === "analysis" ? "Análisis" : "Estadísticas"}
            </button>
          ))}
        </div>
        <ThemeToggle />
        <AuthButton user={user} />
      </div>
    </header>
  );
}
