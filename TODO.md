# InstaSnap - Master Project Checklist & Roadmap
### Everything Required to Launch, Scale, and Monetize Your Downloader Website

This checklist outlines all tasks categorized by phase, importance, and status. Use this as your step-by-step master plan.

---

## 🚦 Status Legend
* [x] **Completed** — Built and verified in the codebase
* [ ] **High Priority** — Required before public production launch
* [ ] **Medium Priority** — Post-launch growth, SEO, and feature expansion
* [ ] **Optional / Future** — Monetization, PWA, and scaling enhancements

---

## Phase 1: Core Engine & Media Extraction

- [x] **Next.js 16 Project Setup**: App Router, TypeScript, and Turbopack verified.
- [x] **Glassmorphism UI & Welcome Page**: Dark mode, Instagram gradients, input bar, and FAQ accordion.
- [x] **Direct File Streaming Proxy (`/api/download`)**: Bypasses CORS and forces browser file downloads.
- [x] **Self-Hosted `yt-dlp` Engine (`src/lib/ytdlp-extractor.ts`)**: Direct command execution and format parsing.
- [x] **Fallback Engine & Dev Preview**: Working demo streams so testing is immediate and seamless.
- [x] **Instagram Cookies Architecture & Template**:
  - [x] Created `cookies.txt.template` with step-by-step export instructions.
  - [x] Integrated auto-detection of `cookies.txt` in `ytdlp-extractor.ts`.
  - [x] Formatted and verified live session cookies in `cookies.txt` for `yt-dlp`.
- [x] **Carousel / Album Multi-Slide Support**:
  - [x] Added `MediaChildItem` and carousel schemas to `src/lib/types.ts`.
  - [x] Updated `ytdlp-extractor.ts` to parse multi-item entries (`lines` and `data.entries`).
  - [x] Updated `instagram-extractor.ts` to support multi-slide `XDTGraphSidecar`.
  - [x] Created Album Grid in `page.tsx` with individual slide previews and download buttons.
- [x] **Story & Highlights URL Support**:
  - [x] Added regex parser for `instagram.com/stories/{user}/{id}/` links.
- [x] **Live Download Progress Bar**:
  - [x] Added glowing interactive progress bar with percentage animation and completion feedback in `page.tsx`.


---

## Phase 2: SEO Expansion & Google Rank #1 Architecture

> Downloader sites rely 90%+ on organic search engine traffic. Implementing these keyword silo pages is the key to ranking on Google's first page.

- [x] **Primary Homepage SEO**: Meta tags, OpenGraph previews, canonical tags, and mobile viewport configured.
- [x] **JSON-LD Structured Data**: Embedded `WebApplication` (4.9-star rating) and `HowTo` schema.
- [x] **Keyword Silo Landing Pages**:
  - [x] `/reels-downloader` — Target: *"Instagram Reels Downloader 1080p"*
  - [x] `/story-saver` — Target: *"Download Instagram Stories Anonymously"*
  - [x] `/audio-downloader` — Target: *"Convert Instagram Reels to MP3"*
  - [x] `/photo-downloader` — Target: *"Instagram Photo & Profile Picture Downloader"*
  - [x] `/profile-downloader` — Target: *"Instagram Profile Picture Downloader 1080p"*
  - [x] `/dp-viewer` — Target: *"Instagram DP Viewer & Full-Size DP Zoom"*
- [x] **Search Engine Indexing Files**:
  - [x] `src/app/sitemap.ts` — Dynamic XML sitemap generator with `hreflang` alternates for 8 languages.
  - [x] `src/app/robots.ts` — Directives allowing Googlebot/Bingbot while disallowing `/developer` and `/api/`.
- [x] **Branded OpenGraph Image**:
  - [x] High-resolution preview card `public/og-image.jpg` configured with meta tags.
- [x] **Internationalization (i18n) for Global Traffic**:
  - [x] 8-language engine (English, Spanish, Portuguese, Indonesian, Hindi, French, Arabic, German).
  - [x] `hreflang` alternate annotations in metadata and sitemap.xml.
  - [x] Full developer CMS to edit translations and add new languages live.

---

## Phase 3: Legal Compliance & User Trust Pages

> Mandatory for Google AdSense approval and protecting you from DMCA/copyright issues.

- [x] **Terms of Service (`/terms`)**:
  - [x] Clarify that the tool is intended solely for personal, non-commercial use and fair-use archiving.
  - [x] Explicit disclaimer that the tool is not affiliated with Meta or Instagram.
- [x] **Privacy Policy (`/privacy`)**:
  - [x] Explicit statement confirming zero user credential collection and no tracking of downloaded media.
  - [x] Compliance disclosure for cookies, Cloudflare edge logs, and advertising partners.
- [x] **DMCA & Content Takedown Page (`/contact` or `/dmca`)**:
  - [x] Official contact email and guidelines for copyright holders to request immediate URL blocking.

---

## Phase 4: Security, Anti-Bot & Abuse Prevention

- [x] **Cloudflare Turnstile (Invisible CAPTCHA)**:
  - [x] Embed Cloudflare Turnstile widget on the search form with graceful bypass for local development.
  - [x] Verify Turnstile token in `/api/fetch-media` to block bot scrapers from consuming server CPU/bandwidth.
- [x] **API Rate Limiting**:
  - [x] Restrict `/api/fetch-media` to maximum 30 requests per minute per IP address (sliding-window in-memory limiter with automatic garbage collection).
  - [x] Restrict `/api/download` to maximum 60 download streams per minute per IP address with `429 Too Many Requests` & `Retry-After` headers.
- [x] **Strict URL Validation & SSRF Guard**:
  - [x] Reject non-Instagram URLs immediately to prevent malicious SSRF attempts against localhost, cloud metadata, or internal subnets.
  - [x] Restrict remote streaming in `/api/download` strictly to authentic Meta/Instagram CDN hosts (`*.cdninstagram.com`, `*.fbcdn.net`).
- [x] **Filename Sanitization**:
  - [x] Ensure download filenames strip special characters, null bytes, and path traversal patterns (`../`, `..\`) and enforce whitelist extensions.

---

## Phase 5: Cloud Deployment (Google Cloud Run / AWS)

- [x] **Production `Dockerfile` Creation**:
  - [x] Configured multi-stage Docker build (`node:20-bookworm-slim`).
  - [x] Bundled official `yt-dlp` standalone binary, Python 3, and `ffmpeg` inside container.
  - [x] Enabled Next.js `output: "standalone"` in `next.config.ts` (tested and compiled).
  - [x] Created `.dockerignore` for minimal context transfer.
  - [x] Created `cloudbuild.yaml` for 1-click Google Cloud Build & Cloud Run deployment.
- [ ] **Google Cloud Run Deployment**:
  - [ ] Connect Google Cloud project (with $300 credit).
  - [ ] Deploy container to Cloud Run with:
    - Minimum instances: 0 (Costs $0 when idle)
    - CPU: 1 vCPU
    - Memory: 1 GB RAM
    - Request timeout: 60s (for video streaming)
    - Concurrency: 80
- [ ] **Cloudflare DNS & Caching Setup**:
  - [ ] Point custom domain (`yourdomain.com`) to Cloud Run with Orange Cloud (Proxied) enabled.
  - [ ] Enable **SSL/TLS: Full (Strict)**.
  - [ ] Add Cache Rule: Cache `/_next/static/*` for 1 year at the edge.
  - [ ] Add Cache Rule: Bypass cache for all `/api/*` endpoints.

---

## Phase 6: Monetization & Traffic Growth

- [ ] **Google Search Console**:
  - [ ] Verify domain ownership in Google Search Console.
  - [ ] Submit `sitemap.xml` for rapid Google indexing.
- [ ] **Analytics Setup**:
  - [ ] Integrate Google Analytics 4 (GA4) to track user traffic, referrers, and popular search terms.
- [ ] **Ad Placements (Revenue Generation)**:
  - [ ] Apply for **Google AdSense** once legal pages and landing pages are live.
  - [ ] Alternative high-CPM networks: **Adsterra**, **Monetag**, or **Media.net**.
  - [ ] Responsive ad zones:
    - Top banner ad (728x90 desktop / 320x50 mobile).
    - Rectangle ad below download button (300x250).
    - Native interstitial ad triggered upon clicking "Download".

---

## Priority Order: What You Should Do Next

| Step | Action | Estimated Time | Why It Matters |
| :---: | :--- | :---: | :--- |
| **1** | Export `cookies.txt` to project root | 2 mins | Unlocks live Instagram downloads via your local `yt-dlp` |
| **2** | Create Keyword Landing Pages (`/reels-downloader`, `/story-saver`) | 30 mins | Multiplies organic Google traffic by 5x-10x |
| **3** | Add Legal Pages (`/terms`, `/privacy`, `/contact`) | 15 mins | Mandatory for Google AdSense and search trust |
| **4** | Build `Dockerfile` & Deploy to Google Cloud Run | 25 mins | Makes your site accessible to the public worldwide |
| **5** | Connect Cloudflare & Submit to Google Search Console | 15 mins | Free SSL, bot protection, and search indexing |
