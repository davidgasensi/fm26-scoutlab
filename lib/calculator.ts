import { Player, Role, RoleScore, PlayerWithScores } from "./types";
import { ALL_ROLES } from "./roles";

function getEligibleRoles(playerPositions: string[]): Role[] {
  const roleSet = new Set<string>();
  const roles: Role[] = [];

  for (const role of ALL_ROLES) {
    if (roleSet.has(role.id)) continue;

    const isEligible = role.positionKeys.some((pk) =>
      playerPositions.includes(pk)
    );

    if (isEligible) {
      roleSet.add(role.id);
      roles.push(role);
    }
  }

  return roles;
}

function scoreRole(player: Player, role: Role): RoleScore {
  const attributeValues: { name: string; value: number }[] = [];
  let total = 0;
  let count = 0;

  for (const attr of role.keyAttributes) {
    const value = player.attributes[attr] ?? 0;
    attributeValues.push({ name: attr, value });
    total += value;
    count++;
  }

  const score = count > 0 ? total / count : 0;

  return { role, score, attributeValues };
}

export function calculatePlayerScores(player: Player): PlayerWithScores {
  const eligibleRoles = getEligibleRoles(player.positions);
  const roleScores = eligibleRoles
    .map((role) => scoreRole(player, role))
    .sort((a, b) => b.score - a.score);

  return { player, roleScores };
}

export function calculateAllPlayers(players: Player[]): PlayerWithScores[] {
  return players.map(calculatePlayerScores);
}
