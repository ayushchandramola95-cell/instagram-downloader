import axios from "axios";
import { ExtractedMedia, MediaResolution, ProfileDetails } from "./types";
import { getCookieString } from "./instagram-extractor";
import { extractProfileUsername } from "./security";

/**
 * Creates sample fallback profile media for UI testing and demos
 */
export function createFallbackDemoProfile(username: string): ExtractedMedia {
  const cleanUser = username.replace(/^@/, "").toLowerCase() || "instagram";
  const isVerified = ["cristiano", "leomessi", "instagram", "selenagomez", "natgeo"].includes(cleanUser);

  const demoHdUrl =
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1080&h=1080&auto=format&fit=crop&q=95";

  const profileDetails: ProfileDetails = {
    username: cleanUser,
    fullName: cleanUser.charAt(0).toUpperCase() + cleanUser.slice(1),
    biography: "Creator & visual storyteller • HD Profile Picture Demo",
    profilePicUrlHd: demoHdUrl,
    profilePicUrlDefault: demoHdUrl,
    followersCount: "1.2M followers",
    followingCount: "450",
    postsCount: "320",
    isVerified,
    isPrivate: false,
  };

  const resolutions: MediaResolution[] = [
    {
      label: "1080x1080 Full HD (Master JPG)",
      quality: "Full HD 1080p",
      size: "Direct Source JPG",
      type: "jpg",
      downloadUrl: demoHdUrl,
      isBest: true,
      width: 1080,
      height: 1080,
    },
    {
      label: "Standard Quality (400x400 JPG)",
      quality: "Standard Res",
      size: "Compressed JPG",
      type: "jpg",
      downloadUrl: demoHdUrl,
      width: 400,
      height: 400,
    },
  ];

  return {
    id: `profile_${cleanUser}`,
    shortcode: cleanUser,
    type: "profile",
    author: profileDetails.fullName,
    authorHandle: `@${cleanUser}`,
    authorAvatar: demoHdUrl,
    caption: `${profileDetails.fullName} (@${cleanUser}) Instagram Profile Picture in Full HD 1080p`,
    thumbnailUrl: demoHdUrl,
    resolutions,
    profileDetails,
    isDemo: true,
  };
}

/**
 * Strategy 1: Internal Search + Media PK resolution for 1080p uncropped avatar
 */
async function extractProfileViaTopsearch(username: string): Promise<ExtractedMedia | null> {
  const cookieStr = getCookieString();

  const browserHeaders: Record<string, string> = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "X-IG-App-ID": "936619743392459",
    "X-Requested-With": "XMLHttpRequest",
    "X-ASBD-ID": "129477",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "Referer": `https://www.instagram.com/${username}/`,
    "Accept": "*/*",
  };

  if (cookieStr) {
    browserHeaders["Cookie"] = cookieStr;
  }

  try {
    const searchRes = await axios.get(
      `https://www.instagram.com/web/search/topsearch/?context=blended&query=${encodeURIComponent(username)}`,
      {
        headers: browserHeaders,
        timeout: 9000,
      }
    );

    const users = searchRes.data?.users;
    if (!Array.isArray(users) || users.length === 0) {
      return null;
    }

    // Find the exact matching user or first match
    const match =
      users.find((u: { user?: { username?: string } }) => u.user?.username?.toLowerCase() === username.toLowerCase())?.user ||
      users[0]?.user;

    if (!match) return null;

    const matchedUsername = match.username || username;
    const fullName = match.full_name || matchedUsername;
    const isVerified = Boolean(match.is_verified);
    const isPrivate = Boolean(match.is_private);
    const followers = match.social_context || undefined;
    const defaultPicUrl = match.profile_pic_url || "";

    let hdPicUrl = defaultPicUrl;
    let hdWidth = 1080;
    let hdHeight = 1080;
    const mediaResolutions: MediaResolution[] = [];

    // Try resolving HD master candidate using profile_pic_id
    if (match.profile_pic_id) {
      const mediaPk = String(match.profile_pic_id).split("_")[0];
      try {
        const mediaRes = await axios.get(`https://i.instagram.com/api/v1/media/${mediaPk}/info/`, {
          headers: {
            "User-Agent":
              "Instagram 275.0.0.27.98 (iPhone14,2; iOS 16_3; en_US; en-US; scale=3.00; 1170x2532; 456893456)",
            "X-IG-App-ID": "936619743392459",
            ...(cookieStr ? { Cookie: cookieStr } : {}),
          },
          timeout: 8000,
        });

        const candidates = mediaRes.data?.items?.[0]?.image_versions2?.candidates;
        if (Array.isArray(candidates) && candidates.length > 0) {
          // Sort candidates descending by pixel width
          const sorted = [...candidates].sort((a, b) => (b.width || 0) - (a.width || 0));
          const best = sorted[0];
          if (best?.url) {
            hdPicUrl = best.url;
            hdWidth = best.width || 1080;
            hdHeight = best.height || 1080;

            mediaResolutions.push({
              label: `${hdWidth}×${hdHeight} Full HD (Master JPG)`,
              quality: "Master Resolution",
              size: "Uncompressed JPG",
              type: "jpg",
              downloadUrl: hdPicUrl,
              isBest: true,
              width: hdWidth,
              height: hdHeight,
            });

            // Add second quality if available
            if (sorted.length > 1 && sorted[1]?.url) {
              const med = sorted[1];
              mediaResolutions.push({
                label: `${med.width || 412}×${med.height || 412} HD JPG`,
                quality: "Standard HD",
                size: "Fast Download",
                type: "jpg",
                downloadUrl: med.url,
                width: med.width,
                height: med.height,
              });
            }
          }
        }
      } catch (mediaErr) {
        console.warn("Profile media PK resolution note:", mediaErr instanceof Error ? mediaErr.message : mediaErr);
      }
    }

    // Fallback resolution if media PK lookup didn't produce candidates
    if (mediaResolutions.length === 0 && hdPicUrl) {
      mediaResolutions.push({
        label: "Full Resolution Profile Photo",
        quality: "Original JPG",
        size: "Direct CDN JPG",
        type: "jpg",
        downloadUrl: hdPicUrl,
        isBest: true,
        width: hdWidth,
        height: hdHeight,
      });
    }

    const profileDetails: ProfileDetails = {
      username: matchedUsername,
      fullName,
      profilePicUrlHd: hdPicUrl,
      profilePicUrlDefault: defaultPicUrl,
      followersCount: followers,
      isVerified,
      isPrivate,
    };

    return {
      id: `profile_${matchedUsername}`,
      shortcode: matchedUsername,
      type: "profile",
      author: fullName,
      authorHandle: `@${matchedUsername}`,
      authorAvatar: hdPicUrl,
      caption: `${fullName} (@${matchedUsername}) Instagram Profile Picture • HD DP Download`,
      thumbnailUrl: hdPicUrl,
      resolutions: mediaResolutions,
      profileDetails,
    };
  } catch (err: unknown) {
    console.warn("Topsearch profile extraction error:", err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Strategy 2: Direct profile page HTML scrape
 */
async function extractProfileViaHtml(username: string): Promise<ExtractedMedia | null> {
  const cookieStr = getCookieString();

  try {
    const res = await axios.get(`https://www.instagram.com/${username}/`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        ...(cookieStr ? { Cookie: cookieStr } : {}),
      },
      timeout: 9000,
    });

    const html = res.data;
    if (typeof html !== "string") return null;

    const ogImgMatch =
      html.match(/property="og:image"\s+content="([^"]+)"/i) ||
      html.match(/name="og:image"\s+content="([^"]+)"/i);

    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const titleText = titleMatch ? titleMatch[1] : "";
    const nameMatch = titleText.match(/^(.*?)\s*\(@/);
    const fullName = nameMatch ? nameMatch[1].trim() : username;

    if (ogImgMatch && ogImgMatch[1]) {
      const picUrl = ogImgMatch[1].replace(/&amp;/g, "&");

      const profileDetails: ProfileDetails = {
        username,
        fullName,
        profilePicUrlHd: picUrl,
        profilePicUrlDefault: picUrl,
        isPrivate: false,
      };

      return {
        id: `profile_${username}`,
        shortcode: username,
        type: "profile",
        author: fullName,
        authorHandle: `@${username}`,
        authorAvatar: picUrl,
        caption: `${fullName} (@${username}) Instagram Profile Picture in HD`,
        thumbnailUrl: picUrl,
        resolutions: [
          {
            label: "Original Profile Photo (HD)",
            quality: "Original JPG",
            size: "Source Image",
            type: "jpg",
            downloadUrl: picUrl,
            isBest: true,
          },
        ],
        profileDetails,
      };
    }
  } catch (err: unknown) {
    console.warn("HTML profile scrape note:", err instanceof Error ? err.message : err);
  }

  return null;
}

/**
 * Master Profile DP extraction pipeline
 */
export async function extractInstagramProfile(
  usernameOrUrl: string,
  isSample = false
): Promise<ExtractedMedia> {
  const username = extractProfileUsername(usernameOrUrl);
  if (!username) {
    throw new Error(
      "Invalid Instagram username or profile link. Please enter a username (e.g. @cristiano) or profile URL."
    );
  }

  if (isSample) {
    return createFallbackDemoProfile(username);
  }

  // 1. Try Internal Search + Media PK resolution (Best: uncropped 1080p HD)
  const topsearchResult = await extractProfileViaTopsearch(username);
  if (topsearchResult) {
    return topsearchResult;
  }

  // 2. Try HTML meta tag scrape
  const htmlResult = await extractProfileViaHtml(username);
  if (htmlResult) {
    return htmlResult;
  }

  // 3. Fallback demo if account exists or requested
  throw new Error(
    `Unable to retrieve profile picture for @${username}. Please verify that the username is spelled correctly and the account is active.`
  );
}
