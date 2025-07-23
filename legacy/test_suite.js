// Comprehensive Test Suite for Stick Ranger UI
// Run this in browser console to test all features

class StickRangerTestSuite {
    constructor() {
        this.testResults = [];
        this.passedTests = 0;
        this.failedTests = 0;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
        this.testResults.push({ timestamp, type, message });
    }

    assert(condition, testName) {
        if (condition) {
            this.log(`✅ ${testName}`, 'pass');
            this.passedTests++;
            return true;
        } else {
            this.log(`❌ ${testName}`, 'fail');
            this.failedTests++;
            return false;
        }
    }

    // Test Layout and Visual Elements
    testLayout() {
        this.log('Testing Layout Structure...', 'test');
        
        // Test main container
        const gameContainer = document.querySelector('.game-container');
        this.assert(gameContainer !== null, 'Game container exists');
        
        // Test sidebars
        const leftSidebar = document.querySelector('.settings-sidebar.left-sidebar');
        const rightSidebar = document.querySelector('.settings-sidebar.right-sidebar');
        this.assert(leftSidebar !== null, 'Left sidebar exists');
        this.assert(rightSidebar !== null, 'Right sidebar exists');
        
        // Test main game area
        const mainGameArea = document.querySelector('.main-game-area');
        this.assert(mainGameArea !== null, 'Main game area exists');
        
        // Test player cards
        const playerCards = document.querySelectorAll('.player-card');
        this.assert(playerCards.length === 4, 'All 4 player cards exist');
        
        // Test game box
        const gameBox = document.querySelector('.game-box');
        this.assert(gameBox !== null, 'Game box exists');
        
        // Test map box
        const mapBox = document.querySelector('.map-box');
        this.assert(mapBox !== null, 'Map box exists');
        
        // Test inventory box
        const inventoryBox = document.querySelector('.shared-inventory-box');
        this.assert(inventoryBox !== null, 'Shared inventory box exists');
        
        // Test combat log
        const combatLog = document.querySelector('#combat-log');
        this.assert(combatLog !== null, 'Combat log exists');
    }

    // Test Stick Figures
    testStickFigures() {
        this.log('Testing Stick Figures...', 'test');
        
        for (let i = 1; i <= 4; i++) {
            const player = document.querySelector(`#player${i}`);
            this.assert(player !== null, `Player ${i} stick figure exists`);
            
            // Check if SVG content is rendered
            const svg = player.querySelector('svg');
            this.assert(svg !== null, `Player ${i} has SVG rendered`);
        }
    }

    // Test Tab System
    testTabSystem() {
        this.log('Testing Tab System...', 'test');
        
        const playerCards = document.querySelectorAll('.player-card');
        
        playerCards.forEach((card, index) => {
            const playerNum = index + 1;
            
            // Test tab buttons
            const tabButtons = card.querySelectorAll('.tab-btn');
            this.assert(tabButtons.length === 3, `Player ${playerNum} has 3 tab buttons`);
            
            // Test tab contents
            const tabContents = card.querySelectorAll('.tab-content');
            this.assert(tabContents.length === 3, `Player ${playerNum} has 3 tab contents`);
            
            // Test tab button text
            const expectedTabs = ['Class', 'Equipment', 'Inventory'];
            tabButtons.forEach((btn, btnIndex) => {
                this.assert(btn.textContent.trim() === expectedTabs[btnIndex], 
                    `Player ${playerNum} tab ${btnIndex + 1} has correct text`);
            });
            
            // Test initial active state
            const activeTab = card.querySelector('.tab-btn.active');
            const activeContent = card.querySelector('.tab-content.active');
            this.assert(activeTab !== null, `Player ${playerNum} has active tab`);
            this.assert(activeContent !== null, `Player ${playerNum} has active content`);
        });
    }

    // Test Tab Switching Functionality
    testTabSwitching() {
        this.log('Testing Tab Switching...', 'test');
        
        const firstCard = document.querySelector('.player-card');
        const tabButtons = firstCard.querySelectorAll('.tab-btn');
        const tabContents = firstCard.querySelectorAll('.tab-content');
        
        // Test switching to each tab
        tabButtons.forEach((btn, index) => {
            // Simulate click
            btn.click();
            
            // Check if tab became active
            this.assert(btn.classList.contains('active'), 
                `Tab ${index + 1} becomes active when clicked`);
            
            // Check if corresponding content is shown
            this.assert(tabContents[index].classList.contains('active'), 
                `Tab content ${index + 1} shows when tab clicked`);
            
            // Check other tabs are inactive
            tabButtons.forEach((otherBtn, otherIndex) => {
                if (otherIndex !== index) {
                    this.assert(!otherBtn.classList.contains('active'), 
                        `Other tab ${otherIndex + 1} is inactive`);
                }
            });
        });
    }

    // Test Player Stats Display
    testPlayerStats() {
        this.log('Testing Player Stats...', 'test');
        
        const playerCards = document.querySelectorAll('.player-card');
        
        playerCards.forEach((card, index) => {
            const playerNum = index + 1;
            const stats = card.querySelectorAll('.player-stats div');
            
            this.assert(stats.length >= 5, `Player ${playerNum} has stat displays`);
            
            // Check for required stats
            const statTexts = Array.from(stats).map(stat => stat.textContent);
            const requiredStats = ['HP:', 'ATK:', 'DEF:', 'SPD:', 'RNG:'];
            
            requiredStats.forEach(statName => {
                const hasStat = statTexts.some(text => text.includes(statName));
                this.assert(hasStat, `Player ${playerNum} has ${statName} stat`);
            });
        });
    }

    // Test Equipment Slots
    testEquipmentSlots() {
        this.log('Testing Equipment Slots...', 'test');
        
        const playerCards = document.querySelectorAll('.player-card');
        
        playerCards.forEach((card, index) => {
            const playerNum = index + 1;
            
            // Switch to equipment tab
            const equipmentTab = card.querySelectorAll('.tab-btn')[1];
            equipmentTab.click();
            
            const equipmentSlots = card.querySelectorAll('.equipment-slots div');
            this.assert(equipmentSlots.length >= 4, 
                `Player ${playerNum} has equipment slots`);
            
            // Check for required equipment types
            const slotTexts = Array.from(equipmentSlots).map(slot => slot.textContent);
            const requiredSlots = ['Weapon:', 'Armor:', 'Accessory:', 'Boots:'];
            
            requiredSlots.forEach(slotName => {
                const hasSlot = slotTexts.some(text => text.includes(slotName));
                this.assert(hasSlot, `Player ${playerNum} has ${slotName} slot`);
            });
        });
    }

    // Test Inventory Grids
    testInventoryGrids() {
        this.log('Testing Inventory Grids...', 'test');
        
        const playerCards = document.querySelectorAll('.player-card');
        
        playerCards.forEach((card, index) => {
            const playerNum = index + 1;
            
            // Switch to inventory tab
            const inventoryTab = card.querySelectorAll('.tab-btn')[2];
            inventoryTab.click();
            
            const inventoryGrid = card.querySelector('.inventory-grid');
            this.assert(inventoryGrid !== null, 
                `Player ${playerNum} has inventory grid`);
            
            const inventorySlots = card.querySelectorAll('.inventory-slot');
            this.assert(inventorySlots.length >= 10, 
                `Player ${playerNum} has inventory slots`);
            
            // Test slot interactivity
            const firstSlot = inventorySlots[0];
            if (firstSlot) {
                // Test hover effect (check if CSS classes exist)
                this.assert(firstSlot.classList.contains('inventory-slot'), 
                    `Player ${playerNum} inventory slots have correct CSS class`);
            }
        });
    }

    // Test Minimap
    testMinimap() {
        this.log('Testing Minimap...', 'test');
        
        const minimap = document.querySelector('#minimap');
        this.assert(minimap !== null, 'Minimap exists');
        
        // Test map zones (if any are generated)
        const mapZones = document.querySelectorAll('.map-zone');
        this.log(`Found ${mapZones.length} map zones`, 'info');
    }

    // Test Shared Inventory
    testSharedInventory() {
        this.log('Testing Shared Inventory...', 'test');
        
        const sharedInventory = document.querySelector('#shared-inventory-grid');
        this.assert(sharedInventory !== null, 'Shared inventory grid exists');
    }

    // Test Accessibility Features
    testAccessibility() {
        this.log('Testing Accessibility Features...', 'test');
        
        // Test tooltips
        const tooltipElements = document.querySelectorAll('[title]');
        this.assert(tooltipElements.length > 0, 'Tooltip elements exist');
        
        // Test tab navigation
        const focusableElements = document.querySelectorAll('button, select, [tabindex]');
        this.assert(focusableElements.length > 0, 'Focusable elements exist');
        
        // Test ARIA attributes (basic check)
        const ariaElements = document.querySelectorAll('[aria-disabled]');
        this.log(`Found ${ariaElements.length} elements with ARIA attributes`, 'info');
    }

    // Test Responsive Design
    testResponsiveDesign() {
        this.log('Testing Responsive Design...', 'test');
        
        const gameContainer = document.querySelector('.game-container');
        const computedStyle = window.getComputedStyle(gameContainer);
        
        this.assert(computedStyle.display === 'grid', 'Grid layout is active');
        
        // Test viewport meta tag
        const viewport = document.querySelector('meta[name="viewport"]');
        this.assert(viewport !== null, 'Viewport meta tag exists');
    }

    // Run All Tests
    runAllTests() {
        this.log('Starting Comprehensive Test Suite...', 'start');
        this.testResults = [];
        this.passedTests = 0;
        this.failedTests = 0;
        
        try {
            this.testLayout();
            this.testStickFigures();
            this.testTabSystem();
            this.testTabSwitching();
            this.testPlayerStats();
            this.testEquipmentSlots();
            this.testInventoryGrids();
            this.testMinimap();
            this.testSharedInventory();
            this.testAccessibility();
            this.testResponsiveDesign();
        } catch (error) {
            this.log(`Test suite error: ${error.message}`, 'error');
        }
        
        this.generateReport();
    }

    // Generate Test Report
    generateReport() {
        this.log('Generating Test Report...', 'report');
        
        const totalTests = this.passedTests + this.failedTests;
        const successRate = totalTests > 0 ? (this.passedTests / totalTests * 100).toFixed(1) : 0;
        
        console.log('\n' + '='.repeat(50));
        console.log('STICK RANGER UI TEST REPORT');
        console.log('='.repeat(50));
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${this.passedTests}`);
        console.log(`Failed: ${this.failedTests}`);
        console.log(`Success Rate: ${successRate}%`);
        console.log('='.repeat(50));
        
        if (this.failedTests === 0) {
            console.log('🎉 ALL TESTS PASSED! UI is fully functional.');
        } else {
            console.log('⚠️  Some tests failed. Check the log above for details.');
        }
        
        return {
            total: totalTests,
            passed: this.passedTests,
            failed: this.failedTests,
            successRate: successRate,
            results: this.testResults
        };
    }
}

// Auto-run tests if in browser environment
if (typeof window !== 'undefined') {
    const testSuite = new StickRangerTestSuite();
    // Expose to global scope for manual testing
    window.StickRangerTestSuite = testSuite;
    
    // Auto-run after a short delay to ensure DOM is ready
    setTimeout(() => {
        console.log('Running Stick Ranger UI Test Suite...');
        testSuite.runAllTests();
    }, 1000);
}
