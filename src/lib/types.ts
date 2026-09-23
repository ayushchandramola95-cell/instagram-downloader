export interface MediaResolution {
  label: string;
  quality: string;
  size?: string;
  type: "mp4" | "mp3" | "jpg";
  downloadUrl: string;
  isBest?: boolean;
  width?: number;
  height?: number;
  bitrate?: string;
}

export interface MediaChildItem {
  id: string;
  index: number;
  type: "video" | "photo";
  thumbnailUrl: string;
  duration?: string;
  width?: number;
  height?: number;
  resolutions: MediaResolution[];
}

export interface ExtractedMedia {
  id: string;
  shortcode: string;
  type: "reel" | "video" | "story" | "photo" | "album" | "audio";
  author: string;
  authorHandle: string;
  authorAvatar?: string;
  caption: string;
  thumbnailUrl: string;
  duration?: string;
  resolutions: MediaResolution[];
  isDemo?: boolean;
  isCarousel?: boolean;
  carouselItems?: MediaChildItem[];
}

export interface FetchMediaResponse {
  success: boolean;
  data?: ExtractedMedia;
  error?: string;
}
