const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

async function build() {
  console.log("🚀 Memulai proses Build Standalone untuk EXE...");
  
  // 1. Ambil versi dari package.json dan update installer.iss
  console.log("\n⚙️ Menyesuaikan versi installer.iss...");
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  const issPath = path.join(__dirname, 'installer.iss');
  let issContent = fs.readFileSync(issPath, 'utf8');
  issContent = issContent.replace(/AppVersion=.*/, `AppVersion=${pkg.version}`);
  if (!issContent.includes('AppVerName=')) {
    issContent = issContent.replace(/AppVersion=.*/, `AppVersion=${pkg.version}\nAppVerName=Aplikasi Kasir Pesantren ${pkg.version}`);
  } else {
    issContent = issContent.replace(/AppVerName=.*/, `AppVerName=Aplikasi Kasir Pesantren ${pkg.version}`);
  }
  fs.writeFileSync(issPath, issContent);

  // 2. Build Next.js
  console.log("\n📦 Building Next.js...");
  execSync('npx next build', { stdio: 'inherit' });
  
  // 2. Siapkan folder dist-client
  const distDir = path.join(__dirname, 'dist-client');
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir);
  
  // 3. Pindahkan hasil build standalone
  console.log("\n🚚 Memindahkan file standalone...");
  copyRecursiveSync(path.join(__dirname, '.next', 'standalone'), distDir);
  
  // 4. Salin public dan .next/static
  console.log("🚚 Memindahkan aset statis...");
  copyRecursiveSync(path.join(__dirname, 'public'), path.join(distDir, 'public'));
  const nextDir = path.join(distDir, '.next');
  if (!fs.existsSync(nextDir)) fs.mkdirSync(nextDir);
  copyRecursiveSync(path.join(__dirname, '.next', 'static'), path.join(distDir, '.next', 'static'));
  
  // 5. Compile worker.ts
  console.log("\n🔨 Mengompilasi WhatsApp Worker...");
  execSync('npx esbuild src/worker.ts --bundle --platform=node --target=node20 --format=cjs --external:sqlite3 --external:better-sqlite3 --external:@libsql/client --external:canvas --outfile=dist-client/worker.js', { stdio: 'inherit' });
  
  // 6. Copy start script and create bat file
  console.log("\n⚙️ Menyiapkan file peluncur (start.js & run.bat)...");
  fs.copyFileSync(path.join(__dirname, 'template-start.js'), path.join(distDir, 'start.js'));
  
  const batContent = `@echo off\ntitle Server Pesantren\nnode start.js\npause`;
  fs.writeFileSync(path.join(distDir, 'run.bat'), batContent);

  const tauriDist = path.join(__dirname, 'src-tauri', 'dist-client');
  if (fs.existsSync(tauriDist)) {
    fs.rmSync(tauriDist, { recursive: true, force: true });
  }
  fs.mkdirSync(tauriDist, { recursive: true });
  copyRecursiveSync(distDir, tauriDist);

  console.log("\n✅ Build Selesai! Aplikasi siap di-pack menjadi EXE di folder 'dist-client' dan 'src-tauri/dist-client'.");
}

build();
