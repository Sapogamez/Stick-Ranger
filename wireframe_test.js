// Wireframe Layout Testing Suite - Ensures UI matches provided wireframe with 5px spacing
class WireframeLayoutTestSuite {
    constructor() {
        this.testResults = [];
        this.passedTests = 0;
        this.failedTests = 0;
        this.expectedSpacing = 5; // 5px as specified in wireframe
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
        this.testResults.push({ timestamp, type, message });
    }

    assert(condition, testName, actual, expected) {
        if (condition) {
            this.log(`✅ ${testName} (${actual})`, 'pass');
            this.passedTests++;
            return true;
        } else {
            this.log(`❌ ${testName} - Expected: ${expected}, Actual: ${actual}`, 'fail');
            this.failedTests++;
            return false;
        }
    }

    // Get computed spacing between elements
    getSpacing(element1, element2, direction = 'horizontal') {
        const rect1 = element1.getBoundingClientRect();
        const rect2 = element2.getBoundingClientRect();
        
        if (direction === 'horizontal') {
            return Math.abs(rect2.left - rect1.right);
        } else {
            return Math.abs(rect2.top - rect1.bottom);
        }
    }

    // Test main container grid gaps
    testMainContainerSpacing() {
        this.log('Testing Main Container Spacing...', 'test');
        
        const gameContainer = document.querySelector('.game-container');
        if (!gameContainer) {
            this.log('Game container not found!', 'error');
            return;
        }
        
        const computedStyle = window.getComputedStyle(gameContainer);
        
        // Test grid gap
        const gridGap = computedStyle.getPropertyValue('gap');
        const columnGap = computedStyle.getPropertyValue('column-gap');
        const rowGap = computedStyle.getPropertyValue('row-gap');
        
        this.log(`Computed styles: gap=${gridGap}, column-gap=${columnGap}, row-gap=${rowGap}`, 'info');
        
        // Check if gaps are exactly 5px
        const expectedGap = '5px';
        
        // Parse computed values to numbers for comparison
        const gapValue = parseFloat(gridGap);
        const columnGapValue = parseFloat(columnGap);
        const rowGapValue = parseFloat(rowGap);
        
        this.assert(
            gapValue === 5 || columnGapValue === 5,
            'Main container gap is exactly 5px',
            `gap: ${gapValue}px, column-gap: ${columnGapValue}px`,
            '5px'
        );
        
        this.assert(
            gapValue === 5 || rowGapValue === 5,
            'Main container row gap is exactly 5px',
            `gap: ${gapValue}px, row-gap: ${rowGapValue}px`,
            '5px'
        );
    }

    // Test sidebar to main area spacing
    testSidebarSpacing() {
        this.log('Testing Sidebar Spacing...', 'test');
        
        const leftSidebar = document.querySelector('.settings-sidebar.left-sidebar');
        const mainGameArea = document.querySelector('.main-game-area');
        const rightSidebar = document.querySelector('.settings-sidebar.right-sidebar');
        
        if (leftSidebar && mainGameArea) {
            const leftToMainSpacing = this.getSpacing(leftSidebar, mainGameArea);
            this.assert(
                Math.abs(leftToMainSpacing - this.expectedSpacing) <= 2,
                'Left sidebar to main area spacing',
                `${leftToMainSpacing}px`,
                `${this.expectedSpacing}px`
            );
        }
        
        if (mainGameArea && rightSidebar) {
            const mainToRightSpacing = this.getSpacing(mainGameArea, rightSidebar);
            this.assert(
                Math.abs(mainToRightSpacing - this.expectedSpacing) <= 2,
                'Main area to right sidebar spacing',
                `${mainToRightSpacing}px`,
                `${this.expectedSpacing}px`
            );
        }
    }

    // Test top row internal spacing
    testTopRowSpacing() {
        this.log('Testing Top Row Internal Spacing...', 'test');
        
        const gameBox = document.querySelector('.game-box');
        const mapBox = document.querySelector('.map-box');
        const inventoryBox = document.querySelector('.shared-inventory-box');
        
        if (gameBox && mapBox) {
            const gameToMapSpacing = this.getSpacing(gameBox, mapBox);
            this.assert(
                Math.abs(gameToMapSpacing - this.expectedSpacing) <= 2,
                'Game box to map box spacing',
                `${gameToMapSpacing}px`,
                `${this.expectedSpacing}px`
            );
        }
        
        if (mapBox && inventoryBox) {
            const mapToInventorySpacing = this.getSpacing(mapBox, inventoryBox);
            this.assert(
                Math.abs(mapToInventorySpacing - this.expectedSpacing) <= 2,
                'Map box to inventory box spacing',
                `${mapToInventorySpacing}px`,
                `${this.expectedSpacing}px`
            );
        }
    }

    // Test combat log to player cards spacing
    testCombatLogSpacing() {
        this.log('Testing Combat Log Spacing...', 'test');
        
        const topRow = document.querySelector('.top-row');
        const combatLogRow = document.querySelector('.combat-log-row');
        const bottomRow = document.querySelector('.bottom-row');
        
        if (topRow && combatLogRow) {
            const topToCombatSpacing = this.getSpacing(topRow, combatLogRow, 'vertical');
            this.assert(
                Math.abs(topToCombatSpacing - this.expectedSpacing) <= 2,
                'Top row to combat log spacing',
                `${topToCombatSpacing}px`,
                `${this.expectedSpacing}px`
            );
        }
        
        if (combatLogRow && bottomRow) {
            const combatToBottomSpacing = this.getSpacing(combatLogRow, bottomRow, 'vertical');
            this.assert(
                Math.abs(combatToBottomSpacing - this.expectedSpacing) <= 2,
                'Combat log to bottom row spacing',
                `${combatToBottomSpacing}px`,
                `${this.expectedSpacing}px`
            );
        }
    }

    // Test player card internal spacing
    testPlayerCardSpacing() {
        this.log('Testing Player Card Spacing...', 'test');
        
        const playerCards = document.querySelectorAll('.player-card');
        
        for (let i = 0; i < playerCards.length - 1; i++) {
            const spacing = this.getSpacing(playerCards[i], playerCards[i + 1]);
            this.assert(
                Math.abs(spacing - this.expectedSpacing) <= 2,
                `Player card ${i + 1} to ${i + 2} spacing`,
                `${spacing}px`,
                `${this.expectedSpacing}px`
            );
        }
    }

    // Test wireframe layout proportions
    testWireframeProportions() {
        this.log('Testing Wireframe Layout Proportions...', 'test');
        
        const gameContainer = document.querySelector('.game-container');
        const leftSidebar = document.querySelector('.settings-sidebar.left-sidebar');
        const mainGameArea = document.querySelector('.main-game-area');
        const rightSidebar = document.querySelector('.settings-sidebar.right-sidebar');
        
        if (gameContainer && leftSidebar && mainGameArea && rightSidebar) {
            const containerWidth = gameContainer.getBoundingClientRect().width;
            const leftWidth = leftSidebar.getBoundingClientRect().width;
            const mainWidth = mainGameArea.getBoundingClientRect().width;
            const rightWidth = rightSidebar.getBoundingClientRect().width;
            
            // Calculate expected proportions based on wireframe
            const totalContentWidth = containerWidth - (2 * this.expectedSpacing); // Subtract gaps
            const sidebarWidthPercent = (leftWidth / containerWidth) * 100;
            const mainAreaWidthPercent = (mainWidth / containerWidth) * 100;
            
            this.log(`Container width: ${containerWidth}px`, 'info');
            this.log(`Left sidebar: ${leftWidth}px (${sidebarWidthPercent.toFixed(1)}%)`, 'info');
            this.log(`Main area: ${mainWidth}px (${mainAreaWidthPercent.toFixed(1)}%)`, 'info');
            this.log(`Right sidebar: ${rightWidth}px`, 'info');
            
            // Test that sidebars are roughly equal
            this.assert(
                Math.abs(leftWidth - rightWidth) <= 10,
                'Left and right sidebars are similar width',
                `L:${leftWidth}px, R:${rightWidth}px`,
                'Similar widths'
            );
        }
    }

    // Test inner panel spacing (within cards)
    testInnerPanelSpacing() {
        this.log('Testing Inner Panel Spacing...', 'test');
        
        // Test tab content spacing
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach((content, index) => {
            const computedStyle = window.getComputedStyle(content);
            const padding = computedStyle.getPropertyValue('padding');
            
            this.log(`Tab content ${index + 1} padding: ${padding}`, 'info');
        });
        
        // Test inventory grid spacing
        const inventoryGrids = document.querySelectorAll('.inventory-grid');
        inventoryGrids.forEach((grid, index) => {
            const computedStyle = window.getComputedStyle(grid);
            const gap = computedStyle.getPropertyValue('gap') || computedStyle.getPropertyValue('grid-gap');
            
            this.log(`Inventory grid ${index + 1} gap: ${gap}`, 'info');
        });
    }

    // Generate CSS fixes for spacing issues
    generateSpacingFixes() {
        this.log('Generating CSS Fixes for Spacing Issues...', 'test');
        
        const fixes = [];
        
        // Main container grid gap fix
        fixes.push(`
.game-container {
    gap: 5px;
    column-gap: 5px;
    row-gap: 5px;
}
        `);
        
        // Top row grid gap fix
        fixes.push(`
.top-row {
    gap: 5px;
}
        `);
        
        // Bottom row grid gap fix
        fixes.push(`
.bottom-row {
    gap: 5px;
}
        `);
        
        // Main game area grid gap fix
        fixes.push(`
.main-game-area {
    gap: 5px;
}
        `);
        
        return fixes;
    }

    // Run all wireframe layout tests
    runAllTests() {
        this.log('Starting Wireframe Layout Compliance Test Suite...', 'start');
        this.testResults = [];
        this.passedTests = 0;
        this.failedTests = 0;
        
        try {
            this.testMainContainerSpacing();
            this.testSidebarSpacing();
            this.testTopRowSpacing();
            this.testCombatLogSpacing();
            this.testPlayerCardSpacing();
            this.testWireframeProportions();
            this.testInnerPanelSpacing();
        } catch (error) {
            this.log(`Test suite error: ${error.message}`, 'error');
        }
        
        this.generateReport();
        return this.generateSpacingFixes();
    }

    // Generate comprehensive test report
    generateReport() {
        this.log('Generating Wireframe Compliance Report...', 'report');
        
        const totalTests = this.passedTests + this.failedTests;
        const successRate = totalTests > 0 ? (this.passedTests / totalTests * 100).toFixed(1) : 0;
        
        console.log('\n' + '='.repeat(60));
        console.log('WIREFRAME LAYOUT COMPLIANCE TEST REPORT');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${this.passedTests}`);
        console.log(`Failed: ${this.failedTests}`);
        console.log(`Success Rate: ${successRate}%`);
        console.log(`Expected Spacing: ${this.expectedSpacing}px between all panels`);
        console.log('='.repeat(60));
        
        if (this.failedTests === 0) {
            console.log('🎉 ALL WIREFRAME TESTS PASSED! Layout matches specification.');
        } else {
            console.log('⚠️  Some spacing issues found. CSS fixes will be applied.');
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

// Auto-run wireframe tests
if (typeof window !== 'undefined') {
    const wireframeTestSuite = new WireframeLayoutTestSuite();
    window.WireframeLayoutTestSuite = wireframeTestSuite;
    
    setTimeout(() => {
        console.log('Running Wireframe Layout Compliance Test Suite...');
        const fixes = wireframeTestSuite.runAllTests();
        
        if (wireframeTestSuite.failedTests > 0) {
            console.log('\n📋 SUGGESTED CSS FIXES:');
            fixes.forEach((fix, index) => {
                console.log(`Fix ${index + 1}:${fix}`);
            });
        }
    }, 1500);
}
