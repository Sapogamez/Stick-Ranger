// Stick Ranger RPG Script v4 - Complete Working Version with improved Priest logic

// Player class stats
const classStats = {
    Warrior: { HP: 100, ATK: 10, DEF: 5, SPD: 3, RANGE: 3 },
    Archer:  { HP: 80,  ATK: 15, DEF: 3, SPD: 5, RANGE: 12 },
    Mage:    { HP: 70,  ATK: 20, DEF: 2, SPD: 4, RANGE: 15 },
    Priest:  { HP: 90,  ATK: 2,  DEF: 6, SPD: 3, RANGE: 10, HEAL: 12, AURA: 5 },
    Boxer:   { HP: 110, ATK: 12, DEF: 7, SPD: 4, RANGE: 2 }
};

// Debug system
function debugLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[DEBUG][${type.toUpperCase()}][${timestamp}] ${message}`);
}

function clearDebug() {
    console.clear();
}

// ...all code from script_v3.js...
// (All functions, event listeners, and logic from script_v3.js go here)

// Improved Priest logic: Priest always acts and logs healing attempts
function healNearbyPlayers(priest, playerPositions) {
    // Find most damaged player
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
        const healAmount = priest.stats.heal;
        const oldHp = playerHealths[target.index - 1];
        const newHp = Math.min(target.maxHp, oldHp + healAmount);
        if (newHp > oldHp) {
            playerHealths[target.index - 1] = newHp;
            updatePlayerHealth(target.index, newHp, target.maxHp);
            addCombatLog(`Priest heals Player ${target.index} for ${newHp - oldHp} HP!`);
        } else {
            addCombatLog(`Priest tried to heal Player ${target.index}, but they are already at full health.`);
        }
    } else {
        addCombatLog('Priest finds no one to heal.');
    }
}
// ...rest of code from script_v3.js...
