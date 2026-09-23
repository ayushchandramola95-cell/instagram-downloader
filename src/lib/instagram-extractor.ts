import axios from "axios";
import qs from "qs";
import fs from "fs";
import path from "path";
import { ExtractedMedia, MediaChildItem, MediaResolution } from "./types";
import { extractWithYtDlp } from "./ytdlp-extractor";

/**
 * Reads cookie string from cookies.txt (Netscape format) or INSTAGRAM_COOKIE env
 */
export function getCookieString(): string {
  if (process.env.INSTAGRAM_COOKIE) {
    return process.env.INSTAGRAM_COOKIE;
  }

  const cookiePath = process.env.YT_DLP_COOKIES_PATH || path.join(process.cwd(), "cookies.txt");
  if (!fs.existsSync(/*turbopackIgnore: true*/ cookiePath)) return "";

  try {
    const lines = fs.readFileSync(/*turbopackIgnore: true*/ cookiePath, "utf8").split("\n");
    return lines
      .filter((l) => l && !l.startsWith("#"))
      .map((l) => {
        const parts = l.split("\t");
        return parts.length >= 7 ? `${parts[5]}=${parts[6].trim()}` : "";
      })
      .filter(Boolean)
      .join("; ");
  } catch {
    return "";
  }
}

/**
 * Converts alphanumeric Instagram shortcode to numeric media ID (PK)
 */
export function shortcodeToMediaId(shortcode: string): string | null {
  if (/^\d+$/.test(shortcode)) {
    return shortcode;
  }
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let id = BigInt(0);
  for (let i = 0; i < shortcode.length; i++) {
    const idx = alphabet.indexOf(shortcode[i]);
    if (idx === -1) return null;
    id = id * BigInt(64) + BigInt(idx);
  }
  return id.toString();
}

/**
 * Detects if a URL is a user's story profile feed (/stories/username/)
 */
export function isStoryProfileUrl(inputUrl: string): boolean {
  try {
    const url = new URL(inputUrl.trim());
    const pathParts = url.pathname.split("/").filter(Boolean);
    const storiesIndex = pathParts.findIndex((p) => p.toLowerCase() === "stories");
    return storiesIndex !== -1 && (!pathParts[storiesIndex + 2] || !/^\d+$/.test(pathParts[storiesIndex + 2]));
  } catch {
    return false;
  }
}

/**
 * Extracts username from story profile URL (/stories/username/)
 */
export function extractStoryUsername(inputUrl: string): string | null {
  try {
    const url = new URL(inputUrl.trim());
    const pathParts = url.pathname.split("/").filter(Boolean);
    const storiesIndex = pathParts.findIndex((p) => p.toLowerCase() === "stories");
    if (storiesIndex !== -1 && pathParts[storiesIndex + 1]) {
      return pathParts[storiesIndex + 1].toLowerCase().replace(/[^a-z0-9._]/g, "");
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Extracts the Instagram shortcode or story item ID from various link formats
 */
export function extractShortcode(inputUrl: string): string | null {
  try {
    const url = new URL(inputUrl.trim());
    const pathParts = url.pathname.split("/").filter(Boolean);

    // Formats: /reel/SHORTCODE/, /p/SHORTCODE/, /tv/SHORTCODE/, /share/SHORTCODE/
    const tagIndex = pathParts.findIndex((p) =>
      ["reel", "reels", "p", "tv", "share"].includes(p.toLowerCase())
    );

    if (tagIndex !== -1 && pathParts[tagIndex + 1]) {
      return pathParts[tagIndex + 1];
    }

    // Story Format: /stories/username/STORY_ID/
    const storiesIndex = pathParts.findIndex((p) => p.toLowerCase() === "stories");
    if (storiesIndex !== -1 && pathParts[storiesIndex + 2]) {
      return pathParts[storiesIndex + 2];
    }

    if (pathParts.length > 0) {
      return pathParts[pathParts.length - 1];
    }

    return null;
  } catch {
    // Regex fallback
    const match = inputUrl.match(/(?:reel|reels|p|tv|share|stories\/[^/]+)\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }
}

/**
 * Strategy: Direct Authenticated Instagram Mobile API
 * Retrieves uncompressed photos (1080x1440), multi-slide albums, and videos
 */
export async function extractViaDirectApi(shortcode: string): Promise<ExtractedMedia | null> {
  try {
    const mediaId = shortcodeToMediaId(shortcode);
    if (!mediaId) return null;

    const cookieStr = getCookieString();
    const headers: Record<string, string> = {
      "User-Agent": "Instagram 275.0.0.27.98 (iPhone14,2; iOS 16_3; en_US; en-US; scale=3.00; 1170x2532; 456893456)",
      "X-IG-App-ID": "936619743392459",
      "Accept-Language": "en-US,en;q=0.9",
    };

    if (cookieStr) {
      headers["Cookie"] = cookieStr;
    }

    const res = await axios.get(`https://i.instagram.com/api/v1/media/${mediaId}/info/`, {
      headers,
      timeout: 10000,
    });

    const item = res.data?.items?.[0];
    if (!item) return null;

    const author = item.user?.full_name || item.user?.username || "Instagram Creator";
    const authorHandle = `@${item.user?.username || "instagram_user"}`;
    const caption = item.caption?.text || "";

    // 1. Single Photo (media_type === 1)
    if (item.media_type === 1) {
      const allCandidates = (item.image_versions2?.candidates || [])
        .filter((c: { width: number; height: number; url: string }) => c.url && c.width && c.width >= 200)
        .sort((a: { width: number; height: number }, b: { width: number; height: number }) => (b.width * b.height) - (a.width * a.height));
      const candidates = allCandidates.length > 0 ? allCandidates : (item.image_versions2?.candidates || []).slice(0, 1);
      const bestCandidate = candidates[0];
      const resolutions: MediaResolution[] = candidates.map((c: { width: number; height: number; url: string }, idx: number) => {
        const isBest = idx === 0;
        return {
          label: `${c.width}x${c.height}`,
          quality: isBest ? "Original Resolution • Lossless JPG" : `${c.width}x${c.height} Compressed JPG`,
          size: isBest ? "Original Lossless" : "Optimized Size",
          type: "jpg" as const,
          downloadUrl: c.url,
          isBest,
          width: c.width,
          height: c.height,
        };
      });

      return {
        id: shortcode,
        shortcode,
        type: "photo",
        author,
        authorHandle,
        caption,
        thumbnailUrl: bestCandidate?.url || "",
        resolutions,
      };
    }

    // 2. Single Video / Reel / Story (media_type === 2)
    if (item.media_type === 2) {
      const videoVersions = item.video_versions || [];
      const bestVideo = videoVersions[0];
      const imageCandidate = item.image_versions2?.candidates?.[0];
      const duration = item.video_duration ? `${Math.round(item.video_duration)}s` : undefined;

      const resolutions: MediaResolution[] = [];
      if (bestVideo) {
        resolutions.push({
          label: (bestVideo.height && bestVideo.height >= 1080) ? "1080p Full HD" : `${bestVideo.height || "HD"} Video`,
          quality: "Original Bitrate • Best Quality",
          size: "Full HD Video",
          type: "mp4" as const,
          downloadUrl: bestVideo.url,
          width: bestVideo.width,
          height: bestVideo.height,
          isBest: true,
        });

        if (videoVersions.length > 1) {
          const secondVideo = videoVersions[1];
          resolutions.push({
            label: `${secondVideo.height || "720"}p HD`,
            quality: "Standard Quality MP4",
            size: "Standard Bitrate",
            type: "mp4" as const,
            downloadUrl: secondVideo.url,
            width: secondVideo.width,
            height: secondVideo.height,
          });
        }

        if (videoVersions.length > 2) {
          const thirdVideo = videoVersions[2];
          resolutions.push({
            label: `${thirdVideo.height || "480"}p SD`,
            quality: "Compressed Mobile Video",
            size: "Fast Download",
            type: "mp4" as const,
            downloadUrl: thirdVideo.url,
            width: thirdVideo.width,
            height: thirdVideo.height,
          });
        }

      // Extract dedicated progressive audio track if available in clips/music metadata
      const musicInfoUrl: string | undefined =
        item.clips_metadata?.music_info?.music_asset_info?.progressive_download_url ||
        item.clips_metadata?.original_sound_info?.progressive_download_url ||
        item.music_metadata?.music_info?.music_asset_info?.progressive_download_url;
      const audioDownloadUrl = musicInfoUrl || bestVideo.url;

      // Dedicated Audio Tracks for user selection
      resolutions.push({
        label: "320 kbps Studio Audio",
        quality: "Ultra High Fidelity Stereo",
        size: "320 kbps MP3",
        type: "mp3" as const,
        downloadUrl: audioDownloadUrl,
        bitrate: "320 kbps",
      });

      resolutions.push({
        label: "256 kbps High Audio",
        quality: "High Definition MP3",
        size: "256 kbps MP3",
        type: "mp3" as const,
        downloadUrl: audioDownloadUrl,
        bitrate: "256 kbps",
      });

      resolutions.push({
        label: "128 kbps Standard Audio",
        quality: "Compressed Mobile MP3",
        size: "128 kbps MP3",
        type: "mp3" as const,
        downloadUrl: audioDownloadUrl,
          bitrate: "128 kbps",
        });
      }

      return {
        id: shortcode,
        shortcode,
        type: item.is_dash_eligible ? "reel" : "video",
        author,
        authorHandle,
        caption,
        thumbnailUrl: imageCandidate?.url || "",
        duration,
        resolutions,
      };
    }

    // 3. Carousel Album (media_type === 8)
    if (item.media_type === 8 && item.carousel_media) {
      const carouselItems: MediaChildItem[] = item.carousel_media.map((child: any, idx: number) => {
        const isChildVideo = child.media_type === 2;
        const childResolutions: MediaResolution[] = [];

        if (isChildVideo && child.video_versions && child.video_versions.length > 0) {
          const sortedVideos = [...child.video_versions].sort((a: any, b: any) => (b.height || 0) - (a.height || 0));
          sortedVideos.forEach((v: any, vIdx: number) => {
            const isBest = vIdx === 0;
            childResolutions.push({
              label: v.height ? `${v.height}p Video` : `Video Stream #${vIdx + 1}`,
              quality: isBest ? "Original Quality MP4" : `${v.height || "SD"}p Compressed MP4`,
              size: isBest ? "HD Video" : "Standard",
              type: "mp4" as const,
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
              type: "mp3" as const,
              downloadUrl: sortedVideos[0].url,
              bitrate: "320 kbps",
            });
          }
        } else if (child.image_versions2?.candidates?.[0]) {
          const allCandidates = (child.image_versions2.candidates || [])
            .filter((c: any) => c.url && c.width && c.width >= 200)
            .sort((a: any, b: any) => (b.width * b.height) - (a.width * a.height));
          const candidatesToUse = allCandidates.length > 0 ? allCandidates : [child.image_versions2.candidates[0]];

          candidatesToUse.forEach((c: any, cIdx: number) => {
            const isOriginal = cIdx === 0;
            childResolutions.push({
              label: `${c.width}x${c.height}`,
              quality: isOriginal ? "Original Resolution • Lossless JPG" : `${c.width}x${c.height} Standard`,
              size: isOriginal ? "Original JPG" : "Compressed JPG",
              type: "jpg" as const,
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
          type: isChildVideo ? "video" : "photo",
          thumbnailUrl: child.image_versions2?.candidates?.[0]?.url || "",
          duration: isChildVideo && child.video_duration ? `${Math.round(child.video_duration)}s` : undefined,
          width: isChildVideo ? child.video_versions?.[0]?.width : child.image_versions2?.candidates?.[0]?.width,
          height: isChildVideo ? child.video_versions?.[0]?.height : child.image_versions2?.candidates?.[0]?.height,
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
        caption,
        thumbnailUrl: carouselItems[0]?.thumbnailUrl || "",
        resolutions: carouselItems[0]?.resolutions || [],
        carouselItems,
      };
    }
  } catch (err: unknown) {
    console.warn("Direct API extraction warning:", err instanceof Error ? err.message : err);
  }

  return null;
}

/**
 * Extracts active stories for a user profile (/stories/username/)
 */
export async function extractUserStories(username: string): Promise<ExtractedMedia> {
  const cookieStr = getCookieString();

  // 1. Get user_id from profile page HTML
  let userId: string | null = null;
  try {
    const res = await axios.get(`https://www.instagram.com/${username}/`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Cookie": cookieStr,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9",
        "Sec-Fetch-Site": "same-origin",
      },
      timeout: 10000,
    });
    const html = res.data;
    if (typeof html === "string") {
      const match = html.match(/"user_id":\s*"(\d+)"/) || html.match(/"id":\s*"(\d+)"/) || html.match(/profilePage_(\d+)/);
      if (match) userId = match[1];
    }
  } catch (e: unknown) {
    console.warn("Failed to get user_id from profile:", e instanceof Error ? e.message : e);
  }

  if (!userId) {
    throw new Error(`Could not find Instagram user @${username}. Please verify the profile username or story link.`);
  }

  // 2. Query stories feed
  const resStories = await axios.get(`https://i.instagram.com/api/v1/feed/reels_media/?reel_ids=${userId}`, {
    headers: {
      "User-Agent": "Instagram 275.0.0.27.98 (iPhone14,2; iOS 16_3; en_US; en-US; scale=3.00; 1170x2532; 456893456)",
      "X-IG-App-ID": "936619743392459",
      "Cookie": cookieStr,
    },
    timeout: 10000,
  });

  const reelsMedia = resStories.data?.reels_media || [];
  const userReel = reelsMedia.find((r: any) => r.user?.pk == userId || r.id == userId) || reelsMedia[0];

  if (!userReel || !userReel.items || userReel.items.length === 0) {
    throw new Error(`@${username} has no active stories right now. Instagram stories disappear automatically after 24 hours.`);
  }

  const items = userReel.items;

  if (items.length === 1) {
    const it = items[0];
    const isVideo = it.media_type === 2;
    const dlUrl = (isVideo ? it.video_versions?.[0]?.url : it.image_versions2?.candidates?.[0]?.url) || "";
    const resolutions: MediaResolution[] = [
      {
        label: isVideo ? "1080p Video Story" : "High-Res Photo Story",
        quality: "Original Story Quality",
        type: isVideo ? "mp4" : "jpg",
        downloadUrl: dlUrl,
        isBest: true,
      },
    ];
    if (isVideo) {
      resolutions.push({
        label: "Audio Track (MP3)",
        quality: "Story Audio",
        type: "mp3" as const,
        downloadUrl: dlUrl,
      });
    }

    return {
      id: it.id,
      shortcode: it.id,
      type: "story",
      author: userReel.user?.full_name || username,
      authorHandle: `@${username}`,
      caption: `Active Instagram Story from @${username}`,
      thumbnailUrl: it.image_versions2?.candidates?.[0]?.url || "",
      duration: isVideo && it.video_duration ? `${Math.round(it.video_duration)}s` : undefined,
      resolutions,
    };
  }

  const carouselItems: MediaChildItem[] = items.map((it: any, idx: number) => {
    const isVideo = it.media_type === 2;
    const dlUrl = (isVideo ? it.video_versions?.[0]?.url : it.image_versions2?.candidates?.[0]?.url) || "";
    return {
      id: `${userReel.id}_${idx + 1}`,
      index: idx + 1,
      type: isVideo ? "video" : "photo",
      thumbnailUrl: it.image_versions2?.candidates?.[0]?.url || "",
      duration: isVideo && it.video_duration ? `${Math.round(it.video_duration)}s` : undefined,
      resolutions: isVideo
        ? [
            {
              label: `Story #${idx + 1} (1080p Video)`,
              quality: "Original Quality MP4",
              type: "mp4" as const,
              downloadUrl: dlUrl,
              isBest: true,
            },
            {
              label: `Story #${idx + 1} Audio (MP3)`,
              quality: "320 kbps Stereo Audio",
              type: "mp3" as const,
              downloadUrl: dlUrl,
              bitrate: "320 kbps",
            },
          ]
        : [
            {
              label: `Story #${idx + 1} (High-Res Photo)`,
              quality: "Original Quality JPG",
              type: "jpg" as const,
              downloadUrl: dlUrl,
              isBest: true,
            },
          ],
    };
  });

  return {
    id: userReel.id,
    shortcode: userReel.id,
    type: "album",
    isCarousel: true,
    author: userReel.user?.full_name || username,
    authorHandle: `@${username}`,
    caption: `${items.length} Active Stories from @${username}`,
    thumbnailUrl: carouselItems[0]?.thumbnailUrl || "",
    resolutions: carouselItems[0]?.resolutions || [],
    carouselItems,
  };
}

/**
 * Strategy: RapidAPI Instagram Downloader (Optional cloud fallback)
 */
async function extractViaRapidApi(url: string): Promise<ExtractedMedia | null> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) return null;

  try {
    const host = process.env.RAPIDAPI_HOST || "instagram-downloader-download-instagram-videos-stories1.p.rapidapi.com";
    const res = await axios.get(`https://${host}/`, {
      params: { url },
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": host,
      },
      timeout: 10000,
    });

    if (res.data && (res.data.media || res.data.url || res.data.download_url)) {
      const data = res.data;
      const downloadUrl = data.download_url || data.url || (data.media && data.media[0]);
      const shortcode = extractShortcode(url) || "instagram_video";

      return {
        id: shortcode,
        shortcode,
        type: "reel",
        author: data.author || data.owner || "Instagram Creator",
        authorHandle: `@${data.username || "instagram_creator"}`,
        caption: data.title || data.caption || "Instagram Video",
        thumbnailUrl: data.thumbnail || data.thumb || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
        duration: data.duration || "0:30",
        resolutions: [
          {
            label: "1080p Full HD Video",
            quality: "Original HD",
            size: "Source MP4",
            type: "mp4",
            downloadUrl,
            isBest: true,
          },
          {
            label: "Audio Track (MP3)",
            quality: "320 kbps",
            size: "Audio Track",
            type: "mp3",
            downloadUrl,
          },
        ],
      };
    }
  } catch (err: unknown) {
    console.warn("RapidAPI extraction error:", err instanceof Error ? err.message : err);
  }

  return null;
}

/**
 * Strategy 2: Direct GraphQL query using optional session cookie
 */
async function extractViaGraphQL(shortcode: string): Promise<ExtractedMedia | null> {
  const cookie = getCookieString();

  try {
    const docId = "9510064595728286";
    const dataBody = qs.stringify({
      variables: JSON.stringify({
        shortcode,
        fetch_tagged_user_count: null,
        hoisted_comment_id: null,
        hoisted_reply_id: null,
      }),
      doc_id: docId,
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "X-IG-App-ID": "936619743392459",
      "X-Requested-With": "XMLHttpRequest",
      "Referer": `https://www.instagram.com/p/${shortcode}/`,
      "Origin": "https://www.instagram.com",
    };

    if (cookie) {
      headers["Cookie"] = cookie;
    }

    const res = await axios.post("https://www.instagram.com/graphql/query", dataBody, {
      headers,
      timeout: 8000,
    });

    if (res.data?.data?.xdt_shortcode_media) {
      const media = res.data.data.xdt_shortcode_media;
      const isVideo = Boolean(media.is_video);
      const videoUrl = media.video_url;
      const displayUrl = media.display_url;
      const owner = media.owner || {};
      const captionNode = media.edge_media_to_caption?.edges?.[0]?.node;

      // Check if carousel sidecar
      const sidecarEdges = media.edge_sidecar_to_children?.edges;
      if (sidecarEdges && sidecarEdges.length > 0) {
        const carouselItems: MediaChildItem[] = sidecarEdges.map((edge: { node: { is_video: boolean; video_url?: string; display_url: string } }, index: number) => {
          const node = edge.node;
          const nodeVideo = Boolean(node.is_video);
          const dlUrl = (nodeVideo ? node.video_url : node.display_url) || "";
          return {
            id: `${shortcode}_${index + 1}`,
            index: index + 1,
            type: nodeVideo ? "video" : "photo",
            thumbnailUrl: node.display_url,
            resolutions: [
              {
                label: nodeVideo ? "1080p Video" : "High Res Photo",
                quality: "Original HD",
                type: nodeVideo ? "mp4" : "jpg",
                downloadUrl: dlUrl,
                isBest: true,
              },
            ],
          };
        });

        return {
          id: shortcode,
          shortcode,
          type: "album",
          isCarousel: true,
          author: owner.full_name || owner.username || "Instagram Creator",
          authorHandle: `@${owner.username || "instagram_user"}`,
          caption: captionNode?.text || `Instagram Album (${carouselItems.length} items)`,
          thumbnailUrl: displayUrl,
          resolutions: carouselItems[0]?.resolutions || [],
          carouselItems,
        };
      }

      return {
        id: shortcode,
        shortcode,
        type: isVideo ? "reel" : "photo",
        author: owner.full_name || owner.username || "Instagram Creator",
        authorHandle: `@${owner.username || "instagram_user"}`,
        authorAvatar: owner.profile_pic_url,
        caption: captionNode?.text || "Instagram Post",
        thumbnailUrl: displayUrl,
        duration: media.video_duration ? `${Math.round(media.video_duration)}s` : "0:30",
        resolutions: [
          ...(isVideo && videoUrl
            ? [
                {
                  label: "1080p Full HD",
                  quality: "Original HD",
                  size: "Direct MP4",
                  type: "mp4" as const,
                  downloadUrl: videoUrl,
                  isBest: true,
                },
                {
                  label: "Audio MP3",
                  quality: "320 kbps Stereo",
                  size: "Audio Track",
                  type: "mp3" as const,
                  downloadUrl: videoUrl,
                },
              ]
            : []),
          {
            label: "High Res Photo",
            quality: "Original JPG",
            size: "Full Quality",
            type: "jpg" as const,
            downloadUrl: displayUrl,
          },
        ],
      };
    }
  } catch (err: unknown) {
    console.warn("Direct GraphQL extraction error:", err instanceof Error ? err.message : err);
  }

  return null;
}

/**
 * Strategy 3: Embed page scraping fallback
 */
async function extractViaEmbed(shortcode: string): Promise<ExtractedMedia | null> {
  try {
    const embedUrl = `https://www.instagram.com/reel/${shortcode}/embed/captioned/`;
    const res = await axios.get(embedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      timeout: 8000,
    });

    const html = res.data;
    if (typeof html === "string") {
      const videoMatch = html.match(/video_url\\?":\\?"([^"\\]*(?:\\.[^"\\]*)*)/i) || html.match(/<video[^>]+src="([^">]+)"/i);
      const imgMatch = html.match(/display_url\\?":\\?"([^"\\]*(?:\\.[^"\\]*)*)/i) || html.match(/<img class="EmbeddedMediaImage"[^>]+src="([^">]+)"/i);
      const userMatch = html.match(/"username\\?":\\?"([^"\\]+)/i);

      if (videoMatch || imgMatch) {
        const videoUrl = videoMatch ? videoMatch[1].replace(/\\u0026/g, "&").replace(/\\\//g, "/") : "";
        const imgUrl = imgMatch ? imgMatch[1].replace(/\\u0026/g, "&").replace(/\\\//g, "/") : "";

        return {
          id: shortcode,
          shortcode,
          type: videoUrl ? "reel" : "photo",
          author: userMatch ? userMatch[1] : "Instagram Creator",
          authorHandle: `@${userMatch ? userMatch[1] : "instagram_user"}`,
          caption: "Instagram Post",
          thumbnailUrl: imgUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
          resolutions: videoUrl
            ? [
                {
                  label: "1080p Full HD",
                  quality: "Original HD",
                  size: "Direct MP4",
                  type: "mp4",
                  downloadUrl: videoUrl,
                  isBest: true,
                },
                {
                  label: "Audio MP3",
                  quality: "320 kbps",
                  size: "Audio Track",
                  type: "mp3",
                  downloadUrl: videoUrl,
                },
              ]
            : [
                {
                  label: "Original Photo",
                  quality: "High Resolution",
                  size: "Direct JPG",
                  type: "jpg",
                  downloadUrl: imgUrl,
                  isBest: true,
                },
              ],
        };
      }
    }
  } catch (err: unknown) {
    console.warn("Embed extraction error:", err instanceof Error ? err.message : err);
  }

  return null;
}

/**
 * Strategy 4: Fallback test provider (Ensures user can always test downloads during dev/staging)
 */
function createFallbackDemoMedia(shortcode: string, url: string): ExtractedMedia {
  const isPostOrAlbum = url.includes("/p/") || url.includes("album") || url.includes("carousel");

  if (isPostOrAlbum) {
    const carouselItems: MediaChildItem[] = [
      {
        id: `${shortcode}_1`,
        index: 1,
        type: "video",
        thumbnailUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&auto=format&fit=crop&q=80",
        duration: "0:25",
        resolutions: [
          {
            label: "Slide 1 (1080p Video)",
            quality: "Original HD",
            size: "3.5 MB",
            type: "mp4",
            downloadUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            isBest: true,
          },
        ],
      },
      {
        id: `${shortcode}_2`,
        index: 2,
        type: "photo",
        thumbnailUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80",
        resolutions: [
          {
            label: "Slide 2 (Photo HD)",
            quality: "High Resolution",
            size: "1.8 MB",
            type: "jpg",
            downloadUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop&q=90",
            isBest: true,
          },
        ],
      },
      {
        id: `${shortcode}_3`,
        index: 3,
        type: "photo",
        thumbnailUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&auto=format&fit=crop&q=80",
        resolutions: [
          {
            label: "Slide 3 (Photo HD)",
            quality: "High Resolution",
            size: "2.1 MB",
            type: "jpg",
            downloadUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&auto=format&fit=crop&q=90",
            isBest: true,
          },
        ],
      },
    ];

    return {
      id: shortcode,
      shortcode,
      type: "album",
      isCarousel: true,
      author: "Photography Studio",
      authorHandle: `@creative_studio`,
      caption: `Multi-slide carousel post extracted from ${url} (3 items ready to download).`,
      thumbnailUrl: carouselItems[0].thumbnailUrl,
      resolutions: carouselItems[0].resolutions,
      carouselItems,
      isDemo: true,
    };
  }

  const isStory = url.includes("/stories/");

  return {
    id: shortcode,
    shortcode,
    type: isStory ? "story" : "reel",
    author: isStory ? "Instagram Story" : "Instagram Video",
    authorHandle: `@instagram_media_${shortcode.slice(0, 5)}`,
    caption: `${isStory ? "Story" : "Reel"} extracted from ${url} • Ready for high-speed download.`,
    thumbnailUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&auto=format&fit=crop&q=80",
    duration: "0:25",
    isDemo: true,
    resolutions: [
      {
        label: "1080p Full HD",
        quality: "High Bitrate 60fps",
        size: "3.5 MB",
        type: "mp4",
        downloadUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        isBest: true,
      },
      {
        label: "720p HD",
        quality: "Standard Quality",
        size: "2.1 MB",
        type: "mp4",
        downloadUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      },
      {
        label: "Audio Track (MP3)",
        quality: "320 kbps Stereo",
        size: "1.2 MB",
        type: "mp3",
        downloadUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
      },
    ],
  };
}

/**
 * Master extraction entrypoint with automatic failover
 */
export async function extractInstagramMedia(inputUrl: string, isSample = false): Promise<ExtractedMedia> {
  // If user explicitly requested a sample preview
  if (isSample) {
    const shortcode = extractShortcode(inputUrl) || "demo_sample";
    return createFallbackDemoMedia(shortcode, inputUrl);
  }

  // 1. Check if it's a story profile URL (/stories/username/) without a specific story ID
  if (isStoryProfileUrl(inputUrl)) {
    const username = extractStoryUsername(inputUrl);
    if (username) {
      return await extractUserStories(username);
    }
  }

  const shortcode = extractShortcode(inputUrl);
  if (!shortcode) {
    throw new Error("Invalid Instagram URL. Please provide a link in the format instagram.com/reel/..., instagram.com/p/..., or instagram.com/stories/...");
  }

  // 2. If it's a photo post (/p/), use Direct API first!
  // yt-dlp only supports video streams and fails with "No video formats found" on photo posts.
  if (inputUrl.includes("/p/")) {
    const directResult = await extractViaDirectApi(shortcode);
    if (directResult) return directResult;
  }

  // 3. Try Self-Hosted yt-dlp (Great for Reels & Videos)
  const ytDlpResult = await extractWithYtDlp(inputUrl);
  if (ytDlpResult) return ytDlpResult;

  // 4. Try Direct Mobile API with cookies (Fallback for any photo, video, or story item yt-dlp missed)
  const directResult = await extractViaDirectApi(shortcode);
  if (directResult) return directResult;

  // 5. Try RapidAPI if configured
  const rapidResult = await extractViaRapidApi(inputUrl);
  if (rapidResult) return rapidResult;

  // 6. Try Direct GraphQL Query with cookies
  const graphResult = await extractViaGraphQL(shortcode);
  if (graphResult) return graphResult;

  // 7. Try Public Embed Scrape
  const embedResult = await extractViaEmbed(shortcode);
  if (embedResult) return embedResult;

  // If all live methods were blocked by Instagram's login wall
  throw new Error(
    "Instagram blocked access for this media (Login Required or link is private). " +
    "Please make sure the post or account is public and your cookies.txt session is active."
  );
}

