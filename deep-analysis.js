/**
 * Deep Code Analysis - Verify Duplicates & Generate Cleanup Report
 * Checks if duplicates are truly identical, or if they serve different purposes
 * Provides actionable recommendations for code cleanup
 */

const fs = require('fs');
const path = require('path');

// Load the analysis report
const reportPath = path.join(__dirname, 'code-analysis-report.json');
const analysis = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

const deepReport = {
    trueDuplicates: [],
    functionalDifferences: [],
    recommendations: [],
    stats: {
        totalDuplicates: 0,
        trueDuplicates: 0,
        functionallyDifferent: 0,
        canMerge: 0,
        mustKeepSeparate: 0
    }
};

/**
 * Read file content for a specific function
 */
function getFunctionCode(filename, lineNumber, functionName) {
    try {
        const filepath = path.join(__dirname, filename);
        const content = fs.readFileSync(filepath, 'utf8');
        const lines = content.split('\n');

        // Find the function starting at or near the line number
        let startLine = Math.max(0, lineNumber - 1);
        let bracketCount = 0;
        let inFunction = false;
        let functionCode = [];

        for (let i = startLine; i < lines.length; i++) {
            const line = lines[i];

            if (!inFunction && line.includes(`function ${functionName}`) ||
                line.includes(`${functionName} =`) ||
                line.includes(`${functionName}:`)) {
                inFunction = true;
            }

            if (inFunction) {
                functionCode.push(line);

                // Count brackets
                for (const char of line) {
                    if (char === '{') bracketCount++;
                    if (char === '}') bracketCount--;
                }

                // Function complete
                if (bracketCount === 0 && functionCode.length > 1) {
                    break;
                }
            }
        }

        return functionCode.join('\n').trim();
    } catch (error) {
        return null;
    }
}

/**
 * Normalize code for comparison (remove whitespace, comments)
 */
function normalizeCode(code) {
    if (!code) return '';

    return code
        .replace(/\/\/.*$/gm, '') // Remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
}

/**
 * Calculate similarity between two code blocks
 */
function calculateSimilarity(code1, code2) {
    const norm1 = normalizeCode(code1);
    const norm2 = normalizeCode(code2);

    if (norm1 === norm2) return 100;
    if (!norm1 || !norm2) return 0;

    // Simple character-based similarity
    const longer = norm1.length > norm2.length ? norm1 : norm2;
    const shorter = norm1.length > norm2.length ? norm2 : norm1;

    let matches = 0;
    for (let i = 0; i < shorter.length; i++) {
        if (longer[i] === shorter[i]) matches++;
    }

    return Math.round((matches / longer.length) * 100);
}

/**
 * Determine if functions should be merged
 */
function analyzeFunction(funcName, occurrences) {
    if (occurrences.length < 2) return null;

    const codes = occurrences.map(occ => {
        const code = getFunctionCode(occ.file, occ.line, funcName);
        return { ...occ, code };
    });

    // Compare all pairs
    const comparisons = [];
    for (let i = 0; i < codes.length - 1; i++) {
        for (let j = i + 1; j < codes.length; j++) {
            const similarity = calculateSimilarity(codes[i].code, codes[j].code);
            comparisons.push({
                pair: `${codes[i].file}:${codes[i].line} <-> ${codes[j].file}:${codes[j].line}`,
                similarity,
                code1Length: codes[i].code?.length || 0,
                code2Length: codes[j].code?.length || 0
            });
        }
    }

    const avgSimilarity = comparisons.reduce((sum, c) => sum + c.similarity, 0) / comparisons.length;

    return {
        functionName: funcName,
        occurrences: codes.map(c => ({
            file: c.file,
            line: c.line,
            length: c.code?.length || 0,
            preview: c.code?.substring(0, 150) || '[Could not read]'
        })),
        comparisons,
        avgSimilarity,
        recommendation: getRecommendation(funcName, codes, avgSimilarity)
    };
}

/**
 * Generate recommendation for function
 */
function getRecommendation(funcName, codes, similarity) {
    // Check if it's index.html vs script.js duplication
    const hasIndexHTML = codes.some(c => c.file === 'index.html');
    const hasScriptJS = codes.some(c => c.file === 'script.js');

    if (similarity > 90) {
        if (hasIndexHTML && hasScriptJS) {
            return {
                action: 'MERGE',
                priority: 'HIGH',
                reason: `${similarity}% identical - Remove from script.js, keep in index.html inline script`,
                details: 'These are essentially identical. The inline script in index.html is what\'s being used.'
            };
        }
        return {
            action: 'MERGE',
            priority: 'HIGH',
            reason: `${similarity}% identical - Consolidate to single implementation`,
            details: 'Nearly identical implementations found in multiple locations'
        };
    } else if (similarity > 60) {
        return {
            action: 'REVIEW',
            priority: 'MEDIUM',
            reason: `${similarity}% similar - May have intentional differences`,
            details: 'Review to determine if differences are intentional or can be unified'
        };
    } else {
        return {
            action: 'KEEP_SEPARATE',
            priority: 'LOW',
            reason: `Only ${similarity}% similar - Different implementations`,
            details: 'These appear to be different implementations, possibly for different contexts'
        };
    }
}

/**
 * Analyze all duplicate functions
 */
function analyzeDuplicateFunctions() {
    console.log('🔍 Deep analyzing duplicate functions...\n');

    analysis.duplicateFunctions.forEach((dup, index) => {
        const result = analyzeFunction(dup.name, dup.occurrences);

        if (result) {
            if (result.avgSimilarity > 90) {
                deepReport.trueDuplicates.push(result);
                deepReport.stats.trueDuplicates++;
            } else {
                deepReport.functionalDifferences.push(result);
                deepReport.stats.functionallyDifferent++;
            }

            if (result.recommendation.action === 'MERGE') {
                deepReport.stats.canMerge++;
            } else if (result.recommendation.action === 'KEEP_SEPARATE') {
                deepReport.stats.mustKeepSeparate++;
            }

            deepReport.recommendations.push(result.recommendation);
        }

        deepReport.stats.totalDuplicates++;

        // Progress indicator
        if ((index + 1) % 10 === 0) {
            console.log(`  Analyzed ${index + 1}/${analysis.duplicateFunctions.length} functions...`);
        }
    });

    console.log(`✅ Analyzed ${analysis.duplicateFunctions.length} duplicate functions\n`);
}

/**
 * Generate detailed report
 */
function generateDetailedReport() {
    const reportLines = [];

    reportLines.push('='.repeat(100));
    reportLines.push('DEEP CODE ANALYSIS REPORT - DUPLICATE VERIFICATION');
    reportLines.push('='.repeat(100));
    reportLines.push('');

    // Executive Summary
    reportLines.push('EXECUTIVE SUMMARY');
    reportLines.push('-'.repeat(100));
    reportLines.push(`Total Duplicate Function Names: ${deepReport.stats.totalDuplicates}`);
    reportLines.push(`True Duplicates (>90% similar): ${deepReport.stats.trueDuplicates}`);
    reportLines.push(`Functionally Different (<90% similar): ${deepReport.stats.functionallyDifferent}`);
    reportLines.push(`Can Be Merged: ${deepReport.stats.canMerge}`);
    reportLines.push(`Should Keep Separate: ${deepReport.stats.mustKeepSeparate}`);
    reportLines.push('');

    // Critical Issue
    reportLines.push('⚠️  CRITICAL ISSUE IDENTIFIED:');
    reportLines.push('Your codebase has BOTH index.html (with inline <script>) AND script.js files.');
    reportLines.push('Most functions are duplicated between these two files.');
    reportLines.push('Currently, index.html is being used (script.js is likely not imported).');
    reportLines.push('');

    // True Duplicates Section
    reportLines.push('='.repeat(100));
    reportLines.push('TRUE DUPLICATES - CAN BE MERGED (>90% Similar)');
    reportLines.push('='.repeat(100));
    reportLines.push('');

    deepReport.trueDuplicates
        .sort((a, b) => b.avgSimilarity - a.avgSimilarity)
        .forEach((dup, index) => {
            reportLines.push(`${index + 1}. ${dup.functionName} (${dup.avgSimilarity.toFixed(1)}% similar)`);
            reportLines.push('   ' + '-'.repeat(96));

            dup.occurrences.forEach(occ => {
                reportLines.push(`   📍 ${occ.file}:${occ.line} (${occ.length} chars)`);
                reportLines.push(`      ${occ.preview.substring(0, 80)}...`);
            });

            reportLines.push('');
            reportLines.push(`   🔧 RECOMMENDATION: ${dup.recommendation.action} - ${dup.recommendation.priority} PRIORITY`);
            reportLines.push(`   💡 ${dup.recommendation.reason}`);
            reportLines.push(`   📝 ${dup.recommendation.details}`);
            reportLines.push('');
        });

    // Functional Differences Section
    reportLines.push('='.repeat(100));
    reportLines.push('FUNCTIONALLY DIFFERENT - REVIEW NEEDED (60-90% Similar)');
    reportLines.push('='.repeat(100));
    reportLines.push('');

    deepReport.functionalDifferences
        .filter(dup => dup.avgSimilarity >= 60)
        .sort((a, b) => b.avgSimilarity - a.avgSimilarity)
        .forEach((dup, index) => {
            reportLines.push(`${index + 1}. ${dup.functionName} (${dup.avgSimilarity.toFixed(1)}% similar)`);
            reportLines.push('   ' + '-'.repeat(96));

            dup.occurrences.forEach(occ => {
                reportLines.push(`   📍 ${occ.file}:${occ.line} (${occ.length} chars)`);
            });

            reportLines.push('');
            reportLines.push(`   🔧 RECOMMENDATION: ${dup.recommendation.action}`);
            reportLines.push(`   💡 ${dup.recommendation.reason}`);
            reportLines.push('');
        });

    // Keep Separate Section
    reportLines.push('='.repeat(100));
    reportLines.push('KEEP SEPARATE - Different Implementations (<60% Similar)');
    reportLines.push('='.repeat(100));
    reportLines.push('');

    const keepSeparate = deepReport.functionalDifferences
        .filter(dup => dup.avgSimilarity < 60)
        .sort((a, b) => a.avgSimilarity - b.avgSimilarity);

    reportLines.push(`Found ${keepSeparate.length} function names with different implementations.`);
    reportLines.push('These likely serve different purposes in different contexts.');
    reportLines.push('');

    keepSeparate.slice(0, 10).forEach((dup, index) => {
        reportLines.push(`${index + 1}. ${dup.functionName} (${dup.avgSimilarity.toFixed(1)}% similar)`);
        dup.occurrences.forEach(occ => {
            reportLines.push(`   📍 ${occ.file}:${occ.line}`);
        });
        reportLines.push('');
    });

    if (keepSeparate.length > 10) {
        reportLines.push(`... and ${keepSeparate.length - 10} more`);
        reportLines.push('');
    }

    // Empty Functions Section
    reportLines.push('='.repeat(100));
    reportLines.push('EMPTY OR STUB FUNCTIONS');
    reportLines.push('='.repeat(100));
    reportLines.push('');

    analysis.emptyFunctions.forEach((func, index) => {
        reportLines.push(`${index + 1}. ${func.name} (${func.type})`);
        reportLines.push(`   📍 ${func.file}:${func.line}`);
        if (func.content) reportLines.push(`   💬 "${func.content}"`);
        reportLines.push(`   🔧 RECOMMENDATION: ${func.type === 'empty' ? 'Remove or implement' : 'Implement or remove placeholder'}`);
        reportLines.push('');
    });

    // Action Plan
    reportLines.push('='.repeat(100));
    reportLines.push('RECOMMENDED ACTION PLAN');
    reportLines.push('='.repeat(100));
    reportLines.push('');

    reportLines.push('Phase 1: IMMEDIATE (High Priority)');
    reportLines.push('-'.repeat(100));
    reportLines.push('1. Decide architecture: Keep code in index.html OR move to script.js');
    reportLines.push('   - Currently index.html has inline <script> with all functions');
    reportLines.push('   - script.js appears to be unused/legacy code');
    reportLines.push('   - RECOMMENDATION: Either remove script.js OR refactor to use script.js properly');
    reportLines.push('');
    reportLines.push(`2. Merge ${deepReport.stats.trueDuplicates} true duplicate functions`);
    reportLines.push('   - These are >90% identical and serve the same purpose');
    reportLines.push('   - Keep the version in index.html, remove from script.js');
    reportLines.push('');
    reportLines.push(`3. Implement or remove ${analysis.emptyFunctions.length} stub functions`);
    reportLines.push('   - generateCharacter, applyCharacterToChat need implementation');
    reportLines.push('   - clearConversationHistory, forceRefreshOllamaModelsFromHTML need implementation or removal');
    reportLines.push('');

    reportLines.push('Phase 2: REVIEW (Medium Priority)');
    reportLines.push('-'.repeat(100));
    reportLines.push('1. Review functions with 60-90% similarity');
    reportLines.push('   - Determine if differences are intentional');
    reportLines.push('   - Consolidate if appropriate');
    reportLines.push('');

    reportLines.push('Phase 3: OPTIMIZATION (Low Priority)');
    reportLines.push('-'.repeat(100));
    reportLines.push('1. Remove duplicate strings (create constants)');
    reportLines.push('2. Refactor duplicate code blocks into reusable functions');
    reportLines.push('');

    reportLines.push('='.repeat(100));
    reportLines.push('END OF REPORT');
    reportLines.push('='.repeat(100));

    return reportLines.join('\n');
}

/**
 * Main execution
 */
console.log('🔍 Starting deep code analysis...\n');
console.log(`Loaded analysis with ${analysis.duplicateFunctions.length} duplicate functions\n`);

analyzeDuplicateFunctions();

const report = generateDetailedReport();
console.log(report);

// Save reports
const textReportPath = path.join(__dirname, 'DEEP-ANALYSIS-REPORT.md');
fs.writeFileSync(textReportPath, report);

const jsonReportPath = path.join(__dirname, 'deep-analysis-report.json');
fs.writeFileSync(jsonReportPath, JSON.stringify(deepReport, null, 2));

console.log('\n📊 Reports saved:');
console.log(`   - ${textReportPath}`);
console.log(`   - ${jsonReportPath}`);
console.log('\n✅ Deep analysis complete!\n');
