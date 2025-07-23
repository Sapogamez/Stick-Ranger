import React from 'react';
import { Player, PlayerClass } from '../types/game';
import Toggle from './Toggle';

interface PlayerCardProps {
  player: Player;
  onClassChange: (playerId: number, newClass: PlayerClass) => void;
  onSkillToggle: (playerId: number, skillId: string, enabled: boolean) => void;
  autoSkillEnabled: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onClassChange, onSkillToggle, autoSkillEnabled }) => {
  const handleClassChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newClass = event.target.value as PlayerClass; // Cast to PlayerClass
    onClassChange(player.id, newClass);

    // Update player stats dynamically
    const updatedStats = getClassStats(newClass);
    player.stats = { ...player.stats, ...updatedStats };

    console.log(`Player ${player.id} changed class to ${newClass}.`);
  };

  const handleSkillToggle = (skillId: string) => {
    onSkillToggle(player.id, skillId, !autoSkillEnabled);
  };

  return (
    <div className="player-card">
      <h3>{player.class}</h3>
      <select value={player.class} onChange={handleClassChange} title="Select player class">
        <option value="Warrior">Warrior</option>
        <option value="Archer">Archer</option>
        <option value="Mage">Mage</option>
        <option value="Priest">Priest</option>
        <option value="Boxer">Boxer</option>
      </select>
      <Toggle
        checked={autoSkillEnabled}
        onChange={() => handleSkillToggle('skill1')}
        label={`Auto Skill: ${autoSkillEnabled ? 'ON' : 'OFF'}`}
      />
    </div>
  );
};

export default PlayerCard;

function getClassStats(playerClass: string) {
  // Dummy implementation for updating stats based on class
  switch (playerClass) {
    case 'Warrior':
      return { strength: 10, agility: 2, intelligence: 1 };
    case 'Archer':
      return { strength: 5, agility: 10, intelligence: 2 };
    case 'Mage':
      return { strength: 1, agility: 2, intelligence: 10 };
    case 'Priest':
      return { strength: 2, agility: 3, intelligence: 8 };
    case 'Boxer':
      return { strength: 8, agility: 5, intelligence: 2 };
    default:
      return {};
  }
}
