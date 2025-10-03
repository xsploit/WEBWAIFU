/**
 * Function Differ - Side-by-Side Code Comparison Tool
 * Shows exact differences between duplicate functions
 * Usage: node function-differ.js <functionName>
 */

const fs = require('fs');
const path = require('path');

const functionName = process.argv[2];

if (!functionName) {
    console.log('Usage: node function-differ.js <functionName>');
    console.log('\nExample: node function-differ.js updateVRMPosition');
    console.log('\nAvailable functions to diff:');

    const report = JSON.parse(fs.readFileSync(path.join(__dirname, 'deep-analysis-report.json'), 'utf8'));
    report.trueDuplicates.slice(0, 20).forEach(dup => {
        console.log(`  - ${dup.functionName} (${dup.occurrences.length} occurrences, ${dup.avgSimilarity.toFixed(1)}% similar)`);
    });
    console.log(`  ... and ${report.trueDuplicates.length - 20} more\n`);
    process.exit(0);
}

/**
 * Extract full function code
 */
function getFunctionCode(filename, lineNumber, funcName) {
    try {
        const filepath = path.join(__dirname, filename);
        const content = fs.readFileSync(filepath, 'utf8');
        const lines = content.split('\n');

        let startLine = Math.max(0, lineNumber - 5);
        let bracketCount = 0;
        let inFunction = false;
        let functionLines = [];
        let actualStartLine = 0;

        for (let i = startLine; i < lines.length; i++) {
            const line = lines[i];

            // Detect function start
            if (!inFunction) {
                const patterns = [
                    `function ${funcName}`,
                    `${funcName} =`,
                    `${funcName}:`,
                    `async function ${funcName}`,
                    `function${funcName}` // For minified code
                ];

                if (patterns.some(pattern => line.includes(pattern))) {
                    inFunction = true;
                    actualStartLine = i + 1; // 1-indexed
                }
            }

            if (inFunction) {
                functionLines.push({ num: i + 1, text: line });

                // Count brackets
                for (const char of line) {
                    if (char === '{') bracketCount++;
                    if (char === '}') bracketCount--;
                }

                // Function complete
                if (bracketCount === 0 && functionLines.length > 1) {
                    break;
                }
            }
        }

        return { lines: functionLines, startLine: actualStartLine };
    } catch (error) {
        return null;
    }
}

/**
 * Highlight differences between two strings
 */
function highlightDiff(str1, str2) {
    if (str1 === str2) return { same: true, str1, str2 };

    // Character-level diff markers
    let diff1 = '';
    let diff2 = '';
    const maxLen = Math.max(str1.length, str2.length);

    for (let i = 0; i < maxLen; i++) {
        const c1 = str1[i] || '';
        const c2 = str2[i] || '';

        if (c1 === c2) {
            diff1 += c1;
            diff2 += c2;
        } else {
            diff1 += `[${c1}]`;
            diff2 += `[${c2}]`;
        }
    }

    return { same: false, str1: diff1, str2: diff2 };
}

/**
 * Generate side-by-side diff
 */
function generateDiff(func1, func2) {
    const lines = [];
    const maxLines = Math.max(func1.lines.length, func2.lines.length);

    lines.push('='.repeat(150));
    lines.push(`FUNCTION DIFF: ${functionName}`);
    lines.push('='.repeat(150));
    lines.push('');

    lines.push('LEFT SIDE:'.padEnd(75) + '| RIGHT SIDE:');
    lines.push(`${func1.file}:${func1.startLine}`.padEnd(75) + `| ${func2.file}:${func2.startLine}`);
    lines.push('-'.repeat(75) + '+' + '-'.repeat(74));

    let diffCount = 0;
    let identicalCount = 0;

    for (let i = 0; i < maxLines; i++) {
        const line1 = func1.lines[i] || { num: '', text: '' };
        const line2 = func2.lines[i] || { num: '', text: '' };

        const text1 = line1.text || '';
        const text2 = line2.text || '';

        const diff = highlightDiff(text1, text2);

        if (diff.same) {
            identicalCount++;
            const lineNum = String(line1.num || '').padStart(4);
            const leftSide = `${lineNum} ${text1}`.padEnd(75).substring(0, 75);
            const rightLineNum = String(line2.num || '').padStart(4);
            const rightSide = `${rightLineNum} ${text2}`.substring(0, 74);
            lines.push(`${leftSide}| ${rightSide}`);
        } else {
            diffCount++;
            const lineNum = String(line1.num || '').padStart(4);
            const leftSide = `${lineNum} ${diff.str1}`.padEnd(75).substring(0, 75);
            const rightLineNum = String(line2.num || '').padStart(4);
            const rightSide = `${rightLineNum} ${diff.str2}`.substring(0, 74);
            lines.push(`${leftSide}|!${rightSide}`);
        }
    }

    lines.push('='.repeat(150));
    lines.push(`SUMMARY: ${identicalCount} identical lines, ${diffCount} different lines`);
    lines.push(`Similarity: ${((identicalCount / maxLines) * 100).toFixed(1)}%`);
    lines.push('='.repeat(150));

    return lines.join('\n');
}

/**
 * Main execution
 */
console.log(`\n🔍 Searching for function: ${functionName}\n`);

// Load analysis
const analysisPath = path.join(__dirname, 'code-analysis-report.json');
const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));

// Find function
const funcData = analysis.duplicateFunctions.find(f => f.name === functionName);

if (!funcData) {
    console.log(`❌ Function '${functionName}' not found in duplicate functions list.`);
    console.log(`\nTry one of these functions:\n`);

    analysis.duplicateFunctions.slice(0, 20).forEach(dup => {
        console.log(`  - ${dup.name}`);
    });
    console.log(`  ... and ${analysis.duplicateFunctions.length - 20} more\n`);
    process.exit(1);
}

if (funcData.occurrences.length < 2) {
    console.log(`❌ Function '${functionName}' only has 1 occurrence (need at least 2 to diff)`);
    process.exit(1);
}

console.log(`✅ Found ${funcData.occurrences.length} occurrences of '${functionName}'\n`);

// Extract all function codes
const functions = funcData.occurrences.map(occ => {
    const code = getFunctionCode(occ.file, occ.line, functionName);
    return {
        file: occ.file,
        line: occ.line,
        startLine: code?.startLine,
        lines: code?.lines || []
    };
});

// Generate diffs for all pairs
const diffs = [];
for (let i = 0; i < functions.length - 1; i++) {
    for (let j = i + 1; j < functions.length; j++) {
        const diff = generateDiff(functions[i], functions[j]);
        diffs.push(diff);
        console.log(diff);
        console.log('\n');
    }
}

// Save to file
const outputPath = path.join(__dirname, `diff-${functionName}.txt`);
const fullOutput = diffs.join('\n\n' + '='.repeat(150) + '\n\n');
fs.writeFileSync(outputPath, fullOutput);

console.log(`\n📊 Diff saved to: ${outputPath}\n`);
