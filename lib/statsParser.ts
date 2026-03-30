import Papa from "papaparse";
import { PlayerStats } from "./types";

function num(val: string | undefined): number {
  if (!val || val.trim() === "" || val.trim() === "-") return 0;
  return parseFloat(val.replace("%", "").replace(",", ".")) || 0;
}

export function parseStatsCSV(csvText: string): PlayerStats[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    delimiter: ";",
    skipEmptyLines: true,
  });

  return result.data
    .filter((row) => row["Jugador"] && row["Jugador"].trim() !== "")
    .map((row) => {
      const raw: Record<string, string | number> = {};
      for (const [k, v] of Object.entries(row)) {
        const n = parseFloat((v ?? "").replace(",", "."));
        raw[k] = isNaN(n) ? v : n;
      }

      return {
        name: row["Jugador"]?.trim() ?? "",
        club: row["Club"]?.trim() || undefined,
        age: parseInt(row["Edad"] ?? "", 10) || undefined,
        position: row["Posición"]?.trim() || undefined,
        minutes: num(row["Minutos"]),
        starts: num(row["Titular"]),
        rating: num(row["Calificación"]),
        goals: num(row["Goles"]),
        assists: num(row["Asistencias"]),
        xG: num(row["xG"]),
        xA: num(row["xA"]),
        shots: num(row["Disparos"]),
        shotsOnTarget: num(row["TaP"]),
        keyPasses: num(row["Clv"]),
        dribbles: num(row["Reg"]),
        passAtt: num(row["Pas I"]),
        passCom: num(row["Pas C"]),
        passRatio: (() => {
          const att = num(row["Pas I"]);
          const com = num(row["Pas C"]);
          return att > 0 ? Math.round((com / att) * 1000) / 10 : 0;
        })(),
        tackleAtt: num(row["Ent I"]),
        tackleCom: num(row["Ent C"]),
        clearances: num(row["Ent Cl"]),
        pressureAtt: num(row["Pres Int"]),
        pressureCom: num(row["Pres C"]),
        saves: num(row["JPar"]),
        goalsConceded: num(row["Goles encajados"]),
        cleanSheets: num(row["Portería imbatida"]),
        yellowCards: num(row["Ama"]),
        redCards: num(row["Tarjetas rojas"]),
        distance: num(row["Distancia"]),
        headers: num(row["Cab"]),
        raw,
      };
    });
}

/** Returns true if the CSV content looks like a stats file (has "Calificación" column) */
export function isStatsCSV(csvText: string): boolean {
  const firstLine = csvText.split("\n")[0] ?? "";
  return firstLine.includes("Calificación") || firstLine.includes("Calificacion");
}
