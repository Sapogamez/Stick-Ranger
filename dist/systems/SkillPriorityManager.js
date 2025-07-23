"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SkillPriorityManager {
    // Process auto-skills for a player
    static processAutoSkills(player, enemies) {
        const availableSkills = player.skills.filter((skill) => this.isSkillAvailable(skill, player));
        // Sort skills by priority (e.g., healing > attack)
        availableSkills.sort((a, b) => this.getSkillPriority(a) - this.getSkillPriority(b));
        for (const skill of availableSkills) {
            if (this.executeSkill(skill, player, enemies)) {
                break; // Stop after successfully executing one skill
            }
        }
    }
    // Check if a skill is available (not on cooldown and enough mana)
    static isSkillAvailable(skill, player) {
        return skill.cooldown === 0 && player.stats.mana >= skill.manaCost;
    }
    // Get skill priority (lower number = higher priority)
    static getSkillPriority(skill) {
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
    static executeSkill(skill, player, enemies) {
        console.log(`Player ${player.id} uses ${skill.name}`);
        // Add logic to apply skill effects to enemies or player
        return true; // Return true if skill was successfully executed
    }
}
exports.default = SkillPriorityManager;
