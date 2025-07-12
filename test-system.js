#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Home Hub System Diagnostics\n');

// Test 1: Check if we're in the right directory
console.log('📁 Test 1: Directory Structure');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log('✅ package.json found and valid');
    console.log(`   Project: ${packageJson.name} v${packageJson.version}`);
} catch (error) {
    console.log('❌ package.json not found or invalid');
    process.exit(1);
}

// Test 2: Check Node.js version
console.log('\n📦 Test 2: Node.js Environment');
try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Node.js version: ${nodeVersion}`);
} catch (error) {
    console.log('❌ Node.js not found');
}

// Test 3: Check npm availability
console.log('\n📦 Test 3: npm Environment');
try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✅ npm version: ${npmVersion}`);
} catch (error) {
    console.log('❌ npm not found');
}

// Test 4: Check dependencies
console.log('\n📦 Test 4: Dependencies');
try {
    if (fs.existsSync('node_modules')) {
        console.log('✅ node_modules directory exists');
        
        // Check key dependencies
        const keyDeps = ['vite', 'express', 'react', 'react-dom'];
        for (const dep of keyDeps) {
            if (fs.existsSync(`node_modules/${dep}`)) {
                console.log(`   ✅ ${dep} installed`);
            } else {
                console.log(`   ❌ ${dep} missing`);
            }
        }
    } else {
        console.log('❌ node_modules directory missing');
    }
} catch (error) {
    console.log('❌ Error checking dependencies:', error.message);
}

// Test 5: Check file permissions
console.log('\n🔐 Test 5: File Permissions');
try {
    const vitePath = 'node_modules/.bin/vite';
    if (fs.existsSync(vitePath)) {
        const stats = fs.statSync(vitePath);
        const isExecutable = (stats.mode & fs.constants.S_IXUSR) !== 0;
        console.log(`✅ vite binary exists`);
        console.log(`   Executable: ${isExecutable ? 'Yes' : 'No'}`);
        if (!isExecutable) {
            console.log('   ⚠️  vite is not executable - this may cause issues');
        }
    } else {
        console.log('❌ vite binary not found');
    }
} catch (error) {
    console.log('❌ Error checking file permissions:', error.message);
}

// Test 6: Check server files
console.log('\n🖥️  Test 6: Server Files');
const serverFiles = ['server/index.js', 'src/App.tsx', 'vite.config.ts'];
for (const file of serverFiles) {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`❌ ${file} missing`);
    }
}

// Test 7: Check environment file
console.log('\n⚙️  Test 7: Environment Configuration');
if (fs.existsSync('.env')) {
    console.log('✅ .env file exists');
    const envContent = fs.readFileSync('.env', 'utf8');
    const hasGoogleConfig = envContent.includes('VITE_GOOGLE_CLIENT_ID');
    console.log(`   Google OAuth configured: ${hasGoogleConfig ? 'Yes' : 'No'}`);
} else {
    console.log('❌ .env file missing');
    console.log('   Run: cp env.example .env');
}

// Test 8: Network connectivity test
console.log('\n🌐 Test 8: Network Connectivity');
function testPort(port, description) {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: port,
            path: '/',
            method: 'GET',
            timeout: 2000
        }, (res) => {
            console.log(`✅ ${description} (port ${port}) - Status: ${res.statusCode}`);
            resolve(true);
        });
        
        req.on('error', () => {
            console.log(`❌ ${description} (port ${port}) - Not responding`);
            resolve(false);
        });
        
        req.on('timeout', () => {
            console.log(`⏰ ${description} (port ${port}) - Timeout`);
            req.destroy();
            resolve(false);
        });
        
        req.end();
    });
}

// Test 9: Process check
console.log('\n🔄 Test 9: Running Processes');
try {
    const processes = execSync('ps aux | grep -E "(node|vite)" | grep -v grep', { encoding: 'utf8' });
    if (processes.trim()) {
        console.log('✅ Node.js processes found:');
        console.log(processes.trim().split('\n').map(p => `   ${p}`).join('\n'));
    } else {
        console.log('❌ No Node.js processes found');
    }
} catch (error) {
    console.log('❌ Error checking processes:', error.message);
}

// Test 10: Port availability
console.log('\n🔌 Test 10: Port Availability');
async function runNetworkTests() {
    const portTests = [
        { port: 3001, description: 'Backend Server' },
        { port: 5173, description: 'Frontend Dev Server' }
    ];
    
    for (const test of portTests) {
        await testPort(test.port, test.description);
    }
}

// Test 11: WSL specific checks
console.log('\n🐧 Test 11: WSL Environment');
try {
    const wslInfo = execSync('uname -a', { encoding: 'utf8' });
    console.log('✅ WSL detected:', wslInfo.trim());
    
    const distro = execSync('cat /etc/os-release | grep PRETTY_NAME', { encoding: 'utf8' });
    console.log('   Distribution:', distro.trim().split('=')[1]?.replace(/"/g, ''));
} catch (error) {
    console.log('❌ Error getting WSL info:', error.message);
}

// Test 12: File system permissions
console.log('\n📂 Test 12: File System Permissions');
try {
    const testWrite = fs.writeFileSync('test-write.tmp', 'test');
    fs.unlinkSync('test-write.tmp');
    console.log('✅ Write permissions OK');
} catch (error) {
    console.log('❌ Write permissions failed:', error.message);
}

// Run all tests
async function runAllTests() {
    await runNetworkTests();
    
    console.log('\n📊 Test Summary');
    console.log('================');
    console.log('If you see ❌ marks above, those components need attention.');
    console.log('\n🎯 Next Steps:');
    console.log('1. If dependencies are missing: npm install');
    console.log('2. If vite is not executable: chmod +x node_modules/.bin/vite');
    console.log('3. If .env is missing: cp env.example .env');
    console.log('4. If servers not running: npm run server (in one terminal)');
    console.log('5. If frontend not running: npm run dev (in another terminal)');
    console.log('\n🌐 Access URLs:');
    console.log('   Frontend: http://localhost:5173/');
    console.log('   Backend:  http://localhost:3001/');
}

runAllTests().catch(console.error); 