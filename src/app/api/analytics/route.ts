import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsData, recordVisitEvent, recordDownloadEvent, resetAnalyticsData } from "@/lib/analytics-store";
import { getClientIp } from "@/lib/rate-limiter";
import fs from "fs";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export const dynamic = "force-dynamic";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "gramsave2026";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");

    if (secret !== ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid developer secret." },
        { status: 401 }
      );
    }

    const analytics = await getAnalyticsData();

    // Check system diagnostics
    const cookiesPath = path.join(process.cwd(), "cookies.txt");
    const hasCookies = fs.existsSync(cookiesPath);
    let cookiesInfo = { exists: false, sizeBytes: 0, lineCount: 0 };
    if (hasCookies) {
      const stats = fs.statSync(cookiesPath);
      const lines = fs.readFileSync(cookiesPath, "utf-8").split("\n").filter((l) => l.trim().length > 0 && !l.startsWith("#"));
      cookiesInfo = {
        exists: true,
        sizeBytes: stats.size,
        lineCount: lines.length,
      };
    }

    // Check yt-dlp
    let ytdlpStatus = { available: false, version: "unknown" };
    try {
      const ytPath = process.env.YTDLP_PATH || (process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp");
      const { stdout } = await execFileAsync(ytPath, ["--version"], { timeout: 4000 });
      ytdlpStatus = { available: true, version: stdout.trim() };
    } catch {
      ytdlpStatus = { available: false, version: "Not detected or timeout" };
    }

    // Check FFmpeg
    let ffmpegStatus = { available: false, version: "unknown" };
    try {
      const ffPath = process.env.FFMPEG_PATH || (process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg");
      const { stdout } = await execFileAsync(ffPath, ["-version"], { timeout: 4000 });
      const firstLine = stdout.split("\n")[0] || "";
      ffmpegStatus = { available: true, version: firstLine.trim() };
    } catch {
      ffmpegStatus = { available: false, version: "Not detected" };
    }

    const systemInfo = {
      uptimeSeconds: Math.round(process.uptime()),
      nodeVersion: process.version,
      platform: `${process.platform} (${process.arch})`,
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      turnstileEnabled: Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
      cookies: cookiesInfo,
      ytdlp: ytdlpStatus,
      ffmpeg: ffmpegStatus,
    };

    return NextResponse.json({
      success: true,
      analytics,
      systemInfo,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error retrieving analytics";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const body = await req.json().catch(() => ({}));
    const { event, action, secret, format, quality, source } = body;

    if (action === "reset") {
      if (secret !== ADMIN_SECRET) {
        return NextResponse.json({ success: false, error: "Unauthorized: Invalid secret." }, { status: 401 });
      }
      const cleanData = await resetAnalyticsData();
      return NextResponse.json({ success: true, message: "Analytics reset to zero.", analytics: cleanData });
    }

    if (event === "visit") {
      await recordVisitEvent(source || "direct", clientIp);
      return NextResponse.json({ success: true });
    }

    if (event === "download") {
      await recordDownloadEvent(format || "reel", quality || "standard", clientIp);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid event or action" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to record event";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
