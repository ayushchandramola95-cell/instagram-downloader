"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

interface HeaderProps {
  activeTab?: string;
}

export default function Header({ activeTab }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Reels", href: "/reels-downloader" },
    { label: "Stories", href: "/story-saver" },
    { label: "Photos", href: "/photo-downloader" },
    { label: "Audio MP3", href: "/audio-downloader" },
    { label: "Carousel", href: "/carousel-downloader" },
  ];

  return (
    <header className="header" id="header">
      <div className="container header-inner">
        <Link href="/" className="brand-logo" id="logo-link">
          <div className="logo-badge">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </div>
          <span className="brand-name">
            Insta<span>Snap</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-links">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive ? "active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link href="/#faq" className="nav-link">FAQ</Link>
        </nav>

        {/* Desktop Right Actions (Status + Theme Switcher) */}
        <div className="nav-right-actions">
          <div className="nav-pill-badge">
            <span className="nav-pill-dot"></span>
            <span>v1.2 Live</span>
          </div>

          <ThemeToggle />

          {/* Mobile Hamburger Button */}
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

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-menu" id="mobile-navigation-drawer">
          {navItems.map((item) => {
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
            <span>FAQ</span>
          </Link>
          <div style={{ paddingTop: "12px", borderTop: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary)" }}>Theme Mode</span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}
