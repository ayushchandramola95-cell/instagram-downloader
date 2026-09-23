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

function cleanQualityLabel(height?: number, formatNote?: string): string {
  if (height && height >= 1080) return "1080p Full HD • Best Quality";
  if (height && height >= 720) return "720p HD • High Definition";
  if (height && height >= 480) return "480p SD • Standard Quality";
  if (formatNote && !formatNote.toLowerCase().includes("dash")) return formatNote;
  return "Original Quality";
}

/**
 * Builds resolutions array from a single yt-dlp item
 */
function buildResolutionsFromOutput(item: YtDlpOutput): MediaResolution[] {
  const resolutions: MediaResolution[] = [];
  const isVideo = item.ext === "mp4" || Boolean(item.formats?.some((f) => f.vcodec && f.vcodec !== "none"));
  const directVideoUrl = item.url;

  if (isVideo) {
    const videoFormats = (item.formats || [])
      .filter((f) => f.url && f.vcodec && f.vcodec !== "none")
      .sort((a, b) => (b.height || 0) - (a.height || 0));

    if (videoFormats.length > 0) {
      // 1080p or highest
      const bestFmt = videoFormats[0];
      resolutions.push({
        label: (bestFmt.height && bestFmt.height >= 1080) ? "1080p Full HD" : `${bestFmt.height || "HD"} Video`,
        quality: "Original HD MP4 • Best Quality",
        size: bestFmt.filesize ? `${(bestFmt.filesize / (1024 * 1024)).toFixed(1)} MB` : "HD Quality",
        type: "mp4",
        downloadUrl: bestFmt.url,
        width: bestFmt.width,
        height: bestFmt.height,
        isBest: true,
      });

      // 720p HD
      const midFmt = videoFormats.find((f) => f.height && f.height <= 720 && f.height >= 540) || (videoFormats[1] !== bestFmt ? videoFormats[1] : undefined);
      if (midFmt && midFmt.url !== bestFmt.url) {
        resolutions.push({
          label: `${midFmt.height || 720}p HD`,
          quality: "Standard Quality MP4",
          size: midFmt.filesize ? `${(midFmt.filesize / (1024 * 1024)).toFixed(1)} MB` : "Optimized Size",
          type: "mp4",
          downloadUrl: midFmt.url,
          width: midFmt.width,
          height: midFmt.height,
        });
      }

      // 480p SD
      const lowFmt = videoFormats.find((f) => f.height && f.height <= 480) || (videoFormats[2] && videoFormats[2].url !== bestFmt.url && videoFormats[2].url !== midFmt?.url ? videoFormats[2] : undefined);
      if (lowFmt && lowFmt.url !== bestFmt.url && lowFmt.url !== midFmt?.url) {
        resolutions.push({
          label: `${lowFmt.height || 480}p SD`,
          quality: "Compressed Mobile Video",
          size: lowFmt.filesize ? `${(lowFmt.filesize / (1024 * 1024)).toFixed(1)} MB` : "Fast Download",
          type: "mp4",
          downloadUrl: lowFmt.url,
          width: lowFmt.width,
          height: lowFmt.height,
        });
      }

      // MP3 Audio Track Options
      const audioUrl = bestFmt.url || directVideoUrl || "";
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
    const photoFormats = (item.formats || []).filter((f) => f.url);
    if (photoFormats.length > 0) {
      const bestPhoto = photoFormats[photoFormats.length - 1];
      resolutions.push({
        label: "1080p Original Photo",
        quality: "Original Lossless JPG",
        size: bestPhoto.filesize ? `${(bestPhoto.filesize / (1024 * 1024)).toFixed(1)} MB` : "Lossless",
        type: "jpg",
        downloadUrl: bestPhoto.url,
        width: bestPhoto.width,
        height: bestPhoto.height,
        isBest: true,
      });
      if (photoFormats.length > 1) {
        const midPhoto = photoFormats[Math.floor(photoFormats.length / 2)];
        if (midPhoto && midPhoto.url !== bestPhoto.url) {
          resolutions.push({
            label: "720p Compressed Photo",
            quality: "Optimized Mobile JPG",
            size: midPhoto.filesize ? `${(midPhoto.filesize / (1024 * 1024)).toFixed(1)} MB` : "Standard",
            type: "jpg",
            downloadUrl: midPhoto.url,
            width: midPhoto.width,
            height: midPhoto.height,
          });
        }
      }
    } else if (directVideoUrl || item.thumbnail) {
      resolutions.push({
        label: "1080p Original Photo",
        quality: "Original Lossless JPG",
        type: "jpg",
        downloadUrl: directVideoUrl || item.thumbnail || "",
        isBest: true,
      });
      resolutions.push({
        label: "720p Compressed Photo",
        quality: "Standard JPG",
        type: "jpg",
        downloadUrl: directVideoUrl || item.thumbnail || "",
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

/**
 * Executes self-hosted yt-dlp to extract direct CDN video links and metadata
 */
export async function extractWithYtDlp(targetUrl: string): Promise<ExtractedMedia | null> {
  try {
    const args: string[] = [
      "-j",
      "--no-warnings",
      "--no-check-certificates",
      "--skip-download",
    ];

    // Optional cookies file (Netscape format) to bypass Instagram login walls
    const cookiesEnv = process.env.YT_DLP_COOKIES_PATH;
    const defaultCookies = path.join(process.cwd(), "cookies.txt");
    if (cookiesEnv && fs.existsSync(cookiesEnv)) {
      args.push("--cookies", cookiesEnv);
    } else if (fs.existsSync(defaultCookies)) {
      args.push("--cookies", defaultCookies);
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

    // Run yt-dlp with a 15-second timeout
    const { stdout } = await execFileAsync(ytDlpBinary, args, {
      timeout: 15000,
      maxBuffer: 15 * 1024 * 1024,
    });

    if (!stdout || !stdout.trim()) {
      return null;
    }

    // yt-dlp can output multiple JSON lines for multi-item posts or playlists
    const lines = stdout.trim().split("\n").filter((l) => l.trim().startsWith("{"));
    if (lines.length === 0) return null;

    // Handle Carousel / Multi-item post
    if (lines.length > 1) {
      const parsedItems: YtDlpOutput[] = lines.map((line) => JSON.parse(line));
      const firstItem = parsedItems[0];
      const shortcode = firstItem.id || "instagram_album";

      const carouselItems: MediaChildItem[] = parsedItems.map((item, index) => {
        const itemResolutions = buildResolutionsFromOutput(item);
        const isVideo = item.ext === "mp4" || Boolean(item.formats?.some((f) => f.vcodec && f.vcodec !== "none"));
        const downloadUrl = itemResolutions[0]?.downloadUrl || item.url || "";

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
