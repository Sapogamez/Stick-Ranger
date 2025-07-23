#!/usr/bin/env node

// Integration Test Suite for Stick Ranger Repository
const fs = require('fs');
const path = require('path');

class IntegrationTester {
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

    // Test file existence and syntax
    testFileExistence() {
        this.log('Testing File Existence...', 'test');
        
        // Test CSS files
        const cssFiles = ['style.css', 'style_new.css', 'style_v1.css', 'style_v3.css'];
        cssFiles.forEach(file => {
            const filePath = path.join(__dirname, 'CSS', file);
            this.assert(fs.existsSync(filePath), `CSS file exists: ${file}`);
        });

        // Test HTML files
        const htmlFiles = ['index.html', 'index_new.html', 'index_v1.html', 'index_v2.html', 'index_v3.html'];
        htmlFiles.forEach(file => {
            const filePath = path.join(__dirname, 'HTML', file);
            this.assert(fs.existsSync(filePath), `HTML file exists: ${file}`);
        });

        // Test JavaScript files
        const jsFiles = ['script.js', 'script_new.js', 'script_v1.js', 'script_v2.js', 'script_v3.js', 'script_v4.js'];
        jsFiles.forEach(file => {
            const filePath = path.join(__dirname, 'JavaScript', file);
            this.assert(fs.existsSync(filePath), `JavaScript file exists: ${file}`);
        });
    }

    // Test HTML-CSS integration
    testHTMLCSSIntegration() {
        this.log('Testing HTML-CSS Integration...', 'test');
        
        const htmlFiles = [
            { html: 'HTML/index.html', css: 'CSS/style.css' },
            { html: 'HTML/index_new.html', css: 'CSS/style_new.css' },
            { html: 'HTML/index_v1.html', css: 'CSS/style_v1.css' },
            { html: 'HTML/index_v2.html', css: 'CSS/style_new.css' },
            { html: 'HTML/index_v3.html', css: 'CSS/style_v3_clean.css' }
        ];

        htmlFiles.forEach(({ html, css }) => {
            try {
                const htmlContent = fs.readFileSync(html, 'utf8');
                const cssExists = fs.existsSync(css);
                
                // Check if HTML references the correct CSS
                const cssFileName = path.basename(css);
                const hasCSSReference = htmlContent.includes(cssFileName);
                
                this.assert(cssExists && hasCSSReference, 
                    `HTML-CSS integration: ${path.basename(html)} → ${cssFileName}`);
            } catch (error) {
                this.assert(false, `HTML-CSS integration error: ${html} → ${css}`);
            }
        });
    }

    // Test JavaScript syntax
    testJavaScriptSyntax() {
        this.log('Testing JavaScript Syntax...', 'test');
        
        const jsFiles = ['script.js', 'script_new.js', 'script_v2.js', 'script_v3.js', 'script_v4.js'];
        
        jsFiles.forEach(file => {
            try {
                const filePath = path.join(__dirname, 'JavaScript', file);
                const content = fs.readFileSync(filePath, 'utf8');
                
                // Basic syntax checks
                const hasMatchingBraces = (content.match(/\{/g) || []).length === (content.match(/\}/g) || []).length;
                const hasMatchingParens = (content.match(/\(/g) || []).length === (content.match(/\)/g) || []).length;
                
                this.assert(hasMatchingBraces, `JavaScript braces match: ${file}`);
                this.assert(hasMatchingParens, `JavaScript parentheses match: ${file}`);
                
                // Check for common syntax errors
                const hasUnterminatedString = /['"`][^'"`]*$/.test(content);
                this.assert(!hasUnterminatedString, `No unterminated strings: ${file}`);
                
            } catch (error) {
                this.assert(false, `JavaScript syntax test failed: ${file} - ${error.message}`);
            }
        });
    }

    // Test CSS syntax basic validation
    testCSSSyntax() {
        this.log('Testing CSS Syntax...', 'test');
        
        const cssFiles = ['style.css', 'style_new.css', 'style_v1.css', 'style_v3.css'];
        
        cssFiles.forEach(file => {
            try {
                const filePath = path.join(__dirname, 'CSS', file);
                const content = fs.readFileSync(filePath, 'utf8');
                
                // Basic CSS syntax checks
                const hasMatchingBraces = (content.match(/\{/g) || []).length === (content.match(/\}/g) || []).length;
                this.assert(hasMatchingBraces, `CSS braces match: ${file}`);
                
                // Check for basic CSS structure
                const hasBasicCSS = /\*\s*\{/.test(content) || /body\s*\{/.test(content);
                this.assert(hasBasicCSS, `Has basic CSS structure: ${file}`);
                
            } catch (error) {
                this.assert(false, `CSS syntax test failed: ${file} - ${error.message}`);
            }
        });
    }

    // Generate final report
    generateReport() {
        this.log('='.repeat(60), 'info');
        this.log('🎮 STICK RANGER INTEGRATION TEST REPORT', 'info');
        this.log('='.repeat(60), 'info');
        
        const totalTests = this.passedTests + this.failedTests;
        const successRate = totalTests > 0 ? ((this.passedTests / totalTests) * 100).toFixed(1) : 0;
        
        this.log(`📊 Test Results:`, 'info');
        this.log(`   Total Tests: ${totalTests}`, 'info');
        this.log(`   Passed: ${this.passedTests}`, 'pass');
        this.log(`   Failed: ${this.failedTests}`, 'fail');
        this.log(`   Success Rate: ${successRate}%`, 'info');
        
        if (this.failedTests === 0) {
            this.log('🎉 All tests passed! Repository integration is complete.', 'pass');
        } else {
            this.log(`⚠️  ${this.failedTests} tests failed. Review and fix the issues above.`, 'fail');
        }
        
        return {
            totalTests,
            passedTests: this.passedTests,
            failedTests: this.failedTests,
            successRate: parseFloat(successRate)
        };
    }

    // Run all tests
    runAllTests() {
        this.log('🚀 Starting Stick Ranger Integration Tests...', 'info');
        
        this.testFileExistence();
        this.testHTMLCSSIntegration();
        this.testJavaScriptSyntax();
        this.testCSSSyntax();
        
        return this.generateReport();
    }
}

// Run the tests
const tester = new IntegrationTester();
const results = tester.runAllTests();

// Exit with appropriate code
process.exit(results.failedTests > 0 ? 1 : 0);