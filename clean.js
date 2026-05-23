const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(__dirname, 'frontend', 'src');

const patterns = [
    /\{\/\*\s*.*?(figma|frame|vector|ellipse|rectangle|auto\s*layout|inside\s*auto\s*layout).*?\*\/\s*\}/gi,
    /\/\*\s*.*?(figma|frame|vector|ellipse|rectangle|auto\s*layout|inside\s*auto\s*layout).*?\*\//gi,
    /\/\/.*?(figma|frame|vector|ellipse|rectangle|auto\s*layout|inside\s*auto\s*layout).*?$/gim
];

let visited = 0;
let cleaned = 0;

function cleanFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    const original = content;

    for (const pattern of patterns) {
        content = content.replace(pattern, '');
    }

    // Clean up excess blank lines left after stripping comments
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    if (content !== original) {
        cleaned++;
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`Cleaned ${cleaned}: ${path.basename(filepath)}`);
    }
}

function walkDir(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    const files = fs.readdirSync(currentDir);
    
    for (const file of files) {
        const filepath = path.join(currentDir, file);
        const stat = fs.statSync(filepath);
        
        if (stat.isDirectory()) {
            walkDir(filepath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
            visited++;
            cleanFile(filepath);
        }
    }
}

console.log("Starting sweeping Figma comment cleanup...");
walkDir(TARGET_DIR);
console.log(`Cleanup complete! Visited: ${visited}, Cleaned: ${cleaned}`);
