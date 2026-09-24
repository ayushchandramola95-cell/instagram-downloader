/**
 * Security utilities: Strict URL validation, SSRF protection, and filename sanitization.
 */

// Whitelist of valid Instagram root hostnames
const ALLOWED_INSTAGRAM_HOSTS = new Set([
  "instagram.com",
  "www.instagram.com",
  "m.instagram.com",
  "instagr.am",
  "www.instagr.am",
]);

// Whitelist of valid Meta/Instagram CDN host suffixes for download proxying
const ALLOWED_CDN_HOST_PATTERNS = [
  /\.cdninstagram\.com$/i,
  /^cdninstagram\.com$/i,
  /\.fbcdn\.net$/i,
  /^fbcdn\.net$/i,
  /\.instagram\.com$/i,
  /^instagram\.com$/i,
  /\.mdn\.mozilla\.net$/i,
  /\.unsplash\.com$/i,
];

// Private and local IP address patterns to block SSRF attempts
const BLOCKED_IP_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^0\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^169\.254\./, // AWS / cloud metadata service
  /^fc00:/i,
  /^fe80:/i,
  /^::1$/,
];

export interface UrlValidationResult {
  valid: boolean;
  error?: string;
  normalizedUrl?: string;
}

/**
 * Validates that an input URL or username is an authentic, public Instagram media or profile target.
 * Protects against open-redirects, SSRF, and malformed inputs.
 */
export function validateInstagramUrl(inputUrl: string): UrlValidationResult {
  if (!inputUrl || typeof inputUrl !== "string") {
    return { valid: false, error: "Please enter an Instagram URL or username." };
  }

  let trimmed = inputUrl.trim();
  if (trimmed.length > 2048) {
    return { valid: false, error: "Input is excessively long." };
  }

  // Support @username or raw username directly (e.g. "@cristiano" or "cristiano")
  const usernameOnlyMatch = trimmed.match(/^@?([a-zA-Z0-9._]{1,30})$/);
  if (
    usernameOnlyMatch &&
    !trimmed.includes("/") &&
    !trimmed.includes(":") &&
    !trimmed.toLowerCase().endsWith(".com") &&
    !trimmed.toLowerCase().endsWith(".org") &&
    !trimmed.toLowerCase().endsWith(".net") &&
    !trimmed.toLowerCase().endsWith(".site") &&
    !trimmed.toLowerCase().endsWith(".io")
  ) {
    const cleanUser = usernameOnlyMatch[1].replace(/^\.+|\.+$/g, "");
    if (cleanUser.length > 0) {
      return {
        valid: true,
        normalizedUrl: `https://www.instagram.com/${cleanUser}/`,
      };
    }
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
  } catch {
    return { valid: false, error: "Invalid URL format." };
  }

  // Must use HTTP or HTTPS protocol
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { valid: false, error: "Only HTTPS Instagram URLs are supported." };
  }

  // Hostname must be an approved Instagram domain
  const hostname = parsed.hostname.toLowerCase();
  const isAllowedHost =
    ALLOWED_INSTAGRAM_HOSTS.has(hostname) ||
    hostname.endsWith(".instagram.com") ||
    hostname.endsWith(".instagr.am");

  if (!isAllowedHost) {
    return {
      valid: false,
      error: "Please enter a valid Instagram URL (e.g., https://www.instagram.com/reel/... or https://www.instagram.com/username).",
    };
  }

  // Check for blocked internal hostnames/IPs
  for (const pattern of BLOCKED_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      return { valid: false, error: "Invalid target destination." };
    }
  }

  // Validate Instagram content or profile path
  const pathname = parsed.pathname;
  const isMediaPath =
    pathname.includes("/reel/") ||
    pathname.includes("/reels/") ||
    pathname.includes("/p/") ||
    pathname.includes("/stories/") ||
    pathname.includes("/tv/") ||
    pathname.includes("/share/") ||
    /^\/[\w.-]+\/(?:reel|p)\/[\w.-]+/.test(pathname);

  const pathParts = pathname.split("/").filter(Boolean);
  const RESERVED_PREFIXES = new Set([
    "reel",
    "reels",
    "p",
    "stories",
    "tv",
    "share",
    "explore",
    "accounts",
    "direct",
    "about",
    "developer",
    "legal",
    "terms",
    "privacy",
    "help",
    "api",
    "graphql",
    "static",
  ]);

  const isProfilePath =
    pathParts.length === 1 &&
    !RESERVED_PREFIXES.has(pathParts[0].toLowerCase()) &&
    /^[a-zA-Z0-9._]{1,30}$/.test(pathParts[0]);

  if (!isMediaPath && !isProfilePath) {
    if (pathname === "/" || pathParts.length === 0) {
      return {
        valid: false,
        error: "Please provide a link to a specific Reel, Post, Story, or Profile username (not the homepage).",
      };
    }
    return {
      valid: false,
      error: "Please enter a valid Instagram URL or profile username.",
    };
  }

  // Build clean normalized URL
  const normalizedUrl = `https://${hostname}${parsed.pathname}${parsed.search}`;

  return {
    valid: true,
    normalizedUrl,
  };
}

/**
 * Checks whether an input URL represents an Instagram user profile (rather than media).
 */
export function isProfileTargetUrl(inputUrl: string): boolean {
  if (!inputUrl) return false;
  const trimmed = inputUrl.trim();
  if (/^@?[a-zA-Z0-9._]{1,30}$/.test(trimmed) && !trimmed.includes("/") && !trimmed.includes(".")) {
    return true;
  }
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const RESERVED_PREFIXES = new Set([
      "reel", "reels", "p", "stories", "tv", "share", "explore",
      "accounts", "direct", "about", "developer", "legal", "terms",
      "privacy", "help", "api", "graphql", "static"
    ]);
    return (
      pathParts.length === 1 &&
      !RESERVED_PREFIXES.has(pathParts[0].toLowerCase()) &&
      /^[a-zA-Z0-9._]{1,30}$/.test(pathParts[0])
    );
  } catch {
    return false;
  }
}

/**
 * Extracts the clean username from an Instagram profile URL or handle string.
 */
export function extractProfileUsername(inputUrl: string): string | null {
  if (!inputUrl) return null;
  const trimmed = inputUrl.trim();
  if (/^@?[a-zA-Z0-9._]{1,30}$/.test(trimmed) && !trimmed.includes("/") && !trimmed.includes(".")) {
    return trimmed.replace(/^@/, "").replace(/^\.+|\.+$/g, "").toLowerCase();
  }
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const RESERVED_PREFIXES = new Set([
      "reel", "reels", "p", "stories", "tv", "share", "explore",
      "accounts", "direct", "about", "developer", "legal", "terms",
      "privacy", "help", "api", "graphql", "static"
    ]);
    if (
      pathParts.length === 1 &&
      !RESERVED_PREFIXES.has(pathParts[0].toLowerCase()) &&
      /^[a-zA-Z0-9._]{1,30}$/.test(pathParts[0])
    ) {
      return pathParts[0].replace(/^\.+|\.+$/g, "").toLowerCase();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Validates that a streaming proxy target URL points strictly to official Meta/Instagram CDN servers.
 * Prevents SSRF exploitation of the /api/download endpoint.
 */
export function validateDownloadTargetUrl(targetUrl: string): { valid: boolean; error?: string } {
  if (!targetUrl || typeof targetUrl !== "string") {
    return { valid: false, error: "Missing media URL." };
  }

  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return { valid: false, error: "Invalid media URL structure." };
  }

  // Protocol must be strictly HTTPS
  if (parsed.protocol !== "https:") {
    return { valid: false, error: "Insecure streaming protocol rejected." };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Reject internal or cloud metadata IPs
  for (const pattern of BLOCKED_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      return { valid: false, error: "Prohibited streaming target." };
    }
  }

  // Custom port restrictions (must be default HTTPS port 443)
  if (parsed.port && parsed.port !== "443") {
    return { valid: false, error: "Non-standard streaming port rejected." };
  }

  // Host must strictly match allowed Meta/Instagram CDN hosts
  const isCdn = ALLOWED_CDN_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
  if (!isCdn) {
    return {
      valid: false,
      error: "Media source is not an authorized Instagram CDN server.",
    };
  }

  return { valid: true };
}

/**
 * Sanitizes download filenames to prevent path traversal (../), null byte injection,
 * and malicious OS executable extensions.
 */
export function sanitizeFilename(
  rawFilename: string,
  defaultExt: "mp4" | "mp3" | "jpg" = "mp4"
): string {
  if (!rawFilename || typeof rawFilename !== "string") {
    return `gramsave_media_${Date.now()}.${defaultExt}`;
  }

  // Strip null bytes and control characters
  let clean = rawFilename.replace(/[\x00-\x1f\x7f]/g, "").trim();

  // Strip directory traversal patterns: ../ or ..\ or leading slashes
  clean = clean.replace(/\.\.+[/\\]/g, "");
  clean = clean.replace(/[/\\?%*:|"<>]/g, "");

  // Separate name and extension
  const lastDotIndex = clean.lastIndexOf(".");
  let namePart = lastDotIndex > 0 ? clean.substring(0, lastDotIndex) : clean;
  let extPart = lastDotIndex > 0 ? clean.substring(lastDotIndex + 1).toLowerCase() : "";

  // Whitelist safe extensions
  const ALLOWED_EXTS = new Set(["mp4", "mp3", "jpg", "jpeg", "webp", "m4a"]);
  if (!ALLOWED_EXTS.has(extPart)) {
    extPart = defaultExt;
  }

  // Keep only safe characters in name part: alphanumeric, underscores, dashes
  namePart = namePart.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_");

  // Fallback if name becomes empty
  if (!namePart) {
    namePart = `gramsave_${Date.now()}`;
  }

  // Limit name length to 80 chars
  if (namePart.length > 80) {
    namePart = namePart.substring(0, 80);
  }

  return `${namePart}.${extPart}`;
}
