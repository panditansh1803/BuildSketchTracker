const dns = require('dns');
const { promisify } = require('util');
const resolve4 = promisify(dns.resolve4);

async function testDomain(domain) {
    try {
        console.log(`\n🔍 Looking up: ${domain}...`);
        const addresses = await resolve4(domain);
        console.log(`   ✅ Success! IP: ${addresses[0]}`);
        return true;
    } catch (err) {
        console.log(`   ❌ Failed: ${err.code} (${err.syscall})`);
        return false;
    }
}

async function main() {
    console.log('--- DNS DIAGNOSTICS ---');
    console.log('Testing connectivity to major services vs Supabase...');

    // 1. Check General Internet (Google)
    const google = await testDomain('google.com');

    // 2. Check Supabase Main Domain
    const supMain = await testDomain('supabase.co');

    // 3. Check Specific Project
    // Extract host from .env.local if possible
    let projectHost = 'rvmotuudiikorokdbloa.supabase.co'; // Hardcoded from previous log
    const supProject = await testDomain(projectHost);

    console.log('\n--- CONCLUSION ---');
    if (google && supProject) {
        console.log('✅ DNS is working perfectly. The earlier error might have been transient.');
    } else if (!google) {
        console.log('❌ TOTAL INTERNET FAILURE. Cannot resolve google.com.');
        console.log('   -> Check your Router/Modem.');
    } else if (google && !supProject) {
        console.log('⚠️ PARTIAL BLOCK. Internet works, but Supabase is blocked.');
        console.log('   -> Check AdGuard, uBlock, Pi-hole, or Corporate VPN.');
    }
}

main();
