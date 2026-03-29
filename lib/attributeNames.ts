// Maps CSV column names to display names shown in the UI.
// Keep keys matching exactly the FM26 export headers.
const DISPLAY_NAMES: Record<string, string> = {
  "Trabajo de equipo": "Juego en equipo",
};

export function getAttrDisplayName(attr: string): string {
  return DISPLAY_NAMES[attr] ?? attr;
}
