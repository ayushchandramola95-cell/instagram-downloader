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
  audioUrl?: string;
  hasAudio?: boolean;
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

export interface ProfileDetails {
  username: string;
  fullName: string;
  biography?: string;
  profilePicUrlHd: string;
  profilePicUrlDefault?: string;
  followersCount?: number | string;
  followingCount?: number | string;
  postsCount?: number | string;
  isVerified?: boolean;
  isPrivate?: boolean;
  externalUrl?: string;
}

export interface ExtractedMedia {
  id: string;
  shortcode: string;
  type: "reel" | "video" | "story" | "photo" | "album" | "audio" | "profile";
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
  profileDetails?: ProfileDetails;
}

export interface FetchMediaResponse {
  success: boolean;
  data?: ExtractedMedia;
  error?: string;
}

