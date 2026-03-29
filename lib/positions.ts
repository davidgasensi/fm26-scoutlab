/**
 * Parses the compound position string from the CSV into individual position keys.
 *
 * Examples:
 *   "POR" → ["POR"]
 *   "DF (D), ME (DI)" → ["DF-D", "ME-D", "ME-I"]
 *   "DF/CR (I)" → ["DF-I", "CR-I"]
 *   "ME/MP (C)" → ["ME-C", "MP-C"]
 *   "DF (DC)" → ["DF-D", "DF-C"]
 *   "DF (DIC)" → ["DF-D", "DF-I", "DF-C"]
 *   "MP (DIC)" → ["MP-D", "MP-I", "MP-C"]
 */
export function parsePositions(raw: string): string[] {
  const positions: string[] = [];

  // Split by comma to get each position group
  const groups = raw.split(",").map((s) => s.trim());

  for (const group of groups) {
    // Handle "POR" or "MC" (no parentheses)
    if (!group.includes("(")) {
      // Could be "DF/CR" without sub-positions - unlikely but handle
      const types = group.split("/").map((s) => s.trim());
      for (const type of types) {
        positions.push(type);
      }
      continue;
    }

    // Extract the type(s) and the sub-positions
    // e.g., "DF/CR (I)" → types=["DF","CR"], subs="I"
    // e.g., "ME (DI)" → types=["ME"], subs="DI"
    const match = group.match(/^([A-Z/]+)\s*\(([^)]+)\)$/);
    if (!match) continue;

    const types = match[1].split("/").map((s) => s.trim());
    const subsRaw = match[2].trim();

    // Expand compound sub-positions: "DIC" → ["D","I","C"], "DI" → ["D","I"], "DC" → ["D","C"]
    const subs = expandSubs(subsRaw);

    for (const type of types) {
      for (const sub of subs) {
        positions.push(`${type}-${sub}`);
      }
    }
  }

  return [...new Set(positions)];
}

function expandSubs(s: string): string[] {
  const result: string[] = [];
  for (const char of s) {
    if (char === "D" || char === "I" || char === "C") {
      result.push(char);
    }
  }
  return result.length > 0 ? result : [s];
}

/** Color mapping for position zones */
export function getPositionColor(posKey: string): string {
  if (posKey === "POR") return "#ff6b35"; // orange for GK
  if (posKey.startsWith("DF") || posKey.startsWith("CR")) return "#3b82f6"; // blue for defense
  if (posKey === "MC" || posKey.startsWith("ME")) return "#22c55e"; // green for midfield
  if (posKey.startsWith("MP")) return "#eab308"; // yellow for attacking mid
  if (posKey.startsWith("DL")) return "#ef4444"; // red for strikers
  return "#6b7280";
}

export function getPositionZone(posKey: string): string {
  if (posKey === "POR") return "POR";
  if (posKey.startsWith("DF") || posKey.startsWith("CR")) return "DEF";
  if (posKey === "MC" || posKey.startsWith("ME")) return "MED";
  if (posKey.startsWith("MP") || posKey.startsWith("DL")) return "ATA";
  return "OTHER";
}
