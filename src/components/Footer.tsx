"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export default function Footer() {
  const { t } = useTranslation();
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasDev =
        localStorage.getItem("gramsave_dev_mode") === "true" ||
        Boolean(localStorage.getItem("gramsave_dev_secret")) ||
        Boolean(sessionStorage.getItem("gramsave_dev_secret"));
      setTimeout(() => setIsDevMode(hasDev), 0);
    }
  }, []);

  return (
    <footer className="footer" id="footer">
      <div className="container footer-inner">
        <div className="footer-grid">
          {/* Brand Col */}
          <div className="footer-col brand-col">
            <Link href="/" className="brand-logo footer-logo">
              <div className="logo-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </div>
              <span className="brand-name">
                Gram<span>Save</span>
              </span>
            </Link>
            <p className="footer-tagline">
              {t("footer_tagline", "The fastest, free, watermark-free Instagram media downloader. Save Reels, Stories, Photos, and Audio MP3 in 1080p Full HD.")}
            </p>
            <div className="footer-badges">
              <span className="ft-badge">⚡ Ultra Fast CDN</span>
              <span className="ft-badge">🔒 100% Anonymous</span>
              <span className="ft-badge">✨ 1080p MP4 & 320k MP3</span>
            </div>
          </div>

          {/* Tools / Silos Col */}
          <div className="footer-col">
            <h4 className="footer-heading">Downloader Tools</h4>
            <ul className="footer-list">
              <li>
                <Link href="/reels-downloader" className="footer-link">Instagram Reels Downloader</Link>
              </li>
              <li>
                <Link href="/story-saver" className="footer-link">Instagram Story Saver</Link>
              </li>
              <li>
                <Link href="/photo-downloader" className="footer-link">Instagram Photo Downloader</Link>
              </li>
              <li>
                <Link href="/profile-downloader" className="footer-link">Instagram Profile Picture / DP</Link>
              </li>
              <li>
                <Link href="/audio-downloader" className="footer-link">Instagram Audio & MP3 Converter</Link>
              </li>
              <li>
                <Link href="/carousel-downloader" className="footer-link">Instagram Carousel & Album Saver</Link>
              </li>
              <li>
                <Link href="/dp-viewer" className="footer-link">Instagram Full-Size HD DP Viewer</Link>
              </li>
            </ul>
          </div>

          {/* Supported Formats Col */}
          <div className="footer-col">
            <h4 className="footer-heading">Supported Formats</h4>
            <ul className="footer-list">
              <li><span className="footer-link-static">MP4 Video (1080p Full HD)</span></li>
              <li><span className="footer-link-static">MP4 Video (720p HD)</span></li>
              <li><span className="footer-link-static">MP3 Audio (320kbps High Bitrate)</span></li>
              <li><span className="footer-link-static">JPG / WebP High-Res Images</span></li>
              <li><span className="footer-link-static">Multi-Slide Carousel Albums</span></li>
            </ul>
          </div>

          {/* Legal / Policy Col */}
          <div className="footer-col">
            <h4 className="footer-heading">Legal & Trust</h4>
            <ul className="footer-list">
              <li>
                <Link href="/terms" className="footer-link">Terms of Service</Link>
              </li>
              <li>
                <Link href="/privacy" className="footer-link">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/contact" className="footer-link">Contact & DMCA Removal</Link>
              </li>
              <li>
                <Link href="/#faq" className="footer-link">Frequently Asked Questions</Link>
              </li>
              {isDevMode && (
                <li>
                  <Link href="/developer" className="footer-link" style={{ color: "#ec4899", fontWeight: 600 }}>⚡ Developer Portal &amp; CMS</Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="footer-disclaimer">
          <p>
            <strong>Disclaimer:</strong> GramSave is an independent archiving utility and is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Instagram, Meta Platforms, Inc., or any of their subsidiaries. Instagram and Meta are registered trademarks of their respective holders. GramSave does not host, store, or archive copyrighted content on its servers; all media files are delivered directly from Instagram public CDN servers upon direct user request.
          </p>
        </div>

        {/* Bottom copyright row */}
        <div className="footer-bottom">
          <p className="copyright-text">
            &copy; {new Date().getFullYear()} GramSave. {t("footer_rights", "All rights reserved. GramSave is not affiliated with or endorsed by Instagram or Meta.")}
          </p>
          <div className="footer-status-pill">
            <span className="status-dot"></span>
            <span>All Extraction Servers Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
