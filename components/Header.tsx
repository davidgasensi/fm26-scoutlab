"use client";

import { User } from "firebase/auth";
import AuthButton from "./AuthButton";

interface HeaderProps {
  user: User | null;
}

export default function Header({ user }: HeaderProps) {
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
        <AuthButton user={user} />
      </div>
    </header>
  );
}
