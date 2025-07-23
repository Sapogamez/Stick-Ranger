// Player class stats
const classStats = {
    Warrior: { 
        HP: 100, ATK: 10, DEF: 5, SPD: 3, RANGE: 3,
        level: 1,
        statGrowth: { HP: 10, ATK: 2, DEF: 1, SPD: 0.2 },
        special: {
            name: "Berserk",
            description: "Increases ATK when HP is low",
            trigger: stats => stats.HP < stats.maxHP * 0.3,
            effect: stats => ({ ATK: stats.ATK * 1.5 })
        }
    },
    Archer: { 
        HP: 80, ATK: 15, DEF: 3, SPD: 5, RANGE: 12,
        level: 1,
        statGrowth: { HP: 7, ATK: 3, DEF: 0.5, SPD: 0.3 },
        special: {
            name: "Precise Shot",
            description: "Chance to deal critical damage",
            trigger: () => Math.random() < 0.2,
            effect: stats => ({ ATK: stats.ATK * 2 })
        }
    },
    Mage: { 
        HP: 70, ATK: 20, DEF: 2, SPD: 4, RANGE: 15,
        level: 1,
        statGrowth: { HP: 5, ATK: 4, DEF: 0.3, SPD: 0.2 },
        special: {
            name: "Arcane Burst",
            description: "Periodic AoE damage",
            trigger: () => true,
            effect: stats => ({ AOE: true, RANGE: stats.RANGE * 1.5 })
        }
    },
    Priest: { 
        HP: 90, ATK: 2, DEF: 6, SPD: 3, RANGE: 10, HEAL: 12, AURA: 5,
        level: 1,
        statGrowth: { HP: 8, HEAL: 2, DEF: 1, SPD: 0.2, AURA: 0.5 },
        special: {
            name: "Divine Blessing",
            description: "Heals allies and boosts their stats",
            trigger: () => true,
            effect: stats => ({ HEAL: stats.HEAL * 1.2, AURA: stats.AURA * 1.2 })
        }
    },
    Boxer: { 
        HP: 110, ATK: 12, DEF: 7, SPD: 4, RANGE: 2,
        level: 1,
        statGrowth: { HP: 12, ATK: 2.5, DEF: 1.5, SPD: 0.4 },
        special: {
            name: "Combo Strike",
            description: "Consecutive hits increase damage",
            trigger: (stats, hits) => hits > 0,
            effect: (stats, hits) => ({ ATK: stats.ATK * (1 + hits * 0.1) })
        }
    }
};

// Test that script is loading
console.log('Script loaded! Class stats:', classStats);

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
    
    // Initialize current HP if not set
    if (!stats.currentHP) {
        stats.currentHP = stats.HP;
    }
    
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
    debugLog(
        `New stats: HP:${stats.HP} ATK:${stats.ATK} DEF:${stats.DEF} SPD:${stats.SPD} RANGE:${stats.RANGE}` +
        (className === 'Priest' ? ` HEAL:${stats.HEAL} AURA:${stats.AURA}` : (auraBonus ? ` +AURA:${auraBonus}` : '')), 'info'
    );

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

        // Update stat displays
        if (statDivs[0]) statDivs[0].innerHTML = `HP: <span>${stats.HP}</span>`;
        if (statDivs[1]) statDivs[1].innerHTML = `ATK: <span>${stats.ATK}</span>`;
        if (statDivs[2]) statDivs[2].innerHTML = `DEF: <span>${stats.DEF}</span>`;
        if (statDivs[3]) statDivs[3].innerHTML = `SPD: <span>${stats.SPD}</span>`;
        if (statDivs[4]) statDivs[4].innerHTML = `RANGE: <span>${stats.RANGE}</span>`;
        
        debugLog('Player stats updated successfully', 'success');
        
    } catch (error) {
        debugLog(`ERROR updating player stats: ${error.message}`, 'error');
    }
}
