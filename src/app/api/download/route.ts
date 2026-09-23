import { NextRequest, NextResponse } from "next/server";
import { validateDownloadTargetUrl, sanitizeFilename } from "@/lib/security";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";

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
  const rawFilename = searchParams.get("filename") || "instagram_media.mp4";

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

  // 3. Filename Sanitization: Strip path traversal (../), control characters, and unsafe extensions
  const safeFilename = sanitizeFilename(rawFilename);

  try {
    const parsedUrl = new URL(targetUrl);

    // Build headers based on the destination host
    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    };

    // Instagram CDN requires Instagram referer to avoid hotlink blocks
    if (parsedUrl.hostname.includes("cdninstagram.com") || parsedUrl.hostname.includes("fbcdn.net")) {
      headers["Referer"] = "https://www.instagram.com/";
    }

    // Fetch the remote media stream
    const response = await fetch(targetUrl, {
      headers,
    });

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
      `attachment; filename="${encodeURIComponent(safeFilename)}"`
    );
    responseHeaders.set("Cache-Control", "public, max-age=3600");
    responseHeaders.set("X-RateLimit-Limit", String(rateLimit.limit));
    responseHeaders.set("X-RateLimit-Remaining", String(rateLimit.remaining));

    if (contentLength) {
      responseHeaders.set("Content-Length", contentLength);
    }

    // Stream the response back to the client
    return new NextResponse(response.body, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error streaming file.";
    return new NextResponse(`Download streaming error: ${message}`, { status: 500 });
  }
}
