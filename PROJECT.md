# InstaSnap - Instagram Video & Media Downloader
### Comprehensive Technical Documentation & Architecture Manual

---

## 1. Project Overview

**InstaSnap** is a next-generation, high-performance web application designed to download Instagram Reels, Videos, Stories, Photos, and Audio (MP3) in crystal-clear **1080p Full HD & 4K** without watermarks, logins, or software installations.

### Key Value Propositions
* **100% Free & Anonymous**: Zero registration or user credentials required.
* **Direct File Streaming**: Bypasses Instagram's cross-origin hotlink protections, ensuring the file is saved directly to the user's Downloads or Photos folder.
* **Self-Hosted yt-dlp Extraction Engine**: Full control over extraction without forced reliance on expensive third-party APIs.
* **SEO-First Architecture**: Built to rank #1 on Google with Server-Side Rendering (SSR), structured data schemas (`WebApplication`, `HowTo`, `FAQPage`), and ultra-fast Core Web Vitals.
* **Cloud & Edge Ready**: Containerized for Google Cloud Run / AWS with Cloudflare WAF, DDoS mitigation, and global CDN caching.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16.3+ (App Router)** | Hybrid SSR/SSG rendering, routing, Turbopack bundler |
| **Language** | **TypeScript 5+** | Full end-to-end type safety |
| **UI Library** | **React 19** | Component-driven declarative interface |
| **Styling** | **Vanilla CSS + Glassmorphism** | Custom dark mode, Instagram sunset gradients, responsive |
| **Typography** | **Plus Jakarta Sans** (Google Fonts) | Modern, clean digital typography via `next/font` |
| **Extraction** | **Self-Hosted yt-dlp** | Direct CLI video extraction from Instagram CDN |
| **HTTP Client** | **Axios & Fetch API** | Web requests, streaming buffers, and GraphQL queries |
| **Streaming** | **Web Streams API (NextResponse)** | Pipes remote media streams directly to user downloads |
| **Cloud Target** | **Google Cloud Run / AWS ECS** | Serverless container deployment scaling to zero |
| **Edge CDN** | **Cloudflare** | Free SSL, global edge cache, Turnstile anti-bot, WAF |

---

## 3. Repository Directory & File Structure

```
insta video download/
├── .next/                         # Next.js compiled build cache & dev artifacts
├── node_modules/                  # Project dependencies
├── public/                        # Static public assets
│   ├── favicon.ico                # Website browser tab icon
│   ├── next.svg                   # Next.js asset icon
│   └── vercel.svg                 # Vercel mark icon
├── src/
│   ├── app/                       # Next.js App Router root
│   │   ├── api/                   # Backend Serverless API Routes
│   │   │   ├── download/          # Media Streaming Proxy Route
│   │   │   │   └── route.ts       # GET: Streams MP4/MP3 with attachment headers
│   │   │   └── fetch-media/       # Media Extraction Route
│   │   │       └── route.ts       # POST: Validates URL & extracts resolutions
│   │   ├── globals.css            # Global design tokens, glassmorphism, responsive styles
│   │   ├── layout.tsx             # Root layout with SEO metadata & JSON-LD schemas
│   │   └── page.tsx               # Interactive Welcome & Downloader Homepage
│   └── lib/                       # Core Business Logic & Extraction Engines
│       ├── instagram-extractor.ts # Master multi-tiered extraction pipeline
│       ├── types.ts               # TypeScript interfaces for media and resolutions
│       └── ytdlp-extractor.ts     # Self-hosted yt-dlp CLI integration wrapper
├── .env.example                   # Template for environment variables (cookies, proxy, keys)
├── .gitignore                     # Git exclusion rules
├── AGENTS.md                      # Agent rules & Next.js conventions
├── next.config.ts                 # Next.js configuration settings
├── package.json                   # Project metadata, scripts, and dependencies
├── package-lock.json              # Locked dependency tree
├── PROJECT.md                     # Complete project documentation & manual (This file)
├── README.md                      # Quickstart guide
├── tsconfig.json                  # TypeScript compiler configuration
└── cookies.txt                    # (Optional) Exported Netscape cookies for yt-dlp
```

---

## 4. Key Files Explained

### 1. `src/app/page.tsx` (Homepage & Downloader UI)
* **Interactive Client Component**: Built with React state management for fluid real-time interaction.
* **1-Click Clipboard Paste**: Integrated with `navigator.clipboard.readText()`.
* **Sample Test Trigger**: Allows one-click testing of live media extraction without needing to copy an Instagram link.
* **Dynamic Media Preview Card**: Displays creator name, handle, caption, thumbnail, duration, and download action buttons (`1080p Full HD`, `720p HD`, `MP3 Audio`).
* **SEO Content**: Semantic `<h1>` heading, 3-step guide (`HowTo`), feature grid, and expandable accordion (`FAQPage`).

### 2. `src/app/layout.tsx` (Root Layout & SEO Engine)
* **Metadata Configuration**: Title, meta description, keywords, canonical URL, and OpenGraph/Twitter cards.
* **JSON-LD Schema Markup**:
  * `WebApplication`: Displays rating snippets (4.9 stars) in Google search results.
  * `HowTo`: Outlines step-by-step instructions displayed directly in search engine snippets.
* **Typography Optimization**: Configures `Plus_Jakarta_Sans` with variable CSS font tokens.

### 3. `src/lib/ytdlp-extractor.ts` (Self-Hosted yt-dlp Engine)
* **CLI Wrapper**: Executes `yt-dlp` using Node's `child_process.execFile` (secure against command injection).
* **Arguments**:
  * `-j --skip-download --no-warnings`: Dumps raw video and format metadata as JSON without saving files to disk.
  * `--cookies <path>`: Automatically detects and attaches `cookies.txt` to bypass Instagram login challenges.
  * `--proxy <proxy_url>`: Routes requests through residential proxies to prevent rate limiting.
* **Format Parsing**: Intelligently inspects all available video bitrates, extracting the best 1080p stream and audio track.

### 4. `src/lib/instagram-extractor.ts` (Master Extraction Pipeline)
Implements an **automatic failover system** across multiple tiers:
1. **Tier 1**: Self-Hosted `yt-dlp` (fastest, full control, direct CDN URL extraction).
2. **Tier 2**: RapidAPI Instagram Downloader (if `RAPIDAPI_KEY` is present in `.env`).
3. **Tier 3**: Authenticated GraphQL query (if `INSTAGRAM_COOKIE` is configured).
4. **Tier 4**: Public embed scraping fallback.
5. **Tier 5**: Development sample stream (ensures UI testing is always functional).

### 5. `src/app/api/fetch-media/route.ts` (Extraction Endpoint)
* **Method**: `POST`
* **Payload**: `{ "url": "https://www.instagram.com/reel/..." }`
* **Response**: Returns extracted media metadata, creator info, thumbnail, and format options.

### 6. `src/app/api/download/route.ts` (Streaming Download Proxy)
* **Method**: `GET`
* **Parameters**: `?url=<encoded_cdn_url>&filename=<filename.mp4>`
* **Why It Is Essential**: Instagram CDN servers (`*.cdninstagram.com`) send `Content-Disposition: inline` and block cross-origin downloads. This proxy streams the video chunks with `Content-Disposition: attachment; filename="..."`, forcing the browser to trigger a true file download.

---

## 5. Self-Hosted yt-dlp Setup & Configuration

### Prerequisites
* `yt-dlp` installed and accessible in the system `PATH` (already verified on your machine!).
* (Optional for merging video/audio formats): `ffmpeg` installed.

### How to Bypass Instagram Rate Limits & Login Walls
Instagram aggressively restricts datacenter IPs and unauthenticated scraping. To achieve 100% extraction success with `yt-dlp`:

#### Step A: Export Instagram Cookies
1. Open Google Chrome or Microsoft Edge.
2. Log into an Instagram account (a secondary or throwaway account is recommended).
3. Install the browser extension **"Get cookies.txt locally"** (open-source Chrome extension).
4. Navigate to `https://www.instagram.com`, click the extension icon, and click **Export**.
5. Save the file as `cookies.txt` directly in your project root:
   `c:\new website creation\insta video download\cookies.txt`
6. `ytdlp-extractor.ts` will automatically detect and pass this file to every extraction call!

#### Step B: Use Rotating Residential Proxies (For High-Volume Traffic)
For a production website handling thousands of daily users:
1. Obtain residential proxies from providers such as **Webshare**, **Smartproxy**, or **Bright Data**.
2. Add your proxy string to `.env`:
   ```env
   YT_DLP_PROXY=http://username:password@residential.proxyprovider.com:8080
   ```
3. `yt-dlp` will rotate IPs on every request, making bans virtually impossible.

---

## 6. Environment Variables Reference

Create a `.env` file in the root directory (based on `.env.example`):

| Variable | Required? | Default | Description |
| :--- | :---: | :--- | :--- |
| `YT_DLP_BINARY_PATH` | No | `yt-dlp` | Path to yt-dlp binary (e.g. `C:\tools\yt-dlp.exe`) |
| `YT_DLP_COOKIES_PATH`| No | `cookies.txt` | Path to Netscape format Instagram cookies file |
| `YT_DLP_PROXY` | No | *(Empty)* | Residential proxy URL for IP rotation |
| `RAPIDAPI_KEY` | No | *(Empty)* | Optional backup API key from RapidAPI |
| `RAPIDAPI_HOST` | No | `instagram-downloader...` | RapidAPI host endpoint |
| `INSTAGRAM_COOKIE` | No | *(Empty)* | Direct session cookie string |
| `PORT` | No | `3000` | Local web server port |

---

## 7. Cloud Deployment & Cloudflare Setup

### Recommended Architecture: Google Cloud Run + Cloudflare

```
User Browser 
    ──▶ Cloudflare Edge (Free SSL, DDoS WAF, CDN, Turnstile)
          ──▶ Google Cloud Run Container (Next.js + yt-dlp)
                ──▶ Instagram CDN (Direct 1080p Stream)
```

### Production Dockerfile (for Cloud Run or AWS ECS)
Create a `Dockerfile` in the project root:

```dockerfile
# Multi-stage build for minimum image size & maximum performance
FROM node:20-alpine AS base

# Install Python, yt-dlp, and ffmpeg
RUN apk add --no-cache python3 py3-pip ffmpeg curl && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

# Dependencies Stage
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Build Stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production Runner Stage
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/cookies.txt ./cookies.txt

EXPOSE 8080
CMD ["node", "server.js"]
```

### Cloudflare Configuration Checklist
1. **DNS**: Point your domain `A` or `CNAME` records to Google Cloud Run with the **Orange Cloud (Proxied)** enabled.
2. **SSL/TLS**: Set encryption mode to **Full (Strict)**.
3. **Caching**:
   * Add a Cache Rule: URL path starts with `/_next/static/*` ➔ **Edge Cache TTL: 1 year**.
   * Add a Cache Rule: URL path `/api/*` ➔ **Bypass Cache**.
4. **Cloudflare Turnstile (Anti-Bot)**:
   * Protects `/api/fetch-media` from malicious scraping scripts and unauthorized quota drain.
5. **Rate Limiting**:
   * Restrict `/api/fetch-media` to max 30 requests per minute per IP address.

---

## 8. SEO Optimization Strategy (Rank #1 Playbook)

### 1. Dedicated Keyword Landing Pages (Planned Silo Structure)
* `/` ➔ Primary Keyword: *Instagram Video Downloader*
* `/reels-downloader` ➔ Keyword: *Download Instagram Reels 1080p*
* `/story-saver` ➔ Keyword: *Instagram Story Downloader & Viewer*
* `/audio-downloader` ➔ Keyword: *Extract MP3 from Instagram Reels*
* `/photo-downloader` ➔ Keyword: *Save Instagram Posts & Carousel Slides*

### 2. Rich Snippets in Google
* **Ratings Snippet**: The `WebApplication` schema in `layout.tsx` informs Google to display star ratings (★★★★★ 4.9) directly in search snippets.
* **HowTo Accordion**: The `HowTo` schema outlines the 3 steps directly in Google search previews, increasing organic Click-Through-Rate (CTR).

### 3. Internationalization (i18n)
70%+ of social downloader queries originate from non-English markets:
* Spanish: `/es/descargar-videos-instagram`
* Portuguese: `/pt/baixar-videos-instagram`
* Indonesian: `/id/download-video-instagram`
* Hindi: `/hi/instagram-video-download`

---

## 9. Development Commands

```bash
# Start local development server (Turbopack)
npm run dev

# Run production build & type check
npm run build

# Start production server
npm run start

# Lint codebase
npm run lint
```

---

## 10. Summary

Your project now possesses:
1. A **modern Next.js 16 App Router application** with glassmorphic styling and responsive mobile UI.
2. A **self-hosted `yt-dlp` extraction engine** capable of resolving 1080p source streams.
3. A **streaming proxy route** (`/api/download`) that forces direct file downloads.
4. Complete **production architecture blueprints** for Google Cloud Run, Cloudflare, and Google SEO ranking.
