# ==============================================================================
# InstaSnap Production Dockerfile for Google Cloud Run
# Multi-stage build with Standalone Next.js 16 + Node.js 20 + yt-dlp + FFmpeg
# ==============================================================================

# Stage 1: Base image
FROM node:20-bookworm-slim AS base
WORKDIR /app

# Stage 2: Install dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Stage 3: Build application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Next.js build creates .next/standalone
RUN npm run build

# Stage 4: Production runner
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"
ENV YT_DLP_BINARY_PATH="/usr/local/bin/yt-dlp"

# 1. Install Python 3, FFmpeg, curl, and CA certificates
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    python3 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# 2. Install latest official standalone yt-dlp binary
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && /usr/local/bin/yt-dlp --version

# 3. Create non-root system user for container security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 4. Copy public assets and standalone output
COPY --from=builder /app/public ./public

# Set correct permissions for Next.js cache and standalone build
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]
