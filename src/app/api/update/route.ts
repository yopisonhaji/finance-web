import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

export const dynamic = 'force-dynamic';

const VERSION_URL = 'https://chat.satujalan.id/updates/finance/version.json';

export async function GET() {
  try {
    const res = await fetch(VERSION_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch version info');

    const data = await res.json();
    const serverVersion = data.version;
    const localVersion = process.env.APP_VERSION || "0.1.0";

    // Simple version comparison
    const isUpdateAvailable = serverVersion > localVersion;

    return NextResponse.json({
      localVersion,
      serverVersion,
      hasUpdate: isUpdateAvailable,
      downloadUrl: data.download_url
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Fetch version info to get the download URL
    const res = await fetch(VERSION_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch version info');
    const data = await res.json();
    const downloadUrl = data.download_url;

    if (!downloadUrl) {
      throw new Error('Download URL not found in version.json');
    }

    // 2. Setup paths - Gunakan folder TEMP Windows agar tidak ada masalah permission (Admin)
    const tempDir = os.tmpdir();
    // Beri nama acak agar tidak bentrok dengan sisa update sebelumnya
    const installerPath = path.join(tempDir, `finance_update_${Date.now()}.exe`);

    // 3. Download the new installer (.exe)
    const fileRes = await fetch(downloadUrl);
    if (!fileRes.ok) throw new Error(`Failed to download update from ${downloadUrl}`);

    const fileBuffer = await fileRes.arrayBuffer();
    fs.writeFileSync(installerPath, Buffer.from(fileBuffer));

    // 4. Jalankan installer langsung dan biarkan berjalan di latar (detached)
    const installerProcess = spawn(installerPath, [], {
      detached: true,
      stdio: 'ignore'
    });

    installerProcess.unref();

    // 5. Matikan aplikasi saat ini agar file .exe tidak terkunci saat proses instalasi
    setTimeout(() => {
      process.exit(0);
    }, 1000);

    return NextResponse.json({ success: true, message: 'Memulai proses update. Installer akan segera terbuka.' });

  } catch (error: any) {
    console.error('Update failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
