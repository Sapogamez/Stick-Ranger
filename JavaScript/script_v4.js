// --- Modular Utility Functions ---
function $(id) { return document.getElementById(id); }
function createEl(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => el[k] = v);
  children.forEach(child => el.appendChild(child));
  return el;
}

// --- Game State ---
const players = [
  { id: 1, class: 'Warrior', hp: 100, maxHp: 100, atk: 10, equipment: {}, alive: true, experience: 0, level: 1, nextLevelXP: 100 },
  { id: 2, class: 'Archer', hp: 100, maxHp: 100, atk: 10, equipment: {}, alive: true, experience: 0, level: 1, nextLevelXP: 100 },
  { id: 3, class: 'Mage', hp: 100, maxHp: 100, atk: 10, equipment: {}, alive: true, experience: 0, level: 1, nextLevelXP: 100 },
  { id: 4, class: 'Priest', hp: 100, maxHp: 100, atk: 10, equipment: {}, alive: true, experience: 0, level: 1, nextLevelXP: 100 }
];
let currentLevel = 1;
let unlockedLevels = [1];
let inventory = [];
let enemies = [];
let combatLog = [];

// --- Level & Enemy Generation ---
function generateLevel(levelNum) {
  const levelMultiplier = 1 + (levelNum - 1) * 0.25;
  enemies = Array.from({ length: 4 + levelNum }, (_, i) => ({
    id: i,
    hp: Math.floor(100 * levelMultiplier),
    atk: Math.floor(10 * levelMultiplier),
    alive: true
  }));
  // Generate loot
  return generateLoot(levelNum, levelMultiplier);
}

function generateLoot(levelNum, multiplier) {
  // Example loot: scale stats
  return [
    { name: `Sword Lv${levelNum}`, type: 'Sword', slot: 'weapon', atk: Math.floor(10 * multiplier) },
    { name: `Bow Lv${levelNum}`, type: 'Bow', slot: 'weapon', atk: Math.floor(10 * multiplier) }
    // ...add more loot types
  ];
}

// --- Map Rendering ---
function renderMap() {
  const minimap = $('minimap');
  minimap.innerHTML = '';
  unlockedLevels.forEach(levelNum => {
    const region = createEl('div', {
      className: `map-zone level-${levelNum}` + (levelNum === currentLevel ? ' active' : ''),
      onclick: () => enterLevel(levelNum)
    });
    region.textContent = `Level ${levelNum}`;
    minimap.appendChild(region);
  });
}

// Dynamic Map Generation
function initializeMapSystem() {
  const map = {
    zones: [
      {
        name: 'Plains',
        levels: [
          { id: 1, enemies: [], loot: [] },
          { id: 2, enemies: [], loot: [] }
        ]
      },
      {
        name: 'Forest',
        levels: [
          { id: 3, enemies: [], loot: [] },
          { id: 4, enemies: [], loot: [] }
        ]
      },
      {
        name: 'Cave',
        levels: [
          { id: 5, enemies: [], loot: [] },
          { id: 6, enemies: [], loot: [] }
        ]
      }
    ]
  };

  map.zones.forEach(zone => {
    zone.levels.forEach(level => {
      const levelMultiplier = 1 + (level.id - 1) * 0.25;
      level.enemies = Array.from({ length: 4 + level.id }, (_, i) => ({
        id: i,
        hp: Math.floor(100 * levelMultiplier),
        atk: Math.floor(10 * levelMultiplier),
        alive: true
      }));
      level.loot = generateLoot(level.id, levelMultiplier);
    });
  });

  return map;
}

function renderMap(map) {
  const mapContainer = document.getElementById('map-container');
  mapContainer.innerHTML = '';
  map.zones.forEach(zone => {
    const zoneDiv = document.createElement('div');
    zoneDiv.className = 'zone';
    zoneDiv.innerHTML = `<h3>${zone.name}</h3>`;
    zone.levels.forEach(level => {
      const levelDiv = document.createElement('div');
      levelDiv.className = 'level';
      levelDiv.innerHTML = `Level ${level.id}`;
      levelDiv.addEventListener('click', () => {
        console.log(`Entering Level ${level.id} in ${zone.name}`);
        startLevel(level);
      });
      zoneDiv.appendChild(levelDiv);
    });
    mapContainer.appendChild(zoneDiv);
  });
}

function startLevel(level) {
  enemies = level.enemies;
  console.log(`Starting Level ${level.id} with ${enemies.length} enemies.`);
}

const gameMap = initializeMapSystem();
renderMap(gameMap);

// --- Enter Level ---
function enterLevel(levelNum) {
  currentLevel = levelNum;
  const loot = generateLevel(currentLevel);
  handleLootDrop(loot);
  renderMap();
  renderEnemies();
  renderPlayerCards();
  renderInventory();
  renderCombatLog();
}

// --- Player Respawn Logic ---
function checkPlayerDefeat() {
  if (players.every(p => p.hp <= 0)) {
    respawnPlayers();
    currentLevel = 1;
    enterLevel(1);
  }
}

function respawnPlayers() {
  players.forEach(p => {
    p.hp = p.maxHp = 100;
    p.atk = 10;
    p.alive = true;
    p.equipment = {};
  });
}

// --- Auto-Equip System ---
function autoEquip(player, newItem) {
  if (!isItemAllowedForClass(player.class, newItem)) return false;
  const currentItem = player.equipment[newItem.slot];
  if (isItemBetter(newItem, currentItem, player.class)) {
    player.equipment[newItem.slot] = newItem;
    showEquipMessage(player, newItem);
    return true;
  }
  return false;
}

function isItemAllowedForClass(playerClass, item) {
  if (playerClass === 'Warrior' && item.type === 'Sword') return true;
  if (playerClass === 'Archer' && item.type === 'Bow') return true;
  // ...other class restrictions...
  return false;
}

function isItemBetter(newItem, currentItem, playerClass) {
  if (!currentItem) return true;
  if (newItem.atk > currentItem.atk) return true;
  return false;
}

function showEquipMessage(player, item) {
  const msg = createEl('div', { className: 'equip-message' });
  msg.textContent = `${player.class} auto-equipped ${item.name}`;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 1200);
}

function handleLootDrop(loot) {
  loot.forEach(item => {
    players.forEach(player => autoEquip(player, item));
    inventory.push(item);
  });
  renderInventory();
}

// --- Rendering Functions ---
function renderEnemies() {
  const container = $('enemy-container');
  container.innerHTML = '';
  enemies.forEach(enemy => {
    if (!enemy.alive) return;
    const el = createEl('div', { className: 'enemy', id: `enemy${enemy.id}` });
    el.innerHTML = `<div class='hp-bar' style='width:${enemy.hp}px'></div>`;
    container.appendChild(el);
  });
}

function renderPlayerCards() {
  const cards = $('player-cards');
  cards.innerHTML = '';
  players.forEach(player => {
    const card = createEl('div', { className: 'player-card' });
    card.innerHTML = `
      <h4>${player.class}</h4>
      <div>HP: ${player.hp}/${player.maxHp}</div>
      <div>ATK: ${player.atk}</div>
      <div>Weapon: ${player.equipment.weapon ? player.equipment.weapon.name : 'None'}</div>
      <div>Level: ${player.level}</div>
      <div>XP: ${player.experience}/${player.nextLevelXP}</div>
    `;
    cards.appendChild(card);
  });
}

function renderInventory() {
  const grid = $('shared-inventory-grid');
  grid.innerHTML = '';
  inventory.forEach(item => {
    const slot = createEl('div', { className: 'inventory-slot' });
    slot.textContent = item.name;
    grid.appendChild(slot);
  });
}

function renderCombatLog() {
  const log = $('combat-log');
  log.innerHTML = combatLog.slice(-10).map(entry => `<div>${entry}</div>`).join('');
}

// --- Stickman Rendering ---
document.addEventListener('DOMContentLoaded', () => {
  // Render stickmen SVGs
  for (let i = 1; i <= 4; i++) {
    const stickman = $(`player${i}`);
    if (stickman) {
      stickman.innerHTML = `
        <svg width="100%" height="100%" viewBox="0 0 40 80">
          <circle cx="20" cy="15" r="10" fill="#ffe4b5" stroke="#222" stroke-width="2" />
          <rect x="18" y="25" width="4" height="25" fill="#222" />
          <line x1="20" y1="30" x2="8" y2="50" stroke="#222" stroke-width="3" />
          <line x1="20" y1="30" x2="32" y2="50" stroke="#222" stroke-width="3" />
          <line x1="20" y1="50" x2="10" y2="75" stroke="#222" stroke-width="3" />
          <line x1="20" y1="50" x2="30" y2="75" stroke="#222" stroke-width="3" />
        </svg>
      `;
    }
  }
  enterLevel(1);
});

// --- Example Combat Logic (modular, simplified) ---
function attackEnemy(player, enemy) {
  if (!player.alive || !enemy.alive) return;
  enemy.hp -= player.atk;
  combatLog.push(`${player.class} attacks Enemy ${enemy.id} for ${player.atk} damage.`);
  if (enemy.hp <= 0) {
    enemy.alive = false;
    combatLog.push(`Enemy ${enemy.id} defeated!`);
    if (enemies.every(e => !e.alive)) onLevelCleared();
  }
  renderEnemies();
  renderCombatLog();
  checkPlayerDefeat();
}

function onLevelCleared() {
  currentLevel++;
  if (!unlockedLevels.includes(currentLevel)) unlockedLevels.push(currentLevel);
  const loot = generateLevel(currentLevel);
  handleLootDrop(loot);
  renderMap();
  renderEnemies();
  renderPlayerCards();
  renderInventory();
  renderCombatLog();
}

// --- UI Controls ---
function switchTab(clickedBtn, tabIndex) {
  const card = clickedBtn.closest('.player-card');
  const tabs = card.querySelectorAll('.tab-btn');
  const contents = card.querySelectorAll('.tab-content');
  
  // Remove active class from all tabs and contents
  tabs.forEach(tab => tab.classList.remove('active'));
  contents.forEach(content => content.classList.remove('active'));
  
  // Add active class to clicked tab and corresponding content
  clickedBtn.classList.add('active');
  contents[tabIndex].classList.add('active');
}

$('speed-slider').oninput = e => $('speed-label').textContent = `${e.target.value}x`;
$('damage-slider').oninput = e => $('damage-label').textContent = `${e.target.value}x`;
$('xp-slider').oninput = e => $('xp-label').textContent = `${e.target.value}x`;

// Auto-Skill System Implementation
function initializeAutoSkillSystem() {
    const autoSkillToggle = document.getElementById('auto-skill-toggle');
    const skillPrioritySliders = document.querySelectorAll('.skill-priority-slider');

    if (autoSkillToggle) {
        autoSkillToggle.addEventListener('change', () => {
            console.log(`Auto-Skill: ${autoSkillToggle.checked ? 'Enabled' : 'Disabled'}`);
        });
    }

    skillPrioritySliders.forEach(slider => {
        slider.addEventListener('input', () => {
            console.log(`Skill Priority Updated: ${slider.value}`);
        });
    });
}

initializeAutoSkillSystem();

// Enemy AI Implementation
function initializeEnemyAI() {
    enemies.forEach(enemy => {
        enemy.move = () => {
            console.log(`${enemy.name} is moving dynamically.`);
          // Move enemy towards player
          const player = players[0]; // Targeting first player for simplicity
          const enemyEl = $(`enemy${enemy.id}`);
          if (player && enemyEl) {
            const enemyRect = enemyEl.getBoundingClientRect();
            const playerRect = playerEl.getBoundingClientRect();
            const dx = playerRect.x - enemyRect.x;
            const dy = playerRect.y - enemyRect.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const moveX = (dx / distance) * enemy.speed;
            const moveY = (dy / distance) * enemy.speed;
            enemyEl.style.transform = `translate(${moveX}px, ${moveY}px)`;
          }
        };

        enemy.attack = () => {
            console.log(`${enemy.name} is attacking.`);
        };
    });
}

initializeEnemyAI();

// Auto-Equipment System
function initializeAutoEquipSystem() {
    players.forEach(player => {
        player.autoEquip = (item) => {
            console.log(`${player.name} auto-equipped ${item.name}`);
        };
    });
}

initializeAutoEquipSystem();

// Combat Mechanics Enhancement
function initializeCombatMechanics() {
    players.forEach(player => {
        player.attack = (enemy) => {
            console.log(`${player.name} attacks ${enemy.name} for ${player.atk} damage.`);
            enemy.hp -= player.atk;
            if (enemy.hp <= 0) {
                console.log(`${enemy.name} is defeated!`);
            }
        };
    });
}

initializeCombatMechanics();

// Leveling System Implementation
function initializeLevelingSystem() {
    players.forEach(player => {
        player.gainExperience = (xp) => {
            player.experience += xp;
            console.log(`${player.name} gained ${xp} XP.`);
            if (player.experience >= player.nextLevelXP) {
                player.level++;
                player.experience = 0;
                player.nextLevelXP *= 1.5;
                console.log(`${player.name} leveled up to Level ${player.level}!`);
              }
        };
    });
}

initializeLevelingSystem();

// Enemy Movement Logic
function updateEnemyPositions() {
  enemies.forEach(enemy => {
    if (!enemy.alive) return;
    const enemyEl = $(`enemy${enemy.id}`);
    if (enemyEl) {
      const player = players[0]; // Targeting first player for simplicity
      const enemyRect = enemyEl.getBoundingClientRect();
      const playerRect = player.getBoundingClientRect();
      const dx = playerRect.x - enemyRect.x;
      const dy = playerRect.y - enemyRect.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const moveX = (dx / distance) * enemy.speed;
      const moveY = (dy / distance) * enemy.speed;
      enemyEl.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }
  });
}

// Game Loop
function gameLoop() {
  updateEnemyPositions();
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

// --- Enemy Spawning Logic ---
function spawnEnemies() {
  enemies.forEach(enemy => {
    enemy.position = { x: gameMap.width - 50, y: gameMap.height - 50 }; // Bottom-right corner
    enemy.alive = true;
  });
}

// --- Game Initialization ---
function initializeGame() {
  // Removed automatic enemy spawning at start
}

// --- Setup Autobattler Button ---
function setupAutobattlerButton() {
  const autobattlerButton = document.getElementById('autobattler-button');
  autobattlerButton.addEventListener('click', () => {
    spawnEnemies();
  });
}

setupAutobattlerButton();

// --- Test Game Button ---
function setupTestGameButton() {
  const testButton = document.createElement('button');
  testButton.id = 'test-game-button';
  testButton.textContent = 'Test Entire Game';
  testButton.style.position = 'absolute';
  testButton.style.top = '10px';
  testButton.style.right = '10px';
  testButton.style.zIndex = '1000';

  const progressContainer = document.createElement('div');
  progressContainer.id = 'test-progress-container';
  progressContainer.style.position = 'absolute';
  progressContainer.style.top = '50px';
  progressContainer.style.right = '10px';
  progressContainer.style.zIndex = '1000';
  progressContainer.style.backgroundColor = '#fff';
  progressContainer.style.border = '1px solid #ccc';
  progressContainer.style.padding = '10px';
  progressContainer.style.display = 'none';

  document.body.appendChild(progressContainer);

  testButton.addEventListener('click', async () => {
    progressContainer.style.display = 'block';
    progressContainer.innerHTML = '<h4>Testing Progress</h4><ul id="progress-list"></ul>';
    const progressList = document.getElementById('progress-list');

    const updateProgress = (message, success = true) => {
      const item = document.createElement('li');
      item.textContent = message;
      item.style.color = success ? 'green' : 'red';
      progressList.appendChild(item);
    };

    try {
      updateProgress('Starting full game testing...');

      // Test map system
      updateProgress('Testing map system...');
      const map = initializeMapSystem();
      renderMap(map);
      updateProgress('Map system test completed.');

      // Test level generation
      updateProgress('Testing level generation...');
      for (let i = 1; i <= 10; i++) {
        const loot = generateLevel(i);
        handleLootDrop(loot);
      }
      updateProgress('Level generation test completed.');

      // Test combat AI
      updateProgress('Testing combat AI...');
      setInterval(advancedCombatAI, 1000);
      updateProgress('Combat AI test initiated.');

      // Test rendering functions
      updateProgress('Testing rendering functions...');
      renderEnemies();
      renderPlayerCards();
      renderInventory();
      renderCombatLog();
      updateProgress('Rendering functions test completed.');

      updateProgress('Full game testing completed.');
    } catch (error) {
      updateProgress(`Error: ${error.message}`, false);
    }
  });

  document.body.appendChild(testButton);
}

setupTestGameButton();

// --- Advanced Combat AI ---
function advancedCombatAI() {
  enemies.forEach(enemy => {
    if (!enemy.alive) return;

    // Enemy AI: Move towards nearest player and attack if in range
    const nearestPlayer = players.reduce((closest, player) => {
      if (!player.alive) return closest;
      const distance = Math.hypot(player.position.x - enemy.position.x, player.position.y - enemy.position.y);
      return distance < closest.distance ? { player, distance } : closest;
    }, { player: null, distance: Infinity }).player;

    if (nearestPlayer) {
      const distance = Math.hypot(nearestPlayer.position.x - enemy.position.x, nearestPlayer.position.y - enemy.position.y);
      if (distance <= enemy.attackRange) {
        nearestPlayer.hp -= enemy.atk;
        console.log(`${enemy.name} attacks ${nearestPlayer.class} for ${enemy.atk} damage.`);
        if (nearestPlayer.hp <= 0) {
          nearestPlayer.alive = false;
          console.log(`${nearestPlayer.class} has been defeated.`);
        }
      } else {
        const directionX = nearestPlayer.position.x - enemy.position.x;
        const directionY = nearestPlayer.position.y - enemy.position.y;
        const magnitude = Math.hypot(directionX, directionY);
        enemy.position.x += (directionX / magnitude) * enemy.speed;
        enemy.position.y += (directionY / magnitude) * enemy.speed;
      }
    }
  });

  players.forEach(player => {
    if (!player.alive) return;

    // Player AI: Attack nearest enemy if in range
    const nearestEnemy = enemies.reduce((closest, enemy) => {
      if (!enemy.alive) return closest;
      const distance = Math.hypot(enemy.position.x - player.position.x, enemy.position.y - player.position.y);
      return distance < closest.distance ? { enemy, distance } : closest;
    }, { enemy: null, distance: Infinity }).enemy;

    if (nearestEnemy) {
      const distance = Math.hypot(nearestEnemy.position.x - player.position.x, nearestEnemy.position.y - player.position.y);
      if (distance <= player.attackRange) {
        nearestEnemy.hp -= player.atk;
        console.log(`${player.class} attacks ${nearestEnemy.name} for ${player.atk} damage.`);
        if (nearestEnemy.hp <= 0) {
          nearestEnemy.alive = false;
          console.log(`${nearestEnemy.name} has been defeated.`);
        }
      }
    }
  });
}

setInterval(advancedCombatAI, 1000); // Run AI every second
