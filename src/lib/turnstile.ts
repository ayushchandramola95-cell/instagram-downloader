/**
 * Cloudflare Turnstile verification helper.
 * Validates anti-bot tokens to prevent scrapers from draining server bandwidth and CPU.
 */

export interface TurnstileVerifyResult {
  success: boolean;
  bypassed?: boolean;
  error?: string;
}

interface CloudflareSiteverifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

/**
 * Verifies a Cloudflare Turnstile CAPTCHA token with Cloudflare's API.
 * Automatically bypassed if TURNSTILE_SECRET_KEY is not defined in environment (local dev mode).
 */
export async function verifyTurnstileToken(
  token?: string,
  clientIp?: string
): Promise<TurnstileVerifyResult> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY?.trim();

  // If Turnstile is not configured, bypass gracefully for local development & zero-friction tests
  if (!secretKey) {
    return { success: true, bypassed: true };
  }

  if (!token || typeof token !== "string" || token.trim() === "") {
    return {
      success: false,
      error: "Security verification required. Please complete the CAPTCHA check.",
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token.trim());
    if (clientIp && clientIp !== "127.0.0.1") {
      formData.append("remoteip", clientIp);
    }

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Turnstile verification service unavailable (${response.status}).`,
      };
    }

    const data = (await response.json()) as CloudflareSiteverifyResponse;

    if (data.success) {
      return { success: true };
    }

    const errorCodes = data["error-codes"] || [];
    return {
      success: false,
      error: `Security verification failed (${errorCodes.join(", ") || "invalid token"}). Please try again.`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error verifying token";
    return {
      success: false,
      error: `Error contacting security verification service: ${message}`,
    };
  }
}
