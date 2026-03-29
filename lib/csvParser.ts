import Papa from "papaparse";
import { Player } from "./types";
import { parsePositions } from "./positions";

export function parseCSV(csvText: string): Player[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    delimiter: ";",
    skipEmptyLines: true,
  });

  return result.data
    .filter((row) => row["Jugador"] && row["Jugador"].trim() !== "")
    .map((row) => {
      const name = row["Jugador"].trim();
      const ageRaw = parseInt(row["Edad"] ?? "", 10);
      const age = isNaN(ageRaw) ? undefined : ageRaw;
      const rawPositions = (row["Posición"] || "").trim();
      const positions = parsePositions(rawPositions);

      // All remaining columns are attributes (numbers)
      const attributes: Record<string, number> = {};
      for (const [key, value] of Object.entries(row)) {
        if (key === "Jugador" || key === "Posición" || key === "Edad") continue;
        const num = parseInt(value, 10);
        if (!isNaN(num)) {
          attributes[key] = num;
        }
      }

      return { name, age, rawPositions, positions, attributes };
    });
}
