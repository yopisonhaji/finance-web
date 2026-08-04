import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const waStateFile = path.join(process.cwd(), "wa-state.json");
    const waPauseFile = path.join(process.cwd(), "wa-pause.json");
    
    let isPaused = false;
    if (fs.existsSync(waPauseFile)) {
      isPaused = true;
    }

    if (fs.existsSync(waStateFile)) {
      const data = JSON.parse(fs.readFileSync(waStateFile, "utf-8"));
      return NextResponse.json({ ...data, isPaused });
    }
    return NextResponse.json({ status: "disconnected", qr: "", isPaused });
  } catch (error) {
    return NextResponse.json({ status: "error", error: String(error) }, { status: 500 });
  }
}
