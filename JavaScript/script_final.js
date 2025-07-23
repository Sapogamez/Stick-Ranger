// 🎮 STICK RANGER FINAL RESTORATION - JAVASCRIPT
// Comprehensive game logic with responsive touch support

class StickRangerGame {
    constructor() {
        // Map and level definitions
        this.mapDefinitions = {
            plains: {
                name: 'Plains',
                levels: [
                    {
                        id: 1,
                        name: 'Grassy Fields',
                        enemies: [
                            { type: 'Slime', level: 1, count: 3 },
                            { type: 'Rabbit', level: 2, count: 2 }
                        ],
                        background: 'plains',
                        rewards: {
                            exp: 50,
                            gold: 25,
                            items: ['Wooden Sword', 'Leather Armor']
                        }
                    },
                    {
                        id: 2,
                        name: 'Rolling Hills',
                        enemies: [
                            { type: 'Wolf', level: 3, count: 2 },
                            { type: 'Bandit', level: 4, count: 1 }
                        ],
                        background: 'hills',
                        rewards: {
                            exp: 75,
                            gold: 40,
                            items: ['Iron Sword', 'Chain Mail']
                        }
                    }
                ]
            },
            forest: {
                name: 'Forest',
                levels: [
                    {
                        id: 3,
                        name: 'Dark Woods',
                        enemies: [
                            { type: 'Spider', level: 5, count: 4 },
                            { type: 'Goblin', level: 6, count: 2 }
                        ],
                        background: 'forest',
                        rewards: {
                            exp: 100,
                            gold: 60,
                            items: ['Bow', 'Forest Cloak']
                        }
                    }
                ]
            },
            cave: {
                name: 'Cave',
                levels: [
                    {
                        id: 4,
                        name: 'Crystal Cave',
                        enemies: [
                            { type: 'Bat', level: 7, count: 3 },
                            { type: 'Rock Golem', level: 8, count: 1 }
                        ],
                        background: 'cave',
                        rewards: {
                            exp: 150,
                            gold: 100,
                            items: ['Magic Staff', 'Crystal Armor']
                        }
                    }
                ]
            }
        };

        this.currentZone = 'plains';
        this.currentLevel = 1;
        this.unlockedLevels = new Set([1]); // Start with first level unlocked

        // Class skill definitions
        this.skillDefinitions = {
            Warrior: {
                'Whirlwind': {
                    mpCost: 30,
                    cooldown: 8000,
                    description: 'Spin and deal damage to all nearby enemies',
                    effect: (player, enemies) => {
                        const damage = player.str * 1.5;
                        return enemies.map(enemy => ({
                            target: enemy,
                            damage: damage,
                            type: 'physical'
                        }));
                    }
                },
                'Battle Cry': {
                    mpCost: 45,
                    cooldown: 15000,
                    description: 'Increase party attack power',
                    effect: (player, _, party) => {
                        return party.map(member => ({
                            target: member,
                            buff: { str: Math.floor(player.str * 0.3), duration: 10000 }
                        }));
                    }
                }
            },
            Mage: {
                'Fireball': {
                    mpCost: 40,
                    cooldown: 5000,
                    description: 'Launch a powerful fireball at an enemy',
                    effect: (player, enemies) => [{
                        target: enemies[0],
                        damage: player.int * 2.5,
                        type: 'magic'
                    }]
                },
                'Frost Nova': {
                    mpCost: 65,
                    cooldown: 12000,
                    description: 'Freeze all enemies and deal damage',
                    effect: (player, enemies) => enemies.map(enemy => ({
                        target: enemy,
                        damage: player.int * 1.2,
                        type: 'magic',
                        status: { type: 'frozen', duration: 3000 }
                    }))
                }
            },
            Archer: {
                'Multishot': {
                    mpCost: 35,
                    cooldown: 7000,
                    description: 'Fire arrows at multiple enemies',
                    effect: (player, enemies) => enemies.slice(0, 3).map(enemy => ({
                        target: enemy,
                        damage: player.dex * 1.8,
                        type: 'physical'
                    }))
                },
                'Snipe': {
                    mpCost: 50,
                    cooldown: 10000,
                    description: 'Deal massive damage to a single target',
                    effect: (player, enemies) => [{
                        target: enemies[0],
                        damage: player.dex * 4,
                        type: 'physical',
                        guaranteed: true
                    }]
                }
            },
            Priest: {
                'Mass Heal': {
                    mpCost: 60,
                    cooldown: 10000,
                    description: 'Heal the entire party',
                    effect: (player, _, party) => party.map(member => ({
                        target: member,
                        heal: player.wis * 2
                    }))
                },
                'Divine Shield': {
                    mpCost: 80,
                    cooldown: 20000,
                    description: 'Protect party from damage',
                    effect: (player, _, party) => party.map(member => ({
                        target: member,
                        buff: { def: Math.floor(player.wis * 0.5), duration: 8000 }
                    }))
                }
            }
        };

        this.gameState = {
            players: [
                { 
                    id: 1, class: 'Warrior', level: 15, hp: 180, maxHp: 200, str: 25, def: 20,
                    mp: 100, maxMp: 100, skills: {}, skillCooldowns: {}
                },
                { 
                    id: 2, class: 'Mage', level: 12, mp: 150, maxMp: 160, int: 28, wis: 22,
                    hp: 100, maxHp: 100, skills: {}, skillCooldowns: {}
                },
                { 
                    id: 3, class: 'Archer', level: 13, hp: 140, maxHp: 150, dex: 30, agi: 25,
                    mp: 120, maxMp: 120, skills: {}, skillCooldowns: {}
                },
                { 
                    id: 4, class: 'Priest', level: 11, mp: 180, maxMp: 200, wis: 26, int: 18,
                    hp: 110, maxHp: 110, skills: {}, skillCooldowns: {}
                }
            ],
            enemies: [
                { id: 1, hp: 100, maxHp: 100 },
                { id: 2, hp: 80, maxHp: 100 },
                { id: 3, hp: 60, maxHp: 100 }
            ],
            settings: {
                gameSpeed: 1,
                autoBattle: true,
                instantCombat: false,
                damageMultiplier: 1,
                xpMultiplier: 1,
                guaranteedDrops: false
            },
            autoBattleSettings: {
                autoAttack: true,
                autoSkills: false,
                autoHeal: false
            }
        };

        this.init();
    }

    init() {
        this.initializeEventListeners();
        this.initializeTabSystem();
        this.initializeSettings();
        this.initializeAutoBattle();
        this.initializeCombatLog();
        this.initializeResponsiveFeatures();
        this.initializeSkillStyles();
        this.initializeMapSystem();
        this.startGameLoop();
        
        console.log('🎮 Stick Ranger Final Restoration - Initialized!');
    }

    // ===== EVENT LISTENERS =====
    initializeEventListeners() {
        // Initialize skill buttons for each player
        this.gameState.players.forEach(player => {
            const skills = this.skillDefinitions[player.class];
            if (skills) {
                Object.keys(skills).forEach(skillName => {
                    const skillBtn = document.getElementById(`skill-${player.id}-${skillName.toLowerCase()}`);
                    if (skillBtn) {
                        skillBtn.addEventListener('click', () => this.useSkill(player.id, skillName));
                        skillBtn.addEventListener('mouseover', () => this.showSkillTooltip(player.id, skillName));
                        skillBtn.addEventListener('mouseout', () => this.hideSkillTooltip());
                    }
                });
            }
        });

        // Settings controls
        document.getElementById('game-speed')?.addEventListener('input', (e) => {
            this.updateGameSpeed(parseFloat(e.target.value));
        });

        document.getElementById('damage-multiplier')?.addEventListener('input', (e) => {
            this.updateDamageMultiplier(parseFloat(e.target.value));
        });

        document.getElementById('xp-multiplier')?.addEventListener('input', (e) => {
            this.updateXpMultiplier(parseInt(e.target.value));
        });

        // Checkboxes
        document.getElementById('auto-battle')?.addEventListener('change', (e) => {
            this.gameState.settings.autoBattle = e.target.checked;
        });

        document.getElementById('instant-combat')?.addEventListener('change', (e) => {
            this.gameState.settings.instantCombat = e.target.checked;
        });

        document.getElementById('guaranteed-drops')?.addEventListener('change', (e) => {
            this.gameState.settings.guaranteedDrops = e.target.checked;
        });

        // Player figures (click to select/interact)
        document.querySelectorAll('.stick-figure').forEach((figure, index) => {
            figure.addEventListener('click', () => this.selectPlayer(index + 1));
            figure.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.selectPlayer(index + 1);
                }
            });
        });

        // Enemy interactions
        document.querySelectorAll('.enemy').forEach((enemy, index) => {
            enemy.addEventListener('click', () => this.attackEnemy(index + 1));
            enemy.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.attackEnemy(index + 1);
                }
            });
        });

        // Map interaction
        document.querySelectorAll('.map-region').forEach(region => {
            region.addEventListener('click', (e) => {
                const zone = e.currentTarget.dataset.zone;
                if (zone) {
                    this.selectZone(zone);
                }
            });
        });

        // Level selection
        document.querySelectorAll('.level-node').forEach(node => {
            node.addEventListener('click', (e) => {
                const levelId = parseInt(e.currentTarget.dataset.level);
                if (this.unlockedLevels.has(levelId)) {
                    this.startLevel(levelId);
                } else {
                    this.logCombat('Level locked! Complete previous levels first.');
                }
            });
        });

        // Inventory drag and drop (touch-friendly)
        this.initializeInventoryInteractions();
    }

    // ===== TAB SYSTEM =====
    initializeTabSystem() {
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const tabType = e.target.dataset.tab;
                const playerId = e.target.dataset.player;
                this.switchTab(playerId, tabType);
            });

            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });
        });
    }

    switchTab(playerId, tabType) {
        // Remove active class from all tabs and contents for this player
        const playerCard = document.querySelector(`.player-card:nth-child(${playerId})`);
        if (!playerCard) return;

        playerCard.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        playerCard.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to selected tab and content
        const activeButton = playerCard.querySelector(`[data-tab="${tabType}"]`);
        const activeContent = playerCard.querySelector(`#${tabType}-${playerId}`);

        if (activeButton && activeContent) {
            activeButton.classList.add('active');
            activeContent.classList.add('active');
        }

        this.logCombat(`Player ${playerId} opened ${tabType} tab`);
    }

    // ===== SETTINGS MANAGEMENT =====
    initializeSettings() {
        this.updateGameSpeed(1);
        this.updateDamageMultiplier(1);
        this.updateXpMultiplier(1);
    }

    updateGameSpeed(value) {
        this.gameState.settings.gameSpeed = value;
        const display = document.getElementById('speed-value');
        if (display) display.textContent = `${value}x`;
    }

    updateDamageMultiplier(value) {
        this.gameState.settings.damageMultiplier = value;
        const display = document.getElementById('damage-value');
        if (display) display.textContent = `${value}x`;
    }

    updateXpMultiplier(value) {
        this.gameState.settings.xpMultiplier = value;
        const display = document.getElementById('xp-value');
        if (display) display.textContent = `${value}x`;
    }

    // ===== AUTO BATTLE SYSTEM =====
    initializeAutoBattle() {
        document.querySelectorAll('.auto-battle-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                this.toggleAutoBattleSetting(e.target.id);
            });

            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });
        });

        setInterval(() => {
            if (this.gameState.settings.autoBattle) {
                if (this.gameState.autoBattleSettings.autoAttack) {
                    this.performAutoBattle();
                }
                if (this.gameState.autoBattleSettings.autoSkills) {
                    this.performAutoSkills();
                }
                if (this.gameState.autoBattleSettings.autoHeal) {
                    this.performAutoHeal();
                }
            }
        }, 1000);
    }

    toggleAutoBattleSetting(settingId) {
        const button = document.getElementById(settingId);
        if (!button) return;

        let isActive = false;
        
        switch (settingId) {
            case 'auto-attack':
                this.gameState.autoBattleSettings.autoAttack = !this.gameState.autoBattleSettings.autoAttack;
                isActive = this.gameState.autoBattleSettings.autoAttack;
                button.textContent = `Auto Attack: ${isActive ? 'ON' : 'OFF'}`;
                break;
            case 'auto-skills':
                this.gameState.autoBattleSettings.autoSkills = !this.gameState.autoBattleSettings.autoSkills;
                isActive = this.gameState.autoBattleSettings.autoSkills;
                button.textContent = `Auto Skills: ${isActive ? 'ON' : 'OFF'}`;
                break;
            case 'auto-heal':
                this.gameState.autoBattleSettings.autoHeal = !this.gameState.autoBattleSettings.autoHeal;
                isActive = this.gameState.autoBattleSettings.autoHeal;
                button.textContent = `Auto Heal: ${isActive ? 'ON' : 'OFF'}`;
                break;
        }

        // Update button appearance
        button.classList.toggle('active', isActive);
        
        this.logCombat(`${settingId.replace('-', ' ')} ${isActive ? 'enabled' : 'disabled'}`);
    }

    // ===== COMBAT SYSTEM =====
    initializeCombatLog() {
        this.combatLogElement = document.getElementById('combat-log');
        this.logCombat('Combat system initialized');
        this.logCombat('Ready for battle!');
    }

    logCombat(message) {
        if (!this.combatLogElement) return;

        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.textContent = `[${timestamp}] ${message}`;
        
        this.combatLogElement.appendChild(logEntry);
        this.combatLogElement.scrollTop = this.combatLogElement.scrollHeight;

        // Keep only last 50 messages for performance
        while (this.combatLogElement.children.length > 50) {
            this.combatLogElement.removeChild(this.combatLogElement.firstChild);
        }
    }

    selectPlayer(playerId) {
        const player = this.gameState.players.find(p => p.id === playerId);
        if (player) {
            this.logCombat(`Selected ${player.class} (Level ${player.level})`);
            
            // Visual feedback
            document.querySelectorAll('.stick-figure').forEach((fig, index) => {
                fig.style.transform = index + 1 === playerId ? 'scale(1.2)' : 'scale(1)';
            });
            
            setTimeout(() => {
                document.querySelectorAll('.stick-figure').forEach(fig => {
                    fig.style.transform = 'scale(1)';
                });
            }, 500);
        }
    }

    attackEnemy(enemyId, playerId = null) {
        const enemy = this.gameState.enemies.find(e => e.id === enemyId);
        if (!enemy || enemy.hp <= 0) return;

        const attacker = playerId ? 
            this.gameState.players.find(p => p.id === playerId) :
            this.gameState.players[0]; // Default to first player if not specified

        // Calculate damage based on class and stats
        let damage = this.calculateDamage(attacker, enemy);
        damage *= this.gameState.settings.damageMultiplier;
        
        enemy.hp = Math.max(0, enemy.hp - damage);
        
        this.logCombat(`${attacker.class} attacked Enemy ${enemyId} for ${damage} damage! (${enemy.hp}/${enemy.maxHp} HP)`);
        
        // Update visual HP bar
        this.updateEnemyHealthBar(enemyId, enemy.hp / enemy.maxHp);
        
        if (enemy.hp <= 0) {
            this.logCombat(`Enemy ${enemyId} defeated! +${50 * this.gameState.settings.xpMultiplier} XP`);
            setTimeout(() => this.respawnEnemy(enemyId), 2000);
        }
    }

    respawnEnemy(enemyId) {
        const enemy = this.gameState.enemies.find(e => e.id === enemyId);
        if (enemy) {
            enemy.hp = enemy.maxHp;
            this.updateEnemyHealthBar(enemyId, 1);
            this.logCombat(`New enemy ${enemyId} appears!`);
        }
    }

    updateEnemyHealthBar(enemyId, percentage) {
        const enemyElement = document.getElementById(`enemy${enemyId}`);
        if (!enemyElement) {
            console.error(`Enemy element with ID enemy${enemyId} not found.`);
            return;
        }

        const hpBar = enemyElement.querySelector('.hp-bar');
        if (!hpBar) {
            console.error(`HP bar for enemy${enemyId} not found.`);
            return;
        }

        hpBar.style.width = `${percentage * 100}%`;
    }

    // ===== INVENTORY SYSTEM =====
    initializeInventoryInteractions() {
        document.querySelectorAll('.inventory-slot').forEach(slot => {
            // Mouse events
            slot.addEventListener('dragstart', this.handleDragStart.bind(this));
            slot.addEventListener('dragover', this.handleDragOver.bind(this));
            slot.addEventListener('drop', this.handleDrop.bind(this));
            slot.addEventListener('click', this.handleSlotClick.bind(this));

            // Touch events for mobile
            slot.addEventListener('touchstart', this.handleTouchStart.bind(this));
            slot.addEventListener('touchmove', this.handleTouchMove.bind(this));
            slot.addEventListener('touchend', this.handleTouchEnd.bind(this));

            // Keyboard events
            slot.addEventListener('keydown', this.handleSlotKeydown.bind(this));

            // Make draggable if occupied
            if (slot.classList.contains('occupied')) {
                slot.draggable = true;
                slot.tabIndex = 0;
            }
        });
    }

    handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.textContent);
        e.target.style.opacity = '0.5';
    }

    handleDragOver(e) {
        e.preventDefault();
        e.target.style.backgroundColor = 'rgba(76, 175, 80, 0.3)';
    }

    handleDrop(e) {
        e.preventDefault();
        const data = e.dataTransfer.getData('text/plain');
        
        if (!e.target.classList.contains('occupied')) {
            e.target.textContent = data;
            e.target.classList.add('occupied');
            e.target.draggable = true;
            e.target.tabIndex = 0;
        }
        
        e.target.style.backgroundColor = '';
        this.logCombat(`Item moved: ${data}`);
    }

    handleSlotClick(e) {
        if (e.target.classList.contains('occupied')) {
            const itemName = e.target.textContent;
            this.logCombat(`Selected item: ${itemName}`);
        }
    }

    handleTouchStart(e) {
        this.touchStartTarget = e.target;
        this.touchStartTime = Date.now();
    }

    handleTouchMove(e) {
        e.preventDefault(); // Prevent scrolling
    }

    handleTouchEnd(e) {
        const touchEndTime = Date.now();
        const touchDuration = touchEndTime - this.touchStartTime;

        // Long press (> 500ms) for context menu
        if (touchDuration > 500) {
            this.showItemContextMenu(e.target);
        } else {
            // Regular tap
            this.handleSlotClick(e);
        }
    }

    handleSlotKeydown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.handleSlotClick(e);
        }
    }

    showItemContextMenu(slot) {
        if (slot.classList.contains('occupied')) {
            const itemName = slot.textContent;
            this.logCombat(`Context menu for: ${itemName}`);
            // Here you would show a context menu with options like "Use", "Drop", "Info"
        }
    }

    // ===== RESPONSIVE FEATURES =====
    initializeResponsiveFeatures() {
        // Handle orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });

        // Handle resize events
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));

        // Initialize touch gestures for mobile
        this.initializeTouchGestures();
    }

    handleOrientationChange() {
        this.logCombat('Screen orientation changed');
        // Adjust layout if needed
        this.adjustLayoutForOrientation();
    }

    handleResize() {
        // Adjust UI elements for new viewport size
        this.adjustLayoutForViewport();
    }

    adjustLayoutForOrientation() {
        const isLandscape = window.innerWidth > window.innerHeight;
        const gameContainer = document.querySelector('.game-container');
        
        if (gameContainer) {
            gameContainer.classList.toggle('landscape', isLandscape);
        }
    }

    adjustLayoutForViewport() {
        // Ensure optimal viewing on all screen sizes
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        // Log viewport info for debugging
        if (viewport.width < 480) {
            this.logCombat('Mobile view activated');
        } else if (viewport.width < 768) {
            this.logCombat('Tablet view activated');
        } else {
            this.logCombat('Desktop view activated');
        }
    }

    initializeTouchGestures() {
        let touchStartX, touchStartY;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            // Simple swipe detection
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    this.handleSwipeRight();
                } else {
                    this.handleSwipeLeft();
                }
            }

            touchStartX = null;
            touchStartY = null;
        });
    }

    handleSwipeRight() {
        this.logCombat('Swipe right detected');
        // Implement swipe right functionality (e.g., next player)
    }

    handleSwipeLeft() {
        this.logCombat('Swipe left detected');
        // Implement swipe left functionality (e.g., previous player)
    }

    // ===== GAME LOOP =====
    startGameLoop() {
        this.gameInterval = setInterval(() => {
            this.updateGame();
        }, 1000 / this.gameState.settings.gameSpeed);
    }

    updateGame() {
        // Auto battle logic
        if (this.gameState.settings.autoBattle) {
            if (this.gameState.autoBattleSettings.autoAttack) {
                this.performAutoBattle();
            }
            if (this.gameState.autoBattleSettings.autoSkills) {
                this.performAutoSkills();
            }
        }

        // Update buffs and cooldowns
        this.updateBuffsAndCooldowns();

        // Update animations
        this.updateAnimations();
    }

    calculateDamage(attacker, target) {
        let baseDamage;
        switch (attacker.class) {
            case 'Warrior':
                baseDamage = attacker.str * 1.2;
                break;
            case 'Mage':
                baseDamage = attacker.int * 1.5;
                break;
            case 'Archer':
                baseDamage = attacker.dex * 1.3;
                break;
            case 'Priest':
                baseDamage = attacker.wis * 0.8;
                break;
            default:
                baseDamage = 10;
        }
        
        // Apply random variance (±10%)
        const variance = 0.9 + Math.random() * 0.2;
        return Math.floor(baseDamage * variance);
    }

    createSkillEffect(type, source, targets) {
        // Create effects container if it doesn't exist
        let effectsContainer = document.querySelector('.effects-container');
        if (!effectsContainer) {
            effectsContainer = document.createElement('div');
            effectsContainer.className = 'effects-container';
            document.querySelector('.game-box')?.appendChild(effectsContainer);
        }

        const effect = document.createElement('div');
        effect.className = `skill-effect ${type}`;
        effectsContainer.appendChild(effect);

        // Get source element position, fallback to center if not found
        const sourceElement = document.getElementById(`player${source.id}`);
        if (sourceElement) {
            const sourceRect = sourceElement.getBoundingClientRect();
            effect.style.left = `${sourceRect.left + sourceRect.width / 2}px`;
            effect.style.top = `${sourceRect.top + sourceRect.height / 2}px`;
        } else {
            effect.style.left = '50%';
            effect.style.top = '50%';
        }

        // Apply specific animations based on skill type
        switch (type) {
            case 'whirlwind':
                effect.style.animation = 'spin 1s linear';
                effect.style.width = '100px';
                effect.style.height = '100px';
                effect.style.background = 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)';
                
                // Add particle effects
                const particleInterval = setInterval(() => {
                    const angle = Math.random() * Math.PI * 2;
                    const radius = 50;
                    const particleX = parseFloat(effect.style.left) + Math.cos(angle) * radius;
                    const particleY = parseFloat(effect.style.top) + Math.sin(angle) * radius;
                    this.createParticles(particleX, particleY, 1, 'holy');
                }, 50);
                
                setTimeout(() => clearInterval(particleInterval), 1000);
                break;

            case 'fireball':
                const projectile = document.createElement('div');
                projectile.className = 'projectile fireball';
                effect.appendChild(projectile);
                
                // Add trailing particles
                const trailInterval = setInterval(() => {
                    this.createParticles(
                        parseFloat(effect.style.left),
                        parseFloat(effect.style.top),
                        2,
                        'fire'
                    );
                }, 50);
                
                setTimeout(() => clearInterval(trailInterval), 500);
                break;
            case 'frost-nova':
                effect.style.animation = 'expand 0.8s ease-out';
                effect.style.background = 'radial-gradient(circle, #00ffff 0%, rgba(0,255,255,0.2) 70%)';
                effect.style.width = '200px';
                effect.style.height = '200px';
                
                // Create ice particles in a circular pattern
                for (let i = 0; i < 12; i++) {
                    const angle = (i / 12) * Math.PI * 2;
                    const radius = 100;
                    setTimeout(() => {
                        const x = parseFloat(effect.style.left) + Math.cos(angle) * radius;
                        const y = parseFloat(effect.style.top) + Math.sin(angle) * radius;
                        this.createParticles(x, y, 4, 'ice');
                    }, i * 50);
                }
                break;

            case 'heal':
                targets.forEach(target => {
                    const targetEl = document.getElementById(`player${target.id}`);
                    if (targetEl) {
                        const rect = targetEl.getBoundingClientRect();
                        const centerX = rect.left + rect.width / 2;
                        const centerY = rect.top + rect.height / 2;
                        
                        // Create rising heal particles
                        const particleInterval = setInterval(() => {
                            const offsetX = (Math.random() - 0.5) * rect.width;
                            this.createParticles(
                                centerX + offsetX,
                                centerY,
                                2,
                                'heal'
                            );
                        }, 100);
                        
                        setTimeout(() => clearInterval(particleInterval), 1000);
                        
                        // Create healing sparkle effect
                        const healSparkle = document.createElement('div');
                        healSparkle.className = 'heal-sparkle';
                        healSparkle.style.left = `${centerX}px`;
                        healSparkle.style.top = `${centerY}px`;
                        document.querySelector('.effects-container')?.appendChild(healSparkle);
                        healSparkle.addEventListener('animationend', () => healSparkle.remove());
                    }
                });
                break;
            case 'shield':
                targets.forEach(target => {
                    const targetEl = document.getElementById(`player${target.id}`);
                    if (targetEl) {
                        const rect = targetEl.getBoundingClientRect();
                        const centerX = rect.left + rect.width / 2;
                        const centerY = rect.top + rect.height / 2;
                        
                        // Create shield effect
                        const shield = document.createElement('div');
                        shield.className = 'divine-shield';
                        targetEl.appendChild(shield);
                        
                        // Add orbiting particles
                        let angle = 0;
                        const orbitInterval = setInterval(() => {
                            const radius = rect.width * 0.7;
                            const particleX = centerX + Math.cos(angle) * radius;
                            const particleY = centerY + Math.sin(angle) * radius;
                            this.createParticles(particleX, particleY, 1, 'holy');
                            angle += Math.PI / 8;
                        }, 200);
                        
                        setTimeout(() => {
                            clearInterval(orbitInterval);
                            shield.remove();
                        }, 8000);
                    }
                });
                break;

            case 'multishot':
                targets.forEach((target, index) => {
                    const arrow = document.createElement('div');
                    arrow.className = 'projectile arrow';
                    
                    // Calculate trajectory
                    const sourceRect = document.getElementById(`player${source.id}`)?.getBoundingClientRect();
                    const targetEl = document.getElementById(`enemy${target.id}`);
                    const targetRect = targetEl?.getBoundingClientRect();
                    
                    if (sourceRect && targetRect) {
                        const startX = sourceRect.left + sourceRect.width / 2;
                        const startY = sourceRect.top + sourceRect.height / 2;
                        const endX = targetRect.left + targetRect.width / 2;
                        const endY = targetRect.top + targetRect.height / 2;
                        
                        // Calculate angle for arrow rotation
                        const angle = Math.atan2(endY - startY, endX - startX);
                        arrow.style.transform = `rotate(${angle}rad)`;
                        
                        // Position and animate arrow
                        arrow.style.left = `${startX}px`;
                        arrow.style.top = `${startY}px`;
                        arrow.style.animation = `
                            shoot 0.3s ${index * 0.1}s ease-out,
                            projectile-spin 0.3s ${index * 0.1}s linear
                        `;
                        
                        document.querySelector('.effects-container')?.appendChild(arrow);
                        
                        // Add trailing particles
                        const trailInterval = setInterval(() => {
                            const progress = (Date.now() - startTime) / 300; // 300ms is arrow animation duration
                            if (progress <= 1) {
                                const currentX = startX + (endX - startX) * progress;
                                const currentY = startY + (endY - startY) * progress;
                                this.createParticles(currentX, currentY, 1, 'holy');
                            }
                        }, 50);
                        
                        const startTime = Date.now();
                        setTimeout(() => {
                            clearInterval(trailInterval);
                            arrow.remove();
                        }, 500);
                    }
                });
                break;
        }

        // Remove effect after animation
        setTimeout(() => effect.remove(), 1000);
    }

    useSkill(playerId, skillName) {
        const player = this.gameState.players.find(p => p.id === playerId);
        if (!player) return false;

        const skillDef = this.skillDefinitions[player.class]?.[skillName];
        if (!skillDef) {
            this.logCombat(`${player.class} doesn't have skill: ${skillName}`);
            return false;
        }

        // Check cooldown
        const cooldownEnd = player.skillCooldowns[skillName] || 0;
        if (Date.now() < cooldownEnd) {
            this.logCombat(`${skillName} is still on cooldown!`);
            return false;
        }

        // Check MP cost
        if (player.mp < skillDef.mpCost) {
            this.logCombat(`Not enough MP for ${skillName}!`);
            return false;
        }

        // Get valid targets
        const aliveEnemies = this.gameState.enemies.filter(e => e.hp > 0);
        const aliveParty = this.gameState.players.filter(p => p.hp > 0);

        // Execute skill effect
        const results = skillDef.effect(player, aliveEnemies, aliveParty);

        // Create visual effect based on skill
        switch (skillName) {
            case 'Whirlwind':
                this.createSkillEffect('whirlwind', player, aliveEnemies);
                break;
            case 'Fireball':
                this.createSkillEffect('fireball', player, [aliveEnemies[0]]);
                break;
            case 'Frost Nova':
                this.createSkillEffect('frost-nova', player, aliveEnemies);
                break;
            case 'Mass Heal':
                this.createSkillEffect('heal', player, aliveParty);
                break;
            case 'Divine Shield':
                this.createSkillEffect('shield', player, aliveParty);
                break;
            case 'Multishot':
                this.createSkillEffect('multishot', player, aliveEnemies.slice(0, 3));
                break;
        }

        // Apply effects
        results.forEach(result => {
            if (result.damage) {
                result.target.hp = Math.max(0, result.target.hp - result.damage);
                this.updateEnemyHealthBar(result.target.id, result.target.hp / result.target.maxHp);
            }
            if (result.heal) {
                const target = this.gameState.players.find(p => p.id === result.target.id);
                if (target) {
                    target.hp = Math.min(target.maxHp, target.hp + result.heal);
                    this.updatePlayerHealth(target.id);
                }
            }
            if (result.buff) {
                const target = this.gameState.players.find(p => p.id === result.target.id);
                if (target) {
                    if (!target.buffs) target.buffs = [];
                    target.buffs.push({
                        ...result.buff,
                        endTime: Date.now() + result.buff.duration
                    });
                }
            }
        });

        // Apply costs and cooldown
        player.mp -= skillDef.mpCost;
        player.skillCooldowns[skillName] = Date.now() + skillDef.cooldown;

        this.logCombat(`${player.class} used ${skillName}!`);
        return true;
    }

    updateBuffsAndCooldowns() {
        const now = Date.now();
        this.gameState.players.forEach(player => {
            // Clean up expired buffs
            if (player.buffs) {
                player.buffs = player.buffs.filter(buff => now < buff.endTime);
            }
        });
    }

    performAutoSkills() {
        this.gameState.players.forEach(player => {
            if (player.hp <= 0) return;

            const availableSkills = Object.keys(this.skillDefinitions[player.class] || {});
            for (const skillName of availableSkills) {
                // 10% chance to try using each skill per second
                if (Math.random() < 0.1) {
                    this.useSkill(player.id, skillName);
                }
            }
        });
    }

    performAutoBattle() {
        // Simple auto battle: attack random enemy
        const aliveEnemies = this.gameState.enemies.filter(e => e.hp > 0);
        if (aliveEnemies.length > 0) {
            const randomEnemy = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
            
            // Random chance to auto attack (every few seconds)
            if (Math.random() < 0.1) { // 10% chance per second
                this.attackEnemy(randomEnemy.id);
            }
        }
    }

    updateAnimations() {
        // Clean up any orphaned effects
        const effectsContainer = document.querySelector('.effects-container');
        if (effectsContainer) {
            effectsContainer.querySelectorAll('.skill-effect').forEach(effect => {
                if (!effect.getAttribute('data-cleanup-scheduled')) {
                    effect.setAttribute('data-cleanup-scheduled', 'true');
                    effect.addEventListener('animationend', () => effect.remove());
                }
            });
        }

        // Subtle animations for alive elements
        document.querySelectorAll('.stick-figure').forEach((figure, index) => {
            const player = this.gameState.players[index];
            if (player && (player.hp > 0 || player.mp > 0)) {
                // Slight breathing animation
                figure.style.transform = `scale(${1 + Math.sin(Date.now() * 0.002 + index) * 0.02})`;
            }
        });
    }

    // ===== MAP SYSTEM =====
    selectZone(zoneName) {
        if (this.mapDefinitions[zoneName]) {
            this.currentZone = zoneName;
            this.updateMapDisplay();
            this.logCombat(`Entered ${this.mapDefinitions[zoneName].name} zone`);
        }
    }

    startLevel(levelId) {
        const currentZoneData = this.mapDefinitions[this.currentZone];
        const level = currentZoneData.levels.find(l => l.id === levelId);
        
        if (!level) {
            this.logCombat('Level not found!');
            return;
        }

        this.currentLevel = levelId;
        this.logCombat(`Starting ${level.name}...`);
        
        // Generate and spawn enemies for this level
        this.generateLevelEnemies(level);
        
        // Update map display
        this.updateMapDisplay();
        
        // Update game state for the new level
        this.gameState.currentLevel = level;
        
        // Trigger level start event
        this.onLevelStart(level);
    }

    generateLevelEnemies(level) {
        // Clear existing enemies
        this.gameState.enemies = [];
        
        // Generate new enemies based on level definition
        level.enemies.forEach(enemyDef => {
            for (let i = 0; i < enemyDef.count; i++) {
                const enemy = this.createEnemy(enemyDef.type, enemyDef.level);
                this.gameState.enemies.push(enemy);
            }
        });
        
        // Update enemy display
        this.updateEnemyDisplay();
    }

    createEnemy(type, level) {
        // Base stats for different enemy types
        const enemyStats = {
            Slime: { hp: 50, attack: 5, defense: 2 },
            Wolf: { hp: 80, attack: 8, defense: 3 },
            Bandit: { hp: 100, attack: 12, defense: 5 },
            Spider: { hp: 60, attack: 15, defense: 2 },
            Goblin: { hp: 120, attack: 10, defense: 6 },
            Bat: { hp: 40, attack: 18, defense: 1 },
            'Rock Golem': { hp: 200, attack: 15, defense: 12 }
        };

        const baseStats = enemyStats[type] || enemyStats.Slime;
        const levelMultiplier = 1 + (level - 1) * 0.2; // 20% increase per level

        return {
            id: this.gameState.enemies.length + 1,
            type: type,
            level: level,
            maxHp: Math.floor(baseStats.hp * levelMultiplier),
            hp: Math.floor(baseStats.hp * levelMultiplier),
            attack: Math.floor(baseStats.attack * levelMultiplier),
            defense: Math.floor(baseStats.defense * levelMultiplier)
        };
    }

    updateMapDisplay() {
        // Update zone highlights
        document.querySelectorAll('.map-region').forEach(region => {
            region.classList.toggle('active-region', region.dataset.zone === this.currentZone);
        });

        // Update level nodes
        document.querySelectorAll('.level-node').forEach(node => {
            const levelId = parseInt(node.dataset.level);
            node.classList.toggle('unlocked', this.unlockedLevels.has(levelId));
            node.classList.toggle('current', levelId === this.currentLevel);
        });

        // Update minimap
        this.updateMinimap();
    }

    updateMinimap() {
        const minimap = document.getElementById('minimap');
        if (!minimap) return;

        // Clear existing minimap
        minimap.innerHTML = '';

        // Create zone representation
        const zoneElement = document.createElement('div');
        zoneElement.className = `minimap-zone ${this.currentZone}`;
        
        // Add level markers
        const currentZoneData = this.mapDefinitions[this.currentZone];
        currentZoneData.levels.forEach(level => {
            const levelMarker = document.createElement('div');
            levelMarker.className = `level-marker ${this.unlockedLevels.has(level.id) ? 'unlocked' : 'locked'}`;
            levelMarker.dataset.level = level.id;
            levelMarker.textContent = level.id;
            
            if (level.id === this.currentLevel) {
                levelMarker.classList.add('current');
            }
            
            zoneElement.appendChild(levelMarker);
        });

        minimap.appendChild(zoneElement);
    }

    updateEnemyDisplay() {
        const enemyContainer = document.querySelector('.enemy-container');
        if (!enemyContainer) return;

        enemyContainer.innerHTML = '';
        
        this.gameState.enemies.forEach(enemy => {
            const enemyElement = document.createElement('div');
            enemyElement.className = `enemy ${enemy.type.toLowerCase()}`;
            enemyElement.id = `enemy${enemy.id}`;
            
            const hpBar = document.createElement('div');
            hpBar.className = 'hp-bar';
            hpBar.style.width = '100%';
            
            const enemyInfo = document.createElement('div');
            enemyInfo.className = 'enemy-info';
            enemyInfo.textContent = `${enemy.type} Lv.${enemy.level}`;
            
            enemyElement.appendChild(hpBar);
            enemyElement.appendChild(enemyInfo);
            enemyContainer.appendChild(enemyElement);
            
            enemyElement.addEventListener('click', () => this.attackEnemy(enemy.id));
        });
    }

    onLevelStart(level) {
        // Set up the level background
        const gameBox = document.querySelector('.game-box');
        if (gameBox) {
            gameBox.className = `game-box background-${level.background}`;
        }

        // Initialize level-specific elements
        this.initializeLevelElements(level);

        // Start background music if available
        this.playLevelMusic(level);
    }

    initializeLevelElements(level) {
        // Add any level-specific decorative elements
        const gameBox = document.querySelector('.game-box');
        if (!gameBox) return;

        // Clear existing decorative elements
        const existingDecorations = gameBox.querySelectorAll('.decoration');
        existingDecorations.forEach(dec => dec.remove());

        // Add new decorative elements based on the level theme
        if (level.background === 'forest') {
            this.addForestDecorations(gameBox);
        } else if (level.background === 'cave') {
            this.addCaveDecorations(gameBox);
        }
    }

    addForestDecorations(container) {
        // Add trees, bushes, etc.
        for (let i = 0; i < 5; i++) {
            const tree = document.createElement('div');
            tree.className = 'decoration tree';
            tree.style.left = `${Math.random() * 80 + 10}%`;
            tree.style.bottom = '0';
            container.appendChild(tree);
        }
    }

    addCaveDecorations(container) {
        // Add stalactites, crystals, etc.
        for (let i = 0; i < 3; i++) {
            const crystal = document.createElement('div');
            crystal.className = 'decoration crystal';
            crystal.style.left = `${Math.random() * 80 + 10}%`;
            crystal.style.bottom = '0';
            container.appendChild(crystal);
        }
    }

    playLevelMusic(level) {
        // Implementation would depend on your audio system
        const musicTrack = this.getLevelMusic(level.background);
        if (musicTrack) {
            // Play the music track
            this.logCombat(`Playing ${level.background} theme`);
        }
    }

    getLevelMusic(background) {
        // Map background types to music tracks
        const musicTracks = {
            plains: 'plains-theme.mp3',
            forest: 'forest-theme.mp3',
            cave: 'cave-theme.mp3'
        };
        return musicTracks[background];
    }

    // ===== UTILITY FUNCTIONS =====
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ===== SAVE/LOAD SYSTEM =====
    saveGame() {
        try {
            localStorage.setItem('stickRangerSave', JSON.stringify(this.gameState));
            this.logCombat('Game saved successfully!');
        } catch (error) {
            this.logCombat('Failed to save game');
            console.error('Save error:', error);
        }
    }

    loadGame() {
        try {
            const savedState = localStorage.getItem('stickRangerSave');
            if (savedState) {
                this.gameState = { ...this.gameState, ...JSON.parse(savedState) };
                this.logCombat('Game loaded successfully!');
                return true;
            }
        } catch (error) {
            this.logCombat('Failed to load game');
            console.error('Load error:', error);
        }
        return false;
    }

    saveGameState() {
        localStorage.setItem('stickRangerGameState', JSON.stringify(this.gameState));
        this.logCombat('Game state saved.');
    }

    loadGameState() {
        const savedState = localStorage.getItem('stickRangerGameState');
        if (savedState) {
            this.gameState = JSON.parse(savedState);
            this.logCombat('Game state loaded.');
            this.updateAllHealthBars();
        } else {
            this.logCombat('No saved game state found.');
        }
    }

    updateAllHealthBars() {
        this.gameState.players.forEach(player => {
            const playerHPBar = document.querySelector(`.player-hp-bar-fill[data-width="player-hp-${player.id}"]`);
            if (playerHPBar instanceof HTMLElement) {
                playerHPBar.style.width = `${(player.hp / player.maxHp) * 100}%`;
            }
        });

        this.gameState.enemies.forEach(enemy => {
            this.updateEnemyHealthBar(enemy.id, enemy.hp / enemy.maxHp);
        });
    }

    // ===== ACCESSIBILITY SUPPORT =====
    showSkillTooltip(playerId, skillName) {
        const player = this.gameState.players.find(p => p.id === playerId);
        const skillDef = this.skillDefinitions[player.class][skillName];
        
        const tooltip = document.createElement('div');
        tooltip.className = 'skill-tooltip';
        tooltip.innerHTML = `
            <h3>${skillName}</h3>
            <p>${skillDef.description}</p>
            <div class="tooltip-stats">
                <span>MP Cost: ${skillDef.mpCost}</span>
                <span>Cooldown: ${skillDef.cooldown / 1000}s</span>
            </div>
        `;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip near mouse
        document.addEventListener('mousemove', e => {
            tooltip.style.left = (e.pageX + 10) + 'px';
            tooltip.style.top = (e.pageY + 10) + 'px';
        });
        
        this.activeTooltip = tooltip;
    }
    
    hideSkillTooltip() {
        if (this.activeTooltip) {
            this.activeTooltip.remove();
            this.activeTooltip = null;
        }
    }

    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // Add CSS styles for skill effects
    createParticles(x, y, count, type) {
        const container = document.querySelector('.effects-container');
        if (!container) return;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = `particle ${type}`;
            
            // Random spread
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            const distance = 30 + Math.random() * 60;
            
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            
            // Set initial transform for animation
            const destinationX = Math.cos(angle) * distance;
            const destinationY = Math.sin(angle) * distance;
            
            particle.style.transform = 'translate(-50%, -50%)';
            particle.style.animation = `
                particle-fade ${0.5 + Math.random() * 0.5}s ease-out,
                particle-move-${i} 0.8s ease-out
            `;

            // Create unique keyframe animation for this particle
            const keyframes = document.createElement('style');
            keyframes.textContent = `
                @keyframes particle-move-${i} {
                    0% { transform: translate(-50%, -50%); }
                    100% { transform: translate(calc(-50% + ${destinationX}px), calc(-50% + ${destinationY}px)); }
                }
            `;
            document.head.appendChild(keyframes);

            container.appendChild(particle);
            particle.addEventListener('animationend', () => {
                particle.remove();
                keyframes.remove();
            });
        }
    }

    initializeMapSystem() {
        // Create level nodes for each zone
        Object.entries(this.mapDefinitions).forEach(([zoneName, zoneData]) => {
            const zoneElement = document.querySelector(`.map-region[data-zone="${zoneName}"]`);
            if (!zoneElement) return;

            // Create level nodes
            const levelContainer = document.createElement('div');
            levelContainer.className = 'level-nodes';
            
            zoneData.levels.forEach(level => {
                const levelNode = document.createElement('div');
                levelNode.className = 'level-node';
                levelNode.dataset.level = level.id;
                levelNode.dataset.zone = zoneName;
                
                // Check if level is unlocked
                if (this.unlockedLevels.has(level.id)) {
                    levelNode.classList.add('unlocked');
                }
                
                // Add level number
                const levelNumber = document.createElement('span');
                levelNumber.textContent = level.id;
                levelNode.appendChild(levelNumber);
                
                // Add tooltip with level info
                const tooltip = document.createElement('div');
                tooltip.className = 'level-tooltip';
                tooltip.innerHTML = `
                    <h4>${level.name}</h4>
                    <p>Level ${level.id}</p>
                    <p>Enemies:</p>
                    <ul>
                        ${level.enemies.map(e => `<li>${e.count}x ${e.type} (Lv.${e.level})</li>`).join('')}
                    </ul>
                `;
                levelNode.appendChild(tooltip);
                
                levelContainer.appendChild(levelNode);
                
                // Add event listener
                levelNode.addEventListener('click', () => {
                    if (this.unlockedLevels.has(level.id)) {
                        this.startLevel(level.id);
                    } else {
                        this.logCombat('Level locked! Complete previous levels first.');
                    }
                });
            });
            
            zoneElement.appendChild(levelContainer);
        });

        // Initialize the minimap
        this.updateMapDisplay();

        // Start with the first level
        this.startLevel(1);
    }

    initializeSkillStyles() {
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            .effects-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1000;
                overflow: hidden;
            }
            
            .skill-effect {
                position: absolute;
                pointer-events: none;
                z-index: 100;
                transform: translate(-50%, -50%);
                transition: all 0.3s ease-out;
            }

            @keyframes spin {
                from { transform: translate(-50%, -50%) rotate(0deg); }
                to { transform: translate(-50%, -50%) rotate(360deg); }
            }

            @keyframes fireball {
                0% { transform: scale(0.5) translate(-50%, -50%); opacity: 1; }
                100% { transform: scale(2) translate(-25%, -25%); opacity: 0; }
            }

            @keyframes expand {
                0% { transform: scale(0) translate(-50%, -50%); opacity: 1; }
                100% { transform: scale(1) translate(-50%, -50%); opacity: 0; }
            }

            .heal-sparkle {
                position: absolute;
                width: 20px;
                height: 20px;
                background: radial-gradient(circle, #00ff00 0%, rgba(0,255,0,0) 70%);
                animation: sparkle 1s ease-out;
            }

            @keyframes sparkle {
                0% { transform: scale(0) translate(-50%, -50%); opacity: 1; }
                50% { transform: scale(1) translate(-50%, -50%); opacity: 0.8; }
                100% { transform: scale(1.5) translate(-50%, -50%); opacity: 0; }
            }

            .divine-shield {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                border: 2px solid #ffff00;
                animation: shield 8s ease-in;
                opacity: 0.5;
            }

            @keyframes shield {
                0% { transform: scale(1.2); opacity: 0.8; }
                90% { transform: scale(1.1); opacity: 0.5; }
                100% { transform: scale(1); opacity: 0; }
            }

            .arrow-projectile {
                position: absolute;
                width: 20px;
                height: 4px;
                background: #663300;
                transform-origin: left center;
            }

            @keyframes shoot {
                0% { transform: translateX(0) translateY(0); opacity: 1; }
                100% { transform: translateX(200px) translateY(0); opacity: 0; }
            }

            /* Particle system */
            .particle {
                position: absolute;
                pointer-events: none;
                width: 8px;
                height: 8px;
                border-radius: 50%;
            }

            .particle.fire {
                background: radial-gradient(circle, #ff6600 0%, #ff4400 50%, transparent 100%);
                box-shadow: 0 0 8px #ff4400;
            }

            .particle.ice {
                background: radial-gradient(circle, #00ffff 0%, #00ccff 50%, transparent 100%);
                box-shadow: 0 0 8px #00ccff;
            }

            .particle.heal {
                background: radial-gradient(circle, #33ff33 0%, #00cc00 50%, transparent 100%);
                box-shadow: 0 0 8px #00cc00;
            }

            .particle.holy {
                background: radial-gradient(circle, #ffff00 0%, #ffcc00 50%, transparent 100%);
                box-shadow: 0 0 8px #ffcc00;
            }

            @keyframes particle-fade {
                0% { opacity: 1; transform: scale(1); }
                100% { opacity: 0; transform: scale(0.3); }
            }

            /* Enhanced projectile effects */
            .projectile {
                position: absolute;
                pointer-events: none;
            }

            .projectile.arrow {
                width: 24px;
                height: 6px;
                background: linear-gradient(90deg, #663300, #995500);
                box-shadow: 0 0 4px rgba(0,0,0,0.3);
            }

            .projectile.fireball {
                width: 20px;
                height: 20px;
                background: radial-gradient(circle, #ff6600 0%, #ff4400 60%, transparent 100%);
                box-shadow: 0 0 12px #ff4400;
            }

            .projectile.ice-bolt {
                width: 16px;
                height: 16px;
                background: radial-gradient(circle, #00ffff 0%, #00ccff 60%, transparent 100%);
                box-shadow: 0 0 12px #00ccff;
            }

            /* Status effect styles */
            .frozen {
                filter: brightness(1.2) saturate(0.8) hue-rotate(180deg);
                animation: freeze 0.5s ease-in;
            }

            @keyframes freeze {
                0% { filter: brightness(1) saturate(1) hue-rotate(0deg); }
                100% { filter: brightness(1.2) saturate(0.8) hue-rotate(180deg); }
            }

            /* Enhanced effect animations */
            @keyframes projectile-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            @keyframes projectile-trail {
                0% { opacity: 0.8; transform: scale(1); }
                100% { opacity: 0; transform: scale(0.3); }
            }
        `;
        document.head.appendChild(styleSheet);
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Starting Stick Ranger Final Restoration...');
    window.stickRangerGame = new StickRangerGame();
});

// Auto-save every 30 seconds
setInterval(() => {
    if (window.stickRangerGame) {
        window.stickRangerGame.saveGame();
    }
}, 30000);

// Save before page unload
window.addEventListener('beforeunload', () => {
    if (window.stickRangerGame) {
        window.stickRangerGame.saveGame();
    }
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log(`🚀 Game loaded in ${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms`);
        }, 0);
    });
}
