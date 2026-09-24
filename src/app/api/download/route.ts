import { NextRequest, NextResponse } from "next/server";
import { validateDownloadTargetUrl, sanitizeFilename } from "@/lib/security";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";
import { recordDownloadEvent } from "@/lib/analytics-store";
import { spawn } from "child_process";
import { Readable } from "stream";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const clientIp = getClientIp(req);

  // 1. IP Rate Limiting (Default: 60 download streams per minute per IP)
  const maxDownloads = parseInt(process.env.RATE_LIMIT_DOWNLOAD_PER_MIN || "60", 10);
  const rateLimit = checkRateLimit(`download:${clientIp}`, maxDownloads, 60000);

  if (!rateLimit.allowed) {
    return new NextResponse(
      `Download limit reached. Please wait ${rateLimit.retryAfterSeconds} seconds before starting new downloads.`,
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const { searchParams } = new URL(req.url);
  const mediaUrl = searchParams.get("url");
  const rawAudioUrl = searchParams.get("audioUrl");
  const rawFilename = searchParams.get("filename") || "gramsave_media.mp4";
  const isPreview = searchParams.get("preview") === "1" || rawFilename.startsWith("preview.");

  // Record analytics for authentic downloads
  if (!isPreview) {
    let format = "reel";
    if (rawFilename.endsWith(".mp3")) format = "audio";
    else if (rawFilename.endsWith(".jpg") || rawFilename.endsWith(".png")) format = "photo";
    else if (rawFilename.includes("story")) format = "story";
    else if (rawFilename.includes("carousel") || rawFilename.includes("slide")) format = "carousel";
    recordDownloadEvent(format, rawFilename, clientIp).catch(() => {});
  }

  if (!mediaUrl) {
    return new NextResponse("Missing media url parameter.", { status: 400 });
  }

  // 2. Strict SSRF Protection: Validate target URL is an authentic Meta/Instagram CDN host
  let targetUrl: string;
  try {
    targetUrl = decodeURIComponent(mediaUrl);
  } catch {
    return new NextResponse("Malformed media URL encoding.", { status: 400 });
  }

  const targetValidation = validateDownloadTargetUrl(targetUrl);
  if (!targetValidation.valid) {
    return new NextResponse(
      `Security violation: ${targetValidation.error || "Prohibited media destination."}`,
      { status: 403 }
    );
  }

  // Validate optional audio URL (SSRF protection)
  let audioUrl: string | null = null;
  if (rawAudioUrl) {
    try {
      audioUrl = decodeURIComponent(rawAudioUrl);
    } catch {
      return new NextResponse("Malformed audio URL encoding.", { status: 400 });
    }
    const audioValidation = validateDownloadTargetUrl(audioUrl);
    if (!audioValidation.valid) {
      return new NextResponse(
        `Security violation: ${audioValidation.error || "Prohibited audio destination."}`,
        { status: 403 }
      );
    }
  }

  // 3. Filename Sanitization: Strip path traversal (../), control characters, and unsafe extensions
  const safeFilename = sanitizeFilename(rawFilename);

  // 4. Real-time FFmpeg Muxing: When separate video & audio streams are provided (DASH streams)
  if (audioUrl) {
    try {
      const ffmpegBinary = process.env.FFMPEG_PATH || "ffmpeg";
      const headersStr =
        "Referer: https://www.instagram.com/\r\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36\r\n";

      const ffmpegArgs = [
        "-y",
        "-loglevel",
        "error",
        "-headers",
        headersStr,
        "-i",
        targetUrl,
        "-headers",
        headersStr,
        "-i",
        audioUrl,
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-shortest",
        "-movflags",
        "frag_keyframe+empty_moov+default_base_moof",
        "-f",
        "mp4",
        "pipe:1",
      ];

      const proc = spawn(/*turbopackIgnore: true*/ ffmpegBinary, ffmpegArgs);

      // Kill child process if client disconnects early
      req.signal.addEventListener("abort", () => {
        try {
          proc.kill("SIGKILL");
        } catch {}
      });

      proc.stderr.on("data", (chunk) => {
        console.error("[FFmpeg error]:", chunk.toString());
      });

      const webStream = Readable.toWeb(proc.stdout) as ReadableStream;

      const responseHeaders = new Headers();
      responseHeaders.set("Content-Type", "video/mp4");
      responseHeaders.set(
        "Content-Disposition",
        isPreview ? "inline" : `attachment; filename="${encodeURIComponent(safeFilename)}"`
      );
      responseHeaders.set("Cache-Control", "public, max-age=3600");
      responseHeaders.set("X-RateLimit-Limit", String(rateLimit.limit));
      responseHeaders.set("X-RateLimit-Remaining", String(rateLimit.remaining));

      return new NextResponse(webStream, {
        status: 200,
        headers: responseHeaders,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "FFmpeg muxing error.";
      return new NextResponse(`Muxing error: ${message}`, { status: 500 });
    }
  }

  // 5. Standard single-stream proxy (photos, standalone audio MP3s, pre-combined videos)
  try {
    const parsedUrl = new URL(targetUrl);
    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    };

    if (parsedUrl.hostname.includes("cdninstagram.com") || parsedUrl.hostname.includes("fbcdn.net")) {
      headers["Referer"] = "https://www.instagram.com/";
    }

    const response = await fetch(targetUrl, { headers });

    if (!response.ok || !response.body) {
      return new NextResponse(
        `Failed to fetch media stream from source (Status: ${response.status})`,
        { status: 502 }
      );
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const contentLength = response.headers.get("content-length");

    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", contentType);
    responseHeaders.set(
      "Content-Disposition",
      isPreview ? "inline" : `attachment; filename="${encodeURIComponent(safeFilename)}"`
    );
    responseHeaders.set("Cache-Control", "public, max-age=3600");
    responseHeaders.set("X-RateLimit-Limit", String(rateLimit.limit));
    responseHeaders.set("X-RateLimit-Remaining", String(rateLimit.remaining));

    if (contentLength) {
      responseHeaders.set("Content-Length", contentLength);
    }

    return new NextResponse(response.body, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error streaming file.";
    return new NextResponse(`Download streaming error: ${message}`, { status: 500 });
  }
}
