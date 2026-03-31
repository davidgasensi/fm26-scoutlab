# AGENTS.md

Agent guidance for the **FM26-ScoutLab** codebase. Read this before making changes.

---

## Project Overview

Static-export Next.js 16 app (React 19, TypeScript 6, Tailwind 4) that analyzes Football Manager player data entirely in the browser. No backend, no API routes, no SSR. Deployed to GitHub Pages.

---

## Commands

```bash
npm run dev      # Development server — http://localhost:3000
npm run build    # Production build → ./out (static export)
npm run start    # Serve production build locally
```

**There is no lint script, no type-check script, and no test suite.** To verify your changes:

```bash
npm run build    # This is the only automated check — fix all TypeScript errors before committing
```

TypeScript strict mode is enabled (`"strict": true` in `tsconfig.json`). The build will fail on type errors.

---

## Architecture

```
app/
  layout.tsx         Root layout, fonts, theme init script
  page.tsx           Single page — owns all state, routes between tabs via Tab union
  globals.css        CSS custom properties, Tailwind import, animations

lib/                 Pure logic only — no React imports
  types.ts           Single source of truth for all shared types (import from here first)
  roles.ts           FM26 role definitions (data constant ALL_ROLES)
  roles-fm24.ts      FM24 role definitions
  calculator.ts      Role scoring: score = weighted average of keyAttributes
  csvParser.ts       FM26 semicolon-delimited CSV → Player[]
  htmlParser.ts      FM24 HTML table export → Player[]
  statsParser.ts     In-game statistics CSV parsing
  positions.ts       Position string parsing + color/zone utilities
  tactics.ts         Best XI assignment + tactic instruction recommendations
  formations.ts      Formation slot definitions (data constant FORMATIONS)
  attributeNames.ts  Display name mapping
  firebase.ts        Firebase app init (SSR-guarded)
  firestore.ts       Firestore CRUD — squad cloud save/load

components/          One component per file (26 files)
```

**Data flow**: CSV/HTML upload → parser → `Player[]` → `calculator.ts` → `PlayerWithScores[]` → state in `page.tsx` → props to tab components.

**Two game versions**: FM26 (green accent `#00ff87`) and FM24 (blue accent `#38bdf8`). Each has its own parser and role set, driven by the `isFm24` flag.

---

## Code Style

### Imports

Three groups separated by blank lines, in this order:

```ts
// 1. External packages (React, Firebase, PapaParse, Next.js)
import { useState, useCallback, useMemo } from "react";

// 2. Internal lib modules (absolute @/lib/ paths)
import { PlayerWithScores } from "@/lib/types";
import { calculatePlayerScores } from "@/lib/calculator";

// 3. Component imports (absolute @/components/ paths)
import PlayerRow from "@/components/PlayerRow";
```

- Use `@/lib/...` and `@/components/...` absolute paths everywhere in `app/` and `components/`.
- Inside `lib/`, use relative imports (`./types`, `./positions`).
- Never use deep relative paths like `../../lib/types`.

### Naming

| Category | Convention | Example |
|---|---|---|
| Component files | PascalCase | `PlayerRow.tsx`, `TacticsView.tsx` |
| Lib files | camelCase | `calculator.ts`, `csvParser.ts` |
| Components | PascalCase default export | `export default function PlayerRow(...)` |
| Props interfaces | `ComponentNameProps` | `interface PlayerRowProps` |
| Types / interfaces | PascalCase | `PlayerWithScores`, `RoleScore` |
| Union type aliases | PascalCase | `type Tab = "analysis" \| "squad"` |
| Module-level constants | SCREAMING_SNAKE_CASE | `ALL_ROLES`, `FORMATIONS`, `KEY_WEIGHT` |
| Boolean variables | `is`/`has` prefix | `isEligible`, `isDragging`, `isFm24` |
| Event handlers | `handle` prefix | `handleFile`, `handleDrop`, `handleSaveSquad` |
| Internal helpers | camelCase, unexported | `avg`, `getAttr`, `cellColor` |

### Types

- Use `interface` for object shapes (props, data models): `Player`, `Role`, `Squad`, `*Props`.
- Use `type` for union literals and aliases: `type Tab = ...`, `type SortMode = ...`.
- Prefer explicit return types on all exported functions.
- Prefer inferred types for local variables.
- Use `Record<K, V>` for index signatures, not `{ [key: string]: V }`.
- Use optional chaining `?.` and nullish coalescing `??` over explicit null checks.
- Avoid `any` except in catch blocks when typed errors aren't needed (`e: any`).

### Components

- Every component file must start with `"use client";` — there are no server components.
- Define a `interface ComponentNameProps` immediately before the function declaration.
- Destructure props directly in the function signature.
- Use `useMemo` for all derived/filtered/sorted data computed from props.
- Use `useCallback` for handlers passed as props to children.
- All state lives in `app/page.tsx` and flows down via props — no Context, no Zustand, no Redux.
- Sub-components tightly coupled to a parent can live in the same file.
- Pure helper functions (no React, no closures over component state) go at module scope, not inside the component.

### Styling

- Tailwind utility classes for layout and spacing.
- CSS custom properties (`var(--color-accent)`, `var(--color-bg-card)`, etc.) via inline `style={{}}` for theme-aware colors.
- `tabular-nums` class + `fontFamily: "var(--font-mono)"` on all numeric/attribute cells.
- No component library — all UI is hand-built.
- No icon library — SVGs are inlined.

### Score Colors

The standard color thresholds for FM attribute scores (0–20 scale) used across all components:

```ts
function getScoreColor(score: number): string {
  if (score >= 16) return "#00ff87";  // accent green
  if (score >= 13) return "#7cfc7c";  // mid green
  if (score >= 10) return "#ffd700";  // yellow
  if (score >= 7)  return "#ff8c00";  // orange
  return "#ff4444";                    // red
}
```

Note: This function is currently duplicated across components. Prefer extracting it to `lib/` if adding it to new files.

### Error Handling

- Use `try/catch/finally` for async Firebase operations.
- Swallow expected user-cancellation errors (e.g. `auth/popup-closed-by-user`) silently.
- Use `console.error` only for unexpected errors.
- Guard Firebase initialization with `typeof window !== "undefined"` for static-export SSR compatibility.
- Use `parseInt(value, 10)` with `isNaN` guards; use `?? 0` fallbacks on attribute lookups.
- Use `?.trim() || undefined` for optional string fields from parsed data.

### File-Level Structure

Large files use ASCII-art section dividers for readability:

```ts
// ─── SECTION NAME ───────────────────────────────────────────────────────────
```

---

## Key Invariants

- `lib/types.ts` is the single source of truth — do not define shared types elsewhere.
- `lib/` files must not import from `components/` or `app/`.
- Scoring is a weighted average: `keyAttributes` weight 2, `preferredAttributes` weight 1.
- Scores are on a **0–20 scale** (matching FM's native attribute scale), not 0–100.
- `basePath` is `/fm26-scoutlab` only when `GITHUB_ACTIONS=true` — local dev always uses root.
- The UI is in **Spanish** — keep all user-facing labels, button text, and messages in Spanish.

---

## What Does Not Exist

- No lint script (`eslint` is not installed).
- No test suite (Jest, Vitest, Playwright, etc. are not installed).
- No type-check script (run `npm run build` to surface TypeScript errors).
- No `.cursorrules`, `.cursor/rules/`, or `.github/copilot-instructions.md`.
- No server components, API routes, or server-side logic of any kind.
- No component library (shadcn, MUI, Radix, etc.).
- No global state management library (Context, Zustand, Redux, etc.).
