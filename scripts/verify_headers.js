const http = require('http');

function checkUrl(path) {
    return new Promise((resolve) => {
        http.get(`http://localhost:3000${path}`, (res) => {
            console.log(`\nChecking: ${path}`);
            console.log(`Status: ${res.statusCode}`);
            console.log('Cache-Control:', res.headers['cache-control'] || 'MISSING');
            res.resume();
            resolve();
        }).on('error', (e) => {
            console.error(`Error checking ${path}:`, e.message);
            resolve();
        });
    });
}

async function verify() {
    console.log('Verifying server and headers...');
    await checkUrl('/');
    // Check a likely static image (Sidebar uses logo.png)
    await checkUrl('/logo.png');
    // Check a next static file if possible, or just a known asset
    // We added headers for .svg, .jpg, .png
}

verify();
