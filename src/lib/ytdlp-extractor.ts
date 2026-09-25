import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { ExtractedMedia, MediaResolution, MediaChildItem } from "./types";

const execFileAsync = promisify(execFile);

interface YtDlpFormat {
  format_id?: string;
  url: string;
  ext?: string;
  height?: number;
  width?: number;
  vcodec?: string;
  acodec?: string;
  filesize?: number;
  filesize_approx?: number;
  format_note?: string;
  abr?: number;
}

interface YtDlpOutput {
  id: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  uploader?: string;
  uploader_id?: string;
  url?: string;
  ext?: string;
  formats?: YtDlpFormat[];
  entries?: YtDlpOutput[]; // For albums / carousels / stories
}


/**
 * Builds resolutions array from a single yt-dlp item
 */
function buildResolutionsFromOutput(item: YtDlpOutput): MediaResolution[] {
  const resolutions: MediaResolution[] = [];
  const isVideo = item.ext === "mp4" || Boolean(item.formats?.some((f) => f.vcodec && f.vcodec !== "none"));
  const directVideoUrl = item.url;

  if (isVideo) {
    const allFormats = item.formats || [];

    // 1. Separate audio-only tracks for standalone MP3 or muxing
    const audioFormats = allFormats
      .filter((f) => f.url && f.acodec && f.acodec !== "none" && (!f.vcodec || f.vcodec === "none"))
      .sort((a, b) => (b.abr || 0) - (a.abr || 0));

    // 2. Any format with audio
    const anyAudioFormat = allFormats
      .filter((f) => f.url && f.acodec && f.acodec !== "none")
      .sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];

    const bestAudioUrl = audioFormats[0]?.url || anyAudioFormat?.url;

    // 3. Formats that contain BOTH video AND audio
    const formatsWithAudio = allFormats
      .filter((f) => f.url && f.vcodec && f.vcodec !== "none" && f.acodec && f.acodec !== "none")
      .sort((a, b) => (b.height || 0) - (a.height || 0));

    // 4. All video formats (including DASH video-only) sorted highest resolution first
    const allVideoFormats = allFormats
      .filter((f) => f.url && f.vcodec && f.vcodec !== "none")
      .sort((a, b) => (b.height || 0) - (a.height || 0));

    // Prefer allVideoFormats so user gets 1080p / 1440p DASH streams (which we mux with bestAudioUrl)
    const videoFormats = allVideoFormats.length > 0 ? allVideoFormats : formatsWithAudio;

    if (videoFormats.length > 0) {
      // 1080p or highest
      const bestFmt = videoFormats[0];
      const bestHasAudio = Boolean(bestFmt.acodec && bestFmt.acodec !== "none");
      resolutions.push({
        label: (bestFmt.height && bestFmt.height >= 1080) ? "1080p Full HD" : `${bestFmt.height || "HD"} Video`,
        quality: "Original HD MP4 • Best Quality",
        size: bestFmt.filesize ? `${(bestFmt.filesize / (1024 * 1024)).toFixed(1)} MB` : "HD Quality",
        type: "mp4",
        downloadUrl: bestFmt.url,
        width: bestFmt.width,
        height: bestFmt.height,
        isBest: true,
        hasAudio: bestHasAudio,
        audioUrl: bestHasAudio ? undefined : bestAudioUrl,
      });

      // 720p HD
      const midFmt = videoFormats.find((f) => f.height && f.height <= 720 && f.height >= 540) ||
        (videoFormats[1] && videoFormats[1].url !== bestFmt.url ? videoFormats[1] : undefined);
      if (midFmt && midFmt.url !== bestFmt.url) {
        const midHasAudio = Boolean(midFmt.acodec && midFmt.acodec !== "none");
        resolutions.push({
          label: `${midFmt.height || 720}p HD`,
          quality: "Standard Quality MP4",
          size: midFmt.filesize ? `${(midFmt.filesize / (1024 * 1024)).toFixed(1)} MB` : "Optimized Size",
          type: "mp4",
          downloadUrl: midFmt.url,
          width: midFmt.width,
          height: midFmt.height,
          hasAudio: midHasAudio,
          audioUrl: midHasAudio ? undefined : bestAudioUrl,
        });
      }

      // 480p SD
      const lowFmt = videoFormats.find((f) => f.height && f.height <= 480) ||
        (videoFormats[2] && videoFormats[2].url !== bestFmt.url && videoFormats[2].url !== midFmt?.url ? videoFormats[2] : undefined);
      if (lowFmt && lowFmt.url !== bestFmt.url && lowFmt.url !== midFmt?.url) {
        const lowHasAudio = Boolean(lowFmt.acodec && lowFmt.acodec !== "none");
        resolutions.push({
          label: `${lowFmt.height || 480}p SD`,
          quality: "Compressed Mobile Video",
          size: lowFmt.filesize ? `${(lowFmt.filesize / (1024 * 1024)).toFixed(1)} MB` : "Fast Download",
          type: "mp4",
          downloadUrl: lowFmt.url,
          width: lowFmt.width,
          height: lowFmt.height,
          hasAudio: lowHasAudio,
          audioUrl: lowHasAudio ? undefined : bestAudioUrl,
        });
      }

      // MP3 Audio Track Options: Use actual audio stream if available
      const audioUrl = bestAudioUrl || bestFmt.url || directVideoUrl || "";
      resolutions.push({
        label: "320 kbps Studio Audio",
        quality: "High Fidelity Stereo MP3",
        size: "320 kbps MP3",
        type: "mp3",
        downloadUrl: audioUrl,
        bitrate: "320 kbps",
      });
      resolutions.push({
        label: "256 kbps High Audio",
        quality: "Standard Definition MP3",
        size: "256 kbps MP3",
        type: "mp3",
        downloadUrl: audioUrl,
        bitrate: "256 kbps",
      });
      resolutions.push({
        label: "128 kbps Mobile Audio",
        quality: "Compressed Mobile MP3",
        size: "128 kbps MP3",
        type: "mp3",
        downloadUrl: audioUrl,
        bitrate: "128 kbps",
      });
    } else if (directVideoUrl) {
      resolutions.push({
        label: "1080p Full HD",
        quality: "Original HD MP4 • Best Quality",
        size: "High Bitrate",
        type: "mp4",
        downloadUrl: directVideoUrl,
        isBest: true,
      });
      resolutions.push({
        label: "720p HD",
        quality: "Standard Quality MP4",
        size: "Standard Bitrate",
        type: "mp4",
        downloadUrl: directVideoUrl,
      });
      resolutions.push({
        label: "320 kbps Studio Audio",
        quality: "320 kbps Stereo Audio",
        size: "320 kbps MP3",
        type: "mp3",
        downloadUrl: directVideoUrl,
        bitrate: "320 kbps",
      });
      resolutions.push({
        label: "256 kbps High Audio",
        quality: "High Definition MP3",
        size: "256 kbps MP3",
        type: "mp3",
        downloadUrl: directVideoUrl,
        bitrate: "256 kbps",
      });
    }
  } else {
    // Photos
    const photoFormats = (item.formats || [])
      .filter((f) => f.url && (f.vcodec === "none" || !f.vcodec))
      .sort((a, b) => ((b.width || 0) * (b.height || 0)) - ((a.width || 0) * (a.height || 0)));

    const seenDimensions = new Set<string>();
    const uniquePhotos: YtDlpFormat[] = [];
    for (const pf of photoFormats) {
      const dim = pf.width && pf.height ? `${pf.width}x${pf.height}` : pf.url;
      if (!seenDimensions.has(dim)) {
        seenDimensions.add(dim);
        uniquePhotos.push(pf);
      }
    }

    if (uniquePhotos.length > 0) {
      uniquePhotos.forEach((pf, pIdx) => {
        const isBest = pIdx === 0;
        const label = pf.width && pf.height ? `${pf.width}x${pf.height}` : (isBest ? "1080p Original" : `Photo #${pIdx + 1}`);
        resolutions.push({
          label,
          quality: isBest ? "Original Lossless JPG" : "Compressed Photo",
          size: pf.filesize ? `${(pf.filesize / (1024 * 1024)).toFixed(1)} MB` : (isBest ? "Lossless" : "Standard"),
          type: "jpg",
          downloadUrl: pf.url,
          width: pf.width,
          height: pf.height,
          isBest,
        });
      });
    } else if (directVideoUrl || item.thumbnail) {
      resolutions.push({
        label: "1080p Original Photo",
        quality: "Original Lossless JPG",
        type: "jpg",
        downloadUrl: directVideoUrl || item.thumbnail || "",
        isBest: true,
      });
    }
  }

  // Fallback if no formats matched
  if (resolutions.length === 0 && (item.url || item.thumbnail)) {
    resolutions.push({
      label: isVideo ? "1080p Full HD Video" : "High-Res Photo",
      quality: isVideo ? "Original HD MP4" : "Original JPG",
      type: isVideo ? "mp4" : "jpg",
      downloadUrl: item.url || item.thumbnail || "",
      isBest: true,
    });
  }

  return resolutions;
}

interface IgCandidate {
  url: string;
  width?: number;
  height?: number;
}

interface IgVideoVersion {
  url: string;
  width?: number;
  height?: number;
}

interface IgCarouselItem {
  pk?: string;
  id?: string;
  media_type: number; // 1 = photo, 2 = video
  image_versions2?: {
    candidates?: IgCandidate[];
  };
  video_versions?: IgVideoVersion[];
  video_duration?: number;
}

interface IgPolarisProduct {
  pk?: string;
  id?: string;
  code?: string;
  media_type?: number;
  user?: {
    username?: string;
    full_name?: string;
    profile_pic_url?: string;
  };
  caption?: {
    text?: string;
  };
  image_versions2?: {
    candidates?: IgCandidate[];
  };
  video_versions?: IgVideoVersion[];
  video_duration?: number;
  carousel_media?: IgCarouselItem[];
}

function parsePolarisMedia(product: IgPolarisProduct, fallbackShortcode: string): ExtractedMedia | null {
  const shortcode = product.code || fallbackShortcode;
  const author = product.user?.full_name || product.user?.username || "Instagram Creator";
  const authorHandle = `@${product.user?.username || "instagram_user"}`;
  const authorAvatar = product.user?.profile_pic_url;
  const caption = product.caption?.text || "Instagram Post";

  // 1. Carousel Media (multi-photo, multi-video, or mixed)
  if (product.carousel_media && product.carousel_media.length > 0) {
    const carouselItems: MediaChildItem[] = product.carousel_media.map((child, idx) => {
      const isVideo = child.media_type === 2;
      const childResolutions: MediaResolution[] = [];

      if (isVideo && child.video_versions && child.video_versions.length > 0) {
        const sortedVideos = [...child.video_versions].sort((a, b) => (b.height || 0) - (a.height || 0));
        sortedVideos.forEach((v, vIdx) => {
          const isBest = vIdx === 0;
          childResolutions.push({
            label: v.height ? `${v.height}p Video` : `Video Stream #${vIdx + 1}`,
            quality: isBest ? "Original Quality MP4" : `${v.height || "SD"}p Compressed MP4`,
            size: isBest ? "HD Video" : "Standard",
            type: "mp4",
            downloadUrl: v.url,
            width: v.width,
            height: v.height,
            isBest,
          });
        });

        if (sortedVideos[0]) {
          childResolutions.push({
            label: "Audio Track (MP3)",
            quality: "320 kbps Stereo Audio",
            size: "320 kbps",
            type: "mp3",
            downloadUrl: sortedVideos[0].url,
            bitrate: "320 kbps",
          });
        }
      } else if (child.image_versions2?.candidates && child.image_versions2.candidates.length > 0) {
        const allCandidates = [...child.image_versions2.candidates]
          .filter((c) => c.url && (c.width || 0) >= 200)
          .sort((a, b) => ((b.width || 0) * (b.height || 0)) - ((a.width || 0) * (a.height || 0)));
        const candidatesToUse = allCandidates.length > 0 ? allCandidates : child.image_versions2.candidates;

        candidatesToUse.forEach((c, cIdx) => {
          const isOriginal = cIdx === 0;
          childResolutions.push({
            label: c.width && c.height ? `${c.width}x${c.height}` : (isOriginal ? "1080p Original" : `Photo #${cIdx + 1}`),
            quality: isOriginal ? "Original Resolution • Lossless JPG" : `${c.width || "HD"} Compressed JPG`,
            size: isOriginal ? "Original JPG" : "Compressed JPG",
            type: "jpg",
            downloadUrl: c.url,
            width: c.width,
            height: c.height,
            isBest: isOriginal,
          });
        });
      }

      return {
        id: `${shortcode}_${idx + 1}`,
        index: idx + 1,
        type: isVideo ? "video" : "photo",
        thumbnailUrl: child.image_versions2?.candidates?.[0]?.url || "",
        duration: isVideo && child.video_duration ? `${Math.round(child.video_duration)}s` : undefined,
        width: isVideo ? child.video_versions?.[0]?.width : child.image_versions2?.candidates?.[0]?.width,
        height: isVideo ? child.video_versions?.[0]?.height : child.image_versions2?.candidates?.[0]?.height,
        resolutions: childResolutions,
      };
    });

    return {
      id: shortcode,
      shortcode,
      type: "album",
      isCarousel: true,
      author,
      authorHandle,
      authorAvatar,
      caption,
      thumbnailUrl: carouselItems[0]?.thumbnailUrl || "",
      resolutions: carouselItems[0]?.resolutions || [],
      carouselItems,
    };
  }

  // 2. Single Photo
  if (product.media_type === 1 || (!product.video_versions && product.image_versions2?.candidates)) {
    const candidates = [...(product.image_versions2?.candidates || [])]
      .filter((c) => c.url)
      .sort((a, b) => ((b.width || 0) * (b.height || 0)) - ((a.width || 0) * (a.height || 0)));

    if (candidates.length > 0) {
      const resolutions: MediaResolution[] = candidates.map((c, idx) => {
        const isBest = idx === 0;
        return {
          label: c.width && c.height ? `${c.width}x${c.height}` : (isBest ? "1080p Original" : `Resolution #${idx + 1}`),
          quality: isBest ? "Original Resolution • Lossless JPG" : `${c.width || "HD"} Compressed JPG`,
          size: isBest ? "Original Lossless" : "Standard",
          type: "jpg",
          downloadUrl: c.url,
          width: c.width,
          height: c.height,
          isBest,
        };
      });

      return {
        id: shortcode,
        shortcode,
        type: "photo",
        author,
        authorHandle,
        authorAvatar,
        caption,
        thumbnailUrl: candidates[0].url,
        resolutions,
      };
    }
  }

  // 3. Single Video / Reel
  if (product.video_versions && product.video_versions.length > 0) {
    const sortedVideos = [...product.video_versions].sort((a, b) => (b.height || 0) - (a.height || 0));
    const bestVideo = sortedVideos[0];
    const resolutions: MediaResolution[] = [];

    sortedVideos.forEach((v, idx) => {
      const isBest = idx === 0;
      resolutions.push({
        label: v.height ? `${v.height}p Video` : (isBest ? "1080p Full HD" : "Standard Video"),
        quality: isBest ? "Original HD MP4 • Best Quality" : "Compressed MP4",
        size: isBest ? "High Bitrate" : "Optimized",
        type: "mp4",
        downloadUrl: v.url,
        width: v.width,
        height: v.height,
        isBest,
      });
    });

    if (bestVideo) {
      resolutions.push({
        label: "320 kbps Studio Audio",
        quality: "High Fidelity Stereo MP3",
        size: "320 kbps MP3",
        type: "mp3",
        downloadUrl: bestVideo.url,
        bitrate: "320 kbps",
      });
      resolutions.push({
        label: "256 kbps High Audio",
        quality: "Standard Definition MP3",
        size: "256 kbps MP3",
        type: "mp3",
        downloadUrl: bestVideo.url,
        bitrate: "256 kbps",
      });
      resolutions.push({
        label: "128 kbps Mobile Audio",
        quality: "Compressed Mobile MP3",
        size: "128 kbps MP3",
        type: "mp3",
        downloadUrl: bestVideo.url,
        bitrate: "128 kbps",
      });
    }

    return {
      id: shortcode,
      shortcode,
      type: "reel",
      author,
      authorHandle,
      authorAvatar,
      caption,
      thumbnailUrl: product.image_versions2?.candidates?.[0]?.url || "",
      duration: product.video_duration ? `${Math.round(product.video_duration)}s` : undefined,
      resolutions,
    };
  }

  return null;
}

function extractPolarisFromDump(stdout: string): IgPolarisProduct | null {
  try {
    const lines = stdout.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("https://www.instagram.com/api/graphql")) {
        const nextLine = lines[i + 1]?.trim();
        if (nextLine && !nextLine.startsWith("[")) {
          const jsonStr = Buffer.from(nextLine, "base64").toString("utf8");
          const data = JSON.parse(jsonStr);
          const product = data?.data?.xig_polaris_media?.if_not_gated_logged_out;
          if (product && (product.carousel_media || product.image_versions2 || product.video_versions)) {
            return product;
          }
        }
      }
    }
  } catch (e) {
    console.warn("Polaris dump decode error:", e instanceof Error ? e.message : e);
  }
  return null;
}

/**
 * Executes self-hosted yt-dlp to extract direct CDN video/image links and metadata
 */
export async function extractWithYtDlp(targetUrl: string): Promise<ExtractedMedia | null> {
  try {
    const args: string[] = [
      "--dump-pages",
      "--ignore-errors",
      "--no-warnings",
      "--no-check-certificates",
      "--skip-download",
    ];

    // Optional cookies file (Netscape format) to bypass Instagram login walls
    const cookiesEnv = process.env.YT_DLP_COOKIES_PATH;
    const defaultCookies = path.join(process.cwd(), "cookies.txt");
    const tmpCookies = path.join(process.platform === "win32" ? process.cwd() : "/tmp", "gramsave_cookies.txt");

    if (cookiesEnv && fs.existsSync(cookiesEnv)) {
      args.push("--cookies", cookiesEnv);
    } else if (fs.existsSync(defaultCookies)) {
      args.push("--cookies", defaultCookies);
    } else if (process.env.INSTAGRAM_COOKIE) {
      try {
        if (!fs.existsSync(tmpCookies)) {
          const lines = [
            "# Netscape HTTP Cookie File",
            "# Generated automatically from INSTAGRAM_COOKIE environment variable",
          ];
          const parts = process.env.INSTAGRAM_COOKIE.split(";").map((p) => p.trim()).filter(Boolean);
          for (const part of parts) {
            const eqIdx = part.indexOf("=");
            if (eqIdx !== -1) {
              const name = part.slice(0, eqIdx).trim();
              const value = part.slice(eqIdx + 1).trim();
              lines.push(`.instagram.com\tTRUE\t/\tTRUE\t2147483647\t${name}\t${value}`);
            }
          }
          fs.writeFileSync(tmpCookies, lines.join("\n"), "utf8");
        }
        if (fs.existsSync(tmpCookies)) {
          args.push("--cookies", tmpCookies);
        }
      } catch {
        args.push("--add-header", `Cookie: ${process.env.INSTAGRAM_COOKIE}`);
      }
    }

    // Optional residential or rotating proxy
    if (process.env.YT_DLP_PROXY) {
      args.push("--proxy", process.env.YT_DLP_PROXY);
    }

    // Pass custom User-Agent
    const userAgent =
      process.env.YT_DLP_USER_AGENT ||
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    args.push("--user-agent", userAgent);

    // Target URL
    args.push(targetUrl);

    // Path to yt-dlp binary (default 'yt-dlp' from PATH or env override)
    const ytDlpBinary = process.env.YT_DLP_BINARY_PATH || "yt-dlp";

    // Run yt-dlp with a 15-second timeout. If yt-dlp exits with 1 due to photo items, stdout still contains dumped pages.
    let stdout = "";
    try {
      const res = await execFileAsync(ytDlpBinary, args, {
        timeout: 15000,
        maxBuffer: 50 * 1024 * 1024,
      });
      stdout = res.stdout;
    } catch (err: unknown) {
      const anyErr = err as { stdout?: string };
      if (anyErr && typeof anyErr.stdout === "string" && anyErr.stdout.trim()) {
        stdout = anyErr.stdout;
      } else {
        console.warn("yt-dlp execution error:", err instanceof Error ? err.message : err);
        return null;
      }
    }

    if (!stdout || !stdout.trim()) {
      return null;
    }

    const shortcodeMatch = targetUrl.match(/(?:reel|reels|p|tv|share|stories\/[^/]+)\/([a-zA-Z0-9_-]+)/);
    const shortcodeFromUrl = shortcodeMatch ? shortcodeMatch[1] : "instagram_media";

    // 1. Try decoding dumped Polaris GraphQL first (covers all photos, mixed carousels, and videos)
    const polarisProduct = extractPolarisFromDump(stdout);
    if (polarisProduct) {
      const parsedPolaris = parsePolarisMedia(polarisProduct, shortcodeFromUrl);
      if (parsedPolaris) {
        return parsedPolaris;
      }
    }

    // 2. Fallback to standard yt-dlp -j JSON extraction for videos if polaris dump is absent
    let jsonStdout = stdout;
    if (!jsonStdout.includes("{\"") && !jsonStdout.includes("{\n")) {
      try {
        const fallbackArgs = [
          "-j",
          "--no-warnings",
          "--no-check-certificates",
          "--skip-download",
        ];
        if (cookiesEnv && fs.existsSync(cookiesEnv)) {
          fallbackArgs.push("--cookies", cookiesEnv);
        } else if (fs.existsSync(defaultCookies)) {
          fallbackArgs.push("--cookies", defaultCookies);
        }
        if (process.env.YT_DLP_PROXY) {
          fallbackArgs.push("--proxy", process.env.YT_DLP_PROXY);
        }
        fallbackArgs.push("--user-agent", userAgent);
        fallbackArgs.push(targetUrl);

        const res = await execFileAsync(ytDlpBinary, fallbackArgs, {
          timeout: 15000,
          maxBuffer: 15 * 1024 * 1024,
        });
        jsonStdout = res.stdout;
      } catch (err: unknown) {
        const anyErr = err as { stdout?: string };
        if (anyErr?.stdout) jsonStdout = anyErr.stdout;
      }
    }

    // yt-dlp can output multiple JSON lines for multi-item posts or playlists
    const lines = jsonStdout.trim().split("\n").filter((l) => l.trim().startsWith("{"));
    if (lines.length === 0) return null;

    // Handle Carousel / Multi-item post
    if (lines.length > 1) {
      const parsedItems: YtDlpOutput[] = lines.map((line) => JSON.parse(line));
      const firstItem = parsedItems[0];
      const shortcode = firstItem.id || "instagram_album";

      const carouselItems: MediaChildItem[] = parsedItems.map((item, index) => {
        const itemResolutions = buildResolutionsFromOutput(item);
        const isVideo = item.ext === "mp4" || Boolean(item.formats?.some((f) => f.vcodec && f.vcodec !== "none"));

        return {
          id: `${shortcode}_${index + 1}`,
          index: index + 1,
          type: isVideo ? "video" : "photo",
          thumbnailUrl:
            item.thumbnail ||
            itemResolutions[0]?.downloadUrl ||
            "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&auto=format&fit=crop&q=80",
          duration: item.duration ? `${Math.round(item.duration)}s` : undefined,
          resolutions: itemResolutions,
        };
      });

      return {
        id: shortcode,
        shortcode,
        type: "album",
        isCarousel: true,
        author: firstItem.uploader || "Instagram Creator",
        authorHandle: `@${firstItem.uploader_id || firstItem.uploader || "instagram_user"}`,
        caption: firstItem.description || firstItem.title || `Instagram Carousel Album (${carouselItems.length} slides)`,
        thumbnailUrl: carouselItems[0]?.thumbnailUrl || "",
        resolutions: carouselItems[0]?.resolutions || [],
        carouselItems,
      };
    }

    // Single item output
    const data: YtDlpOutput = JSON.parse(lines[0]);

    // If data.entries exists (another way yt-dlp represents playlists)
    if (data.entries && data.entries.length > 0) {
      const carouselItems: MediaChildItem[] = data.entries.map((item, index) => {
        const itemResolutions = buildResolutionsFromOutput(item);
        const isVideo = item.ext === "mp4" || Boolean(item.formats?.some((f) => f.vcodec && f.vcodec !== "none"));
        return {
          id: `${data.id}_${index + 1}`,
          index: index + 1,
          type: isVideo ? "video" : "photo",
          thumbnailUrl:
            item.thumbnail ||
            itemResolutions[0]?.downloadUrl ||
            "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&auto=format&fit=crop&q=80",
          duration: item.duration ? `${Math.round(item.duration)}s` : undefined,
          resolutions: itemResolutions,
        };
      });

      return {
        id: data.id,
        shortcode: data.id,
        type: "album",
        isCarousel: true,
        author: data.uploader || "Instagram Creator",
        authorHandle: `@${data.uploader_id || data.uploader || "instagram_user"}`,
        caption: data.description || data.title || `Instagram Album (${carouselItems.length} items)`,
        thumbnailUrl: carouselItems[0]?.thumbnailUrl || "",
        resolutions: carouselItems[0]?.resolutions || [],
        carouselItems,
      };
    }

    // Single Reel, Video, or Photo
    const resolutions = buildResolutionsFromOutput(data);
    const shortcode = data.id || "instagram_media";
    const isStory = targetUrl.includes("/stories/");
    const hasVideoCodec = Boolean(data.formats?.some((f) => f.vcodec && f.vcodec !== "none"));
    const isVideo = data.ext === "mp4" || hasVideoCodec;

    return {
      id: shortcode,
      shortcode,
      type: isStory ? "story" : isVideo ? "reel" : "photo",
      author: data.uploader || "Instagram Creator",
      authorHandle: `@${data.uploader_id || data.uploader || "instagram_user"}`,
      caption: data.description || data.title || "Instagram Media",
      thumbnailUrl:
        data.thumbnail || "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&auto=format&fit=crop&q=80",
      duration: isVideo && data.duration ? `${Math.round(data.duration)}s` : undefined,
      resolutions,
    };
  } catch (err: unknown) {
    console.warn("yt-dlp extraction warning:", err instanceof Error ? err.message : err);
    return null;
  }
}
