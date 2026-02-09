const fs = require('fs');
try {
    const content = fs.readFileSync('lint_results_new.txt', 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
        if (line.includes('177:41') || line.includes('285:90')) {
            console.log(`Match at line ${index + 1}: ${line}`);
            // Print previous 10 lines to find filename
            for (let i = Math.max(0, index - 20); i < index; i++) {
                console.log(`PREV ${i + 1}: ${lines[i]}`);
            }
        }
    });
} catch (e) {
    console.error(e);
}
