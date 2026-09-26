"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { ExtractedMedia, FetchMediaResponse, MediaResolution } from "@/lib/types";
import { trackGAEvent } from "@/lib/ga";

export type MediaTab = "all" | "reels" | "stories" | "photos" | "profile" | "audio" | "carousel";

interface TabPreset {
  id: MediaTab;
  label: string;
  icon: string;
  badge: string;
  titlePrefix: string;
  titleHighlight: string;
  titleSuffix: string;
  subtitle: string;
  placeholder: string;
  pageHref: string;
}

const TAB_PRESETS: Record<MediaTab, TabPreset> = {
  all: {
    id: "all",
    label: "All In One",
    icon: "🔥",
    badge: "Fast, Free & Anonymous Instagram Downloader",
    titlePrefix: "Download Instagram ",
    titleHighlight: "Reels, Videos",
    titleSuffix: " & Stories",
    subtitle:
      "Save Instagram Reels, Videos, Carousel Albums, Stories, and Photos in 1080p Full HD MP4 and 320kbps MP3 without login or watermark.",
    placeholder: "Paste Instagram Reel, Video, Carousel, or Story URL here...",
    pageHref: "/",
  },
  reels: {
    id: "reels",
    label: "Reels",
    icon: "🎬",
    badge: "100% Free Instagram Reels Downloader in 1080p",
    titlePrefix: "Download Instagram ",
    titleHighlight: "Reels in 1080p",
    titleSuffix: " Full HD",
    subtitle:
      "Save viral Instagram reels with crystal-clear original audio and zero watermark in maximum bitrate 1080p MP4.",
    placeholder: "Paste Instagram Reel link here (e.g., https://www.instagram.com/reel/...)",
    pageHref: "/reels-downloader",
  },
  stories: {
    id: "stories",
    label: "Story Saver",
    icon: "⚡",
    badge: "100% Anonymous Instagram Story & Highlight Saver",
    titlePrefix: "Download Instagram ",
    titleHighlight: "Stories & Highlights",
    titleSuffix: " Anonymously",
    subtitle:
      "Save ephemeral 24-hour stories and user highlights in original quality before they disappear. 100% anonymous.",
    placeholder: "Paste Instagram Story link (e.g., https://www.instagram.com/stories/username/...)",
    pageHref: "/story-saver",
  },
  photos: {
    id: "photos",
    label: "Photo / Post",
    icon: "📸",
    badge: "Original Quality Instagram Photo Saver",
    titlePrefix: "Download Instagram ",
    titleHighlight: "Photos & Images",
    titleSuffix: " in HD",
    subtitle:
      "Save uncompressed high-resolution photos, portrait images, and profile pictures without lossy screenshot compression.",
    placeholder: "Paste Instagram Photo link (e.g., https://www.instagram.com/p/...)",
    pageHref: "/photo-downloader",
  },
  profile: {
    id: "profile",
    label: "Profile DP",
    icon: "👤",
    badge: "100% Free Instagram HD Profile Picture & DP Viewer",
    titlePrefix: "Download Instagram ",
    titleHighlight: "Full-Size HD DP",
    titleSuffix: " & Profile Picture",
    subtitle:
      "View and download uncropped original 1080p Full-HD Instagram profile pictures (DP) from any account in 1 click. 100% anonymous.",
    placeholder: "Enter Instagram username or profile link (e.g., @cristiano or instagram.com/cristiano)...",
    pageHref: "/profile-downloader",
  },
  audio: {
    id: "audio",
    label: "Audio MP3",
    icon: "🎵",
    badge: "Fast Instagram Audio & 320kbps MP3 Extractor",
    titlePrefix: "Convert Instagram Reels to ",
    titleHighlight: "320kbps MP3 Audio",
    titleSuffix: "",
    subtitle:
      "Extract background music, sound effects, voiceovers, and trending audio tracks from Instagram reels into standalone MP3s.",
    placeholder: "Paste Instagram Reel or Video URL to extract MP3 (e.g., https://www.instagram.com/reel/...)",
    pageHref: "/audio-downloader",
  },
  carousel: {
    id: "carousel",
    label: "Carousel",
    icon: "📂",
    badge: "100% Free Instagram Carousel & Album Downloader",
    titlePrefix: "Download Instagram ",
    titleHighlight: "Carousel & Albums",
    titleSuffix: " All Slides",
    subtitle:
      "Save all photos, videos, and mixed-media slides from swipeable Instagram carousel albums in 1080p Full HD with 1 click.",
    placeholder: "Paste Instagram Carousel or Album link (e.g., https://www.instagram.com/p/...)",
    pageHref: "/carousel-downloader",
  },
};

interface DownloaderSectionProps {
  defaultTab?: MediaTab;
  showTabs?: boolean;
}

export default function DownloaderSection({
  defaultTab = "all",
  showTabs = true,
}: DownloaderSectionProps) {
  const { t } = useTranslation();
  const [activeTab] = useState<MediaTab>(defaultTab);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractedMedia | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const [showBookmarkletModal, setShowBookmarkletModal] = useState(false);
  const [showDpZoomModal, setShowDpZoomModal] = useState(false);

  // Quality toggle selection for single media (index in result.resolutions)
  const [selectedQualityIndex, setSelectedQualityIndex] = useState<number>(0);

  // Carousel state
  const [carouselSelectedQualities, setCarouselSelectedQualities] = useState<Record<number, number>>({});
  const [carouselViewMode, setCarouselViewMode] = useState<"grid" | "showcase">("grid");
  const [activeShowcaseSlide, setActiveShowcaseSlide] = useState<number>(0);
  const [batchDownloading, setBatchDownloading] = useState(false);
  const [batchProgressText, setBatchProgressText] = useState("");

  // Download simulation progress
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  // Copy link feedback
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);

  // Auto-clipboard detection state
  const [clipboardDetectedUrl, setClipboardDetectedUrl] = useState<string | null>(null);
  const [dismissedClipboardUrl, setDismissedClipboardUrl] = useState<string | null>(null);

  // Video trimming state
  const [showVideoTrimmer, setShowVideoTrimmer] = useState(false);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimDuration, setTrimDuration] = useState<number>(15);

  // Interactive HTML5 Audio Player
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  // Dedicated audio bitrate selection index (0 = 320kbps, 1 = 256kbps, 2 = 128kbps)
  const [selectedAudioQualityIndex, setSelectedAudioQualityIndex] = useState<number>(0);

  // Auto-clipboard inspection when switching back to tab
  useEffect(() => {
    const checkClipboardOnFocus = async () => {
      if (typeof window === "undefined" || !navigator.clipboard?.readText) return;
      try {
        if (document.visibilityState !== "visible") return;
        const text = await navigator.clipboard.readText();
        if (!text) return;
        const trimmed = text.trim();
        if (
          trimmed.startsWith("http") &&
          (trimmed.includes("instagram.com/reel/") ||
            trimmed.includes("instagram.com/p/") ||
            trimmed.includes("instagram.com/stories/") ||
            trimmed.includes("instagram.com/tv/") ||
            trimmed.includes("instagram.com/share/"))
        ) {
          if (trimmed !== url && trimmed !== dismissedClipboardUrl && !result) {
            setClipboardDetectedUrl(trimmed);
          }
        }
      } catch {
        // Silently ignore clipboard permission errors
      }
    };

    window.addEventListener("focus", checkClipboardOnFocus);
    return () => window.removeEventListener("focus", checkClipboardOnFocus);
  }, [url, dismissedClipboardUrl, result]);


  // Cloudflare Turnstile anti-bot state (optional)
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileWidgetRef = useRef<HTMLDivElement | null>(null);

  const activePreset = TAB_PRESETS[activeTab] || TAB_PRESETS.all;

  // Initialize Turnstile widget if site key is configured
  useEffect(() => {
    if (!turnstileSiteKey || typeof window === "undefined") return;

    const scriptId = "cf-turnstile-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        const win = window as unknown as {
          turnstile?: {
            render: (
              container: HTMLElement | string,
              params: Record<string, unknown>
            ) => string;
          };
        };
        if (win.turnstile && turnstileWidgetRef.current) {
          try {
            win.turnstile.render(turnstileWidgetRef.current, {
              sitekey: turnstileSiteKey,
              callback: (token: string) => setTurnstileToken(token),
              "error-callback": () => setTurnstileToken(null),
              "expired-callback": () => setTurnstileToken(null),
              theme: "auto",
            });
          } catch {
            // Widget render error handled safely
          }
        }
      };
    }
  }, [turnstileSiteKey]);

  // Stop audio on unmount
  useEffect(() => {
    const audioEl = audioRef.current;
    return () => {
      if (audioEl) {
        audioEl.pause();
      }
    };
  }, []);

  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlayingAudio(false);
    setResult(null);
    setUrl("");
    setError(null);
    setSelectedQualityIndex(0);
    setSelectedAudioQualityIndex(0);
    setCarouselSelectedQualities({});
    setActiveShowcaseSlide(0);

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        document.getElementById("instagram-url-input")?.focus();
      }, 350);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        setError(null);
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 2000);
      }
    } catch {
      setError("Please paste the link manually into the input box.");
    }
  };

  const handleClear = () => {
    setUrl("");
    setError(null);
    setResult(null);
  };

  const handleCopyLink = (textToCopy: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleApplyClipboardUrl = () => {
    if (clipboardDetectedUrl) {
      const target = clipboardDetectedUrl;
      setUrl(target);
      setClipboardDetectedUrl(null);
      fetchMedia(target);
    }
  };

  const handleCopyCaption = (captionText?: string) => {
    if (!captionText) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(captionText);
      setCopiedCaption(true);
      trackGAEvent("copy_caption", "creator_tool", "caption");
      setTimeout(() => setCopiedCaption(false), 2000);
    }
  };

  const handleCopyHashtags = (captionText?: string) => {
    if (navigator.clipboard) {
      let tags = "";
      if (captionText) {
        const matches = captionText.match(/(#[a-zA-Z0-9_\u0080-\uffff]+)/g);
        if (matches && matches.length > 0) {
          tags = matches.join(" ");
        }
      }
      if (!tags) {
        tags = "#instagram #reels #viral #trending #explorepage #reelsvideo #instagood";
      }
      navigator.clipboard.writeText(tags);
      setCopiedHashtags(true);
      trackGAEvent("copy_hashtags", "creator_tool", "hashtags");
      setTimeout(() => setCopiedHashtags(false), 2000);
    }
  };

  const handleShareMedia = async (title: string, text: string, shareUrl: string) => {
    trackGAEvent("share_media", "engagement", title || "GramSave Downloader");
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: title || "GramSave Downloader",
          text: text ? `${text.slice(0, 100)}...` : "Download Instagram Reels, Photos & Videos on GramSave",
          url: shareUrl || window.location.href,
        });
      } catch {
        // User aborted share modal
      }
    } else {
      handleCopyLink(shareUrl || window.location.href);
    }
  };

  const handleDownloadTrimmedVideo = (targetRes: MediaResolution) => {
    trackGAEvent("trim_video", "creator_tool", `${trimStart}s-${trimStart + trimDuration}s`);
    const cleanName = `gramsave_clip_${trimStart}s-${trimStart + trimDuration}s_${result?.id || "video"}.mp4`;
    let dlUrl = `/api/download?url=${encodeURIComponent(targetRes.downloadUrl)}&filename=${encodeURIComponent(cleanName)}&start=${trimStart}&duration=${trimDuration}`;
    if (targetRes.audioUrl) {
      dlUrl += `&audioUrl=${encodeURIComponent(targetRes.audioUrl)}`;
    }
    triggerDownload(dlUrl, cleanName);
  };

  const handleDownloadRingtone = (targetRes: MediaResolution, durationSec: number) => {
    trackGAEvent("extract_ringtone", "creator_tool", `${durationSec}s`);
    const cleanName = `gramsave_ringtone_${durationSec}s_${result?.id || "audio"}.mp3`;
    const dlUrl = `/api/download?url=${encodeURIComponent(targetRes.downloadUrl)}&filename=${encodeURIComponent(cleanName)}&start=0&duration=${durationSec}`;
    triggerDownload(dlUrl, cleanName);
  };

  const fetchMedia = async (targetUrl: string, isSample = false) => {
    setLoading(true);
    setError(null);

    // Smoothly center the viewport on the loading state
    setTimeout(() => {
      const loadingEl = document.getElementById("extract-loading-box");
      if (loadingEl) {
        loadingEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 40);

    try {
      const res = await fetch("/api/fetch-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl, isSample, turnstileToken }),
      });

      const json: FetchMediaResponse = await res.json();

      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error || "Failed to fetch media from Instagram.");
      }

      setResult(json.data);

      // Auto-select quality toggle
      if (activeTab === "audio" || json.data.type === "audio") {
        const audioIdx = json.data.resolutions.findIndex((r) => r.type === "mp3");
        setSelectedQualityIndex(audioIdx !== -1 ? audioIdx : 0);
        setSelectedAudioQualityIndex(0);
      } else {
        setSelectedQualityIndex(0);
      }

      // Initialize carousel slide quality choices
      if (json.data.carouselItems && json.data.carouselItems.length > 0) {
        const initMap: Record<number, number> = {};
        json.data.carouselItems.forEach((item) => {
          initMap[item.index] = 0;
        });
        setCarouselSelectedQualities(initMap);
        setActiveShowcaseSlide(0);
      }

      // Smoothly center the viewport on the fetched result card
      setTimeout(() => {
        const resultEl = document.getElementById("media-result-preview");
        if (resultEl) {
          resultEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 80);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong while resolving the link.";
      setError(message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch if ?url=... query param is provided
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryUrl = params.get("url");
      const isSampleParam = params.get("sample") === "true";
      if (queryUrl && !url) {
        setTimeout(() => {
          setUrl(queryUrl);
          void fetchMedia(queryUrl, isSampleParam);
        }, 0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Please paste a valid Instagram video or photo link.");
      return;
    }
    fetchMedia(url.trim());
  };

  /**
   * Triggers download via the local attachment streaming proxy (/api/download)
   * to guarantee immediate file saving and bypass Instagram hotlink/CORS restrictions.
   */
  const triggerDownload = (rawDownloadUrl: string, filename: string, audioUrl?: string) => {
    trackGAEvent("file_download", "media", filename, undefined, { file_name: filename });
    setDownloadingFile(filename);
    setDownloadProgress(15);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 120);

    let proxyDownloadUrl = rawDownloadUrl.startsWith("http")
      ? `/api/download?url=${encodeURIComponent(rawDownloadUrl)}&filename=${encodeURIComponent(filename)}`
      : rawDownloadUrl;

    if (audioUrl && rawDownloadUrl.startsWith("http")) {
      proxyDownloadUrl += `&audioUrl=${encodeURIComponent(audioUrl)}`;
    }

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = proxyDownloadUrl;
    document.body.appendChild(iframe);

    setTimeout(() => {
      setDownloadProgress(100);
      setTimeout(() => {
        setDownloadingFile(null);
        setDownloadProgress(0);
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1500);
    }, 800);
  };

  /**
   * Sequentially triggers download for all carousel slides
   */
  const handleDownloadAllCarousel = async () => {
    if (!result?.carouselItems || result.carouselItems.length === 0) return;
    setBatchDownloading(true);

    for (let i = 0; i < result.carouselItems.length; i++) {
      const item = result.carouselItems[i];
      const selectedIndex = carouselSelectedQualities[item.index] ?? 0;
      const chosenRes = item.resolutions[selectedIndex] || item.resolutions[0];

      if (chosenRes) {
        setBatchProgressText(`Triggering slide ${i + 1} of ${result.carouselItems.length}...`);
        const cleanLabel = chosenRes.label.replace(/[^a-zA-Z0-9]/g, "_");
        triggerDownload(
          chosenRes.downloadUrl,
          `gramsave_${result.id}_slide_${item.index}_${cleanLabel}.${chosenRes.type}`,
          chosenRes.audioUrl
        );
        await new Promise((resolve) => setTimeout(resolve, 850));
      }
    }

    setBatchProgressText(`All ${result.carouselItems.length} slides downloaded!`);
    setTimeout(() => {
      setBatchDownloading(false);
      setBatchProgressText("");
    }, 3000);
  };

  /**
   * Bundles all carousel slides into a single .ZIP archive in-browser via JSZip
   */
  const handleDownloadAllZip = async () => {
    if (!result?.carouselItems || result.carouselItems.length === 0) return;
    setBatchDownloading(true);
    setBatchProgressText("Initializing ZIP bundle...");

    try {
      const JSZipModule = await import("jszip");
      const JSZip = JSZipModule.default;
      const zip = new JSZip();
      const folderName = `gramsave_${result.shortcode || result.id || "carousel"}`;
      const folder = zip.folder(folderName) || zip;

      for (let i = 0; i < result.carouselItems.length; i++) {
        const item = result.carouselItems[i];
        const selectedIndex = carouselSelectedQualities[item.index] ?? 0;
        const chosenRes = item.resolutions[selectedIndex] || item.resolutions[0];

        if (!chosenRes) continue;

        setBatchProgressText(`Fetching slide ${i + 1} of ${result.carouselItems.length}...`);

        const cleanLabel = chosenRes.label.replace(/[^a-zA-Z0-9]/g, "_");
        const filename = `slide_${item.index}_${cleanLabel}.${chosenRes.type}`;

        let fetchUrl = chosenRes.downloadUrl.startsWith("http")
          ? `/api/download?url=${encodeURIComponent(chosenRes.downloadUrl)}&filename=${encodeURIComponent(filename)}`
          : chosenRes.downloadUrl;

        if (chosenRes.audioUrl && chosenRes.downloadUrl.startsWith("http")) {
          fetchUrl += `&audioUrl=${encodeURIComponent(chosenRes.audioUrl)}`;
        }

        const res = await fetch(fetchUrl);
        if (!res.ok) throw new Error(`Slide ${i + 1} fetch failed`);
        const blob = await res.blob();
        folder.file(filename, blob);
      }

      setBatchProgressText("Compiling ZIP bundle...");
      const content = await zip.generateAsync({ type: "blob" }, (meta) => {
        setBatchProgressText(`Packaging ZIP: ${Math.round(meta.percent)}%`);
      });

      const zipUrl = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = zipUrl;
      a.download = `${folderName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(zipUrl);

      setBatchProgressText("✓ ZIP Saved Successfully!");
      setTimeout(() => {
        setBatchDownloading(false);
        setBatchProgressText("");
      }, 2500);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed";
      setBatchProgressText(`ZIP Error: ${errMsg}`);
      setTimeout(() => {
        setBatchDownloading(false);
        setBatchProgressText("");
      }, 3000);
    }
  };

  // Audio player controls
  const toggleAudioPlay = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(console.error);
    }
  };

  const handleAudioSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || audioDuration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    audioRef.current.currentTime = pct * audioDuration;
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Determine current active resolution for single media
  const currentResolution: MediaResolution | undefined =
    result?.resolutions[selectedQualityIndex] || result?.resolutions[0];

  const isProfileMedia = result?.type === "profile";
  const isPhotoMedia = result?.type === "photo";
  const isVideoMedia =
    !isProfileMedia &&
    (result?.type === "video" || result?.type === "reel" || result?.type === "story");

  const isAudioSelected =
    !isProfileMedia &&
    (currentResolution?.type === "mp3" ||
      result?.type === "audio" ||
      activeTab === "audio");

  // Audio streaming URL for the preview player & dedicated audio tracks
  const audioPreviewUrl = result?.resolutions.find((r) => r.type === "mp3")?.downloadUrl || currentResolution?.downloadUrl || "";
  const proxyAudioPreviewUrl = audioPreviewUrl.startsWith("http")
    ? `/api/download?url=${encodeURIComponent(audioPreviewUrl)}&filename=preview.mp3`
    : audioPreviewUrl;

  // Filter or synthesize strictly MP3 audio options so video resolutions never appear in the audio bitrate selector
  const audioResolutions: MediaResolution[] = useMemo(() => {
    if (!result?.resolutions || result.resolutions.length === 0) return [];
    const directMp3s = result.resolutions.filter((r) => r.type === "mp3");
    if (directMp3s.length >= 2) return directMp3s;

    // Fallback/standard: Provide the 3 standard bitrates from audio stream
    const baseAudioUrl = directMp3s[0]?.downloadUrl || result.resolutions.find((r) => r.audioUrl)?.audioUrl || audioPreviewUrl;
    return [
      {
        label: "320 kbps Studio Audio",
        quality: "Ultra High Fidelity Stereo",
        size: "320 kbps MP3",
        type: "mp3" as const,
        downloadUrl: baseAudioUrl,
        bitrate: "320 kbps",
      },
      {
        label: "256 kbps High Audio",
        quality: "High Definition MP3",
        size: "256 kbps MP3",
        type: "mp3" as const,
        downloadUrl: baseAudioUrl,
        bitrate: "256 kbps",
      },
      {
        label: "128 kbps Standard Audio",
        quality: "Standard Definition MP3",
        size: "128 kbps MP3",
        type: "mp3" as const,
        downloadUrl: baseAudioUrl,
        bitrate: "128 kbps",
      },
    ];
  }, [result, audioPreviewUrl]);

  const currentAudioResolution: MediaResolution | undefined =
    audioResolutions[selectedAudioQualityIndex] || audioResolutions[0] || currentResolution;

  return (
    <section className="hero container" id="downloader">
      {/* Ambient Floating Aurora Glow Orbs */}
      <div className="hero-aurora-glow" aria-hidden="true">
        <div className="aurora-orb aurora-orb-1"></div>
        <div className="aurora-orb aurora-orb-2"></div>
      </div>

      {/* ========================================================================= */}
      {/* 1. HERO & SEARCH BOX (HIDDEN when loading OR result is present)           */}
      {/* ========================================================================= */}
      {!loading && !result && (
        <>
          {/* Format Tabs as Direct Navigation Links */}
          {showTabs && (
            <div className="format-tabs" role="tablist" aria-label="Media format filters">
              {(Object.keys(TAB_PRESETS) as MediaTab[]).map((tabKey) => {
                const preset = TAB_PRESETS[tabKey];
                const isActive = activeTab === tabKey;
                return (
                  <Link
                    key={tabKey}
                    href={preset.pageHref}
                    id={`tab-${tabKey}`}
                    className={`format-tab-btn tab-${tabKey} ${isActive ? "active" : ""}`}
                    aria-selected={isActive}
                    role="tab"
                  >
                    <span>{preset.icon}</span>
                    <span>{preset.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Hero Headings */}
          <div key={activeTab} className="hero-anim-box">
            <div className="hero-pill">
              <span className="hero-pill-indicator"></span>
              <span>{activeTab === "all" ? t("hero_badge", activePreset.badge) : activePreset.badge}</span>
            </div>

            <h1 className="hero-title">
              {activeTab === "all" ? t("hero_title_prefix", activePreset.titlePrefix) : activePreset.titlePrefix}
              <span className="gradient-text">
                {activeTab === "all" ? t("hero_title_highlight", activePreset.titleHighlight) : activePreset.titleHighlight}
              </span>
              {activeTab === "all" ? t("hero_title_suffix", activePreset.titleSuffix) : activePreset.titleSuffix}
            </h1>

            <p className="hero-subtitle">
              {activeTab === "all" ? t("hero_subtitle", activePreset.subtitle) : activePreset.subtitle}
            </p>
          </div>

          {/* Input Form Box */}
          <div className="downloader-box">
            <form onSubmit={handleSubmit}>
              <div className="input-row">
                <div className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                </div>

                <input
                  id="instagram-url-input"
                  type="text"
                  className="url-input"
                  placeholder={activeTab === "all" ? t("input_placeholder", activePreset.placeholder) : activePreset.placeholder}
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError(null);
                  }}
                  autoComplete="off"
                />

                {url && (
                  <button
                    type="button"
                    className="clear-btn"
                    id="clear-input-btn"
                    onClick={handleClear}
                    title="Clear URL"
                  >
                    ✕
                  </button>
                )}

                <button
                  type="button"
                  id="paste-clipboard-btn"
                  className="paste-btn"
                  onClick={handlePaste}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  </svg>
                  {pasteSuccess ? "Pasted!" : t("btn_paste", "Paste")}
                </button>

                <button
                  id="download-submit-btn"
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  <span className="submit-btn-sheen" aria-hidden="true"></span>
                  <span>{loading ? t("btn_fetching", "Fetching...") : t("btn_download", "Download")}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="submit-arrow-icon">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <polyline points="19 12 12 19 5 12"></polyline>
                  </svg>
                </button>
              </div>
            </form>
          </div>

          {/* Intelligent Auto-Clipboard Detection Pill Toast */}
          {clipboardDetectedUrl && !result && (
            <div
              className="clipboard-detected-banner"
              style={{
                marginTop: "16px",
                width: "100%",
                maxWidth: "760px",
                margin: "16px auto 0",
                background: "linear-gradient(135deg, rgba(236,72,153,0.18) 0%, rgba(139,92,246,0.18) 100%)",
                border: "1px solid rgba(236,72,153,0.45)",
                borderRadius: "14px",
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                backdropFilter: "blur(12px)",
                boxShadow: "0 8px 24px -6px rgba(236,72,153,0.35)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden", textAlign: "left", minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>📋</span>
                <div style={{ overflow: "hidden", minWidth: 0 }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
                    Instagram Link Detected in Clipboard
                  </div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--text-secondary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100%",
                    }}
                  >
                    {clipboardDetectedUrl}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={handleApplyClipboardUrl}
                  style={{
                    background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "6px 14px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 4px 12px rgba(236,72,153,0.35)",
                  }}
                >
                  <span>⚡ Paste &amp; Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDismissedClipboardUrl(clipboardDetectedUrl);
                    setClipboardDetectedUrl(null);
                  }}
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "var(--text-secondary)",
                    border: "none",
                    borderRadius: "8px",
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                  title="Dismiss"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* 1-Click Bookmarklet Trigger Pill */}
          <div style={{ marginTop: "14px", display: "flex", justifyContent: "center" }}>
            <button
              type="button"
              onClick={() => setShowBookmarkletModal(true)}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--card-border, rgba(255,255,255,0.1))",
                color: "var(--text-secondary, #a1a1aa)",
                padding: "6px 14px",
                borderRadius: "var(--radius-full, 9999px)",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease",
              }}
            >
              <span>🔖</span>
              <span>{t("bookmarklet_title", "1-Click Browser Bookmarklet")}</span>
              <span style={{ color: "#ec4899", fontWeight: 700 }}>→</span>
            </button>
          </div>

          {/* Optional Cloudflare Turnstile Container */}
          {turnstileSiteKey && (
            <div
              ref={turnstileWidgetRef}
              id="cf-turnstile-box"
              style={{ marginTop: "14px", minHeight: "65px", display: "flex", justifyContent: "center" }}
            />
          )}

          {error && (
            <div
              style={{
                marginTop: "20px",
                maxWidth: "780px",
                width: "100%",
                background: error.includes("Too many requests")
                  ? "rgba(245, 158, 11, 0.08)"
                  : "rgba(239, 68, 68, 0.08)",
                border: error.includes("Too many requests")
                  ? "1px solid rgba(245, 158, 11, 0.3)"
                  : "1px solid rgba(239, 68, 68, 0.25)",
                borderRadius: "14px",
                padding: "18px 22px",
                textAlign: "left",
                color: error.includes("Too many requests") ? "#fcd34d" : "#fca5a5",
                fontSize: "0.93rem",
                lineHeight: 1.6,
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontWeight: "700",
                  color: error.includes("Too many requests") ? "#fbbf24" : "#f87171",
                  fontSize: "1.02rem",
                  marginBottom: "6px",
                }}
              >
                <span>{error.includes("Too many requests") ? "⏱️ Rate Limit Exceeded" : "⚠️ Download Notice"}</span>
              </div>
              <p style={{ color: "var(--text-primary)", fontSize: "0.95rem" }}>{error}</p>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. INSTANT LOADING STATE (REPLACES EVERYTHING ON CLICK)                   */}
      {/* ========================================================================= */}
      {loading && (
        <div className="extract-loading-container" id="extract-loading-box">
          <div className="extract-spinner-wrapper">
            <div className="extract-spinner-glow"></div>
            <div className="extract-spinner-ring"></div>
          </div>
          <h2 className="loading-title">Resolving Instagram Stream...</h2>
          <p className="loading-subtitle">
            Extracting direct high-speed 1080p media buffers from Instagram CDN edge servers.
          </p>
          <div className="loading-bar-wrapper">
            <div className="loading-bar-indeterminate"></div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LIVE DOWNLOAD PROGRESS NOTIFICATION TOAST                              */}
      {/* ========================================================================= */}
      {downloadingFile && (
        <div className="download-progress-box" style={{ width: "100%", maxWidth: "860px", marginBottom: "20px" }}>
          <div className="progress-header">
            <span>
              {downloadProgress < 100 ? "⏳ Downloading Stream:" : "✅ Download Started:"}{" "}
              <strong style={{ color: "#f472b6" }}>{downloadingFile}</strong>
            </span>
            <span>{downloadProgress}%</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${downloadProgress}%` }}></div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DEDICATED RESULT VIEW (ONLY SHOWN WHEN MEDIA IS READY)                */}
      {/* ========================================================================= */}
      {!loading && result && (
        <div className="result-view-container" id="media-result-preview">
          {/* Top Action Bar */}
          <div className="result-top-action-bar">
            <button type="button" className="back-search-btn" onClick={handleReset}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Download Another Video</span>
            </button>

            <span className="media-ready-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>{result.isCarousel ? `${result.carouselItems?.length || 0} Slides Ready` : "Media Ready for Download"}</span>
            </span>
          </div>

          {/* ===================================================================== */}
          {/* 0. SPECIALIZED INSTAGRAM PROFILE DP / AVATAR RESULT VIEW             */}
          {/* ===================================================================== */}
          {!result.isCarousel && isProfileMedia && (
            <div className="result-card-v2 dp-result-card">
              {/* Media Col: Avatar frame & zoom preview */}
              <div className="result-media-col">
                <div className="profile-dp-showcase-frame">
                  <div
                    className="profile-avatar-wrapper"
                    onClick={() => setShowDpZoomModal(true)}
                    title="Click to view full-size 1080p DP in HD zoom modal"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      referrerPolicy="no-referrer"
                      src={currentResolution?.downloadUrl || result.thumbnailUrl}
                      alt={result.caption || "Instagram Profile Picture"}
                      className="profile-avatar-img"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fallback = currentResolution?.downloadUrl || result.thumbnailUrl;
                        if (fallback && !target.src.includes("/api/download")) {
                          target.src = `/api/download?url=${encodeURIComponent(fallback)}&filename=preview.jpg&preview=1`;
                        }
                      }}
                    />
                    <div className="profile-zoom-hint">🔍 Tap to Zoom</div>
                  </div>

                  <div className="profile-meta-chips">
                    <span className="profile-chip profile-chip-status">
                      ✨ {currentResolution?.width ? `${currentResolution.width}×${currentResolution.height} Full HD` : "1080p HD DP"}
                    </span>
                    {result.profileDetails?.followersCount && (
                      <span className="profile-chip profile-chip-followers">
                        👥 {result.profileDetails.followersCount}
                      </span>
                    )}
                    {result.profileDetails?.isPrivate ? (
                      <span className="profile-chip profile-chip-private">
                        🔒 Private Account (DP is Public)
                      </span>
                    ) : (
                      <span className="profile-chip profile-chip-status">
                        🌐 Public Profile
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick utility actions */}
                <div className="photo-quick-actions">
                  <button
                    type="button"
                    className="photo-action-btn"
                    onClick={() => setShowDpZoomModal(true)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      <line x1="11" y1="8" x2="11" y2="14"></line>
                      <line x1="8" y1="11" x2="14" y2="11"></line>
                    </svg>
                    <span>Zoom HD</span>
                  </button>
                  <a
                    href={currentResolution?.downloadUrl || result.thumbnailUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="photo-action-btn"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h6v6"></path>
                      <path d="M10 14L21 3"></path>
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    </svg>
                    <span>Full Size</span>
                  </a>
                  <button
                    type="button"
                    className="photo-action-btn"
                    onClick={() => handleCopyLink(currentResolution?.downloadUrl || result.thumbnailUrl)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                  </button>
                  <button
                    type="button"
                    className="photo-action-btn"
                    onClick={() =>
                      handleShareMedia(
                        `Instagram Profile DP of ${result.author || result.authorHandle}`,
                        result.profileDetails?.biography || result.caption,
                        currentResolution?.downloadUrl || result.thumbnailUrl
                      )
                    }
                    title="Share profile DP"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18" cy="5" r="3"></circle>
                      <circle cx="6" cy="12" r="3"></circle>
                      <circle cx="18" cy="19" r="3"></circle>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Info & Download Col */}
              <div className="result-info-col">
                <div>
                  {/* Creator Card */}
                  <div className="creator-profile-card">
                    <div className="creator-avatar" style={{ background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)" }}>
                      {result.author ? result.author.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="creator-meta">
                      <div className="creator-name-row">
                        <span className="creator-name">{result.author || result.authorHandle}</span>
                        {result.profileDetails?.isVerified && (
                          <svg className="verified-icon" width="18" height="18" viewBox="0 0 24 24" fill="#38bdf8" aria-label="Verified Account">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                        )}
                      </div>
                      <div className="creator-handle">
                        {result.authorHandle}
                      </div>
                    </div>
                  </div>

                  {/* Bio or Caption */}
                  {(result.profileDetails?.biography || result.caption) && (
                    <div className="caption-box">
                      <p>{result.profileDetails?.biography || result.caption}</p>
                      <div className="caption-actions-row">
                        <button
                          type="button"
                          className={`caption-action-pill ${copiedCaption ? "active" : ""}`}
                          onClick={() => handleCopyCaption(result.profileDetails?.biography || result.caption)}
                        >
                          <span>📋</span>
                          <span>{copiedCaption ? "Copied Bio!" : "Copy Bio"}</span>
                        </button>
                        <button
                          type="button"
                          className={`caption-action-pill ${copiedHashtags ? "active" : ""}`}
                          onClick={() => handleCopyHashtags(result.profileDetails?.biography || result.caption)}
                        >
                          <span>🏷️</span>
                          <span>{copiedHashtags ? "Copied Tags!" : "Copy Hashtags"}</span>
                        </button>
                        <button
                          type="button"
                          className="caption-action-pill"
                          onClick={() =>
                            handleShareMedia(
                              `Instagram Profile DP: ${result.author || result.authorHandle}`,
                              result.profileDetails?.biography || result.caption,
                              currentResolution?.downloadUrl || result.thumbnailUrl
                            )
                          }
                        >
                          <span>📤</span>
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quality Selector (if multiple resolutions exist) */}
                  {result.resolutions.length > 1 && (
                    <div className="quality-toggle-container">
                      <div className="quality-toggle-label">
                        <span>Select DP Resolution</span>
                        <span className="quality-count-badge">
                          {result.resolutions.length} Sizes Available
                        </span>
                      </div>
                      <div className="quality-toggle-bar">
                        {result.resolutions.map((resItem, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className={`quality-chip-btn ${selectedQualityIndex === idx ? "active" : ""}`}
                            onClick={() => setSelectedQualityIndex(idx)}
                          >
                            <span className="chip-res-tag">{resItem.label}</span>
                            <span className="chip-size-tag">{resItem.quality}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Download Action Card */}
                  <div className="download-action-card" style={{ marginTop: "20px" }}>
                    <div className="download-target-summary">
                      <div className="target-icon-wrap" style={{ background: "rgba(236,72,153,0.15)", color: "#ec4899" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <div className="target-details">
                        <span className="target-format-name">
                          {currentResolution?.label || "1080p Full HD Profile Picture"}
                        </span>
                        <span className="target-format-meta">
                          Uncropped Master Quality • JPG Image • 100% Watermark-Free
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="download-stream-btn"
                      id="download-profile-dp-btn"
                      onClick={() => {
                        const targetUrl = currentResolution?.downloadUrl || result.thumbnailUrl;
                        const cleanUser = result.authorHandle.replace(/^@/, "") || "instagram";
                        triggerDownload(targetUrl, `${cleanUser}_profile_dp_1080p.jpg`);
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      <span>Download Full HD Profile Picture (1080p JPG)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fullscreen DP Zoom Modal */}
          {showDpZoomModal && (
            <div className="dp-zoom-modal-backdrop" onClick={() => setShowDpZoomModal(false)}>
              <div className="dp-zoom-modal-content" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="dp-zoom-close-btn"
                  onClick={() => setShowDpZoomModal(false)}
                  title="Close Zoom Modal"
                >
                  ✕
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  referrerPolicy="no-referrer"
                  src={currentResolution?.downloadUrl || result.thumbnailUrl}
                  alt={result.author || "Full Resolution DP"}
                  className="dp-zoom-modal-img"
                  onError={(e) => {
                    const target = e.currentTarget;
                    const fallback = currentResolution?.downloadUrl || result.thumbnailUrl;
                    if (fallback && !target.src.includes("/api/download")) {
                      target.src = `/api/download?url=${encodeURIComponent(fallback)}&filename=preview.jpg&preview=1`;
                    }
                  }}
                />
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    className="download-stream-btn"
                    style={{ padding: "10px 24px", fontSize: "0.95rem" }}
                    onClick={() => {
                      const targetUrl = currentResolution?.downloadUrl || result.thumbnailUrl;
                      const cleanUser = result.authorHandle.replace(/^@/, "") || "instagram";
                      triggerDownload(targetUrl, `${cleanUser}_profile_dp_1080p.jpg`);
                    }}
                  >
                    <span>⬇️ Download Full Size (1080p JPG)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* A. SPECIALIZED SINGLE PHOTO RESULT VIEW                               */}
          {/* ===================================================================== */}
          {!result.isCarousel && !isProfileMedia && isPhotoMedia && (
            <div className="result-card-v2">
              {/* Photo Showcase Column */}
              <div className="result-media-col">
                <div className="photo-showcase-frame">
                  <div className="photo-badge-row">
                    <span className="photo-tag-chip">📸 HIGH-RES PHOTO</span>
                    {currentResolution?.width && (
                      <span className="photo-tag-chip" style={{ background: "rgba(131, 58, 180, 0.85)" }}>
                        {currentResolution.width}×{currentResolution.height}
                      </span>
                    )}
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    referrerPolicy="no-referrer"
                    src={currentResolution?.downloadUrl || result.thumbnailUrl}
                    alt={result.caption || "Instagram Photo"}
                    className="photo-showcase-img"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallback = currentResolution?.downloadUrl || result.thumbnailUrl;
                      if (fallback && !target.src.includes("/api/download")) {
                        target.src = `/api/download?url=${encodeURIComponent(fallback)}&filename=preview.jpg&preview=1`;
                      }
                    }}
                  />
                </div>

                {/* Quick utility actions */}
                <div className="photo-quick-actions">
                  <a
                    href={currentResolution?.downloadUrl || result.thumbnailUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="photo-action-btn"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h6v6"></path>
                      <path d="M10 14L21 3"></path>
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    </svg>
                    <span>Full Size</span>
                  </a>
                  <button
                    type="button"
                    className="photo-action-btn"
                    onClick={() => handleCopyLink(currentResolution?.downloadUrl || result.thumbnailUrl)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>{copiedLink ? "Copied Link!" : "Copy Link"}</span>
                  </button>
                  <button
                    type="button"
                    className="photo-action-btn"
                    onClick={() =>
                      handleShareMedia(
                        `Instagram Photo by ${result.author || result.authorHandle}`,
                        result.caption,
                        currentResolution?.downloadUrl || result.thumbnailUrl
                      )
                    }
                    title="Share Photo"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18" cy="5" r="3"></circle>
                      <circle cx="6" cy="12" r="3"></circle>
                      <circle cx="18" cy="19" r="3"></circle>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Photo Info & Quality Toggle Column */}
              <div className="result-info-col">
                <div>
                  {/* Creator Card */}
                  <div className="creator-profile-card">
                    <div className="creator-avatar">
                      {result.author ? result.author.charAt(0).toUpperCase() : "I"}
                    </div>
                    <div className="creator-meta">
                      <div className="creator-name-row">
                        <span className="creator-name">{result.author || "Instagram Creator"}</span>
                        <svg className="verified-icon" width="16" height="16" viewBox="0 0 24 24" fill="#38bdf8">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      </div>
                      <div className="creator-handle">
                        {result.authorHandle || "@instagram_user"}
                      </div>
                    </div>
                  </div>

                  {/* Caption */}
                  {result.caption && (
                    <div className="caption-box">
                      <p>{result.caption}</p>
                      <div className="caption-actions-row">
                        <button
                          type="button"
                          className={`caption-action-pill ${copiedCaption ? "active" : ""}`}
                          onClick={() => handleCopyCaption(result.caption)}
                        >
                          <span>📋</span>
                          <span>{copiedCaption ? "Copied Caption!" : "Copy Caption"}</span>
                        </button>
                        <button
                          type="button"
                          className={`caption-action-pill ${copiedHashtags ? "active" : ""}`}
                          onClick={() => handleCopyHashtags(result.caption)}
                        >
                          <span>🏷️</span>
                          <span>{copiedHashtags ? "Copied Tags!" : "Copy Hashtags"}</span>
                        </button>
                        <button
                          type="button"
                          className="caption-action-pill"
                          onClick={() =>
                            handleShareMedia(
                              `Instagram Photo by ${result.author || result.authorHandle}`,
                              result.caption,
                              currentResolution?.downloadUrl || result.thumbnailUrl
                            )
                          }
                        >
                          <span>📤</span>
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Segmented Quality Toggle */}
                  <div className="quality-toggle-container">
                    <div className="quality-toggle-label">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                      </svg>
                      <span>Choose Photo Resolution:</span>
                    </div>

                    {result.resolutions.length > 1 && (
                      <div className="main-quality-select-box">
                        <span className="main-quality-select-label">Choose Resolution:</span>
                        <div className="main-select-wrapper">
                          <select
                            className="main-quality-select"
                            value={selectedQualityIndex}
                            onChange={(e) => setSelectedQualityIndex(Number(e.target.value))}
                          >
                            {result.resolutions.map((res, idx) => (
                              <option key={idx} value={idx}>
                                {res.width && res.height
                                  ? `${res.width} × ${res.height} px ${res.isBest ? "(Original Quality)" : ""}`
                                  : res.label}
                              </option>
                            ))}
                          </select>
                          <div className="main-select-chevron">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Technical Specs Strip */}
                  {currentResolution && (
                    <div className="specs-strip">
                      <div className="spec-item">
                        <span className="spec-title">Format</span>
                        <span className="spec-value">JPG (Photo)</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-title">Resolution</span>
                        <span className="spec-value">
                          {currentResolution.width && currentResolution.height
                            ? `${currentResolution.width} × ${currentResolution.height} px`
                            : "1080p High-Res"}
                        </span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-title">Quality</span>
                        <span className="spec-value">{currentResolution.quality}</span>
                      </div>
                      {currentResolution.size && (
                        <div className="spec-item">
                          <span className="spec-title">Approx Size</span>
                          <span className="spec-value">{currentResolution.size}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Primary Download CTA */}
                {currentResolution && (
                  <button
                    type="button"
                    className="primary-dl-card-btn"
                    id="download-photo-btn"
                    onClick={() =>
                      triggerDownload(
                        currentResolution.downloadUrl,
                        `gramsave_${result.id}_${currentResolution.label.replace(/\s+/g, "_")}.${currentResolution.type}`
                      )
                    }
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>Download Photo</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* B. SPECIALIZED DEDICATED AUDIO RESULT VIEW                            */}
          {/* ===================================================================== */}
          {!result.isCarousel && isAudioSelected && (
            <div className="result-card-v2">
              {/* Vinyl Player Showcase */}
              <div className="result-media-col">
                <div className="vinyl-showcase-box">
                  <div className={`vinyl-disk ${isPlayingAudio ? "spinning" : ""}`}>
                    <div
                      className="vinyl-center-art"
                      style={{ backgroundImage: `url(${result.thumbnailUrl})` }}
                    >
                      <div className="vinyl-center-spindle"></div>
                    </div>
                  </div>

                  <div className="sound-bars-indicator">
                    <span className="sound-bar"></span>
                    <span className="sound-bar"></span>
                    <span className="sound-bar"></span>
                    <span className="sound-bar"></span>
                    <span className="sound-bar"></span>
                    <span className="sound-bar"></span>
                  </div>

                  <span style={{ marginTop: "10px", fontSize: "0.8rem", fontWeight: 700, color: "#ec4899" }}>
                    🎵 {currentAudioResolution?.bitrate ? `${currentAudioResolution.bitrate.toUpperCase()} STEREO AUDIO` : "320 KBPS STEREO AUDIO"}
                  </span>
                </div>
              </div>

              {/* Audio Controls & Download */}
              <div className="result-info-col">
                <div>
                  {/* Creator Card */}
                  <div className="creator-profile-card">
                    <div className="creator-avatar" style={{ background: "linear-gradient(135deg, #f97316 0%, #ec4899 100%)" }}>
                      🎵
                    </div>
                    <div className="creator-meta">
                      <div className="creator-name-row">
                        <span className="creator-name">{result.author || "Instagram Audio Track"}</span>
                        <svg className="verified-icon" width="16" height="16" viewBox="0 0 24 24" fill="#38bdf8">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      </div>
                      <div className="creator-handle">
                        {result.authorHandle || "@instagram_audio"} • MP3 Audio Track
                      </div>
                    </div>
                  </div>

                  {/* Caption / Title */}
                  {result.caption && (
                    <div className="caption-box">
                      <p>{result.caption}</p>
                      <div className="caption-actions-row">
                        <button
                          type="button"
                          className={`caption-action-pill ${copiedCaption ? "active" : ""}`}
                          onClick={() => handleCopyCaption(result.caption)}
                        >
                          <span>📋</span>
                          <span>{copiedCaption ? "Copied Title!" : "Copy Title"}</span>
                        </button>
                        <button
                          type="button"
                          className={`caption-action-pill ${copiedHashtags ? "active" : ""}`}
                          onClick={() => handleCopyHashtags(result.caption)}
                        >
                          <span>🏷️</span>
                          <span>{copiedHashtags ? "Copied Tags!" : "Copy Hashtags"}</span>
                        </button>
                        <button
                          type="button"
                          className="caption-action-pill"
                          onClick={() =>
                            handleShareMedia(
                              `Instagram Audio: ${result.author || "Trending Sound"}`,
                              result.caption,
                              currentResolution?.downloadUrl || result.thumbnailUrl
                            )
                          }
                        >
                          <span>📤</span>
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Built-in HTML5 Audio Preview Player */}
                  <div className="audio-player-custom">
                    <audio
                      ref={audioRef}
                      src={proxyAudioPreviewUrl}
                      onTimeUpdate={() => {
                        if (audioRef.current) {
                          setAudioCurrentTime(audioRef.current.currentTime);
                        }
                      }}
                      onLoadedMetadata={() => {
                        if (audioRef.current) {
                          setAudioDuration(audioRef.current.duration);
                        }
                      }}
                      onEnded={() => setIsPlayingAudio(false)}
                      preload="metadata"
                    />

                    <div className="audio-controls-row">
                      <button
                        type="button"
                        className="audio-play-toggle-btn"
                        onClick={toggleAudioPlay}
                        title={isPlayingAudio ? "Pause Audio Preview" : "Play Audio Preview"}
                      >
                        {isPlayingAudio ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16"></rect>
                            <rect x="14" y="4" width="4" height="16"></rect>
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: "2px" }}>
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                          </svg>
                        )}
                      </button>

                      <div className="audio-progress-bar-container" onClick={handleAudioSeek}>
                        <div
                          className="audio-progress-fill"
                          style={{
                            width: `${audioDuration > 0 ? (audioCurrentTime / audioDuration) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>

                      <span className="audio-time-label">
                        {formatTime(audioCurrentTime)} / {formatTime(audioDuration || 30)}
                      </span>
                    </div>
                  </div>

                  {/* Redesigned Premium Audio Bitrate Selector */}
                  <div className="audio-bitrate-selector-container">
                    <div className="audio-bitrate-header">
                      <div className="audio-bitrate-title">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                        <span>Select MP3 Audio Bitrate:</span>
                      </div>
                      <span className="audio-bitrate-selected-pill">
                        🎵 {currentAudioResolution?.bitrate || "320 kbps"} Stereo
                      </span>
                    </div>

                    <div className="audio-bitrate-cards-grid">
                      {audioResolutions.map((res, idx) => {
                        const isSelected = selectedAudioQualityIndex === idx;
                        const is320 = res.bitrate?.includes("320") || res.label.includes("320") || idx === 0;
                        const is256 = res.bitrate?.includes("256") || res.label.includes("256") || idx === 1;
                        const is128 = res.bitrate?.includes("128") || res.label.includes("128") || idx === 2;

                        const badgeLabel = is320 ? "Master Quality" : is256 ? "High Quality" : "Fast / Mobile";
                        const badgeIcon = is320 ? "⭐" : is256 ? "✨" : "⚡";
                        const bitrateNum = is320 ? "320 kbps" : is256 ? "256 kbps" : is128 ? "128 kbps" : (res.bitrate || res.label);
                        const subLabel = is320 ? "Studio Audio" : is256 ? "Crystal Clear" : "Standard MP3";

                        return (
                          <button
                            key={idx}
                            type="button"
                            className={`audio-bitrate-card ${isSelected ? "selected" : ""}`}
                            onClick={() => setSelectedAudioQualityIndex(idx)}
                            aria-label={`Select ${bitrateNum} ${subLabel}`}
                          >
                            <div className="audio-bitrate-card-top">
                              <span className={`audio-bitrate-badge ${isSelected ? "badge-active" : ""}`}>
                                {badgeIcon} {badgeLabel}
                              </span>
                              <div className={`audio-radio-circle ${isSelected ? "radio-checked" : ""}`}>
                                {isSelected && <span className="audio-radio-inner-dot"></span>}
                              </div>
                            </div>
                            <div className="audio-bitrate-rate">{bitrateNum}</div>
                            <div className="audio-bitrate-sub">{subLabel}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Specs Strip */}
                  <div className="specs-strip">
                    <div className="spec-item">
                      <span className="spec-title">Audio Format</span>
                      <span className="spec-value">MP3 Stereo ({currentAudioResolution?.bitrate || "320kbps"})</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-title">Quality Tier</span>
                      <span className="spec-value">{currentAudioResolution?.quality || "Ultra HD Fidelity"}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-title">Channels</span>
                      <span className="spec-value">2.0 Dual Stereo</span>
                    </div>
                  </div>
                </div>

                {/* Primary Download Button */}
                {currentAudioResolution && (
                  <button
                    type="button"
                    className="primary-dl-card-btn"
                    id="download-audio-btn"
                    style={{ background: "linear-gradient(135deg, #f97316 0%, #ec4899 100%)", boxShadow: "0 8px 28px rgba(249,115,22,0.45), 0 2px 8px rgba(0,0,0,0.3)" }}
                    onClick={() =>
                      triggerDownload(
                        currentAudioResolution.downloadUrl,
                        `gramsave_${result.id}_${(currentAudioResolution.bitrate || currentAudioResolution.label).replace(/[^a-zA-Z0-9]/g, "_")}.mp3`
                      )
                    }
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>
                      Download {currentAudioResolution.bitrate || "320 kbps"} Audio
                    </span>
                  </button>
                )}

                {/* Ringtone & Viral Snippet Extractor */}
                {currentAudioResolution && (
                  <div
                    style={{
                      marginTop: "16px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid var(--card-border)",
                      borderRadius: "14px",
                      padding: "16px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>✂️</span>
                        <span>Ringtone &amp; Story Sound Snippets</span>
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "#ec4899", fontWeight: 700, background: "rgba(236,72,153,0.12)", padding: "2px 8px", borderRadius: "9999px" }}>
                        Fast Trim
                      </span>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "12px" }}>
                      Extract an instant trimmed 15s ringtone or 30s WhatsApp audio snippet from this track:
                    </p>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => handleDownloadRingtone(currentAudioResolution, 15)}
                        style={{
                          flex: 1,
                          minWidth: "150px",
                          background: "rgba(236,72,153,0.12)",
                          border: "1px solid rgba(236,72,153,0.35)",
                          color: "#f472b6",
                          borderRadius: "10px",
                          padding: "10px 14px",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <span>🔔</span>
                        <span>15s Ringtone (MP3)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadRingtone(currentAudioResolution, 30)}
                        style={{
                          flex: 1,
                          minWidth: "150px",
                          background: "rgba(56,189,248,0.12)",
                          border: "1px solid rgba(56,189,248,0.35)",
                          color: "#38bdf8",
                          borderRadius: "10px",
                          padding: "10px 14px",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <span>🔔</span>
                        <span>30s Story Sound (MP3)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* C. SPECIALIZED VIDEO / REEL / STORY RESULT VIEW                       */}
          {/* ===================================================================== */}
          {!result.isCarousel && isVideoMedia && !isAudioSelected && (
            <div className="result-card-v2">
              {/* Video Player Column */}
              <div className="result-media-col">
                <div className="video-player-frame">
                  <span className="thumb-type-tag">
                    {result.type === "reel" ? "🎬 REEL" : result.type === "story" ? "⚡ STORY" : "🎥 VIDEO"}
                  </span>
                  {result.duration && (
                    <span className="thumb-duration-tag">⏱ {result.duration}</span>
                  )}

                  <video
                    controls
                    playsInline
                    poster={result.thumbnailUrl}
                    src={
                      currentResolution?.audioUrl
                        ? `/api/download?url=${encodeURIComponent(currentResolution.downloadUrl)}&audioUrl=${encodeURIComponent(currentResolution.audioUrl)}&filename=preview.mp4&preview=1`
                        : currentResolution?.downloadUrl
                    }
                    className="video-player-element"
                  />
                </div>
              </div>

              {/* Video Info & Quality Toggle */}
              <div className="result-info-col">
                <div>
                  {/* Creator Card */}
                  <div className="creator-profile-card">
                    <div className="creator-avatar">
                      {result.author ? result.author.charAt(0).toUpperCase() : "I"}
                    </div>
                    <div className="creator-meta">
                      <div className="creator-name-row">
                        <span className="creator-name">{result.author || "Instagram Creator"}</span>
                        <svg className="verified-icon" width="16" height="16" viewBox="0 0 24 24" fill="#38bdf8">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      </div>
                      <div className="creator-handle">
                        {result.authorHandle || "@instagram_user"}
                      </div>
                    </div>
                  </div>

                  {/* Caption */}
                  {result.caption && (
                    <div className="caption-box">
                      <p>{result.caption}</p>
                      <div className="caption-actions-row">
                        <button
                          type="button"
                          className={`caption-action-pill ${copiedCaption ? "active" : ""}`}
                          onClick={() => handleCopyCaption(result.caption)}
                        >
                          <span>📋</span>
                          <span>{copiedCaption ? "Copied Caption!" : "Copy Caption"}</span>
                        </button>
                        <button
                          type="button"
                          className={`caption-action-pill ${copiedHashtags ? "active" : ""}`}
                          onClick={() => handleCopyHashtags(result.caption)}
                        >
                          <span>🏷️</span>
                          <span>{copiedHashtags ? "Copied Tags!" : "Copy Hashtags"}</span>
                        </button>
                        <button
                          type="button"
                          className="caption-action-pill"
                          onClick={() =>
                            handleShareMedia(
                              `Instagram Video by ${result.author || result.authorHandle}`,
                              result.caption,
                              currentResolution?.downloadUrl || result.thumbnailUrl
                            )
                          }
                        >
                          <span>📤</span>
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Segmented Quality Toggle */}
                  <div className="quality-toggle-container">
                    <div className="quality-toggle-label">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polygon points="23 7 16 12 23 17 23 7"></polygon>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                      </svg>
                      <span>Choose Download Quality & Format:</span>
                    </div>

                    {result.resolutions.length > 1 && (
                      <div className="main-quality-select-box">
                        <span className="main-quality-select-label">Choose Quality & Format:</span>
                        <div className="main-select-wrapper">
                          <select
                            className="main-quality-select"
                            value={selectedQualityIndex}
                            onChange={(e) => setSelectedQualityIndex(Number(e.target.value))}
                          >
                            {result.resolutions.map((res, idx) => (
                              <option key={idx} value={idx}>
                                {res.type === "mp3"
                                  ? `🎵 ${res.label} (Audio MP3)`
                                  : `🎥 ${res.label} ${res.width && res.height ? `(${res.width}×${res.height})` : ""}`}
                              </option>
                            ))}
                          </select>
                          <div className="main-select-chevron">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Specs Strip */}
                  {currentResolution && (
                    <div className="specs-strip">
                      <div className="spec-item">
                        <span className="spec-title">Format</span>
                        <span className="spec-value">{currentResolution.type === "mp3" ? "MP3 Audio" : "MP4 Video"}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-title">Quality Tier</span>
                        <span className="spec-value">{currentResolution.quality}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-title">Resolution / Codec</span>
                        <span className="spec-value">
                          {currentResolution.type === "mp3"
                            ? "320 kbps Stereo"
                            : currentResolution.width && currentResolution.height
                            ? `${currentResolution.width}×${currentResolution.height} (H.264)`
                            : "1080p HD (H.264)"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Download Button */}
                {currentResolution && (
                  <button
                    type="button"
                    className="primary-dl-card-btn"
                    id="download-video-btn"
                    onClick={() =>
                      triggerDownload(
                        currentResolution.downloadUrl,
                        `gramsave_${result.id}_${currentResolution.label.replace(/\s+/g, "_")}.${currentResolution.type}`,
                        currentResolution.audioUrl
                      )
                    }
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span style={{ fontWeight: 800, fontSize: "1.08rem" }}>
                      {currentResolution.type === "mp3" ? "Download Audio" : "Download Video"}
                    </span>
                  </button>
                )}

                {/* Video Quick Actions Row */}
                <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    id="video-trim-toggle-btn"
                    onClick={() => setShowVideoTrimmer(!showVideoTrimmer)}
                    style={{
                      flex: 1,
                      minWidth: "130px",
                      background: showVideoTrimmer ? "rgba(236,72,153,0.18)" : "rgba(255,255,255,0.06)",
                      border: showVideoTrimmer ? "1px solid #ec4899" : "1px solid var(--card-border)",
                      color: showVideoTrimmer ? "#f472b6" : "var(--text-secondary)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span>✂️</span>
                    <span>{showVideoTrimmer ? "Close Trimmer" : "Trim Clip"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(currentResolution?.downloadUrl || result.thumbnailUrl)}
                    style={{
                      flex: 1,
                      minWidth: "110px",
                      background: copiedLink ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.06)",
                      border: copiedLink ? "1px solid #10b981" : "1px solid var(--card-border)",
                      color: copiedLink ? "#34d399" : "var(--text-secondary)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleShareMedia(
                        `Instagram Video by ${result.author || result.authorHandle}`,
                        result.caption,
                        currentResolution?.downloadUrl || result.thumbnailUrl
                      )
                    }
                    style={{
                      flex: 1,
                      minWidth: "100px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid var(--card-border)",
                      color: "var(--text-secondary)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18" cy="5" r="3"></circle>
                      <circle cx="6" cy="12" r="3"></circle>
                      <circle cx="18" cy="19" r="3"></circle>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                    <span>Share</span>
                  </button>
                </div>

                {/* Interactive Video Trimmer Drawer – Premium Design */}
                {showVideoTrimmer && currentResolution && (
                  <div className="video-trimmer-box">
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "7px" }}>
                        <span>✂️</span>
                        <span>Trim Video Before Download</span>
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "#f472b6", fontWeight: 700, background: "rgba(236,72,153,0.15)", padding: "3px 10px", borderRadius: "9999px", border: "1px solid rgba(236,72,153,0.3)" }}>
                        WhatsApp & TikTok
                      </span>
                    </div>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "14px", lineHeight: 1.5 }}>
                      Select only the exact segment you need — no need to download the full video.
                    </p>

                    {/* Quick Presets */}
                    <div className="trimmer-presets-row">
                      <button
                        type="button"
                        className={`trimmer-preset-chip ${trimStart === 0 && trimDuration === 15 ? "active" : ""}`}
                        onClick={() => { setTrimStart(0); setTrimDuration(15); }}
                      >
                        ⚡ 15s Reel
                      </button>
                      <button
                        type="button"
                        className={`trimmer-preset-chip ${trimStart === 0 && trimDuration === 30 ? "active" : ""}`}
                        onClick={() => { setTrimStart(0); setTrimDuration(30); }}
                      >
                        📱 30s WhatsApp
                      </button>
                      <button
                        type="button"
                        className={`trimmer-preset-chip ${trimStart === 0 && trimDuration === 60 ? "active" : ""}`}
                        onClick={() => { setTrimStart(0); setTrimDuration(60); }}
                      >
                        ⏱️ 60s TikTok
                      </button>
                    </div>

                    {/* Visual Timeline */}
                    <div className="trimmer-timeline-bar">
                      <div
                        className="trimmer-timeline-fill"
                        style={{
                          left: `${Math.min((trimStart / 120) * 100, 90)}%`,
                          width: `${Math.min((trimDuration / 120) * 100, 100 - (trimStart / 120) * 100)}%`,
                        }}
                      />
                    </div>

                    {/* Sliders */}
                    <div className="trimmer-slider-group">
                      <div>
                        <div className="trimmer-slider-label">
                          <span>Start</span>
                          <strong>{trimStart}s</strong>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="120"
                          value={trimStart}
                          onChange={(e) => setTrimStart(Number(e.target.value))}
                          style={{ width: "100%", accentColor: "#ec4899" }}
                        />
                      </div>
                      <div>
                        <div className="trimmer-slider-label">
                          <span>Duration</span>
                          <strong>{trimDuration}s</strong>
                        </div>
                        <input
                          type="range"
                          min="3"
                          max="90"
                          value={trimDuration}
                          onChange={(e) => setTrimDuration(Number(e.target.value))}
                          style={{ width: "100%", accentColor: "#8b5cf6" }}
                        />
                      </div>
                    </div>

                    {/* Clip Summary */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "14px", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                      <span style={{ background: "rgba(236,72,153,0.12)", border: "1px solid rgba(236,72,153,0.25)", borderRadius: "8px", padding: "4px 12px", fontWeight: 700, color: "#f472b6" }}>
                        {trimStart}s → {trimStart + trimDuration}s
                      </span>
                      <span>•</span>
                      <span>{trimDuration}s clip</span>
                    </div>

                    {/* Download Button */}
                    <button
                      type="button"
                      className="trimmer-download-btn"
                      onClick={() => handleDownloadTrimmedVideo(currentResolution)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      <span>Download Trimmed Clip · {trimStart}s – {trimStart + trimDuration}s</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* D. SPECIALIZED CAROUSEL ALBUM VIEW (WITH MIXED SLIDES & TOGGLES)      */}
          {/* ===================================================================== */}
          {result.isCarousel && result.carouselItems && (
            <div style={{ width: "100%" }}>
              {/* Overview Header Card */}
              <div className="carousel-overview-header">
                <div className="creator-profile-card" style={{ marginBottom: "12px" }}>
                  <div className="creator-avatar">
                    {result.author ? result.author.charAt(0).toUpperCase() : "I"}
                  </div>
                  <div className="creator-meta">
                    <div className="creator-name-row">
                      <span className="creator-name">{result.author || "Instagram Creator"}</span>
                      <svg className="verified-icon" width="16" height="16" viewBox="0 0 24 24" fill="#38bdf8">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                    <div className="creator-handle">
                      {result.authorHandle || "@instagram_user"}
                    </div>
                  </div>
                </div>

                {result.caption && (
                  <div className="caption-box" style={{ marginBottom: "12px" }}>
                    <p>{result.caption}</p>
                    <div className="caption-actions-row">
                      <button
                        type="button"
                        className={`caption-action-pill ${copiedCaption ? "active" : ""}`}
                        onClick={() => handleCopyCaption(result.caption)}
                      >
                        <span>📋</span>
                        <span>{copiedCaption ? "Copied Caption!" : "Copy Caption"}</span>
                      </button>
                      <button
                        type="button"
                        className={`caption-action-pill ${copiedHashtags ? "active" : ""}`}
                        onClick={() => handleCopyHashtags(result.caption)}
                      >
                        <span>🏷️</span>
                        <span>{copiedHashtags ? "Copied Tags!" : "Copy Hashtags"}</span>
                      </button>
                      <button
                        type="button"
                        className="caption-action-pill"
                        onClick={() =>
                          handleShareMedia(
                            `Instagram Carousel Album by ${result.author || result.authorHandle}`,
                            result.caption,
                            result.thumbnailUrl
                          )
                        }
                      >
                        <span>📤</span>
                        <span>Share Album</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Summary Stats Pill */}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  <span className="carousel-stats-pill">
                    <span>📦</span>
                    <span>{result.carouselItems.length} Total Slides</span>
                  </span>
                  <span className="carousel-stats-pill" style={{ background: "rgba(236, 72, 153, 0.12)", color: "#f472b6", borderColor: "rgba(236, 72, 153, 0.3)" }}>
                    <span>📸</span>
                    <span>{result.carouselItems.filter((i) => i.type === "photo").length} Photos</span>
                  </span>
                  <span className="carousel-stats-pill" style={{ background: "rgba(56, 189, 248, 0.12)", color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.3)" }}>
                    <span>🎬</span>
                    <span>{result.carouselItems.filter((i) => i.type === "video").length} Videos</span>
                  </span>
                </div>

                {/* Toolbar */}
                <div className="carousel-toolbar">
                  {/* View Mode Switcher */}
                  <div className="view-mode-toggle">
                    <button
                      type="button"
                      className={`view-mode-btn ${carouselViewMode === "grid" ? "active" : ""}`}
                      onClick={() => setCarouselViewMode("grid")}
                    >
                      <span>▦ Grid View</span>
                    </button>
                    <button
                      type="button"
                      className={`view-mode-btn ${carouselViewMode === "showcase" ? "active" : ""}`}
                      onClick={() => setCarouselViewMode("showcase")}
                    >
                      <span>🎞️ Slide Showcase</span>
                    </button>
                  </div>

                  {/* Action Buttons Row */}
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                    {/* Primary ZIP Archive Download */}
                    <button
                      type="button"
                      className="batch-download-all-btn"
                      disabled={batchDownloading}
                      onClick={handleDownloadAllZip}
                      style={{
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        boxShadow: "0 6px 16px -4px rgba(16, 185, 129, 0.45)",
                        border: "none",
                      }}
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      <span>
                        {batchDownloading
                          ? batchProgressText || "Packaging ZIP..."
                          : t("result_download_zip", `📦 Download All as ZIP (${result.carouselItems.length})`)}
                      </span>
                    </button>

                    {/* Sequential Individual Files Download */}
                    <button
                      type="button"
                      className="batch-download-all-btn"
                      disabled={batchDownloading}
                      onClick={handleDownloadAllCarousel}
                      style={{
                        background: "rgba(255, 255, 255, 0.06)",
                        border: "1px solid var(--card-border, rgba(255,255,255,0.12))",
                        color: "var(--text-secondary, #a1a1aa)",
                      }}
                      title="Download each slide as an individual file"
                    >
                      <span>Individual Files</span>
                    </button>

                    {/* Share Album Button */}
                    <button
                      type="button"
                      className="batch-download-all-btn"
                      onClick={() =>
                        handleShareMedia(
                          `Instagram Carousel Album by ${result.author || result.authorHandle}`,
                          result.caption,
                          result.thumbnailUrl
                        )
                      }
                      style={{
                        background: "rgba(255, 255, 255, 0.06)",
                        border: "1px solid var(--card-border, rgba(255,255,255,0.12))",
                        color: "var(--text-secondary, #a1a1aa)",
                      }}
                      title="Share album to WhatsApp, Telegram or social media"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="18" cy="5" r="3"></circle>
                        <circle cx="6" cy="12" r="3"></circle>
                        <circle cx="18" cy="19" r="3"></circle>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                      </svg>
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 1. GRID VIEW MODE */}
              {carouselViewMode === "grid" && (
                <div className="carousel-grid">
                  {result.carouselItems.map((item) => {
                    const selectedIdx = carouselSelectedQualities[item.index] ?? 0;
                    const chosenRes = item.resolutions[selectedIdx] || item.resolutions[0];

                    return (
                      <div key={item.index} className="carousel-card">
                        {/* Slide Thumbnail */}
                        <div className="carousel-slide-thumb" style={{ overflow: "hidden", position: "relative" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            referrerPolicy="no-referrer"
                            src={item.thumbnailUrl}
                            alt={`Slide ${item.index}`}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (item.thumbnailUrl && !target.src.includes("/api/download")) {
                                target.src = `/api/download?url=${encodeURIComponent(item.thumbnailUrl)}&filename=slide_${item.index}.jpg&preview=1`;
                              }
                            }}
                          />
                          <span className="carousel-slide-badge">
                            {item.type === "video" ? "🎬 VIDEO" : "📸 PHOTO"}
                          </span>
                          <span className="carousel-slide-counter">Slide #{item.index}</span>
                          {item.duration && (
                            <span className="carousel-slide-duration">⏱ {item.duration}</span>
                          )}
                        </div>

                        {/* Slide Card Body with Dropdown and Clean Button */}
                        <div className="carousel-card-body">
                          {/* Quality Dropdown when multiple options exist */}
                          {item.resolutions.length > 1 && (
                            <div className="carousel-select-wrapper">
                              <select
                                className="carousel-quality-select"
                                value={selectedIdx}
                                onChange={(e) =>
                                  setCarouselSelectedQualities((prev) => ({
                                    ...prev,
                                    [item.index]: Number(e.target.value),
                                  }))
                                }
                              >
                                {item.resolutions.map((res, rIdx) => (
                                  <option key={rIdx} value={rIdx}>
                                    {res.width && res.height
                                      ? `${res.width}x${res.height}`
                                      : res.label}
                                  </option>
                                ))}
                              </select>
                              <div className="carousel-select-chevron">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                              </div>
                            </div>
                          )}

                          {/* Short, Clean Download Button */}
                          <button
                            type="button"
                            className="slide-dl-btn"
                            onClick={() =>
                              triggerDownload(
                                chosenRes.downloadUrl,
                                `gramsave_${result.id}_slide_${item.index}_${chosenRes.label.replace(/[^a-zA-Z0-9]/g, "_")}.${chosenRes.type}`,
                                chosenRes.audioUrl
                              )
                            }
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="7 10 12 15 17 10"></polyline>
                              <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            <span>
                              {item.type === "video"
                                ? chosenRes.type === "mp3"
                                  ? "Download Audio"
                                  : "Download Video"
                                : "Download Photo"}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 2. SHOWCASE SLIDER VIEW MODE */}
              {carouselViewMode === "showcase" && (
                <div className="showcase-slider-box">
                  {(() => {
                    const activeItem = result.carouselItems[activeShowcaseSlide] || result.carouselItems[0];
                    const selectedIdx = carouselSelectedQualities[activeItem.index] ?? 0;
                    const chosenRes = activeItem.resolutions[selectedIdx] || activeItem.resolutions[0];

                    return (
                      <>
                        {/* Main Featured Frame with Nav Arrows */}
                        <div className="showcase-featured-frame">
                          {/* Previous button */}
                          <button
                            type="button"
                            className="showcase-nav-btn prev"
                            onClick={() =>
                              setActiveShowcaseSlide((prev) =>
                                prev > 0 ? prev - 1 : (result.carouselItems?.length || 1) - 1
                              )
                            }
                            title="Previous Slide"
                          >
                            ‹
                          </button>

                          {/* Media Display */}
                          {activeItem.type === "video" ? (
                            <video
                              controls
                              playsInline
                              poster={activeItem.thumbnailUrl}
                              src={
                                chosenRes.audioUrl
                                  ? `/api/download?url=${encodeURIComponent(chosenRes.downloadUrl)}&audioUrl=${encodeURIComponent(chosenRes.audioUrl)}&filename=preview.mp4&preview=1`
                                  : chosenRes.downloadUrl
                              }
                              className="showcase-featured-video"
                            />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              referrerPolicy="no-referrer"
                              src={chosenRes.downloadUrl || activeItem.thumbnailUrl}
                              alt={`Slide ${activeItem.index}`}
                              className="showcase-featured-img"
                              onError={(e) => {
                                const target = e.currentTarget;
                                const fallback = chosenRes.downloadUrl || activeItem.thumbnailUrl;
                                if (fallback && !target.src.includes("/api/download")) {
                                  target.src = `/api/download?url=${encodeURIComponent(fallback)}&filename=preview.jpg&preview=1`;
                                }
                              }}
                            />
                          )}

                          {/* Next button */}
                          <button
                            type="button"
                            className="showcase-nav-btn next"
                            onClick={() =>
                              setActiveShowcaseSlide((prev) =>
                                prev < (result.carouselItems?.length || 1) - 1 ? prev + 1 : 0
                              )
                            }
                            title="Next Slide"
                          >
                            ›
                          </button>
                        </div>

                        {/* Slide Quality Dropdown */}
                        {activeItem.resolutions.length > 1 && (
                          <div className="main-quality-select-box" style={{ margin: "4px 0" }}>
                            <span className="main-quality-select-label">Slide #{activeItem.index} Resolution:</span>
                            <div className="main-select-wrapper">
                              <select
                                className="main-quality-select"
                                value={selectedIdx}
                                onChange={(e) =>
                                  setCarouselSelectedQualities((prev) => ({
                                    ...prev,
                                    [activeItem.index]: Number(e.target.value),
                                  }))
                                }
                              >
                                {activeItem.resolutions.map((res, rIdx) => (
                                  <option key={rIdx} value={rIdx}>
                                    {res.width && res.height
                                      ? `${res.width}x${res.height}`
                                      : res.label}
                                  </option>
                                ))}
                              </select>
                              <div className="main-select-chevron">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Download Active Slide Button */}
                        <button
                          type="button"
                          className="primary-dl-card-btn"
                          style={{ marginBottom: "10px" }}
                          onClick={() =>
                            triggerDownload(
                              chosenRes.downloadUrl,
                              `gramsave_${result.id}_slide_${activeItem.index}.${chosenRes.type}`,
                              chosenRes.audioUrl
                            )
                          }
                        >
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                          <span>
                            {activeItem.type === "video"
                              ? chosenRes.type === "mp3"
                                ? "Download Audio"
                                : "Download Video"
                              : "Download Photo"}
                            </span>
                        </button>

                        {/* Filmstrip thumbnails row */}
                        <div className="filmstrip-row">
                          {result.carouselItems.map((item, idx) => (
                            <div
                              key={idx}
                              className={`filmstrip-thumb ${activeShowcaseSlide === idx ? "active" : ""}`}
                              onClick={() => setActiveShowcaseSlide(idx)}
                              title={`Slide ${item.index}`}
                              style={{ overflow: "hidden", position: "relative" }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                referrerPolicy="no-referrer"
                                src={item.thumbnailUrl}
                                alt={`Slide ${item.index}`}
                                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  if (item.thumbnailUrl && !target.src.includes("/api/download")) {
                                    target.src = `/api/download?url=${encodeURIComponent(item.thumbnailUrl)}&filename=thumb_${item.index}.jpg&preview=1`;
                                  }
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Bottom Reset Button */}
          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <button type="button" className="back-search-btn" onClick={handleReset} style={{ fontSize: "1rem", padding: "12px 28px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Download Another Video / Paste New URL</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1-CLICK BOOKMARKLET MODAL                                                 */}
      {/* ========================================================================= */}
      {showBookmarkletModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
            animation: "fadeIn 0.2s ease",
          }}
          onClick={() => setShowBookmarkletModal(false)}
        >
          <div
            style={{
              background: "var(--card-bg-elevated, #16181f)",
              border: "1px solid var(--card-border, rgba(255,255,255,0.12))",
              borderRadius: "20px",
              padding: "30px 26px",
              maxWidth: "480px",
              width: "100%",
              boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowBookmarkletModal(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "rgba(255,255,255,0.06)",
                border: "none",
                color: "#fff",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
              }}
            >
              ✕
            </button>

            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #ec4899, #a855f7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                  fontSize: "24px",
                  boxShadow: "0 8px 20px -4px rgba(236,72,153,0.5)",
                }}
              >
                🔖
              </div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#fff", marginBottom: "6px" }}>
                1-Click Browser Bookmarklet
              </h3>
              <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Download any Instagram Reel, Video or Post directly while browsing Instagram without copy-pasting links!
              </p>
            </div>

            {/* Draggable Button Box */}
            <div
              style={{
                background: "rgba(0,0,0,0.3)",
                border: "2px dashed rgba(236,72,153,0.4)",
                borderRadius: "14px",
                padding: "20px",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              <span style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase", fontWeight: 700 }}>
                👇 Drag this button to your Bookmarks Bar:
              </span>

              <a
                href="javascript:(function(){var u=window.location.href;if(!u.includes('instagram.com')){alert('Please use this on an Instagram Reel or Post!');return;}window.open('https://gramsave.site/?url='+encodeURIComponent(u)+'&src=bookmarklet','_blank');})();"
                onClick={(e) => {
                  if (typeof window !== "undefined" && !window.location.href.includes("instagram.com")) {
                    e.preventDefault();
                    alert("Drag this button to your bookmarks bar! Then click it whenever you are on Instagram.");
                  }
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  borderRadius: "var(--radius-full, 9999px)",
                  background: "linear-gradient(135deg, #ec4899, #a855f7)",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "1rem",
                  textDecoration: "none",
                  cursor: "grab",
                  boxShadow: "0 8px 20px -5px rgba(236,72,153,0.5)",
                }}
              >
                <span>⬇ Save IG</span>
              </a>
            </div>

            {/* Step Instructions */}
            <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
                <span style={{ color: "#ec4899", fontWeight: 800 }}>1.</span>
                <span>Ensure your browser bookmarks bar is visible (<kbd style={{ background: "rgba(255,255,255,0.1)", padding: "1px 5px", borderRadius: "4px" }}>Ctrl+Shift+B</kbd> or <kbd style={{ background: "rgba(255,255,255,0.1)", padding: "1px 5px", borderRadius: "4px" }}>Cmd+Shift+B</kbd>).</span>
              </div>
              <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
                <span style={{ color: "#ec4899", fontWeight: 800 }}>2.</span>
                <span>Drag the pink <strong>&quot;⬇ Save IG&quot;</strong> button up to your bookmarks bar.</span>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <span style={{ color: "#ec4899", fontWeight: 800 }}>3.</span>
                <span>Whenever viewing an Instagram post, click <strong>&quot;⬇ Save IG&quot;</strong> to start downloading instantly!</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
