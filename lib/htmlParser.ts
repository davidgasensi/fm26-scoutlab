import { Player } from "./types";
import { parsePositions } from "./positions";
import { mapFm24Header } from "./fm24AttributeMap";

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

function extractCells(row: string, tag: "th" | "td"): string[] {
  const pattern = new RegExp(`<${tag}[^>]*>(.*?)<\\/${tag}>`, "gi");
  const cells: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(row)) !== null) {
    cells.push(stripTags(match[1]));
  }
  return cells;
}

export function parseHTML(htmlText: string): Player[] {
  // Extract all table rows
  const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const rows: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = rowPattern.exec(htmlText)) !== null) {
    rows.push(m[1]);
  }

  if (rows.length < 2) return [];

  // First row: headers (th elements)
  const headers = extractCells(rows[0], "th");

  // Find key column indices
  const nameIdx = headers.indexOf("Nombre");
  const posIdx  = headers.indexOf("Posición");
  const ageIdx  = headers.indexOf("Edad");

  if (nameIdx === -1 || posIdx === -1) return [];

  const players: Player[] = [];

  for (let i = 1; i < rows.length; i++) {
    const cells = extractCells(rows[i], "td");
    if (cells.length < headers.length) continue;

    const name = cells[nameIdx]?.trim();
    if (!name) continue;

    const rawPositions = (cells[posIdx] ?? "").trim();
    const positions = parsePositions(rawPositions);

    const ageRaw = ageIdx !== -1 ? parseInt(cells[ageIdx] ?? "", 10) : NaN;
    const age = isNaN(ageRaw) ? undefined : ageRaw;

    const attributes: Record<string, number> = {};
    for (let j = 0; j < headers.length; j++) {
      if (j === nameIdx || j === posIdx || j === ageIdx || !headers[j]) continue;
      const fullName = mapFm24Header(headers[j]);
      const val = parseInt(cells[j] ?? "", 10);
      if (!isNaN(val)) {
        attributes[fullName] = val;
      }
    }

    players.push({ name, age, rawPositions, positions, attributes });
  }

  return players;
}
