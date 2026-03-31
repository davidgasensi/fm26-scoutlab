import { PlayerWithScores, RoleScore } from "./types";
import { Formation, FormationSlot } from "./formations";

// ─── BEST XI ASSIGNMENT ─────────────────────────────────────────────────────────────────────────────────

export interface SlotAssignment {
  slot: FormationSlot;
  playerData: PlayerWithScores;
  bestRoleScore: RoleScore | null;
  score: number;
}

export function getBestScoreForSlot(
  player: PlayerWithScores,
  slot: FormationSlot
): { score: number; roleScore: RoleScore | null } {
  const playerPositions = new Set(player.player.positions);
  const relevant = player.roleScores.filter((rs) =>
    rs.role.positionKeys.some((pk) => slot.positionKeys.includes(pk) && playerPositions.has(pk))
  );
  if (relevant.length === 0) return { score: 0, roleScore: null };
  return { score: relevant[0].score, roleScore: relevant[0] };
}

export function assignBestXI(
  players: PlayerWithScores[],
  formation: Formation
): SlotAssignment[] {
  const usedIndices = new Set<number>();
  const filledSlots = new Set<string>();
  const assignments: SlotAssignment[] = [];

  for (let iter = 0; iter < formation.slots.length; iter++) {
    let bestScore = -1;
    let bestSlotIdx = -1;
    let bestPlayerIdx = -1;

    for (let si = 0; si < formation.slots.length; si++) {
      if (filledSlots.has(formation.slots[si].id)) continue;
      for (let pi = 0; pi < players.length; pi++) {
        if (usedIndices.has(pi)) continue;
        const { score } = getBestScoreForSlot(players[pi], formation.slots[si]);
        if (score > bestScore) {
          bestScore = score;
          bestSlotIdx = si;
          bestPlayerIdx = pi;
        }
      }
    }

    if (bestSlotIdx >= 0 && bestPlayerIdx >= 0 && bestScore > 0) {
      const slot = formation.slots[bestSlotIdx];
      const playerData = players[bestPlayerIdx];
      const { score, roleScore } = getBestScoreForSlot(playerData, slot);
      filledSlots.add(slot.id);
      usedIndices.add(bestPlayerIdx);
      assignments.push({ slot, playerData, bestRoleScore: roleScore, score });
    }
  }

  return assignments;
}

// ─── TACTIC INSTRUCTIONS RECOMMENDATION ───────────────────────────────────────────

export interface TacticInstruction {
  category: "possession" | "defense";
  name: string;
  recommendation: string;
  reason: string;
  options: string[];
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function getAttr(player: PlayerWithScores, attr: string): number {
  return player.player.attributes[attr] ?? 0;
}

function getAttrs(players: PlayerWithScores[], attr: string): number[] {
  return players.map((p) => getAttr(p, attr));
}

export function recommendInstructions(
  assignments: SlotAssignment[]
): TacticInstruction[] {
  const all = assignments.map((a) => a.playerData);
  const gkSlot = assignments.find((a) => a.slot.positionKeys.includes("POR"));
  const defSlots = assignments.filter((a) =>
    a.slot.positionKeys.some((pk) => pk.startsWith("DF") || pk.startsWith("CR"))
  );
  const midSlots = assignments.filter((a) =>
    a.slot.positionKeys.some((pk) => pk === "MC" || pk.startsWith("ME"))
  );
  const wideSlots = assignments.filter((a) =>
    a.slot.positionKeys.some((pk) => pk.startsWith("MP") && pk !== "MP-C")
  );
  const attackSlots = assignments.filter((a) =>
    a.slot.positionKeys.some((pk) => pk.startsWith("DL") || pk.startsWith("MP"))
  );

  const defs = defSlots.map((a) => a.playerData);
  const mids = midSlots.map((a) => a.playerData);
  const wide = wideSlots.map((a) => a.playerData);
  const attacks = attackSlots.map((a) => a.playerData);

  const passingAvg = avg([...getAttrs(all, "Pases"), ...getAttrs(mids, "Visión"), ...getAttrs(mids, "Técnica")]);
  const passingStyle = passingAvg >= 13.5 ? "Más en corto" : passingAvg >= 11 ? "Estándar" : "Más directo";
  const passingOpts = ["Mucho más en corto", "Más en corto", "Estándar", "Más directo", "Mucho más directo"];

  const tempoAvg = avg([...getAttrs(all, "Resistencia"), ...getAttrs(all, "Aceleración"), ...getAttrs(all, "Velocidad")]);
  const tempo = tempoAvg >= 13.5 ? "Más alto" : tempoAvg >= 11 ? "Estándar" : "Más bajo";

  const wideScore = avg(getAttrs(wide, "Centros").concat(getAttrs(wide, "Regate")));
  const centralScore = avg(getAttrs(mids, "Pases").concat(getAttrs(mids, "Visión")));
  const amplitud = wideScore >= centralScore + 1.5 ? "Más ancho" : centralScore >= wideScore + 1.5 ? "Más estrecho" : "Estándar";

  const creativityAvg = avg([...getAttrs(all, "Visión"), ...getAttrs(all, "Talento"), ...getAttrs(all, "Decisiones")]);
  const creativity = creativityAvg >= 13 ? "Ser más expresivos" : creativityAvg >= 10 ? "Equilibrado" : "Más disciplinados";

  const dribbleAvg = avg([...getAttrs(wide, "Regate"), ...getAttrs(attacks, "Regate")]);
  const dribble = dribbleAvg >= 13 ? "Animar" : dribbleAvg <= 9 ? "Desanimar" : "Equilibrada";

  const longShotsAvg = avg([...getAttrs(mids, "Tiros lejanos"), ...getAttrs(attacks, "Tiros lejanos")]);
  const longShots = longShotsAvg >= 13 ? "Animar" : longShotsAvg <= 9 ? "Desanimar" : "Equilibrada";

  const headingAvg = avg(getAttrs(attacks, "Cabeceo"));
  const crossingAvg = avg(getAttrs(wide, "Centros"));
  const crossStyle = headingAvg >= 13 && crossingAvg >= 12 ? "Centros colgados" : headingAvg <= 9 && crossingAvg >= 12 ? "Centros rasos" : crossingAvg >= 13 ? "Centros tocados" : "Equilibrada";

  const counterAttackAvg = avg([...getAttrs(attacks, "Aceleración"), ...getAttrs(attacks, "Velocidad"), ...getAttrs(attacks, "Desmarques")]);
  const transition = counterAttackAvg >= 14 ? "Contraataque" : counterAttackAvg <= 10 ? "Mantener dibujo" : "Normal";

  const gkDistrib = gkSlot ? getAttr(gkSlot.playerData, "Saques de puerta") : 10;
  const goalkick = gkDistrib >= 13 && passingAvg >= 12 ? "En corto" : gkDistrib <= 8 ? "Largo" : "Mixto";

  const buildupAvg = avg([...getAttrs(defs, "Pases"), ...getAttrs(defs, "Serenidad"), ...getAttrs(defs, "Técnica")]);
  const buildup = buildupAvg >= 13 ? "Jugar superando líneas" : buildupAvg <= 9 ? "Saltarse la presión" : "Equilibrada";

  const finishAvg = avg([...getAttrs(attacks, "Remate"), ...getAttrs(wide, "Centros")]);
  const patience = finishAvg >= 13 && crossingAvg >= 12 ? "Hacer centros" : finishAvg >= 13 ? "Intentar llevar el balón hacia el área" : "Estándar";

  const spaceRunAvg = avg([...getAttrs(attacks, "Desmarques"), ...getAttrs(attacks, "Aceleración")]);
  const passReceive = spaceRunAvg >= 14 ? "Pasar al espacio" : spaceRunAvg <= 10 ? "Pase al pie" : "Equilibrada";

  let gkTarget = "Equilibrada";
  if (gkSlot) {
    const hasOrganizer = mids.some((p) => (p.roleScores[0]?.role.id ?? "").includes("organizador") || (p.roleScores[0]?.role.id ?? "").includes("pivote"));
    const hasTargetMan = attacks.some((p) => (p.roleScores[0]?.role.id ?? "") === "hombre-objetivo");
    if (hasTargetMan) gkTarget = "Delantero centro";
    else if (hasOrganizer) gkTarget = "Organizador";
    else if (passingAvg >= 12) gkTarget = "Centrales";
    else gkTarget = "Equilibrada";
  }

  const pressureAvg = avg([...getAttrs(all, "Resistencia"), ...getAttrs(all, "Sacrificio"), ...getAttrs(all, "Anticipación")]);
  const pressLine = pressureAvg >= 13.5 ? "Presión adelantada" : pressureAvg >= 11 ? "Bloque medio" : "Bloque bajo";

  const defSpeedAvg = avg([...getAttrs(defs, "Velocidad"), ...getAttrs(defs, "Aceleración")]);
  const defLine = defSpeedAvg >= 14 ? "Más alta" : defSpeedAvg <= 10 ? "Más baja" : "Estándar";

  const pressIntensityAvg = avg([...getAttrs(all, "Resistencia"), ...getAttrs(all, "Sacrificio"), ...getAttrs(all, "Agresividad")]);
  const pressIntensity = pressIntensityAvg >= 13.5 ? "Más insistente" : pressIntensityAvg <= 10 ? "Menos insistente" : "Estándar";

  const defTransAvg = avg([...getAttrs(all, "Resistencia"), ...getAttrs(all, "Trabajo de equipo"), ...getAttrs(all, "Concentración")]);
  const defTransition = defTransAvg >= 13.5 ? "Contrapresión" : defTransAvg <= 10 ? "Reagruparse" : "Estándar";

  const tacklingAvg = avg([...getAttrs(all, "Entradas"), ...getAttrs(all, "Agresividad")]);
  const readingAvg = avg([...getAttrs(all, "Anticipación"), ...getAttrs(all, "Concentración")]);
  const tackling = tacklingAvg >= readingAvg + 1.5 ? "Ser agresivos" : readingAvg >= tacklingAvg + 1.5 ? "Mantenerse de pie" : "Estándar";

  const flankDefAvg = avg([...getAttrs(defs, "Marcaje"), ...getAttrs(defs, "Entradas")]);
  const centroCompromiso = flankDefAvg >= 13 ? "Evitar centros" : flankDefAvg <= 10 ? "Permitir centros" : "Equilibrada";

  const defMidStr = avg(getAttrs(mids, "Entradas").concat(getAttrs(mids, "Anticipación")));
  const defFlankStr = avg(getAttrs(defs, "Entradas").concat(getAttrs(defs, "Marcaje")));
  const pressureTrap = defMidStr >= defFlankStr + 1.5 ? "Trampa dentro" : defFlankStr >= defMidStr + 1.5 ? "Presionar fuera" : "Equilibrada";

  return [
    { category: "possession", name: "Pases directos", recommendation: passingStyle, reason: `Media pases+visión+técnica del XI: ${passingAvg.toFixed(1)}`, options: passingOpts },
    { category: "possession", name: "Ritmo de juego", recommendation: tempo, reason: `Media resistencia+aceleración+velocidad: ${tempoAvg.toFixed(1)}`, options: ["Mucho más bajo", "Más bajo", "Estándar", "Más alto", "Mucho más alto"] },
    { category: "possession", name: "Amplitud del ataque", recommendation: amplitud, reason: wideScore >= centralScore + 1.5 ? `Extremos destacan (${wideScore.toFixed(1)}) sobre centrocampistas (${centralScore.toFixed(1)})` : centralScore >= wideScore + 1.5 ? `Centrocampistas destacan (${centralScore.toFixed(1)}) sobre extremos (${wideScore.toFixed(1)})` : `Amplitud y centro equilibrados (${wideScore.toFixed(1)} vs ${centralScore.toFixed(1)})`, options: ["Mucho más estrecho", "Más estrecho", "Estándar", "Más ancho", "Mucho más ancho"] },
    { category: "possession", name: "Libertad creativa", recommendation: creativity, reason: `Media visión+talento+decisiones del XI: ${creativityAvg.toFixed(1)}`, options: ["Más disciplinados", "Equilibrado", "Ser más expresivos"] },
    { category: "possession", name: "Regate", recommendation: dribble, reason: `Media regate de extremos y atacantes: ${dribbleAvg.toFixed(1)}`, options: ["Desanimar", "Equilibrada", "Animar"] },
    { category: "possession", name: "Disparos lejanos", recommendation: longShots, reason: `Media tiros lejanos de medios y atacantes: ${longShotsAvg.toFixed(1)}`, options: ["Desanimar", "Equilibrada", "Animar"] },
    { category: "possession", name: "Estilo de centros", recommendation: crossStyle, reason: `Cabeceo atacantes: ${headingAvg.toFixed(1)}, Centros extremos: ${crossingAvg.toFixed(1)}`, options: ["Equilibrada", "Centros colgados", "Centros tocados", "Centros rasos"] },
    { category: "possession", name: "Transición ofensiva", recommendation: transition, reason: `Media velocidad+desmarques de atacantes: ${counterAttackAvg.toFixed(1)}`, options: ["Mantener dibujo", "Normal", "Contraataque"] },
    { category: "possession", name: "Saques de puerta", recommendation: goalkick, reason: `Saques portero: ${gkDistrib}, estilo de pase del equipo: ${passingAvg.toFixed(1)}`, options: ["En corto", "Mixto", "Largo"] },
    { category: "possession", name: "Estrategia previa", recommendation: buildup, reason: `Media pases+serenidad+técnica defensas: ${buildupAvg.toFixed(1)}`, options: ["Jugar superando líneas", "Equilibrada", "Saltarse la presión"] },
    { category: "possession", name: "Paciencia", recommendation: patience, reason: `Media remate atacantes: ${finishAvg.toFixed(1)}, centros extremos: ${crossingAvg.toFixed(1)}`, options: ["Hacer centros", "Estándar", "Intentar llevar el balón hacia el área"] },
    { category: "possession", name: "Recepción de pase", recommendation: passReceive, reason: `Media desmarques+aceleración de atacantes: ${spaceRunAvg.toFixed(1)}`, options: ["Pase al pie", "Equilibrada", "Pasar al espacio"] },
    { category: "possession", name: "Distribución del portero", recommendation: gkTarget, reason: gkTarget === "Delantero centro" ? "Hombre objetivo detectado en el XI" : gkTarget === "Organizador" ? "Pivote/Organizador detectado en el XI" : `Basado en el estilo de pase del equipo (${passingAvg.toFixed(1)})`, options: ["Equilibrada", "Centrales", "Laterales", "Bandas", "Organizador", "Delantero centro", "Por encima de la defensa"] },
    { category: "defense", name: "Línea de presión", recommendation: pressLine, reason: `Media resistencia+sacrificio+anticipación del XI: ${pressureAvg.toFixed(1)}`, options: ["Bloque bajo", "Bloque medio", "Presión adelantada"] },
    { category: "defense", name: "Línea defensiva", recommendation: defLine, reason: `Media velocidad+aceleración de defensas: ${defSpeedAvg.toFixed(1)}`, options: ["Mucho más baja", "Más baja", "Estándar", "Más alta", "Mucho más alta"] },
    { category: "defense", name: "Activar presión", recommendation: pressIntensity, reason: `Media resistencia+sacrificio+agresividad del XI: ${pressIntensityAvg.toFixed(1)}`, options: ["Mucho menos insistente", "Menos insistente", "Estándar", "Más insistente", "Mucho más insistente"] },
    { category: "defense", name: "Transición defensiva", recommendation: defTransition, reason: `Media resistencia+trabajo de equipo+concentración: ${defTransAvg.toFixed(1)}`, options: ["Reagruparse", "Estándar", "Contrapresión"] },
    { category: "defense", name: "Realizando una entrada", recommendation: tackling, reason: `Entradas+agresividad: ${tacklingAvg.toFixed(1)}, Anticipación+concentración: ${readingAvg.toFixed(1)}`, options: ["Mantenerse de pie", "Estándar", "Ser agresivos"] },
    { category: "defense", name: "Compromiso de centros", recommendation: centroCompromiso, reason: `Media marcaje+entradas de defensas: ${flankDefAvg.toFixed(1)}`, options: ["Evitar centros", "Equilibrada", "Permitir centros"] },
    { category: "defense", name: "Trampa de presión", recommendation: pressureTrap, reason: pressureTrap === "Trampa dentro" ? `Mediocentros más fuertes defensivamente (${defMidStr.toFixed(1)}) que defensas laterales (${defFlankStr.toFixed(1)})` : pressureTrap === "Presionar fuera" ? `Defensas laterales más fuertes (${defFlankStr.toFixed(1)}) que mediocentros (${defMidStr.toFixed(1)})` : `Centro y bandas equiparados (${defMidStr.toFixed(1)} vs ${defFlankStr.toFixed(1)})`, options: ["Trampa dentro", "Equilibrada", "Presionar fuera"] },
  ];
}
