# Testing Guidelines Documentation

## Overview

This document outlines comprehensive testing strategies, best practices, and implementation guidelines for Stick Ranger. The testing approach emphasizes quality assurance, maintainability, and comprehensive coverage across all game systems.

## Testing Philosophy

### Core Principles

1. **Test-Driven Development**: Write tests before implementing features
2. **Comprehensive Coverage**: Aim for high test coverage across all systems
3. **Fast Feedback**: Quick test execution for rapid development cycles
4. **Realistic Testing**: Tests should reflect actual gameplay scenarios
5. **Maintainable Tests**: Clear, readable tests that serve as documentation

### Testing Pyramid

```
    /\     E2E Tests (Few)
   /  \    Integration Tests (Some)
  /____\   Unit Tests (Many)
```

## Testing Stack

### Current Technology Stack

```json
{
  "jest": "^30.0.5",
  "@types/jest": "^30.0.0",
  "@testing-library/react": "^13.4.0",
  "@testing-library/jest-dom": "^5.16.4",
  "@testing-library/user-event": "^14.4.3"
}
```

### Recommended Additional Tools

```json
{
  "cypress": "^12.0.0",              // E2E testing
  "jest-canvas-mock": "^2.4.0",     // Canvas mocking for game graphics
  "msw": "^0.49.0",                 // API mocking for network tests
  "puppeteer": "^19.0.0"            // Headless browser automation
}
```

## Unit Testing

### Testing Game Systems

#### Combat System Tests

```typescript
// src/systems/__tests__/CombatSystem.test.ts
import { CombatSystem } from '../CombatSystem';
import { createMockPlayer, createMockEnemy } from '../../test-utils/factories';

describe('CombatSystem', () => {
  let combatSystem: CombatSystem;

  beforeEach(() => {
    combatSystem = new CombatSystem();
    combatSystem.initialize();
  });

  afterEach(() => {
    combatSystem.cleanup();
  });

  describe('Auto Attack', () => {
    test('should toggle auto attack state', () => {
      expect(combatSystem['autoAttackEnabled']).toBe(false);
      
      combatSystem.toggleAutoAttack(true);
      expect(combatSystem['autoAttackEnabled']).toBe(true);
      
      combatSystem.toggleAutoAttack(false);
      expect(combatSystem['autoAttackEnabled']).toBe(false);
    });

    test('should not attack when auto attack is disabled', () => {
      const player = createMockPlayer();
      const enemy = createMockEnemy();
      
      combatSystem.toggleAutoAttack(false);
      const initialHealth = enemy.health;
      
      combatSystem.processAutoAttack(player, [enemy]);
      
      expect(enemy.health).toBe(initialHealth);
    });
  });

  describe('Skill Processing', () => {
    test('should execute skill when conditions are met', () => {
      const player = createMockPlayer({
        stats: { ...createMockPlayer().stats, mana: 100 },
        skills: [{
          id: 'heal',
          name: 'Heal',
          cooldown: 0,
          manaCost: 20
        }]
      });
      const enemies = [createMockEnemy()];

      const executeSpy = jest.spyOn(combatSystem as any, 'executeSkill');
      combatSystem.processAutoSkills(player, enemies);

      expect(executeSpy).toHaveBeenCalledWith(player, expect.objectContaining({
        id: 'heal'
      }), enemies);
    });

    test('should not execute skill when mana is insufficient', () => {
      const player = createMockPlayer({
        stats: { ...createMockPlayer().stats, mana: 10 },
        skills: [{
          id: 'fireball',
          name: 'Fireball',
          cooldown: 0,
          manaCost: 50
        }]
      });
      const enemies = [createMockEnemy()];

      const executeSpy = jest.spyOn(combatSystem as any, 'executeSkill');
      combatSystem.processAutoSkills(player, enemies);

      expect(executeSpy).not.toHaveBeenCalled();
    });
  });

  describe('Damage Calculation', () => {
    test('should calculate damage correctly', () => {
      const attacker = createMockPlayer({ stats: { atk: 15 } });
      const target = createMockEnemy({ defense: 5 });

      const damage = combatSystem.calculateDamage(attacker, target);

      expect(damage).toBe(10); // 15 - 5 = 10
    });

    test('should ensure minimum damage of 1', () => {
      const attacker = createMockPlayer({ stats: { atk: 3 } });
      const target = createMockEnemy({ defense: 10 });

      const damage = combatSystem.calculateDamage(attacker, target);

      expect(damage).toBe(1);
    });
  });
});
```

#### AI System Tests

```typescript
// src/systems/__tests__/EnemyAI.test.ts
import { EnemyAI } from '../EnemyAI';
import { createMockEnemy, createMockPlayer } from '../../test-utils/factories';

describe('EnemyAI', () => {
  let enemyAI: EnemyAI;

  beforeEach(() => {
    enemyAI = new EnemyAI();
  });

  describe('Target Selection', () => {
    test('aggressive AI should target closest player', () => {
      const enemy = createMockEnemy({ 
        ai: 'Aggressive',
        position: { x: 5, y: 5 }
      });
      
      const players = [
        createMockPlayer({ position: { x: 2, y: 2 } }), // Closer
        createMockPlayer({ position: { x: 10, y: 10 } }) // Farther
      ];

      const target = enemyAI.getTargetPriority(enemy, players);
      expect(target).toBe(players[0]);
    });

    test('defensive AI should target highest threat player', () => {
      const enemy = createMockEnemy({ ai: 'Defensive' });
      const players = [
        createMockPlayer({ stats: { atk: 5 } }),
        createMockPlayer({ stats: { atk: 15 } }) // Higher attack
      ];

      const target = enemyAI.getTargetPriority(enemy, players);
      expect(target).toBe(players[1]);
    });
  });

  describe('Movement Behavior', () => {
    test('should move toward target when out of range', () => {
      const enemy = createMockEnemy({
        position: { x: 0, y: 0 },
        attackRange: 2
      });
      const target = createMockPlayer({ position: { x: 5, y: 0 } });

      enemyAI.updateMovement(enemy, target, 16); // 16ms delta

      expect(enemy.position.x).toBeGreaterThan(0);
    });

    test('should stop moving when in attack range', () => {
      const enemy = createMockEnemy({
        position: { x: 0, y: 0 },
        attackRange: 5
      });
      const target = createMockPlayer({ position: { x: 3, y: 0 } });
      const initialPosition = { ...enemy.position };

      enemyAI.updateMovement(enemy, target, 16);

      expect(enemy.position).toEqual(initialPosition);
    });
  });
});
```

### Component Testing

#### PlayerCard Component Tests

```typescript
// src/components/__tests__/PlayerCard.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { PlayerCard } from '../PlayerCard';
import { createMockPlayer } from '../../test-utils/factories';

describe('PlayerCard', () => {
  const user = userEvent.setup();

  test('renders player information correctly', () => {
    const mockPlayer = createMockPlayer({
      class: 'Warrior',
      stats: { hp: 80, maxHp: 100, mana: 30 }
    });

    render(<PlayerCard player={mockPlayer} />);

    expect(screen.getByText('Warrior')).toBeInTheDocument();
    expect(screen.getByDisplayValue('80')).toBeInTheDocument(); // HP value
    expect(screen.getByDisplayValue('30')).toBeInTheDocument(); // Mana value
  });

  test('handles auto attack toggle', async () => {
    const mockPlayer = createMockPlayer();
    const onToggleAutoAttack = jest.fn();

    render(
      <PlayerCard 
        player={mockPlayer} 
        onToggleAutoAttack={onToggleAutoAttack}
      />
    );

    const autoAttackToggle = screen.getByLabelText(/auto attack/i);
    await user.click(autoAttackToggle);

    expect(onToggleAutoAttack).toHaveBeenCalledWith(true);
  });

  test('skill button is disabled when skill is on cooldown', () => {
    const mockPlayer = createMockPlayer({
      skills: [{
        id: 'heal',
        name: 'Heal',
        cooldown: 5000, // 5 seconds
        manaCost: 20,
        lastUsed: Date.now() - 2000 // Used 2 seconds ago
      }]
    });

    render(<PlayerCard player={mockPlayer} />);

    const healButton = screen.getByRole('button', { name: /heal/i });
    expect(healButton).toBeDisabled();
  });

  test('skill button is enabled when skill is available', () => {
    const mockPlayer = createMockPlayer({
      stats: { ...createMockPlayer().stats, mana: 50 },
      skills: [{
        id: 'heal',
        name: 'Heal',
        cooldown: 5000,
        manaCost: 20,
        lastUsed: Date.now() - 6000 // Used 6 seconds ago
      }]
    });

    render(<PlayerCard player={mockPlayer} />);

    const healButton = screen.getByRole('button', { name: /heal/i });
    expect(healButton).toBeEnabled();
  });

  test('displays low health warning', () => {
    const mockPlayer = createMockPlayer({
      stats: { hp: 15, maxHp: 100 } // 15% health
    });

    render(<PlayerCard player={mockPlayer} />);

    expect(screen.getByTestId('low-health-warning')).toBeInTheDocument();
  });
});
```

#### GameBoard Integration Tests

```typescript
// src/components/__tests__/GameBoard.integration.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { GameBoard } from '../GameBoard';

// Mock game systems
jest.mock('../../systems/CombatSystem');
jest.mock('../../systems/EnemyAI');

describe('GameBoard Integration', () => {
  test('initializes game with default players and enemies', () => {
    render(<GameBoard />);

    expect(screen.getByText('Level 1')).toBeInTheDocument();
    expect(screen.getAllByTestId('player-card')).toHaveLength(4); // Default team size
    expect(screen.getAllByTestId('enemy-indicator')).toHaveLength(2); // Default enemies
  });

  test('progresses to next level when current level is completed', async () => {
    render(<GameBoard />);

    // Simulate level completion
    const completeButton = screen.getByRole('button', { name: /complete level/i });
    await userEvent.click(completeButton);

    await waitFor(() => {
      expect(screen.getByText('Level 2')).toBeInTheDocument();
    });
  });

  test('shows game over screen when all players are defeated', async () => {
    render(<GameBoard />);

    // Simulate all players dying
    const gameOverTrigger = screen.getByTestId('game-over-trigger');
    await userEvent.click(gameOverTrigger);

    await waitFor(() => {
      expect(screen.getByText(/game over/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /restart/i })).toBeInTheDocument();
    });
  });

  test('combat system responds to player actions', async () => {
    render(<GameBoard />);

    const autoAttackToggle = screen.getAllByLabelText(/auto attack/i)[0];
    await userEvent.click(autoAttackToggle);

    // Verify auto attack is reflected in the game state
    await waitFor(() => {
      expect(screen.getByTestId('auto-attack-indicator')).toHaveClass('active');
    });
  });
});
```

## Integration Testing

### Game System Integration

```typescript
// src/__tests__/game-systems.integration.test.ts
import { CombatSystem } from '../systems/CombatSystem';
import { EnemyAI } from '../systems/EnemyAI';
import { SkillSystem } from '../systems/SkillSystem';
import { createMockPlayer, createMockEnemy } from '../test-utils/factories';

describe('Game Systems Integration', () => {
  let combatSystem: CombatSystem;
  let enemyAI: EnemyAI;
  let skillSystem: SkillSystem;

  beforeEach(() => {
    combatSystem = new CombatSystem();
    enemyAI = new EnemyAI();
    skillSystem = new SkillSystem();

    combatSystem.initialize();
    skillSystem.initialize();
  });

  test('complete combat scenario with skill usage', () => {
    const warrior = createMockPlayer({
      class: 'Warrior',
      stats: { hp: 100, maxHp: 100, atk: 15, def: 8, mana: 50 },
      skills: [{
        id: 'heal',
        name: 'Heal',
        cooldown: 3000,
        manaCost: 25
      }]
    });

    const goblin = createMockEnemy({
      type: 'Goblin',
      health: 30,
      ai: 'Aggressive',
      defense: 3
    });

    // Enable auto attack
    combatSystem.toggleAutoAttack(true);

    // Simulate combat rounds
    for (let i = 0; i < 10; i++) {
      // Enemy AI turn
      enemyAI.update(goblin, [warrior], 100);

      // Combat processing
      combatSystem.update(100);

      // Skill system processing
      skillSystem.update(100);

      // Check for combat end conditions
      if (goblin.health <= 0 || warrior.stats.hp <= 0) {
        break;
      }
    }

    // Verify combat outcome
    expect(goblin.health).toBeLessThanOrEqual(0);
    expect(warrior.stats.hp).toBeGreaterThan(0);
  });

  test('multi-enemy encounter with different AI behaviors', () => {
    const team = [
      createMockPlayer({ class: 'Warrior' }),
      createMockPlayer({ class: 'Archer' }),
      createMockPlayer({ class: 'Priest' })
    ];

    const enemies = [
      createMockEnemy({ ai: 'Aggressive', health: 40 }),
      createMockEnemy({ ai: 'Defensive', health: 60 }),
      createMockEnemy({ ai: 'Neutral', health: 50 })
    ];

    const initialEnemyCount = enemies.length;

    // Simulate extended combat
    for (let turn = 0; turn < 50; turn++) {
      // Update all enemies
      enemies.forEach(enemy => {
        if (enemy.health > 0) {
          enemyAI.update(enemy, team, 100);
        }
      });

      // Process combat for all players
      combatSystem.update(100);

      // Remove defeated enemies
      enemies.splice(0, enemies.length, ...enemies.filter(e => e.health > 0));

      if (enemies.length === 0) break;
    }

    expect(enemies.length).toBeLessThan(initialEnemyCount);
  });
});
```

## End-to-End Testing

### Cypress E2E Tests

```typescript
// cypress/e2e/gameplay.cy.ts
describe('Stick Ranger Gameplay', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should start a new game successfully', () => {
    cy.get('[data-testid="start-game-button"]').click();
    cy.get('[data-testid="game-board"]').should('be.visible');
    cy.get('[data-testid="current-level"]').should('contain', 'Level 1');
  });

  it('should allow player to control characters', () => {
    cy.get('[data-testid="start-game-button"]').click();
    
    // Toggle auto attack for first player
    cy.get('[data-testid="player-card"]').first().within(() => {
      cy.get('[data-testid="auto-attack-toggle"]').click();
      cy.get('[data-testid="auto-attack-indicator"]').should('have.class', 'active');
    });

    // Use a skill
    cy.get('[data-testid="player-card"]').first().within(() => {
      cy.get('[data-testid="skill-button-heal"]').click();
    });

    // Verify skill was used (button should be disabled during cooldown)
    cy.get('[data-testid="skill-button-heal"]').should('be.disabled');
  });

  it('should progress through levels', () => {
    cy.get('[data-testid="start-game-button"]').click();
    
    // Wait for level completion (this might take a while in a real game)
    cy.get('[data-testid="level-complete-indicator"]', { timeout: 30000 })
      .should('be.visible');
    
    cy.get('[data-testid="next-level-button"]').click();
    cy.get('[data-testid="current-level"]').should('contain', 'Level 2');
  });

  it('should handle game over scenario', () => {
    cy.get('[data-testid="start-game-button"]').click();
    
    // Force game over for testing (might need a cheat/debug mode)
    cy.get('[data-testid="debug-game-over"]').click();
    
    cy.get('[data-testid="game-over-screen"]').should('be.visible');
    cy.get('[data-testid="restart-button"]').should('be.visible');
    
    cy.get('[data-testid="restart-button"]').click();
    cy.get('[data-testid="game-board"]').should('be.visible');
  });

  it('should save and load game settings', () => {
    // Open settings
    cy.get('[data-testid="settings-button"]').click();
    
    // Change settings
    cy.get('[data-testid="sound-toggle"]').click();
    cy.get('[data-testid="difficulty-select"]').select('Hard');
    
    // Save and reload page
    cy.get('[data-testid="save-settings"]').click();
    cy.reload();
    
    // Verify settings persisted
    cy.get('[data-testid="settings-button"]').click();
    cy.get('[data-testid="sound-toggle"]').should('not.be.checked');
    cy.get('[data-testid="difficulty-select"]').should('have.value', 'Hard');
  });
});
```

### Performance Testing

```typescript
// cypress/e2e/performance.cy.ts
describe('Performance Tests', () => {
  it('should maintain good performance during extended gameplay', () => {
    cy.visit('/');
    cy.get('[data-testid="start-game-button"]').click();

    // Monitor frame rate and memory usage
    cy.window().then((win) => {
      let frameCount = 0;
      let lastTime = performance.now();

      const checkPerformance = () => {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - lastTime >= 1000) {
          const fps = frameCount;
          frameCount = 0;
          lastTime = currentTime;
          
          // Assert minimum FPS
          expect(fps).to.be.at.least(30);
        }
        
        requestAnimationFrame(checkPerformance);
      };
      
      requestAnimationFrame(checkPerformance);
    });

    // Let the game run for a while
    cy.wait(10000);
  });

  it('should load game assets efficiently', () => {
    cy.intercept('GET', '**/*.{js,css,png,jpg}', (req) => {
      req.on('response', (res) => {
        // Assert reasonable load times
        expect(res.duration).to.be.at.most(1000);
      });
    });

    cy.visit('/');
    cy.get('[data-testid="game-board"]').should('be.visible');
  });
});
```

## Test Utilities and Factories

### Mock Data Factories

```typescript
// src/test-utils/factories.ts
import { Player, Enemy, Skill, PlayerStats } from '../types/game';

export function createMockPlayer(overrides?: Partial<Player>): Player {
  const defaultStats: PlayerStats = {
    hp: 100,
    maxHp: 100,
    atk: 10,
    def: 5,
    spd: 3,
    range: 1,
    mana: 50
  };

  return {
    id: Math.floor(Math.random() * 1000),
    class: 'Warrior',
    stats: { ...defaultStats, ...overrides?.stats },
    position: { x: 0, y: 0 },
    equipment: {
      weapon: 'Sword',
      armor: 'Shield',
      accessory: 'Ring',
      boots: 'Boots'
    },
    skills: [],
    ...overrides
  };
}

export function createMockEnemy(overrides?: Partial<Enemy>): Enemy {
  return {
    id: Math.floor(Math.random() * 1000),
    type: 'Goblin',
    health: 50,
    position: { x: 10, y: 10 },
    ai: 'Aggressive',
    defense: 2,
    attackRange: 1,
    moveSpeed: 2,
    ...overrides
  };
}

export function createMockSkill(overrides?: Partial<Skill>): Skill {
  return {
    id: 'test-skill',
    name: 'Test Skill',
    cooldown: 1000,
    manaCost: 10,
    ...overrides
  };
}

// Complex scenario builders
export function createBalancedTeam(): Player[] {
  return [
    createMockPlayer({ class: 'Warrior', stats: { hp: 120, atk: 12, def: 8 } }),
    createMockPlayer({ class: 'Archer', stats: { hp: 80, atk: 10, range: 4 } }),
    createMockPlayer({ class: 'Mage', stats: { hp: 60, atk: 8, mana: 100 } }),
    createMockPlayer({ class: 'Priest', stats: { hp: 90, mana: 80 } })
  ];
}

export function createEnemyWave(count: number, type: 'weak' | 'strong' = 'weak'): Enemy[] {
  const enemies: Enemy[] = [];
  
  for (let i = 0; i < count; i++) {
    if (type === 'weak') {
      enemies.push(createMockEnemy({
        health: 30,
        ai: 'Aggressive',
        defense: 1
      }));
    } else {
      enemies.push(createMockEnemy({
        health: 80,
        ai: 'Defensive',
        defense: 5
      }));
    }
  }
  
  return enemies;
}
```

### Custom Test Utilities

```typescript
// src/test-utils/test-utilities.ts
import { render, RenderOptions } from '@testing-library/react';
import React, { ReactElement } from 'react';

// Game context wrapper for testing
const GameTestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div data-testid="game-wrapper">
      {children}
    </div>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: GameTestWrapper, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Game state assertions
export function expectPlayerToBeAlive(player: Player): void {
  expect(player.stats.hp).toBeGreaterThan(0);
  expect(player.stats.hp).toBeLessThanOrEqual(player.stats.maxHp);
}

export function expectEnemyToBeDefeated(enemy: Enemy): void {
  expect(enemy.health).toBeLessThanOrEqual(0);
}

export function expectSkillToBeOnCooldown(skill: Skill, lastUsed: number): void {
  const timeSinceUse = Date.now() - lastUsed;
  expect(timeSinceUse).toBeLessThan(skill.cooldown);
}

// Game timing utilities
export function waitForGameTicks(ticks: number = 1): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ticks * 16.67); // 60 FPS = 16.67ms per frame
  });
}

export function simulateGameTime(seconds: number): void {
  const originalDateNow = Date.now;
  const startTime = Date.now();
  
  Date.now = jest.fn(() => startTime + (seconds * 1000));
  
  // Restore after test
  afterEach(() => {
    Date.now = originalDateNow;
  });
}
```

## Performance Testing

### Load Testing

```typescript
// src/__tests__/performance/load.test.ts
describe('Load Testing', () => {
  test('should handle large number of entities', () => {
    const startTime = performance.now();
    
    // Create large game state
    const players = Array.from({ length: 100 }, () => createMockPlayer());
    const enemies = Array.from({ length: 200 }, () => createMockEnemy());
    
    const combatSystem = new CombatSystem();
    
    // Process multiple frames
    for (let i = 0; i < 60; i++) {
      combatSystem.update(16.67);
    }
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    // Should complete within reasonable time (1 second for 60 frames)
    expect(executionTime).toBeLessThan(1000);
  });

  test('memory usage should remain stable', () => {
    const initialMemory = performance.memory?.usedJSHeapSize || 0;
    
    // Run game simulation
    const combatSystem = new CombatSystem();
    
    for (let i = 0; i < 1000; i++) {
      const players = createBalancedTeam();
      const enemies = createEnemyWave(5);
      
      combatSystem.update(16.67);
      
      // Force garbage collection periodically
      if (i % 100 === 0 && global.gc) {
        global.gc();
      }
    }
    
    const finalMemory = performance.memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable (less than 50MB)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });
});
```

## Test Configuration

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test-utils/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test-utils/**',
    '!src/**/*.stories.*'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};
```

### Test Setup

```typescript
// src/test-utils/setup.ts
import '@testing-library/jest-dom';

// Mock canvas for game graphics
jest.mock('canvas', () => {
  const actualCanvas = jest.requireActual('canvas');
  return {
    ...actualCanvas,
    createCanvas: jest.fn(() => ({
      getContext: jest.fn(() => ({
        fillRect: jest.fn(),
        drawImage: jest.fn(),
        getImageData: jest.fn(),
        putImageData: jest.fn(),
        createImageData: jest.fn(),
        setTransform: jest.fn(),
        save: jest.fn(),
        restore: jest.fn()
      }))
    }))
  };
});

// Mock Web APIs
Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  value: jest.fn(cb => setTimeout(cb, 16))
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  writable: true,
  value: jest.fn(id => clearTimeout(id))
});

// Global test utilities
global.createMockPlayer = require('./factories').createMockPlayer;
global.createMockEnemy = require('./factories').createMockEnemy;
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run unit tests
      run: npm test -- --coverage --watchAll=false
    
    - name: Run integration tests
      run: npm run test:integration
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
    
    - name: Run E2E tests
      run: npm run test:e2e:headless
```

## Best Practices Summary

### Testing Guidelines

1. **Write Descriptive Test Names**: Tests should clearly describe what they're testing
2. **Use Arrange-Act-Assert Pattern**: Structure tests with clear setup, execution, and verification
3. **Test Behavior, Not Implementation**: Focus on what the code does, not how it does it
4. **Keep Tests Independent**: Each test should run independently without relying on others
5. **Use Appropriate Test Doubles**: Mock external dependencies and complex internal systems
6. **Maintain Test Performance**: Tests should run quickly to encourage frequent execution
7. **Cover Edge Cases**: Test boundary conditions and error scenarios
8. **Update Tests with Code Changes**: Keep tests current with functionality changes

### Quality Metrics

- **Code Coverage**: Aim for 80%+ coverage with focus on critical paths
- **Test Performance**: Unit tests should complete in under 5 seconds total
- **Test Reliability**: Tests should pass consistently without flaking
- **Maintainability**: Tests should be easy to read, update, and debug

---

This testing documentation provides a comprehensive framework for ensuring code quality, functionality, and performance in Stick Ranger through systematic testing approaches.