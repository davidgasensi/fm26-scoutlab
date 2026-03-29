import { Role } from "./types";

// Position keys that map to each role group
const POS_POR = ["POR"];
const POS_LAT = ["DF-D", "DF-I", "CR-D", "CR-I"];
const POS_DC = ["DF-C"];
const POS_MC = ["MC"];
const POS_ME = ["ME-D", "ME-I", "ME-C"];
const POS_MP_EXT = ["MP-D", "MP-I"];
const POS_MP_C = ["MP-C"];
const POS_DL = ["DL-C"];

export const ALL_ROLES: Role[] = [
  // PORTERO
  {
    id: "portero",
    name: "Portero",
    group: "Portero",
    positionKeys: POS_POR,
    keyAttributes: ["Blocaje", "Alcance aéreo", "Mando en el área", "Comunicación", "Colocación", "Reflejos", "Agilidad", "Concentración"],
  },
  {
    id: "portero-juego-pies",
    name: "Portero con juego de pies",
    group: "Portero",
    positionKeys: POS_POR,
    keyAttributes: ["Blocaje", "Alcance aéreo", "Mando en el área", "Comunicación", "Saques de puerta", "Colocación", "Reflejos", "Agilidad"],
  },
  {
    id: "portero-sin-complicaciones",
    name: "Portero sin complicaciones",
    group: "Portero",
    positionKeys: POS_POR,
    keyAttributes: ["Blocaje", "Alcance aéreo", "Mando en el área", "Comunicación", "Colocación", "Reflejos", "Agilidad", "Concentración"],
  },

  // LATERAL Y/O CARRILERO
  {
    id: "lateral-defensivo",
    name: "Lateral defensivo",
    group: "Lateral / Carrilero",
    positionKeys: POS_LAT,
    keyAttributes: ["Marcaje", "Entradas", "Anticipación", "Colocación", "Trabajo de equipo", "Aceleración", "Concentración"],
  },
  {
    id: "lateral-ofensivo",
    name: "Lateral ofensivo",
    group: "Lateral / Carrilero",
    positionKeys: POS_LAT,
    keyAttributes: ["Centros", "Marcaje", "Entradas", "Trabajo de equipo", "Sacrificio", "Aceleración", "Resistencia", "Velocidad"],
  },
  {
    id: "carrilero-por-dentro",
    name: "Carrilero por dentro",
    group: "Lateral / Carrilero",
    positionKeys: POS_LAT,
    keyAttributes: ["Pases", "Entradas", "Anticipación", "Decisiones", "Colocación", "Trabajo de equipo", "Aceleración", "Serenidad"],
  },
  {
    id: "lateral-por-dentro",
    name: "Lateral por dentro",
    group: "Lateral / Carrilero",
    positionKeys: POS_LAT,
    keyAttributes: ["Cabeceo", "Marcaje", "Entradas", "Anticipación", "Colocación", "Fuerza"],
  },
  {
    id: "lateral-ofensivo-creador",
    name: "Lateral ofensivo creador",
    group: "Lateral / Carrilero",
    positionKeys: POS_LAT,
    keyAttributes: ["Pases", "Entradas", "Visión", "Decisiones", "Control", "Técnica", "Trabajo de equipo", "Aceleración"],
  },
  {
    id: "lateral-ofensivo-avanzado",
    name: "Lateral ofensivo avanzado",
    group: "Lateral / Carrilero",
    positionKeys: POS_LAT,
    keyAttributes: ["Centros", "Regate", "Desmarques", "Técnica", "Trabajo de equipo", "Sacrificio", "Aceleración", "Resistencia"],
  },

  // DEFENSA CENTRAL
  {
    id: "central",
    name: "Central",
    group: "Defensa Central",
    positionKeys: POS_DC,
    keyAttributes: ["Cabeceo", "Marcaje", "Entradas", "Anticipación", "Colocación", "Fuerza", "Alcance de salto"],
  },
  {
    id: "central-avanzado",
    name: "Central avanzado",
    group: "Defensa Central",
    positionKeys: POS_DC,
    keyAttributes: ["Cabeceo", "Marcaje", "Pases", "Entradas", "Anticipación", "Decisiones", "Colocación", "Técnica"],
  },
  {
    id: "central-con-toque",
    name: "Central con toque",
    group: "Defensa Central",
    positionKeys: POS_DC,
    keyAttributes: ["Cabeceo", "Marcaje", "Pases", "Entradas", "Anticipación", "Colocación", "Fuerza", "Alcance de salto"],
  },
  {
    id: "central-defensivo",
    name: "Central defensivo",
    group: "Defensa Central",
    positionKeys: POS_DC,
    keyAttributes: ["Cabeceo", "Marcaje", "Entradas", "Anticipación", "Colocación", "Fuerza", "Alcance de salto"],
  },

  // MEDIOCENTRO
  {
    id: "mediocentro",
    name: "Mediocentro",
    group: "Mediocentro",
    positionKeys: POS_MC,
    keyAttributes: ["Entradas", "Anticipación", "Colocación", "Trabajo de equipo", "Concentración"],
  },
  {
    id: "pivote-organizador",
    name: "Pivote organizador",
    group: "Mediocentro",
    positionKeys: POS_MC,
    keyAttributes: ["Pases", "Visión", "Decisiones", "Control", "Técnica", "Trabajo de equipo", "Serenidad"],
  },
  {
    id: "centrocampista-todoterreno",
    name: "Centrocampista todoterreno",
    group: "Mediocentro",
    positionKeys: POS_MC,
    keyAttributes: ["Desmarques", "Pases", "Entradas", "Trabajo de equipo", "Sacrificio", "Resistencia"],
  },
  {
    id: "medio-cierre",
    name: "Medio cierre",
    group: "Mediocentro",
    positionKeys: POS_MC,
    keyAttributes: ["Cabeceo", "Marcaje", "Entradas", "Anticipación", "Colocación", "Trabajo de equipo", "Fuerza", "Alcance de salto"],
  },
  {
    id: "organizador-todoterreno",
    name: "Organizador todoterreno",
    group: "Mediocentro",
    positionKeys: POS_MC,
    keyAttributes: ["Desmarques", "Pases", "Visión", "Decisiones", "Control", "Técnica", "Trabajo de equipo", "Sacrificio"],
  },

  // CENTROCAMPISTA POR DENTRO
  {
    id: "centrocampista",
    name: "Centrocampista",
    group: "Centrocampista",
    positionKeys: POS_ME,
    keyAttributes: ["Pases", "Entradas", "Decisiones", "Control", "Trabajo de equipo"],
  },
  {
    id: "mediapunta-cm",
    name: "Mediapunta (CM)",
    group: "Centrocampista",
    positionKeys: POS_ME,
    keyAttributes: ["Tiros lejanos", "Desmarques", "Pases", "Control", "Técnica", "Talento", "Serenidad"],
  },
  {
    id: "organizador-adelantado",
    name: "Organizador adelantado",
    group: "Centrocampista",
    positionKeys: POS_ME,
    keyAttributes: ["Desmarques", "Pases", "Visión", "Decisiones", "Control", "Técnica", "Trabajo de equipo", "Serenidad"],
  },
  {
    id: "mediocampista-de-banda",
    name: "Mediocampista de banda",
    group: "Centrocampista",
    positionKeys: POS_ME,
    keyAttributes: ["Pases", "Entradas", "Decisiones", "Control", "Trabajo de equipo"],
  },
  {
    id: "centrocampista-interior",
    name: "Centrocampista interior",
    group: "Centrocampista",
    positionKeys: POS_ME,
    keyAttributes: ["Centros", "Desmarques", "Pases", "Control", "Técnica", "Sacrificio", "Aceleración", "Serenidad"],
  },
  {
    id: "centrocampista-organizador",
    name: "Centrocampista organizador",
    group: "Centrocampista",
    positionKeys: POS_ME,
    keyAttributes: ["Desmarques", "Pases", "Visión", "Decisiones", "Control", "Técnica", "Trabajo de equipo", "Serenidad"],
  },

  // EXTERIORES (BANDA)
  {
    id: "centrocampista-de-banda",
    name: "Centrocampista de banda",
    group: "Exterior",
    positionKeys: POS_MP_EXT,
    keyAttributes: ["Centros", "Pases", "Decisiones", "Técnica", "Trabajo de equipo", "Sacrificio", "Resistencia", "Velocidad"],
  },
  {
    id: "extremo",
    name: "Extremo",
    group: "Exterior",
    positionKeys: POS_MP_EXT,
    keyAttributes: ["Centros", "Regate", "Técnica", "Trabajo de equipo", "Aceleración", "Velocidad", "Agilidad"],
  },
  {
    id: "extremo-organizador",
    name: "Extremo organizador",
    group: "Exterior",
    positionKeys: POS_MP_EXT,
    keyAttributes: ["Centros", "Regate", "Desmarques", "Pases", "Visión", "Decisiones", "Control", "Técnica"],
  },
  {
    id: "extremo-por-dentro",
    name: "Extremo por dentro",
    group: "Exterior",
    positionKeys: POS_MP_EXT,
    keyAttributes: ["Regate", "Control", "Técnica", "Trabajo de equipo", "Aceleración", "Agilidad", "Serenidad"],
  },
  {
    id: "delantero-por-dentro",
    name: "Delantero por dentro",
    group: "Exterior",
    positionKeys: POS_MP_EXT,
    keyAttributes: ["Regate", "Desmarques", "Anticipación", "Control", "Técnica", "Aceleración", "Agilidad", "Serenidad"],
  },
  {
    id: "delantero-escorado",
    name: "Delantero escorado",
    group: "Exterior",
    positionKeys: POS_MP_EXT,
    keyAttributes: ["Regate", "Desmarques", "Anticipación", "Control", "Técnica", "Aceleración", "Velocidad", "Agilidad"],
  },

  // MEDIAPUNTA POR DENTRO
  {
    id: "rol-libre",
    name: "Rol libre",
    group: "Mediapunta",
    positionKeys: POS_MP_C,
    keyAttributes: ["Regate", "Tiros lejanos", "Desmarques", "Pases", "Visión", "Control", "Técnica", "Talento"],
  },
  {
    id: "mediapunta-mp",
    name: "Mediapunta (MP)",
    group: "Mediapunta",
    positionKeys: POS_MP_C,
    keyAttributes: ["Tiros lejanos", "Desmarques", "Pases", "Control", "Técnica", "Talento", "Serenidad"],
  },
  {
    id: "organizador-adelantado-mp",
    name: "Organizador adelantado (MP)",
    group: "Mediapunta",
    positionKeys: POS_MP_C,
    keyAttributes: ["Desmarques", "Pases", "Visión", "Decisiones", "Control", "Técnica", "Trabajo de equipo", "Serenidad"],
  },
  {
    id: "segundo-delantero",
    name: "Segundo delantero",
    group: "Mediapunta",
    positionKeys: POS_MP_C,
    keyAttributes: ["Remate", "Desmarques", "Anticipación", "Control", "Aceleración", "Serenidad"],
  },
  {
    id: "centrocampista-interior-mp",
    name: "Centrocampista interior (MP)",
    group: "Mediapunta",
    positionKeys: POS_MP_C,
    keyAttributes: ["Centros", "Desmarques", "Pases", "Control", "Técnica", "Sacrificio", "Aceleración", "Serenidad"],
  },

  // DELANTERO CENTRO
  {
    id: "delantero-de-apoyo",
    name: "Delantero de apoyo",
    group: "Delantero",
    positionKeys: POS_DL,
    keyAttributes: ["Remate", "Desmarques", "Control", "Técnica", "Fuerza", "Serenidad"],
  },
  {
    id: "delantero-centro",
    name: "Delantero centro",
    group: "Delantero",
    positionKeys: POS_DL,
    keyAttributes: ["Remate", "Cabeceo", "Desmarques", "Control", "Técnica", "Aceleración", "Fuerza", "Serenidad"],
  },
  {
    id: "hombre-objetivo",
    name: "Hombre objetivo",
    group: "Delantero",
    positionKeys: POS_DL,
    keyAttributes: ["Remate", "Cabeceo", "Desmarques", "Fuerza", "Alcance de salto", "Equilibrio", "Valentía", "Agresividad"],
  },
  {
    id: "ariete",
    name: "Ariete",
    group: "Delantero",
    positionKeys: POS_DL,
    keyAttributes: ["Remate", "Cabeceo", "Desmarques", "Anticipación", "Aceleración", "Serenidad", "Concentración"],
  },
  {
    id: "delantero-buscaespacios",
    name: "Delantero buscaespacios",
    group: "Delantero",
    positionKeys: POS_DL,
    keyAttributes: ["Remate", "Cabeceo", "Desmarques", "Control", "Técnica", "Aceleración", "Fuerza", "Serenidad"],
  },
  {
    id: "falso-nueve",
    name: "Falso nueve",
    group: "Delantero",
    positionKeys: POS_DL,
    keyAttributes: ["Regate", "Desmarques", "Pases", "Visión", "Decisiones", "Control", "Técnica", "Trabajo de equipo"],
  },
];
