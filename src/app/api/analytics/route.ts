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

    // Check system diagnostics & cookies health
    const cookiesPath = path.join(process.cwd(), "cookies.txt");
    const hasCookies = fs.existsSync(cookiesPath);
    let cookiesInfo: {
      exists: boolean;
      sizeBytes: number;
      lineCount: number;
      status: "HEALTHY" | "EXPIRING_SOON" | "EXPIRED" | "MISSING_SESSION" | "NOT_FOUND";
      daysRemaining: number | null;
      expiresAt: string | null;
      userIdMasked: string | null;
      hasSessionId: boolean;
    } = {
      exists: false,
      sizeBytes: 0,
      lineCount: 0,
      status: "NOT_FOUND",
      daysRemaining: null,
      expiresAt: null,
      userIdMasked: null,
      hasSessionId: false,
    };

    if (hasCookies) {
      const stats = fs.statSync(cookiesPath);
      const fileContent = fs.readFileSync(cookiesPath, "utf-8");
      const lines = fileContent.split("\n").filter((l) => l.trim().length > 0 && !l.startsWith("#"));

      let foundSessionId = false;
      let sessionExpiry: number | null = null;
      let maskedUser: string | null = null;

      for (const line of lines) {
        const parts = line.split(/\t+/);
        if (parts.length >= 7) {
          const cookieName = parts[5]?.trim();
          const cookieVal = parts[6]?.trim();
          const expiryNum = parseInt(parts[4]?.trim() || "0", 10);

          if (cookieName === "sessionid") {
            foundSessionId = true;
            if (expiryNum > 0) {
              sessionExpiry = expiryNum;
            }
          }
          if (cookieName === "ds_user_id" && cookieVal) {
            maskedUser = cookieVal.length > 4 ? `${cookieVal.substring(0, 3)}****${cookieVal.slice(-2)}` : "logged_in";
          }
        }
      }

      const nowSec = Math.floor(Date.now() / 1000);
      let status: "HEALTHY" | "EXPIRING_SOON" | "EXPIRED" | "MISSING_SESSION" | "NOT_FOUND" = "HEALTHY";
      let daysRemaining: number | null = null;
      let expiresAt: string | null = null;

      if (!foundSessionId) {
        status = "MISSING_SESSION";
      } else if (sessionExpiry) {
        const diffSec = sessionExpiry - nowSec;
        daysRemaining = Math.max(0, Math.round(diffSec / 86400));
        expiresAt = new Date(sessionExpiry * 1000).toISOString().split("T")[0];

        if (diffSec <= 0) {
          status = "EXPIRED";
        } else if (daysRemaining <= 14) {
          status = "EXPIRING_SOON";
        } else {
          status = "HEALTHY";
        }
      }

      cookiesInfo = {
        exists: true,
        sizeBytes: stats.size,
        lineCount: lines.length,
        status,
        daysRemaining,
        expiresAt,
        userIdMasked: maskedUser,
        hasSessionId: foundSessionId,
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
    const country =
      req.headers.get("cf-ipcountry") ||
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("x-country-code") ||
      req.headers.get("cloudfront-viewer-country") ||
      "GLOBAL";

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
      await recordVisitEvent(source || "direct", clientIp, country);
      return NextResponse.json({ success: true });
    }

    if (event === "download") {
      await recordDownloadEvent(format || "reel", quality || "standard", clientIp, country);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid event or action" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to record event";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
