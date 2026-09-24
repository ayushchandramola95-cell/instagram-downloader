"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import InstallAppButton from "@/components/InstallAppButton";
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslation } from "@/lib/i18n";

interface HeaderProps {
  activeTab?: string;
}

export default function Header({ activeTab }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [logoClicks, setLogoClicks] = useState(0);
  const logoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Primary top-level navigation links
  const primaryNavItems = [
    { label: t("nav_home", "Home"), href: "/" },
    { label: t("nav_reels", "Reels"), href: "/reels-downloader" },
    { label: t("nav_stories", "Stories"), href: "/story-saver" },
    {
      label: t("nav_profile", "Profile DP"),
      href: "/profile-downloader",
      badge: "HD",
    },
  ];

  // Secondary tools in the "More Tools" dropdown
  const moreToolsItems = [
    {
      label: t("nav_photos", "Photos"),
      desc: "Original High-Res Images",
      href: "/photo-downloader",
      icon: "📸",
    },
    {
      label: t("nav_audio", "Audio MP3"),
      desc: "320kbps Audio Extractor",
      href: "/audio-downloader",
      icon: "🎵",
    },
    {
      label: t("nav_carousel", "Carousel"),
      desc: "All Slides Album Saver",
      href: "/carousel-downloader",
      icon: "📂",
    },
  ];

  const isMoreToolsActive = moreToolsItems.some((item) => pathname === item.href);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setToolsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Check Developer Mode authorization & listen for secret hotkey
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Check existing saved developer credentials
    const hasSecret =
      Boolean(localStorage.getItem("gramsave_dev_secret")) ||
      Boolean(sessionStorage.getItem("gramsave_dev_secret")) ||
      localStorage.getItem("gramsave_dev_mode") === "true";

    // 2. Check secret query param: ?dev=admin or ?dev=true or ?admin=1
    const params = new URLSearchParams(window.location.search);
    const devParam = params.get("dev") || params.get("admin");
    if (devParam === "true" || devParam === "admin" || devParam === "1") {
      localStorage.setItem("gramsave_dev_mode", "true");
      setIsDevMode(true);
      triggerToast("⚡ Developer Mode Unlocked!");
      return;
    }

    if (hasSecret) {
      setIsDevMode(true);
    }

    // 3. Secret Hotkey: Ctrl + Shift + D (or Cmd + Shift + D) to toggle Dev Mode
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setIsDevMode((prev) => {
          const next = !prev;
          if (next) {
            localStorage.setItem("gramsave_dev_mode", "true");
            triggerToast("⚡ Developer Mode Unlocked!");
          } else {
            localStorage.removeItem("gramsave_dev_mode");
            localStorage.removeItem("gramsave_dev_secret");
            triggerToast("🔒 Developer Mode Hidden");
          }
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Easter egg: Click brand logo 5 times in 2.5s to toggle Dev Mode
  const handleLogoClick = (e: React.MouseEvent) => {
    if (logoTimerRef.current) clearTimeout(logoTimerRef.current);

    const nextCount = logoClicks + 1;
    setLogoClicks(nextCount);

    if (nextCount >= 5) {
      setLogoClicks(0);
      setIsDevMode((prev) => {
        const next = !prev;
        if (next) {
          localStorage.setItem("gramsave_dev_mode", "true");
          triggerToast("⚡ Developer Mode Unlocked!");
        } else {
          localStorage.removeItem("gramsave_dev_mode");
          localStorage.removeItem("gramsave_dev_secret");
          triggerToast("🔒 Developer Mode Hidden");
        }
        return next;
      });
      return;
    }

    logoTimerRef.current = setTimeout(() => {
      setLogoClicks(0);
    }, 2500);
  };

  return (
    <header className="header" id="header">
      <div className="container header-inner">
        {/* Brand Logo with secret 5-click easter egg */}
        <Link
          href="/"
          className="brand-logo"
          id="logo-link"
          onClick={handleLogoClick}
          title={isDevMode ? "GramSave (Dev Mode Active)" : "GramSave"}
        >
          <div className="logo-badge">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </div>
          <span className="brand-name">
            Gram<span>Save</span>
          </span>
        </Link>

        {/* Desktop Clean Navigation */}
        <nav className="nav-links">
          {primaryNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive ? "active" : ""}`}
              >
                <span>{item.label}</span>
                {item.badge && <span className="nav-badge-new">{item.badge}</span>}
              </Link>
            );
          })}

          {/* More Tools Dropdown */}
          <div
            className="nav-dropdown-wrapper"
            ref={dropdownRef}
            onMouseEnter={() => setToolsDropdownOpen(true)}
            onMouseLeave={() => setToolsDropdownOpen(false)}
          >
            <button
              type="button"
              className={`nav-link nav-dropdown-btn ${isMoreToolsActive ? "active" : ""}`}
              onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
              aria-expanded={toolsDropdownOpen}
              aria-label="More Download Tools"
            >
              <span>{t("nav_more_tools", "More Tools")}</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={`nav-caret ${toolsDropdownOpen ? "open" : ""}`}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {toolsDropdownOpen && (
              <div className="nav-dropdown-menu">
                {moreToolsItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`nav-dropdown-item ${isActive ? "active" : ""}`}
                      onClick={() => setToolsDropdownOpen(false)}
                    >
                      <div className="nav-dropdown-icon">{item.icon}</div>
                      <div className="nav-dropdown-content">
                        <span className="nav-dropdown-title">{item.label}</span>
                        <span className="nav-dropdown-desc">{item.desc}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <Link href="/#faq" className="nav-link">
            {t("nav_faq", "FAQ")}
          </Link>
        </nav>

        {/* Desktop Right Actions */}
        <div className="nav-right-actions">
          <LanguageSelector />

          <InstallAppButton />

          <ThemeToggle />

          {/* Developer Mode Button (STRICTLY VISIBLE ONLY TO OWNER/DEVELOPER) */}
          {isDevMode && (
            <Link
              href="/developer"
              className="nav-dev-btn"
              title="Developer Dashboard (Only visible to you)"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 11px",
                borderRadius: "var(--radius-full, 9999px)",
                background: "rgba(236,72,153,0.12)",
                border: "1px solid rgba(236,72,153,0.4)",
                color: "#ec4899",
                fontSize: "0.78rem",
                fontWeight: 700,
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              <span className="nav-pill-dot"></span>
              <span>⚡ Dev</span>
            </Link>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            className="mobile-menu-toggle"
            aria-label="Toggle Navigation Menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu" id="mobile-navigation-drawer">
          <div style={{ paddingBottom: "12px", borderBottom: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>Language</span>
            <LanguageSelector />
          </div>

          {/* All format links in mobile drawer */}
          {[...primaryNavItems, ...moreToolsItems].map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mobile-nav-link ${isActive ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span style={{ fontSize: "0.75rem", color: "#ec4899", fontWeight: 700 }}>● Current</span>
                )}
              </Link>
            );
          })}

          <Link
            href="/#faq"
            className="mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span>{t("nav_faq", "FAQ")}</span>
          </Link>

          {/* Dev button in mobile only if isDevMode */}
          {isDevMode && (
            <Link
              href="/developer"
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: "#ec4899", fontWeight: 700 }}
            >
              <span>⚡ Developer Dashboard (Private)</span>
            </Link>
          )}

          <div style={{ paddingTop: "12px", borderTop: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary)" }}>Theme Mode</span>
            <ThemeToggle />
          </div>
        </div>
      )}

      {/* Secret Dev Mode Notification Toast */}
      {toastMessage && (
        <div className="dev-mode-toast">
          <span>{toastMessage}</span>
        </div>
      )}
    </header>
  );
}
