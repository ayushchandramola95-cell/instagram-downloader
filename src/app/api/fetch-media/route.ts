import { NextRequest, NextResponse } from "next/server";
import { extractInstagramMedia } from "@/lib/instagram-extractor";
import { validateInstagramUrl } from "@/lib/security";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";
import { verifyTurnstileToken } from "@/lib/turnstile";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);

  // 1. IP Rate Limiting (Default: 30 requests per minute)
  const maxRequests = parseInt(process.env.RATE_LIMIT_FETCH_PER_MIN || "30", 10);
  const rateLimit = checkRateLimit(`fetch:${clientIp}`, maxRequests, 60000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Too many requests. Please wait ${rateLimit.retryAfterSeconds} seconds before trying again.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetTime / 1000)),
        },
      }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { url, isSample, turnstileToken } = body;

    // 2. Cloudflare Turnstile Anti-Bot Verification (Bypassed if secret key not set)
    const turnstileCheck = await verifyTurnstileToken(turnstileToken, clientIp);
    if (!turnstileCheck.success) {
      return NextResponse.json(
        { success: false, error: turnstileCheck.error || "Security check failed." },
        { status: 403 }
      );
    }

    // 3. Strict URL Validation & SSRF Prevention
    const urlValidation = validateInstagramUrl(url);
    if (!urlValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error:
            urlValidation.error ||
            "Please enter a valid Instagram URL (e.g., https://www.instagram.com/reel/...).",
        },
        { status: 400 }
      );
    }

    // 4. Extract Instagram media
    const targetUrl = urlValidation.normalizedUrl || url.trim();
    const data = await extractInstagramMedia(targetUrl, Boolean(isSample));

    return NextResponse.json(
      {
        success: true,
        data,
      },
      {
        status: 200,
        headers: {
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to extract Instagram media.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 422 }
    );
  }
}
