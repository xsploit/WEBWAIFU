/**
 * Code Analysis Suite
 * Finds duplicate code, functions, strings, empty functions, and redundancies
 * Usage: node code-analyzer.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    targetFiles: ['index.html', 'script.js', 'whisper-worker.js'],
    minStringLength: 20, // Minimum length for duplicate string detection
    minCodeBlockLength: 50, // Minimum length for duplicate code block detection
    excludePatterns: [/node_modules/, /old_files/, /backup/]
};

// Results storage
const results = {
    duplicateFunctions: [],
    emptyFunctions: [],
    duplicateStrings: [],
    duplicateCodeBlocks: [],
    unusedFunctions: [],
    redundantEventHandlers: []
};

/**
 * Extract functions from code
 */
function extractFunctions(code, filename) {
    const functions = [];

    // Match function declarations and expressions
    const patterns = [
        /function\s+(\w+)\s*\([^)]*\)\s*{([^}]*)}/g,
        /const\s+(\w+)\s*=\s*function\s*\([^)]*\)\s*{([^}]*)}/g,
        /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*{([^}]*)}/g,
        /(\w+)\s*:\s*function\s*\([^)]*\)\s*{([^}]*)}/g,
        /async\s+function\s+(\w+)\s*\([^)]*\)\s*{([^}]*)}/g
    ];

    patterns.forEach(pattern => {
        let match;
        const regex = new RegExp(pattern.source, pattern.flags);
        while ((match = regex.exec(code)) !== null) {
            const name = match[1];
            const body = match[2] || '';
            const fullMatch = match[0];

            functions.push({
                name,
                body: body.trim(),
                fullCode: fullMatch,
                file: filename,
                line: code.substring(0, match.index).split('\n').length
            });
        }
    });

    return functions;
}

/**
 * Find duplicate functions (same name, different implementations)
 */
function findDuplicateFunctions(allFunctions) {
    const functionMap = {};

    allFunctions.forEach(func => {
        if (!functionMap[func.name]) {
            functionMap[func.name] = [];
        }
        functionMap[func.name].push(func);
    });

    Object.entries(functionMap).forEach(([name, funcs]) => {
        if (funcs.length > 1) {
            results.duplicateFunctions.push({
                name,
                occurrences: funcs.map(f => ({
                    file: f.file,
                    line: f.line,
                    bodyLength: f.body.length
                }))
            });
        }
    });
}

/**
 * Find empty or stub functions
 */
function findEmptyFunctions(allFunctions) {
    allFunctions.forEach(func => {
        const body = func.body.trim();

        // Empty function
        if (body.length === 0) {
            results.emptyFunctions.push({
                name: func.name,
                file: func.file,
                line: func.line,
                type: 'empty'
            });
        }
        // Only console.log
        else if (/^console\.(log|warn|error)\(['"].*['"]\);?$/.test(body)) {
            results.emptyFunctions.push({
                name: func.name,
                file: func.file,
                line: func.line,
                type: 'stub',
                content: body
            });
        }
    });
}

/**
 * Find duplicate strings
 */
function findDuplicateStrings(code, filename) {
    const strings = [];

    // Match strings in quotes
    const stringPattern = /["'`]([^"'`]{20,})["'`]/g;
    let match;

    while ((match = stringPattern.exec(code)) !== null) {
        const str = match[1];
        if (str.length >= config.minStringLength && !/^[\s\n]*$/.test(str)) {
            strings.push({
                content: str.substring(0, 100), // Truncate for display
                fullContent: str,
                file: filename,
                line: code.substring(0, match.index).split('\n').length
            });
        }
    }

    return strings;
}

/**
 * Find duplicate code blocks
 */
function findDuplicateCodeBlocks(code, filename) {
    const blocks = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length - 5; i++) {
        const block = lines.slice(i, i + 5).join('\n').trim();
        if (block.length >= config.minCodeBlockLength && !/^[\s\n]*$/.test(block)) {
            blocks.push({
                content: block.substring(0, 100),
                fullContent: block,
                file: filename,
                startLine: i + 1,
                hash: hashCode(block)
            });
        }
    }

    return blocks;
}

/**
 * Find window assignments (exposed functions)
 */
function findWindowAssignments(code) {
    const assignments = [];
    const pattern = /window\.(\w+)\s*=\s*(\w+)/g;
    let match;

    while ((match = pattern.exec(code)) !== null) {
        assignments.push({
            windowName: match[1],
            functionName: match[2]
        });
    }

    return assignments;
}

/**
 * Simple hash function for code blocks
 */
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
}

/**
 * Analyze all files
 */
function analyzeFiles() {
    const allFunctions = [];
    const allStrings = [];
    const allCodeBlocks = [];

    config.targetFiles.forEach(filename => {
        const filepath = path.join(__dirname, filename);

        if (!fs.existsSync(filepath)) {
            console.log(`⚠️  File not found: ${filename}`);
            return;
        }

        console.log(`📄 Analyzing ${filename}...`);
        const code = fs.readFileSync(filepath, 'utf8');

        // Extract and analyze
        const functions = extractFunctions(code, filename);
        const strings = findDuplicateStrings(code, filename);
        const codeBlocks = findDuplicateCodeBlocks(code, filename);

        allFunctions.push(...functions);
        allStrings.push(...strings);
        allCodeBlocks.push(...codeBlocks);
    });

    // Find duplicates and issues
    findDuplicateFunctions(allFunctions);
    findEmptyFunctions(allFunctions);

    // Find duplicate strings
    const stringMap = {};
    allStrings.forEach(str => {
        const key = str.fullContent;
        if (!stringMap[key]) stringMap[key] = [];
        stringMap[key].push(str);
    });

    Object.entries(stringMap).forEach(([content, occurrences]) => {
        if (occurrences.length > 1) {
            results.duplicateStrings.push({
                content: content.substring(0, 100),
                count: occurrences.length,
                locations: occurrences.map(s => `${s.file}:${s.line}`)
            });
        }
    });

    // Find duplicate code blocks
    const blockMap = {};
    allCodeBlocks.forEach(block => {
        if (!blockMap[block.hash]) blockMap[block.hash] = [];
        blockMap[block.hash].push(block);
    });

    Object.values(blockMap).forEach(blocks => {
        if (blocks.length > 1) {
            results.duplicateCodeBlocks.push({
                content: blocks[0].content,
                count: blocks.length,
                locations: blocks.map(b => `${b.file}:${b.startLine}`)
            });
        }
    });
}

/**
 * Generate report
 */
function generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('CODE ANALYSIS REPORT');
    console.log('='.repeat(80) + '\n');

    // Duplicate Functions
    console.log(`📋 DUPLICATE FUNCTIONS (${results.duplicateFunctions.length})`);
    console.log('-'.repeat(80));
    if (results.duplicateFunctions.length === 0) {
        console.log('✅ No duplicate function names found\n');
    } else {
        results.duplicateFunctions.forEach(dup => {
            console.log(`\n⚠️  Function: ${dup.name}`);
            dup.occurrences.forEach(occ => {
                console.log(`   - ${occ.file}:${occ.line} (${occ.bodyLength} chars)`);
            });
        });
        console.log();
    }

    // Empty/Stub Functions
    console.log(`🔍 EMPTY OR STUB FUNCTIONS (${results.emptyFunctions.length})`);
    console.log('-'.repeat(80));
    if (results.emptyFunctions.length === 0) {
        console.log('✅ No empty or stub functions found\n');
    } else {
        results.emptyFunctions.forEach(func => {
            console.log(`\n⚠️  ${func.name} (${func.type})`);
            console.log(`   Location: ${func.file}:${func.line}`);
            if (func.content) console.log(`   Content: ${func.content}`);
        });
        console.log();
    }

    // Duplicate Strings
    console.log(`📝 DUPLICATE STRINGS (${results.duplicateStrings.length})`);
    console.log('-'.repeat(80));
    if (results.duplicateStrings.length === 0) {
        console.log('✅ No significant duplicate strings found\n');
    } else {
        results.duplicateStrings.slice(0, 10).forEach(dup => {
            console.log(`\n⚠️  String (${dup.count} occurrences):`);
            console.log(`   "${dup.content}${dup.content.length >= 100 ? '...' : ''}"`);
            console.log(`   Locations: ${dup.locations.join(', ')}`);
        });
        if (results.duplicateStrings.length > 10) {
            console.log(`\n... and ${results.duplicateStrings.length - 10} more`);
        }
        console.log();
    }

    // Duplicate Code Blocks
    console.log(`🔁 DUPLICATE CODE BLOCKS (${results.duplicateCodeBlocks.length})`);
    console.log('-'.repeat(80));
    if (results.duplicateCodeBlocks.length === 0) {
        console.log('✅ No duplicate code blocks found\n');
    } else {
        results.duplicateCodeBlocks.slice(0, 10).forEach(dup => {
            console.log(`\n⚠️  Code block (${dup.count} occurrences):`);
            console.log(`   ${dup.content}...`);
            console.log(`   Locations: ${dup.locations.join(', ')}`);
        });
        if (results.duplicateCodeBlocks.length > 10) {
            console.log(`\n... and ${results.duplicateCodeBlocks.length - 10} more`);
        }
        console.log();
    }

    // Summary
    console.log('='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    console.log(`Duplicate Functions: ${results.duplicateFunctions.length}`);
    console.log(`Empty/Stub Functions: ${results.emptyFunctions.length}`);
    console.log(`Duplicate Strings: ${results.duplicateStrings.length}`);
    console.log(`Duplicate Code Blocks: ${results.duplicateCodeBlocks.length}`);
    console.log('='.repeat(80) + '\n');

    // Save to file
    const reportPath = path.join(__dirname, 'code-analysis-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`📊 Full report saved to: ${reportPath}\n`);
}

// Run analysis
console.log('🔍 Starting code analysis...\n');
analyzeFiles();
generateReport();
