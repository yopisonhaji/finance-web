const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// =====================================
// KONFIGURASI AUTO-UPDATER
// =====================================
const CURRENT_VERSION = "1.0.0";
const UPDATE_URL = "https://satujalan.id/version.json";
// =====================================

console.log(`=========================================`);
console.log(`🤖 Memulai Sistem Pesantren v${CURRENT_VERSION}`);
console.log(`=========================================\n`);

async function checkUpdate() {
  return new Promise((resolve) => {
    console.log("Mengecek pembaruan dari server...");
    const req = (UPDATE_URL.startsWith('https') ? https : http).get(UPDATE_URL, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.version && json.version !== CURRENT_VERSION) {
            console.log(`\n=========================================`);
            console.log(`🎉 UPDATE TERSEDIA: Versi ${json.version}`);
            console.log(`Mengunduh pembaruan secara otomatis... Mohon tunggu.`);
            console.log(`=========================================\n`);
            
            const file = fs.createWriteStream("update.zip");
            https.get(json.download_url, (response) => {
              response.pipe(file);
              file.on('finish', () => {
                file.close();
                console.log("✅ Unduhan selesai. Mengekstrak pembaruan...");
                try {
                   // Gunakan powershell bawaan Windows untuk ekstrak
                   const { execSync } = require('child_process');
                   execSync('powershell -command "Expand-Archive -Path update.zip -DestinationPath . -Force"', { stdio: 'inherit' });
                   console.log("✅ Ekstrak sukses! Aplikasi akan dijalankan dengan versi terbaru.");
                   
                   // Hapus file zip
                   fs.unlinkSync("update.zip");
                   
                   // Update versi di file ini? (Opsional, karena zip baru idealnya menimpa file ini dengan versi terbaru)
                } catch(e) {
                   console.log("Gagal mengekstrak. Silakan ekstrak manual update.zip.");
                }
                resolve(true);
              });
            }).on('error', (err) => {
               console.log("Gagal mengunduh file update.");
               fs.unlink("update.zip", () => {});
               resolve(false);
            });
          } else {
             console.log("Sistem Anda sudah versi terbaru.\n");
             resolve(true);
          }
        } catch (e) {
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log("Gagal mengecek pembaruan (Tidak ada koneksi internet).\n");
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      req.abort();
      resolve(false);
    });
  });
}

async function startApp() {
  await checkUpdate();

  const isWindows = process.platform === "win32";
  const npmCmd = isWindows ? "npm.cmd" : "npm";
  const nodeCmd = isWindows ? "node.exe" : "node";

  // Jalankan Next.js Standalone
  console.log("Menyalakan Web Server...");
  const web = spawn(nodeCmd, ["server.js"], { stdio: 'inherit', env: { ...process.env, PORT: '3000' } });

  // Jalankan WhatsApp Worker
  console.log("Menyalakan WhatsApp Bot Server...");
  const worker = spawn(nodeCmd, ["worker.js"], { stdio: 'inherit' });

  // Otomatis buka browser (hanya di Windows) - DINONAKTIFKAN KARENA TAURI
  // setTimeout(() => {
  //   if (isWindows) {
  //      console.log("Membuka browser otomatis...");
  //      spawn("cmd", ["/c", "start", "http://localhost:3000"]);
  //   }
  // }, 4000);

  // Tangani penutupan aplikasi
  process.on('SIGINT', () => {
    console.log("Menutup aplikasi...");
    web.kill();
    worker.kill();
    process.exit(0);
  });
}

startApp();
