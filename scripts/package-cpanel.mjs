import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist-cpanel');
const desktopPath = path.resolve(process.env.USERPROFILE || 'C:\\Users\\asph4', 'Desktop');
const zipOutputPath = path.resolve(desktopPath, 'wacrm-namecheap-cpanel.zip');

console.log('=== Packaging WACRM for Namecheap cPanel ===');

const standaloneDir = path.resolve(rootDir, '.next', 'standalone');
if (!fs.existsSync(standaloneDir)) {
  console.log('Building project first...');
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
}

console.log('1. Preparing dist-cpanel folder...');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

console.log('2. Copying standalone files...');
fs.cpSync(standaloneDir, distDir, { recursive: true });

console.log('3. Copying static assets (.next/static)...');
const staticSrc = path.resolve(rootDir, '.next', 'static');
const staticDest = path.resolve(distDir, '.next', 'static');
if (fs.existsSync(staticSrc)) {
  fs.cpSync(staticSrc, staticDest, { recursive: true });
}

console.log('4. Copying root public folder...');
const publicSrc = path.resolve(rootDir, 'public');
const publicDest = path.resolve(distDir, 'public');
if (fs.existsSync(publicSrc)) {
  fs.cpSync(publicSrc, publicDest, { recursive: true });
}

console.log('5. Copying environment configuration (.env)...');
const envSrc = path.resolve(rootDir, '.env.local');
const envDest = path.resolve(distDir, '.env');
if (fs.existsSync(envSrc)) {
  fs.copyFileSync(envSrc, envDest);
}

console.log('6. Creating zip file on Desktop...');
if (fs.existsSync(zipOutputPath)) {
  fs.unlinkSync(zipOutputPath);
}

execSync(`tar -a -c -f "${zipOutputPath}" *`, { cwd: distDir, stdio: 'inherit' });

const stats = fs.statSync(zipOutputPath);
const mb = (stats.size / (1024 * 1024)).toFixed(2);
console.log(`\nSUCCESS! Created: ${zipOutputPath} (${mb} MB)`);
