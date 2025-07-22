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
}

function clearDebug() {
    if (debugOutput) {
        debugOutput.innerHTML = '<div class="debug-line">Debug console cleared...</div>';
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
            const enemy = createEnemy(enemyType);
            enemies.push(enemy);
            container.appendChild(enemy.element);
        }
    });
    
    debugLog(`Spawned ${enemies.length} enemies in ${zoneName}`, 'info');
    addCombatLog(`Entered ${zoneName} - ${enemies.length} enemies spotted!`);
}

function createEnemy(enemyData) {
    const element = document.createElement('div');
    element.className = `enemy ${enemyData.type}`;
    
    // Random position in game area
    const gameBox = document.querySelector('.game-box');
    const x = Math.random() * 80 + 10; // 10-90% to avoid edges
    const y = Math.random() * 40 + 20; // 20-60% to stay above grass
    
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
        lastAttack: 0
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
    // Simple combat logic - enemies move towards players, attack if in range
    const playerElements = document.querySelectorAll('.stick-figure');
    const playerPositions = [];
    
    // Get player positions
    playerElements.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        const gameBoxRect = document.querySelector('.game-box').getBoundingClientRect();
        
        const stats = getPlayerStats(index + 1);
        if (!stats) return;
        
        playerPositions.push({
            x: ((rect.left - gameBoxRect.left) / gameBoxRect.width) * 100,
            y: ((rect.top - gameBoxRect.top) / gameBoxRect.height) * 100,
            element: element,
            stats: stats,
            hp: stats.hp,
            maxHp: stats.maxHp,
            index: index + 1,
            lastAttack: element.lastAttack || 0
        });
    });
    
    // Process player attacks first
    playerPositions.forEach(player => {
        if (player.hp <= 0) return;
        
        const now = Date.now();
        const attackCooldown = 3000 - (player.stats.spd * 100); // Faster speed = faster attacks
        
        if (now - player.lastAttack > attackCooldown) {
            // Find enemies in range
            const rangeThreshold = player.stats.range * 3; // Scale range appropriately
            
            enemies.forEach(enemy => {
                if (enemy.hp <= 0) return;
                
                const distance = calculateDistance(player, enemy);
                if (distance <= rangeThreshold) {
                    // Player attacks enemy
                    if (player.stats.className === 'Priest' && player.stats.heal > 0) {
                        // Priest heals instead of attacking
                        healNearbyPlayers(player, playerPositions);
                    } else {
                        const damage = Math.max(1, player.stats.atk - enemy.def);
                        enemy.hp = Math.max(0, enemy.hp - damage);
                        
                        updateEnemyHealth(enemy);
                        addCombatLog(`Player ${player.index} (${player.stats.className}) attacks ${enemy.name} for ${damage} damage!`);
                        
                        if (enemy.hp <= 0) {
                            addCombatLog(`${enemy.name} defeated!`);
                            enemy.element.style.opacity = '0.3';
                            enemy.element.style.pointerEvents = 'none';
                        }
                    }
                    
                    player.element.lastAttack = now;
                    player.lastAttack = now;
                    return; // Attack only one enemy per turn
                }
            });
        }
    });
    
    // Process each enemy
    enemies.forEach(enemy => {
        if (enemy.hp <= 0) return;
        
        // Find nearest living player
        let nearestPlayer = null;
        let nearestDistance = Infinity;
        
        playerPositions.forEach(player => {
            if (player.stats && player.hp > 0) {
                const distance = calculateDistance(enemy, player);
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestPlayer = player;
                }
            }
        });
        
        if (nearestPlayer) {
            // Move towards player if not in range
            const rangeThreshold = enemy.range * 4; // Scale range appropriately
            
            if (nearestDistance > rangeThreshold) {
                const newPos = moveTowards(enemy, nearestPlayer, enemy.spd * 0.8);
                enemy.x = Math.max(5, Math.min(95, newPos.x)); // Keep within bounds
                enemy.y = Math.max(10, Math.min(70, newPos.y)); // Keep above grass
                updateEnemyPosition(enemy);
            } else {
                // Attack if in range and enough time has passed
                const now = Date.now();
                const attackCooldown = 2500 - (enemy.spd * 50);
                
                if (now - enemy.lastAttack > attackCooldown) {
                    const damage = Math.max(1, enemy.atk - (nearestPlayer.stats.def || 0));
                    nearestPlayer.hp = Math.max(0, nearestPlayer.hp - damage);
                    
                    updatePlayerHealth(nearestPlayer.index, nearestPlayer.hp, nearestPlayer.maxHp);
                    addCombatLog(`${enemy.name} attacks Player ${nearestPlayer.index} for ${damage} damage!`);
                    
                    if (nearestPlayer.hp <= 0) {
                        addCombatLog(`Player ${nearestPlayer.index} defeated!`);
                        nearestPlayer.element.style.opacity = '0.5';
                    }
                    
                    enemy.lastAttack = now;
                }
            }
        }
    });
    
    // Check for victory condition
    const aliveEnemies = enemies.filter(e => e.hp > 0).length;
    const alivePlayers = playerPositions.filter(p => p.hp > 0).length;
    
    if (aliveEnemies === 0) {
        addCombatLog('Victory! All enemies defeated!');
        setTimeout(() => {
            spawnEnemies(currentZone); // Respawn enemies
        }, 3000);
    } else if (alivePlayers === 0) {
        addCombatLog('Defeat! All players have fallen!');
        stopBattleLoop();
        autoBattleEnabled = false;
        document.getElementById('auto-battle-btn').classList.remove('active');
        document.getElementById('auto-battle-btn').textContent = 'Auto Battle: OFF';
    }
}

function healNearbyPlayers(priest, playerPositions) {
    const healRange = priest.stats.range * 3;
    let healed = false;
    
    playerPositions.forEach(player => {
        if (player.index === priest.index) return; // Don't heal self
        if (player.hp >= player.maxHp) return; // Already at full health
        
        const distance = calculateDistance(priest, player);
        if (distance <= healRange) {
            const healAmount = priest.stats.heal;
            const oldHp = player.hp;
            player.hp = Math.min(player.maxHp, player.hp + healAmount);
            
            updatePlayerHealth(player.index, player.hp, player.maxHp);
            addCombatLog(`Priest heals Player ${player.index} for ${player.hp - oldHp} HP!`);
            healed = true;
        }
    });
    
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
});
