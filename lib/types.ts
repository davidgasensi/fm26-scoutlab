export interface Player {
  name: string;
  age?: number;
  club?: string;
  rawPositions: string;
  positions: string[];
  attributes: Record<string, number>;
}

export interface Role {
  id: string;
  name: string;
  group: string;
  positionKeys: string[];
  keyAttributes: string[];
  preferredAttributes?: string[];
}

export interface RoleScore {
  role: Role;
  score: number;
  attributeValues: { name: string; value: number; isKey: boolean }[];
}

export interface PlayerWithScores {
  player: Player;
  roleScores: RoleScore[];
}

export interface PlayerStats {
  name: string;
  club?: string;
  age?: number;
  position?: string;
  minutes: number;
  starts: number;
  rating: number;
  goals: number;
  assists: number;
  xG: number;
  xA: number;
  shots: number;
  shotsOnTarget: number;
  keyPasses: number;
  dribbles: number;
  passAtt: number;
  passCom: number;
  passRatio: number;
  tackleAtt: number;
  tackleCom: number;
  clearances: number;
  pressureAtt: number;
  pressureCom: number;
  saves: number;
  goalsConceded: number;
  cleanSheets: number;
  yellowCards: number;
  redCards: number;
  distance: number;
  headers: number;
  raw: Record<string, string | number>;
}
