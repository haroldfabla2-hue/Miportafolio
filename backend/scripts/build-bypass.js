const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Bypass Build Process...');

// 1. Manually resolve tsc path
const tscPath = path.resolve(__dirname, '../node_modules/typescript/bin/tsc');
console.log(`📍 Using compiler at: ${tscPath}`);

if (!fs.existsSync(tscPath)) {
    console.error('❌ TypeScript compiler not found!');
    process.exit(1);
}

// 2. Clean dist folder manually
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
    console.log('nm Cleaning dist folder...');
    fs.rmSync(distPath, { recursive: true, force: true });
}

// 3. Clean tsbuildinfo manually
const tsBuildInfoPath = path.resolve(__dirname, '../tsconfig.tsbuildinfo');
if (fs.existsSync(tsBuildInfoPath)) {
    console.log('🧹 Cleaning tsconfig.tsbuildinfo...');
    try {
        fs.unlinkSync(tsBuildInfoPath);
    } catch (e) {
        console.warn('⚠️ Could not delete tsconfig.tsbuildinfo (file locked?), ignoring...');
    }
}

// 4. Run TSC directly
console.log('nj Compiling...');
try {
    // Force non-incremental build to bypass locks
    execSync(`node "${tscPath}" --incremental false`, {
        stdio: 'inherit',
        cwd: path.resolve(__dirname, '../')
    });
    console.log('✅ Build Complete!');
} catch (error) {
    console.error('❌ Build Failed:', error.message);
    process.exit(1);
}
