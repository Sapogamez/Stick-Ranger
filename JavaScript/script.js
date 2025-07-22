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

// (rest of your code continues unchanged, except remove all conflict markers and ensure all functions are properly closed)
