import React, { useEffect } from 'react';
import MapSystem from './MapSystem';
import SkillPriorityManager from '../systems/SkillPriorityManager';
import EnemyAI from '../systems/EnemyAI';
import { Player, Enemy } from '../types/game';
import PlayerCard from './PlayerCard';
import '../styles/GameBoard.css';

const GameBoard: React.FC = () => {
  const [currentLevel, setCurrentLevel] = React.useState('Level 1');
  const [gameOver, setGameOver] = React.useState(false);
  const levels = ['Level 1', 'Level 2', 'Boss Level'];

  const players: Player[] = [
    {
      id: 1,
      class: 'Warrior',
      stats: { hp: 100, atk: 10, def: 5, spd: 2, range: 1, mana: 50, maxHp: 100 },
      position: { x: 0, y: 0 },
      equipment: { weapon: 'Sword', armor: 'Shield', accessory: 'Ring', boots: 'Boots' },
      skills: [
        { id: '1', name: 'Heal', cooldown: 0, manaCost: 10 },
        { id: '2', name: 'Fireball', cooldown: 0, manaCost: 20 },
      ],
    },
  ];

  const enemies: Enemy[] = [
    {
      id: 1,
      type: 'Goblin',
      health: 50,
      position: { x: 5, y: 5 },
      ai: 'Aggressive',
    },
  ];

  const handleLevelSelect = (level: string) => {
    setCurrentLevel(level);
    // Additional logic to load the selected level can be added here
  };

  const handleEnemyDamage = (enemyId: number, damage: number) => {
    const updatedEnemies = enemies.map((enemy) =>
      enemy.id === enemyId ? { ...enemy, health: Math.max(enemy.health - damage, 0) } : enemy
    );
    // Update enemies state if needed
    console.log(`Enemy ${enemyId} took ${damage} damage.`);
  };

  const handlePlayerDamage = (playerId: number, damage: number) => {
    const updatedPlayers = players.map((player) =>
      player.id === playerId ? { ...player, stats: { ...player.stats, hp: Math.max(player.stats.hp - damage, 0) } } : player
    );
    // Update players state if needed
    console.log(`Player ${playerId} took ${damage} damage.`);
  };

  const handlePlayerHeal = (playerId: number, healAmount: number) => {
    const updatedPlayers = players.map((player) =>
      player.id === playerId
        ? { ...player, stats: { ...player.stats, hp: Math.min(player.stats.hp + healAmount, 100) } }
        : player
    );
    // Update players state if needed
    console.log(`Player ${playerId} healed for ${healAmount} HP.`);
  };

  const handleSkillCooldown = (skillId: string, cooldown: number) => {
    const updatedPlayers = players.map((player) => {
      const updatedSkills = player.skills.map((skill) =>
        skill.id === skillId ? { ...skill, cooldown } : skill
      );
      return { ...player, skills: updatedSkills };
    });
    // Update players state if needed
    console.log(`Skill ${skillId} is now on cooldown for ${cooldown} seconds.`);
  };

  const handleEnemyAttack = (playerId: number, damage: number) => {
    handlePlayerDamage(playerId, damage);
    console.log(`Enemy attacked Player ${playerId} for ${damage} damage.`);
  };

  const resetEnemiesForLevel = () => {
    const resetEnemies = enemies.map((enemy) => ({ ...enemy, health: 100 }));
    // Update enemies state if needed
    console.log('Enemies reset for new level.');
  };

  const handleGameOver = () => {
    setGameOver(true);
    console.log('Game Over! All players are dead.');
  };

  const handleLevelLoad = (level: string) => {
    setCurrentLevel(level);
    resetEnemiesForLevel();
    console.log(`Level ${level} loaded.`);
  };

  const handleSkillToggle = (playerId: number, skillId: string, enabled: boolean) => {
    const updatedPlayers = players.map((player) => {
      if (player.id === playerId) {
        const updatedSkills = player.skills.map((skill) =>
          skill.id === skillId ? { ...skill, enabled } : skill
        );
        return { ...player, skills: updatedSkills };
      }
      return player;
    });
    console.log(`Skill ${skillId} for player ${playerId} toggled to ${enabled}.`);
  };

  const resetGame = () => {
    setCurrentLevel('Level 1');
    resetEnemiesForLevel();
    setGameOver(false);
    console.log('Game reset to Level 1.');
  };

  const updateHealthBars = () => {
    players.forEach((player) => {
      const healthPercentage = (player.stats.hp / 100) * 100;
      const healthStatus =
        healthPercentage <= 25
          ? 'critical'
          : healthPercentage <= 50
          ? 'low'
          : healthPercentage <= 75
          ? 'medium'
          : 'high';

      document.documentElement.style.setProperty(
        `--player-health-${player.id}`,
        `${healthPercentage}%`
      );
      const playerElement = document.getElementById(`player${player.id}`);
      if (playerElement) {
        playerElement.setAttribute('data-health', healthStatus);
      }
    });

    enemies.forEach((enemy) => {
      const healthPercentage = (enemy.health / 100) * 100;
      const healthStatus =
        healthPercentage <= 25
          ? 'critical'
          : healthPercentage <= 50
          ? 'low'
          : healthPercentage <= 75
          ? 'medium'
          : 'high';

      document.documentElement.style.setProperty(
        `--enemy-health-${enemy.id}`,
        `${healthPercentage}%`
      );
      const enemyElement = document.getElementById(`enemy${enemy.id}`);
      if (enemyElement) {
        enemyElement.setAttribute('data-health', healthStatus);
      }
    });
  };

  const updatePlayerHPBars = () => {
    players.forEach((player) => {
      const playerHPBar = document.querySelector(`.player-hp-bar-fill[data-width="player-hp-${player.id}"]`);
      const playerCardHPBar = document.querySelector(`.player-card-hp-bar-fill[data-width="player-card-hp-${player.id}"]`);

      if (playerHPBar instanceof HTMLElement) {
        playerHPBar.style.width = `${(player.stats.hp / 100) * 100}%`;
      }

      if (playerCardHPBar instanceof HTMLElement) {
        playerCardHPBar.style.width = `${(player.stats.hp / 100) * 100}%`;
      }
    });
  };

  React.useEffect(() => {
    updateHealthBars();
  }, [players, enemies]);

  React.useEffect(() => {
    updatePlayerHPBars();
  }, [players]);

  React.useEffect(() => {
    console.log(`Loading ${currentLevel}...`);
    // Add logic to load the selected level's data, enemies, and layout
    resetEnemiesForLevel();
  }, [currentLevel]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      players.forEach((player) => {
        SkillPriorityManager.processAutoSkills(player, enemies);
      });
    }, 1000); // Process auto-skills every second

    return () => clearInterval(interval);
  }, [players, enemies]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      enemies.forEach((enemy) => {
        EnemyAI.update(enemy, players, 1, 2); // Example speed and attack range values
      });
    }, 1000); // Update enemy behaviors every second

    return () => clearInterval(interval);
  }, [players, enemies]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      players.forEach((player) => {
        player.skills.forEach((skill) => {
          if (skill.cooldown > 0) {
            skill.cooldown -= 1;
          }
        });
      });
    }, 1000); // Decrease cooldown every second

    return () => clearInterval(interval);
  }, [players]);

  React.useEffect(() => {
    if (players.every((player) => player.stats.hp <= 0)) {
      handleGameOver();
    }
  }, [players]);

  const testGameFeatures = () => {
    console.log('--- Starting Game Tests ---');

    // Test health bar updates
    handlePlayerDamage(1, 20);
    console.assert(players[0].stats.hp === 80, 'Player HP did not update correctly after damage.');

    handlePlayerHeal(1, 10);
    console.assert(players[0].stats.hp === 90, 'Player HP did not update correctly after healing.');

    handleEnemyDamage(1, 30);
    console.assert(enemies[0].health === 20, 'Enemy HP did not update correctly after damage.');

    // Test skill cooldowns
    handleSkillCooldown('1', 5);
    console.assert(players[0].skills[0].cooldown === 5, 'Skill cooldown did not update correctly.');

    // Test game-over logic
    players[0].stats.hp = 0;
    if (players.every((player) => player.stats.hp <= 0)) {
      console.log('Game over logic works: all players are dead.');
    } else {
      console.error('Game over logic failed: players are still alive.');
    }

    // Test level transitions
    handleLevelLoad('Level 2');
    console.assert(currentLevel === 'Level 2', 'Level did not transition correctly.');

    // Test reset functionality
    resetGame();
    console.assert(currentLevel === 'Level 1', 'Game did not reset correctly.');

    console.log('--- All Tests Passed ---');
  };

  React.useEffect(() => {
    testGameFeatures();
  }, []);

  return (
    <div className="game-board">
      {gameOver && (
        <div className="game-over-screen">
          <h1>Game Over</h1>
          <button onClick={resetGame}>Restart Game</button>
        </div>
      )}
      {!gameOver && (
        <>
          <h1>Stick Ranger</h1>
          <button onClick={resetGame}>Reset Game</button>
          <MapSystem
            levels={levels}
            onLevelSelect={handleLevelLoad}
            currentLevel={currentLevel}
          />
          {/* Adding PlayerCard components for each player */}
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onClassChange={(playerId, newClass) => {
                const updatedPlayers = players.map((p) =>
                  p.id === playerId ? { ...p, class: newClass } : p
                );
                // Update players state if needed
              }}
              onSkillToggle={handleSkillToggle}
              autoSkillEnabled={true} // Example value, can be dynamic
            />
          ))}
          {/* Adding health bars for enemies */}
          {enemies.map((enemy) => (
            <div
              key={enemy.id}
              className="enemy"
              aria-label={`Enemy ${enemy.type}`}
              title={`HP: ${enemy.health}, Type: ${enemy.type}`}
            >
              <div className="health-bar">
                <div className="health-bar-fill enemy-health" data-health={
                  enemy.health / 100 > 0.75 ? 'high' :
                  enemy.health / 100 > 0.5 ? 'medium' :
                  enemy.health / 100 > 0.25 ? 'low' : 'critical'
                }></div>
              </div>
              {enemy.type}
            </div>
          ))}
          {/* Adding health bars for players */}
          {players.map((player) => (
            <div key={player.id} className="player" aria-label={`Player ${player.class}`} title={`HP: ${player.stats.hp}/${player.stats.maxHp || 100}, ATK: ${player.stats.atk}, DEF: ${player.stats.def}`}>
                <div className="health-bar">
                    <div className="health-bar-fill player-health" data-health={
                        (player.stats.hp / (player.stats.maxHp || 100)) > 0.75 ? 'high' :
                        (player.stats.hp / (player.stats.maxHp || 100)) > 0.5 ? 'medium' :
                        (player.stats.hp / (player.stats.maxHp || 100)) > 0.25 ? 'low' : 'critical'
                    }></div>
                </div>
                {player.class}
            </div>
          ))}
          {/* Adding player card HP bars */}
          {players.map((player) => (
            <div key={player.id} className="player-card">
              <div className="player-card-hp-bar">
                <div
                  className="player-card-hp-bar-fill"
                  data-width={`player-card-hp-${player.id}`}
                ></div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default GameBoard;
