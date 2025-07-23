// FINAL WIREFRAME SPACING VERIFICATION
console.log('🔍 WIREFRAME SPACING VERIFICATION');
console.log('==================================');

function verifySpacing() {
    const results = [];
    
    // 1. Main container
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
        const style = window.getComputedStyle(gameContainer);
        const gap = parseFloat(style.gap);
        const columnGap = parseFloat(style.columnGap);
        const rowGap = parseFloat(style.rowGap);
        
        console.log(`📦 Game Container:`, {
            gap: gap + 'px',
            columnGap: columnGap + 'px', 
            rowGap: rowGap + 'px',
            gridColumns: style.gridTemplateColumns,
            status: gap === 5 ? '✅' : '❌'
        });
        results.push(['Game Container Gap', gap === 5]);
    }
    
    // 2. Main game area
    const mainArea = document.querySelector('.main-game-area');
    if (mainArea) {
        const style = window.getComputedStyle(mainArea);
        const gap = parseFloat(style.gap);
        
        console.log(`🎮 Main Game Area:`, {
            gap: gap + 'px',
            gridRows: style.gridTemplateRows,
            status: gap === 5 ? '✅' : '❌'
        });
        results.push(['Main Game Area Gap', gap === 5]);
    }
    
    // 3. Top row
    const topRow = document.querySelector('.top-row');
    if (topRow) {
        const style = window.getComputedStyle(topRow);
        const gap = parseFloat(style.gap);
        
        console.log(`🔝 Top Row:`, {
            gap: gap + 'px',
            gridColumns: style.gridTemplateColumns,
            status: gap === 5 ? '✅' : '❌'
        });
        results.push(['Top Row Gap', gap === 5]);
    }
    
    // 4. Bottom row
    const bottomRow = document.querySelector('.bottom-row');
    if (bottomRow) {
        const style = window.getComputedStyle(bottomRow);
        const gap = parseFloat(style.gap);
        
        console.log(`⬇️ Bottom Row:`, {
            gap: gap + 'px',
            gridColumns: style.gridTemplateColumns,
            status: gap === 5 ? '✅' : '❌'
        });
        results.push(['Bottom Row Gap', gap === 5]);
    }
    
    // 5. Stickman row
    const stickmanRow = document.querySelector('.stickman-row');
    if (stickmanRow) {
        const style = window.getComputedStyle(stickmanRow);
        const gap = parseFloat(style.gap);
        
        console.log(`🏃 Stickman Row:`, {
            gap: gap + 'px',
            status: gap === 5 ? '✅' : '❌'
        });
        results.push(['Stickman Row Gap', gap === 5]);
    }
    
    // 6. Inventory grids
    const inventoryGrids = document.querySelectorAll('.inventory-grid');
    inventoryGrids.forEach((grid, index) => {
        const style = window.getComputedStyle(grid);
        const gap = parseFloat(style.gap);
        
        console.log(`📋 Inventory Grid ${index + 1}:`, {
            gap: gap + 'px',
            status: gap === 5 ? '✅' : '❌'
        });
        results.push([`Inventory Grid ${index + 1} Gap`, gap === 5]);
    });
    
    // Summary
    const passed = results.filter(r => r[1]).length;
    const total = results.length;
    const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
    
    console.log('\n📊 SUMMARY:');
    console.log(`Tests Passed: ${passed}/${total} (${percentage}%)`);
    
    if (percentage === 100) {
        console.log('🎉 PERFECT! All spacing matches wireframe (5px)');
    } else {
        console.log('⚠️  Some spacing issues remain:');
        results.forEach(([test, passed]) => {
            if (!passed) console.log(`   ❌ ${test}`);
        });
    }
    
    return {passed, total, percentage, results};
}

// Run verification when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', verifySpacing);
} else {
    verifySpacing();
}
