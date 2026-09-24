import fs from "fs";
import path from "path";

export interface LanguageMeta {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  dir?: "ltr" | "rtl";
  active: boolean;
}

export interface TranslationsData {
  languages: LanguageMeta[];
  strings: Record<string, Record<string, string>>;
}

const DATA_PATH = path.join(process.cwd(), "src", "data", "translations.json");

/**
 * Reads translation data from disk
 */
export async function getTranslationsData(): Promise<TranslationsData> {
  try {
    if (fs.existsSync(DATA_PATH)) {
      const content = await fs.promises.readFile(DATA_PATH, "utf-8");
      return JSON.parse(content) as TranslationsData;
    }
  } catch (err) {
    console.error("Error reading translations.json:", err);
  }

  // Fallback defaults
  return {
    languages: [
      { code: "en", name: "English", nativeName: "English", flag: "🇺🇸", dir: "ltr", active: true },
    ],
    strings: {
      en: {
        nav_home: "Home",
        nav_reels: "Reels",
        nav_stories: "Stories",
        nav_photos: "Photos",
        nav_audio: "Audio MP3",
        nav_carousel: "Carousel",
        nav_faq: "FAQ",
        nav_developer: "Developer",
        hero_badge: "Fast, Free & Anonymous Instagram Downloader",
        hero_title_prefix: "Download Instagram ",
        hero_title_highlight: "Reels, Videos",
        hero_title_suffix: " & Stories",
        hero_subtitle: "Save Instagram Reels, Videos, Carousel Albums, Stories, and Photos in 1080p Full HD MP4 and 320kbps MP3 without login or watermark.",
        input_placeholder: "Paste Instagram Reel, Video, Carousel, or Story URL here...",
        btn_paste: "Paste",
        btn_clear: "Clear",
        btn_download: "Download",
        btn_fetching: "Fetching Media...",
      },
    },
  };
}

/**
 * Saves translations data atomically to disk
 */
export async function saveTranslationsData(data: TranslationsData): Promise<boolean> {
  try {
    const dir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
    const tempPath = `${DATA_PATH}.tmp`;
    await fs.promises.writeFile(tempPath, JSON.stringify(data, null, 2), "utf-8");
    await fs.promises.rename(tempPath, DATA_PATH);
    return true;
  } catch (err) {
    console.error("Error writing translations.json:", err);
    return false;
  }
}
