import { PlayerStats } from "./types";

export interface Badge {
  icon: string;
  label: string;
  color: string;
}

function p90(val: number, mins: number): number {
  return mins > 0 ? val / (mins / 90) : 0;
}

function threshold(squad: PlayerStats[], fn: (p: PlayerStats) => number, topPct: number): number {
  const vals = squad.map(fn).sort((a, b) => b - a);
  return vals[Math.floor(vals.length * topPct)] ?? 0;
}

export function getBadges(player: PlayerStats, squad: PlayerStats[]): Badge[] {
  const active = squad.filter((p) => p.minutes >= 90);
  if (!active.length || player.minutes < 90) return [];

  const mins = player.minutes;
  const badges: Badge[] = [];

  const g90   = p90(player.goals,                       mins);
  const xA90  = p90(player.xA,                          mins);
  const kp90  = p90(player.keyPasses,                   mins);
  const def90 = p90(player.tackleCom + player.clearances, mins);
  const drb90 = p90(player.dribbles,                    mins);

  if (g90 >= threshold(active, (p) => p90(p.goals, p.minutes), 0.2) && g90 > 0.15)
    badges.push({ icon: "⚽", label: "Goleador", color: "#00ff87" });

  if (xA90 + kp90 * 0.1 >= threshold(active, (p) => p90(p.xA, p.minutes) + p90(p.keyPasses, p.minutes) * 0.1, 0.2))
    badges.push({ icon: "🎯", label: "Creador", color: "#a78bfa" });

  if (def90 >= threshold(active, (p) => p90(p.tackleCom + p.clearances, p.minutes), 0.2) && def90 > 0)
    badges.push({ icon: "🛡️", label: "Destructor", color: "#38bdf8" });

  if (player.rating >= 7.1 && mins >= 450)
    badges.push({ icon: "⭐", label: "Referente", color: "#eab308" });

  if (drb90 >= threshold(active, (p) => p90(p.dribbles, p.minutes), 0.2) && drb90 > 0.2)
    badges.push({ icon: "💨", label: "Regateador", color: "#f97316" });

  if (player.passRatio >= threshold(active, (p) => p.passRatio, 0.2) && player.passRatio >= 78)
    badges.push({ icon: "📐", label: "Metódico", color: "#22c55e" });

  return badges;
}
