import { Player, PlayerStats } from "./types";

// ─── SCORE COLOR ─────────────────────────────────────────────────────────────

export function getScoreColor(s: number): string {
  if (s >= 16) return "#00ff87";
  if (s >= 13) return "#22c55e";
  if (s >= 10) return "#eab308";
  if (s >= 7)  return "#f97316";
  return "#ef4444";
}

// ─── CLUB DETECTION ──────────────────────────────────────────────────────────

export function detectClub(players: Player[] | PlayerStats[]): string {
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

// ─── FIELD LAYOUT ─────────────────────────────────────────────────────────────

export const FIELD_POSITIONS: ({ label: string; posKey: string } | null)[][] = [
  [null,                               { label: "DL(C)", posKey: "DL-C" }, null                              ],
  [{ label: "MP(I)", posKey: "MP-I" }, { label: "MP(C)", posKey: "MP-C" }, { label: "MP(D)", posKey: "MP-D" }],
  [{ label: "ME(I)", posKey: "ME-I" }, { label: "ME(C)", posKey: "ME-C" }, { label: "ME(D)", posKey: "ME-D" }],
  [{ label: "CR(I)", posKey: "CR-I" }, { label: "MC",    posKey: "MC"   }, { label: "CR(D)", posKey: "CR-D" }],
  [{ label: "DF(I)", posKey: "DF-I" }, { label: "DF(C)", posKey: "DF-C" }, { label: "DF(D)", posKey: "DF-D" }],
  [null,                               { label: "POR",   posKey: "POR"  }, null                              ],
];
