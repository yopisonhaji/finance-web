import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { action } = await req.json();
    
    if (action === "logout") {
      // Tulis perintah IPC ke file agar dibaca oleh worker.ts
      fs.writeFileSync(path.join(process.cwd(), "wa-command.json"), JSON.stringify({ action: "logout" }));
      
      const pauseFile = path.join(process.cwd(), "wa-pause.json");
      if (fs.existsSync(pauseFile)) {
        fs.rmSync(pauseFile);
      }
    } else if (action === "pause") {
      fs.writeFileSync(path.join(process.cwd(), "wa-pause.json"), JSON.stringify({ paused: true }));
    } else if (action === "resume") {
      const pauseFile = path.join(process.cwd(), "wa-pause.json");
      if (fs.existsSync(pauseFile)) {
        fs.rmSync(pauseFile);
      }
    }

    return NextResponse.json({ success: true, action });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Gagal memproses aksi" }, { status: 500 });
  }
}
