import { Player, Skill, Enemy } from '../types/game';

class SkillPriorityManager {
  // Process auto-skills for a player
  public static processAutoSkills(player: Player, enemies: Enemy[]): void {
    const availableSkills = player.skills.filter(
      (skill) => this.isSkillAvailable(skill, player)
    );

    // Sort skills by priority (e.g., healing > attack)
    availableSkills.sort((a, b) => this.getSkillPriority(a) - this.getSkillPriority(b));

    for (const skill of availableSkills) {
      if (this.executeSkill(skill, player, enemies)) {
        break; // Stop after successfully executing one skill
      }
    }
  }

  // Check if a skill is available (not on cooldown and enough mana)
  private static isSkillAvailable(skill: Skill, player: Player): boolean {
    return skill.cooldown === 0 && player.stats.mana >= skill.manaCost;
  }

  // Get skill priority (lower number = higher priority)
  private static getSkillPriority(skill: Skill): number {
    switch (skill.name) {
      case 'Heal':
        return 1;
      case 'Fireball':
        return 2;
      case 'Shield':
        return 3;
      default:
        return 99;
    }
  }

  // Execute a skill
  private static executeSkill(skill: Skill, player: Player, enemies: Enemy[]): boolean {
    console.log(`Player ${player.id} uses ${skill.name}`);
    // Add logic to apply skill effects to enemies or player
    return true; // Return true if skill was successfully executed
  }
}

export default SkillPriorityManager;
