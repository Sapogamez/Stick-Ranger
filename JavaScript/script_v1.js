




// Player class stats
const classStats = {
    Warrior: { HP: 100, ATK: 10, DEF: 5, SPD: 3, RANGE: 3 },
    Archer:  { HP: 80,  ATK: 15, DEF: 3, SPD: 5, RANGE: 12 },
    Mage:    { HP: 70,  ATK: 20, DEF: 2, SPD: 4, RANGE: 15 },
    Priest:  { HP: 90,  ATK: 2,  DEF: 6, SPD: 3, RANGE: 10, HEAL: 12, AURA: 5 },
    Boxer:   { HP: 110, ATK: 12, DEF: 7, SPD: 4, RANGE: 2 }
};

// Test that script is loading
console.log('Script loaded! Class stats:', classStats);
alert('Script is working! Check console for debug info.');

// Debug system
let debugEnabled = true;
let debugOutput = null;

function debugLog(message, type = 'info') {
    if (!debugEnabled || !debugOutput) return;
    
    const timestamp = new Date().toLocaleTimeString();
    const debugLine = document.createElement('div');
    debugLine.className = `debug-line ${type}`;
    debugLine.textContent = `[${timestamp}] ${message}`;
    
    debugOutput.appendChild(debugLine);
    debugOutput.scrollTop = debugOutput.scrollHeight;
    
    // Also log to browser console
    console.log(`[DEBUG] ${message}`);
// ...existing code...


function clearDebug() {
    if (debugOutput) {
        debugOutput.innerHTML = '<div class="debug-line">Debug console cleared...</div>';
    }
}
}

function updatePlayerCard(card, className) {
    const stats = classStats[className];
    if (!stats) {
        debugLog(`ERROR: Class '${className}' not found in classStats`, 'error');
        return;
    }
    
    debugLog(`Updating player card to class: ${className}`, 'info');
    let auraBonus = 0;
    // Priest aura: if any other player in the same region is a Priest, add aura
    if (className !== 'Priest') {
        // Find all player cards
        const allCards = document.querySelectorAll('.player-card');
        allCards.forEach(otherCard => {
            if (otherCard !== card) {
                const otherClass = otherCard.querySelector('.player-class').textContent.trim();
                if (otherClass === 'Priest') {
                    auraBonus += classStats.Priest.AURA;
                }
            }
        });
    }
    debugLog(`New stats: HP:${stats.HP} ATK:${stats.ATK} DEF:${stats.DEF} SPD:${stats.SPD} RANGE:${stats.RANGE}` + (className === 'Priest' ? ` HEAL:${stats.HEAL} AURA:${stats.AURA}` : (auraBonus ? ` +AURA:${auraBonus}` : '')), 'info');
    
    try {
        const classElement = card.querySelector('.player-class');
        if (!classElement) {
            debugLog('ERROR: Could not find .player-class element', 'error');
            return;
        }
        
        const oldClass = classElement.textContent;
        classElement.textContent = className;
        debugLog(`Class name changed from '${oldClass}' to '${className}'`, 'success');
        
        const statDivs = card.querySelectorAll('.player-stats div');
        if (statDivs.length < 5) {
            debugLog(`ERROR: Expected 5 stat divs, found ${statDivs.length}`, 'error');
            return;
        }
        
        statDivs[0].querySelector('span').textContent = stats.HP;
        // Priest shows HEAL instead of ATK
        if (className === 'Priest') {
            statDivs[1].querySelector('span').textContent = `Heal: ${stats.HEAL}`;
        } else {
            statDivs[1].querySelector('span').textContent = stats.ATK + (auraBonus ? ` (+${auraBonus})` : '');
        }
        statDivs[2].querySelector('span').textContent = stats.DEF;
        statDivs[3].querySelector('span').textContent = stats.SPD;
        statDivs[4].querySelector('span').textContent = stats.RANGE;
        
        debugLog(`Stats updated successfully`, 'success');
        
        // Update corresponding stick figure
        updateStickFigure(card, className, stats);
        
    } catch (error) {
        debugLog(`ERROR updating player card: ${error.message}`, 'error');
    }
}


function updateStickFigure(card, className, stats) {
    // Find which player this is (1-4)
    const playerCards = document.querySelectorAll('.player-card');
    let playerIndex = -1;
    
    playerCards.forEach((pCard, index) => {
        if (pCard === card) {
            playerIndex = index + 1;
        }
    });
    if (playerIndex === -1) {
        debugLog('ERROR: Could not find player index for stick figure update', 'error');
        return;
    }
    const stickFigure = document.getElementById(`player${playerIndex}`);
    if (!stickFigure) {
        debugLog(`ERROR: Could not find stick figure for player ${playerIndex}`, 'error');
        return;
    }
    debugLog(`Updating stick figure for player ${playerIndex} with class ${className}`, 'info');
    // Remove all previous class styling
    stickFigure.classList.remove('warrior', 'archer', 'mage', 'priest', 'boxer');
    stickFigure.classList.remove('warrior-style', 'archer-style', 'mage-style', 'priest-style', 'boxer-style');
    // Add class-specific styling
    if (className && className !== 'None') {
        const classLower = className.toLowerCase();
        stickFigure.classList.add(classLower);
        debugLog(`Added class: ${classLower}`, 'info');
    }
    // Apply speed-based animation speed
    const animationSpeed = Math.max(0.5, 2 - (stats.SPD * 0.02));
    stickFigure.style.animationDuration = `${animationSpeed}s`;
    // Apply size based on overall stats (bigger = stronger overall)
    const totalStats = (stats.HP + stats.ATK + stats.DEF + stats.SPD + stats.RANGE) / 5;
    const scale = 0.8 + (totalStats / 150);
    stickFigure.style.transform = `scale(${scale})`;
    debugLog(`Stick figure updated: ${className} with scale ${scale.toFixed(2)} and animation speed ${animationSpeed.toFixed(1)}s`, 'success');
}


// Map functionality
function initializeMap() {
    const minimap = document.getElementById('minimap');
    const fullscreenMap = document.getElementById('fullscreen-map');
    const closeMapBtn = document.getElementById('close-map');
    
    // Open fullscreen map when minimap is clicked
    minimap.addEventListener('click', () => {
        fullscreenMap.classList.add('active');
        debugLog('Opened fullscreen map', 'info');
    });
    
    // Close fullscreen map
    closeMapBtn.addEventListener('click', () => {
        fullscreenMap.classList.remove('active');
        debugLog('Closed fullscreen map', 'info');
    });
    
    // Close map when clicking outside the map container
    fullscreenMap.addEventListener('click', (e) => {
        if (e.target === fullscreenMap) {
            fullscreenMap.classList.remove('active');
            debugLog('Closed fullscreen map (clicked outside)', 'info');
        }
    });
    
    // Handle region selection
    const mapRegions = document.querySelectorAll('.map-region');
    mapRegions.forEach(region => {
        region.addEventListener('click', (e) => {
            e.stopPropagation();
            const zoneName = region.dataset.zone;
            selectMapRegion(zoneName);
        });
    });
    
    // Close map with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && fullscreenMap.classList.contains('active')) {
            fullscreenMap.classList.remove('active');
            debugLog('Closed fullscreen map (Escape key)', 'info');
        }
    });
    
    debugLog('Map system initialized', 'success');
}

function selectMapRegion(zoneName) {
    // Remove active class from all regions
    document.querySelectorAll('.map-region').forEach(region => {
        region.classList.remove('active-region');
    });
    document.querySelectorAll('.map-zone').forEach(zone => {
        zone.classList.remove('active');
    });
    
    // Add active class to selected region
    const selectedRegion = document.querySelector(`[data-zone="${zoneName}"]`);
    const selectedMiniZone = document.querySelector(`.map-zone.${zoneName}`);
    
    if (selectedRegion) {
        selectedRegion.classList.add('active-region');
    }
    if (selectedMiniZone) {
        selectedMiniZone.classList.add('active');
    }
    
    // Move all players to the selected region
    movePlayersToRegion(zoneName);
    
    // Spawn enemies for the new region
    spawnEnemies(zoneName);
    
    debugLog(`Selected map region: ${zoneName}`, 'info');
    
    // Close the fullscreen map after selection
    setTimeout(() => {
        document.getElementById('fullscreen-map').classList.remove('active');
    }, 500);
}

function movePlayersToRegion(zoneName) {
    // Update player positions in minimap
    const playerDots = document.querySelectorAll('.player-dot');
    const positions = {
        forest: [
            { top: '10px', left: '15px' },
            { top: '13px', left: '18px' },
            { top: '16px', left: '21px' },
            { top: '19px', left: '24px' }
        ],
        plains: [
            { top: '15px', left: '55px' },
            { top: '18px', left: '58px' },
            { top: '21px', left: '61px' },
            { top: '24px', left: '64px' }
        ],
        mountains: [
            { top: '45px', left: '12px' },
            { top: '48px', left: '15px' },
            { top: '51px', left: '18px' },
            { top: '54px', left: '21px' }
        ],
        desert: [
            { top: '45px', left: '50px' },
            { top: '48px', left: '53px' },
            { top: '51px', left: '56px' },
            { top: '54px', left: '59px' }
        ],
        cave: [
            { top: '58px', left: '85px' },
            { top: '61px', left: '88px' },
            { top: '64px', left: '91px' },
            { top: '67px', left: '94px' }
        ]
    };
    
    if (positions[zoneName]) {
        playerDots.forEach((dot, index) => {
            if (positions[zoneName][index]) {
                dot.style.top = positions[zoneName][index].top;
                dot.style.left = positions[zoneName][index].left;
            }
        });
    }
    
    // Update player icons in fullscreen map
    document.querySelectorAll('.region-players').forEach(container => {
        container.innerHTML = '';
    });
    
    const targetRegion = document.querySelector(`[data-zone="${zoneName}"] .region-players`);
    if (targetRegion) {
        for (let i = 1; i <= 4; i++) {
            const playerIcon = document.createElement('div');
            playerIcon.className = 'map-player-icon';
            playerIcon.dataset.player = i;
            playerIcon.textContent = `P${i}`;
            targetRegion.appendChild(playerIcon);
        }
    }
    
    debugLog(`Moved all players to ${zoneName}`, 'success');
}

// Combat System

let currentZone = 'plains';
let enemies = [];
let combatActive = false;
let autoBattleEnabled = false;
let battleLoopInterval = null;
let gameLevel = 1;
let enemyStatMultiplier = 1;

const enemyData = {
    plains: [
        { type: 'slime', name: 'Slime', hp: 25, atk: 5, def: 2, spd: 2, range: 1, count: [3, 6] },
        { type: 'rabbit', name: 'Rabbit', hp: 15, atk: 3, def: 1, spd: 4, range: 1, count: [2, 4] }
    ],
    forest: [
        { type: 'goblin', name: 'Goblin', hp: 40, atk: 8, def: 3, spd: 3, range: 2, count: [2, 4] },
        { type: 'wolf', name: 'Wolf', hp: 35, atk: 12, def: 2, spd: 5, range: 2, count: [1, 3] }
    ],
    mountains: [
        { type: 'troll', name: 'Troll', hp: 80, atk: 15, def: 8, spd: 2, range: 2, count: [1, 2] },
        { type: 'eagle', name: 'Eagle', hp: 45, atk: 18, def: 3, spd: 7, range: 4, count: [1, 2] }
    ],
    desert: [
        { type: 'scorpion', name: 'Scorpion', hp: 50, atk: 12, def: 5, spd: 4, range: 2, count: [2, 3] },
        { type: 'mummy', name: 'Mummy', hp: 70, atk: 10, def: 6, spd: 1, range: 1, count: [1, 2] }
    ],
    cave: [
        { type: 'bat', name: 'Bat', hp: 30, atk: 14, def: 2, spd: 8, range: 3, count: [3, 5] },
        { type: 'spider', name: 'Spider', hp: 55, atk: 16, def: 4, spd: 6, range: 2, count: [2, 3] }
    ]
};

function spawnEnemies(zoneName) {
    clearEnemies();
    currentZone = zoneName;
    const zoneEnemies = enemyData[zoneName] || enemyData.plains;
    const container = document.getElementById('enemy-container');
    enemies = [];
    zoneEnemies.forEach(enemyType => {
        const count = Math.floor(Math.random() * (enemyType.count[1] - enemyType.count[0] + 1)) + enemyType.count[0];
        for (let i = 0; i < count; i++) {
            // Scale enemy stats by multiplier
            const scaledType = Object.assign({}, enemyType);
            scaledType.hp = Math.round(enemyType.hp * enemyStatMultiplier);
            scaledType.atk = Math.round(enemyType.atk * enemyStatMultiplier);
            scaledType.def = Math.round(enemyType.def * enemyStatMultiplier);
            scaledType.spd = Math.round(enemyType.spd * Math.max(1, enemyStatMultiplier * 0.9));
            scaledType.range = Math.round(enemyType.range * Math.max(1, enemyStatMultiplier * 0.9));
            // Place enemies on the right side
            scaledType._startX = 80 + Math.random() * 10; // 80-90% right
            scaledType._startY = 30 + Math.random() * 30; // 30-60% vertical
            const enemy = createEnemy(scaledType);
            enemy.x = scaledType._startX;
            enemy.y = scaledType._startY;
            enemies.push(enemy);
            container.appendChild(enemy.element);
        }
    });
    debugLog(`Spawned ${enemies.length} enemies in ${zoneName} (Level ${gameLevel}, Multiplier ${enemyStatMultiplier.toFixed(2)})`, 'info');
    addCombatLog(`Entered ${zoneName} - ${enemies.length} enemies spotted! (Level ${gameLevel})`);
}

function createEnemy(enemyData) {
    const element = document.createElement('div');
    element.className = `enemy ${enemyData.type}`;
    
    // Use start position if provided, otherwise default
    const x = enemyData._startX || (Math.random() * 80 + 10);
    const y = enemyData._startY || (Math.random() * 40 + 20);
    
    element.style.left = x + '%';
    element.style.top = y + '%';
    
    // Health bar
    const healthBar = document.createElement('div');
    healthBar.className = 'enemy-health';
    const healthFill = document.createElement('div');
    healthFill.className = 'enemy-health-fill';
    healthFill.style.width = '100%';
    healthBar.appendChild(healthFill);
    element.appendChild(healthBar);
    
    const enemy = {
        element,
        type: enemyData.type,
        name: enemyData.name,
        maxHp: enemyData.hp,
        hp: enemyData.hp,
        atk: enemyData.atk,
        def: enemyData.def,
        spd: enemyData.spd,
        range: enemyData.range,
        x: x,
        y: y,
        target: null,
        lastAttack: 0,
        moveDirection: Math.random() * Math.PI * 2, // Random initial direction
        idleTime: 0
    };
    
    return enemy;
}

function clearEnemies() {
    const container = document.getElementById('enemy-container');
    if (container) {
        container.innerHTML = '';
    }
    enemies = [];
}

function addHealthBarsToPlayers() {
    const players = document.querySelectorAll('.stick-figure');
    players.forEach((playerElement, index) => {
        if (!playerElement.querySelector('.player-health')) {
            const healthBar = document.createElement('div');
            healthBar.className = 'player-health';
            const healthFill = document.createElement('div');
            healthFill.className = 'player-health-fill';
            healthFill.style.width = '100%';
            healthBar.appendChild(healthFill);
            playerElement.appendChild(healthBar);
        }
    });
}

function getPlayerStats(playerIndex) {
    const playerCard = document.querySelectorAll('.player-card')[playerIndex - 1];
    if (!playerCard) return null;
    
    const className = playerCard.querySelector('.player-class').textContent.trim();
    const baseStats = classStats[className];
    if (!baseStats) return null;
    
    // Calculate aura bonuses
    let atkBonus = 0;
    if (className !== 'Priest') {
        const allCards = document.querySelectorAll('.player-card');
        allCards.forEach(otherCard => {
            if (otherCard !== playerCard) {
                const otherClass = otherCard.querySelector('.player-class').textContent.trim();
                if (otherClass === 'Priest') {
                    atkBonus += classStats.Priest.AURA || 0;
                }
            }
        });
    }
    
    return {
        hp: baseStats.HP,
        maxHp: baseStats.HP,
        atk: className === 'Priest' ? 0 : baseStats.ATK + atkBonus,
        heal: className === 'Priest' ? baseStats.HEAL : 0,
        def: baseStats.DEF,
        spd: baseStats.SPD,
        range: baseStats.RANGE,
        className: className
    };
}

function calculateDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function moveTowards(from, to, speed) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= speed) {
        return { x: to.x, y: to.y };
    }
    
    const ratio = speed / distance;
    return {
        x: from.x + dx * ratio,
        y: from.y + dy * ratio
    };
}

function updateEnemyPosition(enemy) {
    enemy.element.style.left = enemy.x + '%';
    enemy.element.style.top = enemy.y + '%';
}

function updateEnemyHealth(enemy) {
    const healthFill = enemy.element.querySelector('.enemy-health-fill');
    if (healthFill) {
        const healthPercent = (enemy.hp / enemy.maxHp) * 100;
        healthFill.style.width = healthPercent + '%';
    }
}

function updatePlayerHealth(playerIndex, currentHp, maxHp) {
    // Update player card stats
    const playerCard = document.querySelector(`.player-card:nth-child(${playerIndex})`);
    if (playerCard) {
        const hpElement = playerCard.querySelector('.stat-value[data-stat="hp"]');
        if (hpElement) {
            hpElement.textContent = Math.max(0, Math.round(currentHp));
        }
    }
    
    // Update visual health bar on stick figure
    const playerElement = document.querySelector(`.stick-figure:nth-child(${playerIndex})`);
    if (playerElement) {
        const healthPercent = Math.max(0, currentHp / maxHp);
        
        // Create or update health bar
        let healthBar = playerElement.querySelector('.player-health-bar');
        if (!healthBar) {
            healthBar = document.createElement('div');
            healthBar.className = 'player-health-bar';
            healthBar.innerHTML = '<div class="player-health-fill"></div>';
            playerElement.appendChild(healthBar);
        }
        
        const healthFill = healthBar.querySelector('.player-health-fill');
        healthFill.style.width = (healthPercent * 100) + '%';
        
        // Color based on health
        if (healthPercent > 0.6) {
            healthFill.style.backgroundColor = '#4CAF50';
        } else if (healthPercent > 0.3) {
            healthFill.style.backgroundColor = '#FF9800';
        } else {
            healthFill.style.backgroundColor = '#F44336';
        }
    }
}

function addCombatLog(message) {
    const log = document.getElementById('combat-log');
    if (log) {
        const line = document.createElement('div');
        line.textContent = message;
        log.appendChild(line);
        log.scrollTop = log.scrollHeight;
        
        // Keep only last 10 messages
        while (log.children.length > 10) {
            log.removeChild(log.firstChild);
        }
    }
}

function initializeCombatSystem() {
    // Add health bars to existing players
    addHealthBarsToPlayers();
    
    // Set up auto-battle button
    const autoBattleBtn = document.getElementById('auto-battle-btn');
    if (autoBattleBtn) {
        autoBattleBtn.addEventListener('click', toggleAutoBattle);
    }
    
    // Spawn initial enemies
    spawnEnemies(currentZone);
    
    debugLog('Combat system initialized', 'success');
}

function toggleAutoBattle() {
    autoBattleEnabled = !autoBattleEnabled;
    const btn = document.getElementById('auto-battle-btn');
    
    if (autoBattleEnabled) {
        btn.textContent = 'Auto Battle: ON';
        btn.classList.add('active');
        startBattleLoop();
        addCombatLog('Auto battle enabled!');
    } else {
        btn.textContent = 'Auto Battle: OFF';
        btn.classList.remove('active');
        stopBattleLoop();
        addCombatLog('Auto battle disabled.');
    }
    
    debugLog(`Auto battle ${autoBattleEnabled ? 'enabled' : 'disabled'}`, 'info');
}

function startBattleLoop() {
    if (battleLoopInterval) return;
    
    battleLoopInterval = setInterval(() => {
        if (autoBattleEnabled) {
            processCombatTurn();
        }
    }, 1000); // Process combat every second
}

function stopBattleLoop() {
    if (battleLoopInterval) {
        clearInterval(battleLoopInterval);
        battleLoopInterval = null;
    }
}

function processCombatTurn() {
    // Players start on the left, enemies on the right, both move toward each other
    const playerElements = document.querySelectorAll('.stick-figure');
    const playerPositions = [];
    // Get player positions
    playerElements.forEach((element, index) => {
        const stats = getPlayerStats(index + 1);
        if (!stats) return;
        // Place players on the left side at start
        if (!element._initialized) {
            element._initialized = true;
            element._x = 10 + index * 5; // 10, 15, 20, 25% left
            element._y = 40 + index * 5; // 40, 45, 50, 55% vertical
        }
        playerPositions.push({
            x: element._x,
            y: element._y,
            element: element,
            stats: stats,
            hp: stats.hp,
            maxHp: stats.maxHp,
            index: index + 1,
            lastAttack: element.lastAttack || 0
        });
    });
    
    // Move players toward nearest enemy (or Priest toward damaged player)
    playerPositions.forEach(player => {
        if (player.hp <= 0) return;
        
        // Update player visual position
        player.element.style.left = player.x + '%';
        player.element.style.top = player.y + '%';
        
        // Priest moves toward most damaged player
        if (player.stats.className === 'Priest' && player.stats.heal > 0) {
            healNearbyPlayers(player, playerPositions);
        } else {
            // Move toward nearest enemy like Stick Ranger
            let nearestEnemy = null;
            let nearestDistance = Infinity;
    playerPositions.forEach(player => {
        if (player.hp <= 0) return;
        // Update player visual position
        player.element.style.left = player.x + '%';
        player.element.style.top = player.y + '%';
        // Priest only heals, never attacks
        if (player.stats.className === 'Priest' && player.stats.heal > 0) {
            healNearbyPlayersInfiniteRange(player, playerPositions);
        } else {
            let nearestEnemy = null;
            let nearestDistance = Infinity;
            enemies.forEach(enemy => {
                if (enemy.hp <= 0) return;
                const distance = calculateDistance(player, enemy);
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestEnemy = enemy;
                }
            });
            if (nearestEnemy) {
                const rangeThreshold = player.stats.range * 2.5;
                if (nearestDistance > rangeThreshold) {
                    const moveSpeed = player.stats.spd * 0.8;
                    const newPos = moveTowards(player, nearestEnemy, moveSpeed);
                    player.x = Math.max(5, Math.min(95, newPos.x));
                    player.y = Math.max(15, Math.min(75, newPos.y));
                    player.element._x = player.x;
                    player.element._y = player.y;
                } else {
                    const now = Date.now();
                    const attackCooldown = 2000 - (player.stats.spd * 50);
                    if (now - player.lastAttack > attackCooldown) {
                        const damage = Math.max(1, player.stats.atk - nearestEnemy.def);
                        nearestEnemy.hp = Math.max(0, nearestEnemy.hp - damage);
                        updateEnemyHealth(nearestEnemy);
                        addCombatLog(`Player ${player.index} (${player.stats.className}) attacks ${nearestEnemy.name} for ${damage} damage!`);
                        if (nearestEnemy.hp <= 0) {
                            addCombatLog(`${nearestEnemy.name} defeated!`);
                            nearestEnemy.element.style.opacity = '0.3';
                            nearestEnemy.element.style.pointerEvents = 'none';
                        }
                        player.element.lastAttack = now;
                        player.lastAttack = now;
                    }
                }
            }
        }
    });
// Priest infinite range healing
function healNearbyPlayersInfiniteRange(priest, playerPositions) {
    let healed = false;
    // Find most damaged player (lowest HP, not self, not dead)
    let target = null;
    let minHpRatio = 1;
    for (let i = 0; i < playerPositions.length; i++) {
        const player = playerPositions[i];
        if (player.index === priest.index) continue;
        if (player.hp <= 0) continue;
        const hpRatio = player.hp / player.maxHp;
        if (hpRatio < minHpRatio) {
            minHpRatio = hpRatio;
            target = player;
        }
    }
    if (target) {
        // Heal at infinite range
        const healAmount = priest.stats.heal;
        const oldHp = target.hp;
        let newHp = Math.min(target.maxHp, target.hp + healAmount);
        target.hp = newHp;
        // Update the player's HP in the actual player card
        const playerCard = document.querySelectorAll('.player-card')[target.index - 1];
        if (playerCard) {
            const hpSpan = playerCard.querySelector('.stat-value[data-stat="hp"]');
            if (hpSpan) {
                hpSpan.textContent = newHp;
            }
        }
        updatePlayerHealth(target.index, newHp, target.maxHp);
        addCombatLog(`Priest heals Player ${target.index} for ${newHp - oldHp} HP!`);
        healed = true;
    }
    if (!healed) {
        addCombatLog('Priest finds no one to heal nearby.');
    }
}

function healNearbyPlayers(priest, playerPositions) {
    // Priest actively moves toward the most damaged player until in healing range
    const healRange = priest.stats.range * 3;
    let healed = false;
    // Find most damaged player (lowest HP, not self, not dead)
    let target = null;
    let minHpRatio = 1;
    playerPositions.forEach(player => {
        if (player.index === priest.index) return;
        if (player.hp <= 0) return;
        const hpRatio = player.hp / player.maxHp;
        if (hpRatio < minHpRatio) {
            minHpRatio = hpRatio;
            target = player;
        }
    });
    if (target) {
        // Move priest toward target every tick until in healing range
        let distance = calculateDistance(priest, target);
        const healRange = priest.stats.range * 4;
        if (distance > healRange) {
            const moveSpeed = priest.stats.spd * 2.0;
            const newPos = moveTowards(priest, target, moveSpeed);
            priest.x = Math.max(5, Math.min(95, newPos.x));
            priest.y = Math.max(15, Math.min(75, newPos.y));
            priest.element._x = priest.x;
            priest.element._y = priest.y;
            priest.element.style.left = priest.x + '%';
            priest.element.style.top = priest.y + '%';
        }
        distance = calculateDistance(priest, target);
        // Heal if in range
        if (distance <= healRange) {
            const healAmount = priest.stats.heal;
            const oldHp = target.hp;
            let newHp = Math.min(target.maxHp, target.hp + healAmount);
            target.hp = newHp;
            // Update the player's HP in the actual player card
            const playerCard = document.querySelectorAll('.player-card')[target.index - 1];
            if (playerCard) {
                const hpSpan = playerCard.querySelector('.stat-value[data-stat="hp"]');
                if (hpSpan) {
                    hpSpan.textContent = newHp;
                }
            }
            updatePlayerHealth(target.index, newHp, target.maxHp);
            addCombatLog(`Priest heals Player ${target.index} for ${newHp - oldHp} HP!`);
            healed = true;
        }
    }
    if (!healed) {
        addCombatLog('Priest finds no one to heal nearby.');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize debug system
    debugOutput = document.getElementById('debug-output');
    
    document.getElementById('clear-debug').addEventListener('click', clearDebug);
    document.getElementById('toggle-debug').addEventListener('click', () => {
        debugEnabled = !debugEnabled;
        debugLog(`Debug ${debugEnabled ? 'enabled' : 'disabled'}`, 'warning');
    });
    
    // Initialize map system
    initializeMap();
    
    // Initialize combat system
    initializeCombatSystem();
    
    debugLog('Script loaded, DOM ready, initializing player cards...', 'info');
    
    document.querySelectorAll('.player-card').forEach((card, index) => {
        debugLog(`Setting up player card ${index + 1}`, 'info');
        
        const select = card.querySelector('.class-select');
        const applyBtn = card.querySelector('.apply-class');
        const currentClass = card.querySelector('.player-class').textContent.trim();
        
        if (!select) {
            debugLog(`ERROR: Missing .class-select in card ${index + 1}`, 'error');
            return;
        }
        if (!applyBtn) {
            debugLog(`ERROR: Missing .apply-class button in card ${index + 1}`, 'error');
            return;
        }
        
        debugLog(`Card ${index + 1}: Found select and apply button`, 'success');
        debugLog(`Card ${index + 1}: Current class is '${currentClass}'`, 'info');
        
        // Set dropdown to match displayed class name
        let foundMatch = false;
        for (let i = 0; i < select.options.length; i++) {
            if (select.options[i].value === currentClass) {
                select.selectedIndex = i;
                foundMatch = true;
                debugLog(`Card ${index + 1}: Set dropdown to match current class '${currentClass}'`, 'success');
                break;
            }
        }
        
        if (!foundMatch) {
            debugLog(`Card ${index + 1}: WARNING: Current class '${currentClass}' not found in dropdown options`, 'warning');
        }
        
        // Listen for dropdown changes
        select.addEventListener('change', () => {
            debugLog(`Card ${index + 1}: Dropdown changed to '${select.value}'`, 'info');
        });
        
        // Initial update
        debugLog(`Card ${index + 1}: Performing initial update with class '${select.value}'`, 'info');
        updatePlayerCard(card, select.value);
        
        // Only update when Apply button is clicked
        applyBtn.addEventListener('click', () => {
            debugLog(`Card ${index + 1}: Apply button clicked!`, 'warning');
            debugLog(`Card ${index + 1}: Selected class in dropdown: '${select.value}'`, 'info');
            updatePlayerCard(card, select.value);
        });
        
        debugLog(`Card ${index + 1}: Setup complete`, 'success');
    });
    
    debugLog('All player cards initialized!', 'success');
    
    // Initialize equipment tab system
    initializeEquipmentTabs();
}
);

// Equipment Tab System
function initializeEquipmentTabs() {
    const playerCards = document.querySelectorAll('.player-card');
    
    playerCards.forEach((card, index) => {
        const classTabs = card.querySelectorAll('.tab-btn');
        const tabContents = card.querySelectorAll('.tab-content');
        
        if (classTabs.length === 0) {
            debugLog(`Card ${index + 1}: No equipment tabs found`, 'warning');
            return;
        }
        
        classTabs.forEach((tab, tabIndex) => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs and content
                classTabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                tab.classList.add('active');
                if (tabContents[tabIndex]) {
                    tabContents[tabIndex].classList.add('active');
                }
                
                const tabName = tab.textContent.trim();
                debugLog(`Player ${index + 1}: Switched to ${tabName} tab`, 'info');
            });
        });
        
        // Set default active tab (Class tab)
        if (classTabs[0]) {
            classTabs[0].classList.add('active');
        }
        if (tabContents[0]) {
            tabContents[0].classList.add('active');
        }
        
        debugLog(`Player ${index + 1}: Equipment tabs initialized`, 'success');
    });
    
    debugLog('Equipment tab system initialized for all players', 'success');
}




// Equipment Data Structure
const equipmentData = {
    weapons: [
        { id: 'sword', name: 'Iron Sword', atk: 10, def: 0, spd: 0, hp: 0, range: 1 },
        { id: 'bow', name: 'Wooden Bow', atk: 8, def: 0, spd: 2, hp: 0, range: 3 },
        { id: 'staff', name: 'Magic Staff', atk: 6, def: 0, spd: 1, hp: 0, range: 2 }
    ],
    armor: [
        { id: 'leather', name: 'Leather Armor', atk: 0, def: 5, spd: 0, hp: 10, range: 0 },
        { id: 'chain', name: 'Chain Mail', atk: 0, def: 8, spd: -1, hp: 15, range: 0 },
        { id: 'plate', name: 'Plate Armor', atk: 0, def: 12, spd: -2, hp: 20, range: 0 }
    ],
    accessories: [
        { id: 'ring', name: 'Power Ring', atk: 3, def: 0, spd: 0, hp: 0, range: 0 },
        { id: 'amulet', name: 'Health Amulet', atk: 0, def: 2, spd: 0, hp: 15, range: 0 },
        { id: 'cloak', name: 'Speed Cloak', atk: 0, def: 0, spd: 3, hp: 0, range: 0 }
    ],
    boots: [
        { id: 'leather_boots', name: 'Leather Boots', atk: 0, def: 1, spd: 2, hp: 0, range: 0 },
        { id: 'iron_boots', name: 'Iron Boots', atk: 0, def: 3, spd: 1, hp: 5, range: 0 },
        { id: 'magic_boots', name: 'Magic Boots', atk: 1, def: 1, spd: 3, hp: 0, range: 0 }
    ]
};

// Player equipment storage
let playerEquipment = {
    1: { weapon: null, armor: null, accessory: null, boots: null },
    2: { weapon: null, armor: null, accessory: null, boots: null },
    3: { weapon: null, armor: null, accessory: null, boots: null },
    4: { weapon: null, armor: null, accessory: null, boots: null }
};

function calculateEquipmentBonus(playerIndex) {
    const equipment = playerEquipment[playerIndex];
    let bonus = { atk: 0, def: 0, spd: 0, hp: 0, range: 0 };
    
    Object.values(equipment).forEach(item => {
        if (item) {
            bonus.atk += item.atk || 0;
            bonus.def += item.def || 0;
            bonus.spd += item.spd || 0;
            bonus.hp += item.hp || 0;
            bonus.range += item.range || 0;
        }
    });
    
    return bonus;
}

function updateEquipmentStats(playerIndex) {
    const playerCard = document.querySelectorAll('.player-card')[playerIndex - 1];
    if (!playerCard) return;
    
    const equipmentStats = playerCard.querySelector('.equipment-stats');
    if (!equipmentStats) return;
    
    const bonus = calculateEquipmentBonus(playerIndex);
    
    equipmentStats.innerHTML = `
        <div>ATK: +${bonus.atk}</div>
        <div>DEF: +${bonus.def}</div>
        <div>SPD: +${bonus.spd}</div>
        <div>HP: +${bonus.hp}</div>
        <div>RNG: +${bonus.range}</div>
    `;
    
    debugLog(`Player ${playerIndex}: Equipment stats updated`, 'info');
}

// Close remaining open blocks
}
}
}

