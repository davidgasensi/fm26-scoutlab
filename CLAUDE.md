# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
```

No test suite is configured.

## Architecture

FM26-ScoutLab is a **client-side Next.js 16 app** (App Router) that analyzes Football Manager 2026 player data. There is no backend — all processing happens in the browser.

### Data Flow

1. User uploads a **semicolon-delimited CSV** exported from FM26 (columns: `Jugador`, `Edad`, `Posición`, then numeric attributes)
2. `lib/csvParser.ts` (PapaParse) → produces `Player[]`
3. `lib/calculator.ts` → scores each player against eligible roles → produces `PlayerWithScores[]`
4. State held in `app/page.tsx`, distributed to five tab views via props

### Core Business Logic (`lib/`)

| File | Purpose |
|------|----------|
| `types.ts` | Central type definitions (`Player`, `Role`, `RoleScore`, `PlayerWithScores`) |
| `roles.ts` | ~50 pre-defined roles, each with `positionKeys[]` (eligibility) and `keyAttributes[]` (scoring) |
| `calculator.ts` | Score = average of a role's `keyAttributes` values; only roles matching player positions are evaluated |
| `positions.ts` | Parses FM26 position strings like `"DF(D), ME(DI)"` → `["DF-D", "ME-D", "ME-I"]` |
| `tactics.ts` | Formation definitions and "Best XI" selection logic |
| `formations.ts` | Formation shape configurations |

### Role Scoring

Roles are filtered by `player.positions` matching `role.positionKeys`. The score (0–100) is the unweighted average of the player's attribute values for the role's `keyAttributes`. Results are sorted descending.

### Views (5 tabs, all in `components/`)

- **Análisis de Roles** — `PlayerTable` + `PlayerRow` (expandable rows with all role scores)
- **Vista de Equipo** — `SquadOverview`
- **Comparador** — `PlayerCompare` (side-by-side attribute comparison)
- **Mejor XI & Táctica** — `TacticsView` (formation selector, best XI per role)
- **¿Dónde Encaja?** — `PlayerFitView` + `HeatmapView` (pitch heatmap)

### Styling

Dark theme with green accent (`#00ff87`). CSS custom properties defined in `app/globals.css`. Tailwind CSS 4 with `@tailwindcss/postcss`. Fonts: Outfit (UI) + JetBrains Mono (data).

### Path Alias

`@/*` maps to the project root, so `@/lib/types` resolves to `lib/types.ts`.
