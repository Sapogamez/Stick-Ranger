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
  { id: 1, class: 'Warrior', hp: 100, maxHp: 100, atk: 10, equipment: {}, alive: true },
  { id: 2, class: 'Archer', hp: 100, maxHp: 100, atk: 10, equipment: {}, alive: true },
  { id: 3, class: 'Mage', hp: 100, maxHp: 100, atk: 10, equipment: {}, alive: true },
  { id: 4, class: 'Priest', hp: 100, maxHp: 100, atk: 10, equipment: {}, alive: true }
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
$('speed-slider').oninput = e => $('speed-label').textContent = `${e.target.value}x`;
$('damage-slider').oninput = e => $('damage-label').textContent = `${e.target.value}x`;
$('xp-slider').oninput = e => $('xp-label').textContent = `${e.target.value}x`;
