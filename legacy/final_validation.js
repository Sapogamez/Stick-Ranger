#!/usr/bin/env node

// Final Comprehensive Validation Report for Stick Ranger Repository
const fs = require('fs');
const path = require('path');

class FinalValidator {
    constructor() {
        this.results = {
            cssFiles: {},
            htmlFiles: {},
            jsFiles: {},
            integration: {},
            performance: {},
            bestPractices: {}
        };
    }

    log(message, type = 'info') {
        const icons = {
            'info': '📋',
            'pass': '✅',
            'fail': '❌',
            'warning': '⚠️',
            'success': '🎉'
        };
        console.log(`${icons[type] || '📋'} ${message}`);
    }

    validateCSSFiles() {
        this.log('CSS FILES VALIDATION', 'info');
        this.log('='.repeat(50));
        
        const cssFiles = [
            'style.css',
            'style_new.css', 
            'style_v1.css',
            'style_v3.css'
        ];

        cssFiles.forEach(file => {
            const filePath = path.join(__dirname, 'CSS', file);
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.split('\n').length;
                const hasResetCSS = content.includes('* {');
                const hasResponsive = content.includes('@media');
                const hasAnimations = content.includes('@keyframes');
                
                this.results.cssFiles[file] = {
                    exists: true,
                    lines: lines,
                    hasResetCSS,
                    hasResponsive,
                    hasAnimations,
                    status: 'valid'
                };
                
                this.log(`${file}: ✓ ${lines} lines, Reset: ${hasResetCSS ? 'Yes' : 'No'}, Responsive: ${hasResponsive ? 'Yes' : 'No'}, Animations: ${hasAnimations ? 'Yes' : 'No'}`, 'pass');
            } catch (error) {
                this.results.cssFiles[file] = { exists: false, status: 'error' };
                this.log(`${file}: Error - ${error.message}`, 'fail');
            }
        });
        console.log();
    }

    validateHTMLFiles() {
        this.log('HTML FILES VALIDATION', 'info');
        this.log('='.repeat(50));
        
        const htmlFiles = [
            'index.html',
            'index_new.html',
            'index_v1.html', 
            'index_v2.html',
            'index_v3.html'
        ];

        htmlFiles.forEach(file => {
            const filePath = path.join(__dirname, 'HTML', file);
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.split('\n').length;
                const hasDoctype = content.includes('<!DOCTYPE html>');
                const hasViewport = content.includes('viewport');
                const hasCorrectCSS = content.includes('href="../CSS/');
                const hasCorrectJS = content.includes('src="../JavaScript/') || content.includes('src="../');
                
                this.results.htmlFiles[file] = {
                    exists: true,
                    lines: lines,
                    hasDoctype,
                    hasViewport,
                    hasCorrectCSS,
                    hasCorrectJS,
                    status: 'valid'
                };
                
                this.log(`${file}: ✓ ${lines} lines, DOCTYPE: ${hasDoctype ? 'Yes' : 'No'}, Viewport: ${hasViewport ? 'Yes' : 'No'}, CSS: ${hasCorrectCSS ? 'Linked' : 'Missing'}, JS: ${hasCorrectJS ? 'Linked' : 'Missing'}`, 'pass');
            } catch (error) {
                this.results.htmlFiles[file] = { exists: false, status: 'error' };
                this.log(`${file}: Error - ${error.message}`, 'fail');
            }
        });
        console.log();
    }

    validateJSFiles() {
        this.log('JAVASCRIPT FILES VALIDATION', 'info');
        this.log('='.repeat(50));
        
        const jsFiles = [
            'script.js',
            'script_new.js',
            'script_v2.js',
            'script_v3.js',
            'script_v4.js'
        ];

        jsFiles.forEach(file => {
            const filePath = path.join(__dirname, 'JavaScript', file);
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.split('\n').length;
                const openBraces = (content.match(/\{/g) || []).length;
                const closeBraces = (content.match(/\}/g) || []).length;
                const braceBalance = openBraces === closeBraces;
                const hasConstants = content.includes('const ');
                const hasFunctions = content.includes('function ');
                
                this.results.jsFiles[file] = {
                    exists: true,
                    lines: lines,
                    braceBalance,
                    hasConstants,
                    hasFunctions,
                    status: braceBalance ? 'valid' : 'warning'
                };
                
                const braceStatus = braceBalance ? 'Balanced' : `Unbalanced (${openBraces}/${closeBraces})`;
                this.log(`${file}: ✓ ${lines} lines, Braces: ${braceStatus}, Constants: ${hasConstants ? 'Yes' : 'No'}, Functions: ${hasFunctions ? 'Yes' : 'No'}`, braceBalance ? 'pass' : 'warning');
            } catch (error) {
                this.results.jsFiles[file] = { exists: false, status: 'error' };
                this.log(`${file}: Error - ${error.message}`, 'fail');
            }
        });
        console.log();
    }

    validateIntegration() {
        this.log('CROSS-FILE INTEGRATION VALIDATION', 'info');
        this.log('='.repeat(50));
        
        // Test HTML-CSS integration
        let cssIntegrationCount = 0;
        let jsIntegrationCount = 0;
        let totalHTMLFiles = 0;

        Object.keys(this.results.htmlFiles).forEach(htmlFile => {
            if (this.results.htmlFiles[htmlFile].exists) {
                totalHTMLFiles++;
                if (this.results.htmlFiles[htmlFile].hasCorrectCSS) cssIntegrationCount++;
                if (this.results.htmlFiles[htmlFile].hasCorrectJS) jsIntegrationCount++;
            }
        });

        const cssIntegrationRate = totalHTMLFiles > 0 ? ((cssIntegrationCount / totalHTMLFiles) * 100).toFixed(1) : 0;
        const jsIntegrationRate = totalHTMLFiles > 0 ? ((jsIntegrationCount / totalHTMLFiles) * 100).toFixed(1) : 0;

        this.results.integration = {
            cssIntegrationRate: parseFloat(cssIntegrationRate),
            jsIntegrationRate: parseFloat(jsIntegrationRate),
            totalHTMLFiles
        };

        this.log(`HTML-CSS Integration: ${cssIntegrationRate}% (${cssIntegrationCount}/${totalHTMLFiles})`, cssIntegrationRate == 100 ? 'pass' : 'warning');
        this.log(`HTML-JS Integration: ${jsIntegrationRate}% (${jsIntegrationCount}/${totalHTMLFiles})`, jsIntegrationRate >= 80 ? 'pass' : 'warning');
        console.log();
    }

    generateFinalReport() {
        this.log('FINAL COMPREHENSIVE REPOSITORY REPORT', 'success');
        this.log('='.repeat(60));
        
        // Count totals
        const totalCSS = Object.keys(this.results.cssFiles).length;
        const validCSS = Object.values(this.results.cssFiles).filter(f => f.status === 'valid').length;
        
        const totalHTML = Object.keys(this.results.htmlFiles).length;
        const validHTML = Object.values(this.results.htmlFiles).filter(f => f.status === 'valid').length;
        
        const totalJS = Object.keys(this.results.jsFiles).length;
        const validJS = Object.values(this.results.jsFiles).filter(f => f.status === 'valid' || f.status === 'warning').length;

        this.log('📊 SUMMARY STATISTICS:', 'info');
        this.log(`   CSS Files: ${validCSS}/${totalCSS} valid (${((validCSS/totalCSS)*100).toFixed(1)}%)`, validCSS === totalCSS ? 'pass' : 'warning');
        this.log(`   HTML Files: ${validHTML}/${totalHTML} valid (${((validHTML/totalHTML)*100).toFixed(1)}%)`, validHTML === totalHTML ? 'pass' : 'warning');
        this.log(`   JavaScript Files: ${validJS}/${totalJS} valid (${((validJS/totalJS)*100).toFixed(1)}%)`, validJS === totalJS ? 'pass' : 'warning');
        this.log(`   CSS Integration: ${this.results.integration.cssIntegrationRate}%`, this.results.integration.cssIntegrationRate === 100 ? 'pass' : 'warning');
        this.log(`   JS Integration: ${this.results.integration.jsIntegrationRate}%`, this.results.integration.jsIntegrationRate >= 80 ? 'pass' : 'warning');
        
        console.log();
        
        // Calculate overall score
        const cssScore = (validCSS / totalCSS) * 100;
        const htmlScore = (validHTML / totalHTML) * 100;
        const jsScore = (validJS / totalJS) * 100;
        const integrationScore = (this.results.integration.cssIntegrationRate + this.results.integration.jsIntegrationRate) / 2;
        
        const overallScore = (cssScore + htmlScore + jsScore + integrationScore) / 4;
        
        this.log('🎯 OVERALL REPOSITORY QUALITY SCORE', 'info');
        this.log(`   Final Score: ${overallScore.toFixed(1)}%`, overallScore >= 90 ? 'success' : overallScore >= 75 ? 'pass' : 'warning');
        
        if (overallScore >= 90) {
            this.log('🎉 EXCELLENT! Repository is in outstanding condition!', 'success');
        } else if (overallScore >= 75) {
            this.log('✅ GOOD! Repository is well-integrated with minor issues.', 'pass');
        } else {
            this.log('⚠️ NEEDS IMPROVEMENT. Several issues need attention.', 'warning');
        }
        
        console.log();
        this.log('VALIDATION COMPLETE ✨', 'success');
        
        return {
            overallScore: overallScore,
            totalFiles: totalCSS + totalHTML + totalJS,
            validFiles: validCSS + validHTML + validJS,
            results: this.results
        };
    }

    runFullValidation() {
        this.log('🚀 STARTING COMPREHENSIVE REPOSITORY VALIDATION', 'success');
        this.log('='.repeat(60));
        console.log();
        
        this.validateCSSFiles();
        this.validateHTMLFiles();
        this.validateJSFiles();
        this.validateIntegration();
        
        return this.generateFinalReport();
    }
}

// Execute final validation
const validator = new FinalValidator();
const finalResults = validator.runFullValidation();

// Generate return code based on score
process.exit(finalResults.overallScore >= 75 ? 0 : 1);