import { Player, Role, RoleScore, PlayerWithScores } from "./types";
import { ALL_ROLES } from "./roles";

function getEligibleRoles(playerPositions: string[], allRoles: Role[]): Role[] {
  const roleSet = new Set<string>();
  const eligible: Role[] = [];

  for (const role of allRoles) {
    if (roleSet.has(role.id)) continue;

    const isEligible = role.positionKeys.some((pk) =>
      playerPositions.includes(pk)
    );

    if (isEligible) {
      roleSet.add(role.id);
      eligible.push(role);
    }
  }

  return eligible;
}

const KEY_WEIGHT = 2;
const PREFERRED_WEIGHT = 1;

function scoreRole(player: Player, role: Role): RoleScore {
  const attributeValues: { name: string; value: number; isKey: boolean }[] = [];
  let weightedTotal = 0;
  let totalWeight = 0;

  for (const attr of role.keyAttributes) {
    const value = player.attributes[attr] ?? 0;
    attributeValues.push({ name: attr, value, isKey: true });
    weightedTotal += value * KEY_WEIGHT;
    totalWeight += KEY_WEIGHT;
  }

  for (const attr of role.preferredAttributes ?? []) {
    const value = player.attributes[attr] ?? 0;
    attributeValues.push({ name: attr, value, isKey: false });
    weightedTotal += value * PREFERRED_WEIGHT;
    totalWeight += PREFERRED_WEIGHT;
  }

  const raw = totalWeight > 0 ? weightedTotal / totalWeight : 0;
  const score = Math.min(20, Math.max(0, raw));

  return { role, score, attributeValues };
}

export function calculatePlayerScores(player: Player, roles: Role[] = ALL_ROLES): PlayerWithScores {
  const eligibleRoles = getEligibleRoles(player.positions, roles);
  const roleScores = eligibleRoles
    .map((role) => scoreRole(player, role))
    .sort((a, b) => b.score - a.score);

  return { player, roleScores };
}

export function calculateAllPlayers(players: Player[], roles: Role[] = ALL_ROLES): PlayerWithScores[] {
  return players.map((p) => calculatePlayerScores(p, roles));
}
