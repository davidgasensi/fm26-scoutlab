export interface Player {
  name: string;
  age?: number;
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
