"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useTranslation, LanguageMeta } from "@/lib/i18n";

interface SystemInfo {
  uptimeSeconds: number;
  nodeVersion: string;
  platform: string;
  memoryUsageMb: number;
  turnstileEnabled: boolean;
  cookies: { exists: boolean; sizeBytes: number; lineCount: number };
  ytdlp: { available: boolean; version: string };
  ffmpeg: { available: boolean; version: string };
}

interface AnalyticsData {
  totalVisits: number;
  totalDownloads: number;
  downloadsByType: Record<string, number>;
  trafficSources: Record<string, number>;
  recentActivity: Array<{
    id: string;
    type: string;
    format?: string;
    quality?: string;
    timestamp: string;
    ipMasked?: string;
  }>;
  dailyStats: Array<{ date: string; visits: number; downloads: number }>;
}

export default function DeveloperPage() {
  const { reloadTranslations } = useTranslation();

  // Authentication State
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"analytics" | "cms" | "system" | "debugger" | "bookmarklet">("analytics");

  // Analytics & System Data
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Translations CMS State
  const [languages, setLanguages] = useState<LanguageMeta[]>([]);
  const [allStrings, setAllStrings] = useState<Record<string, Record<string, string>>>({});
  const [selectedLang, setSelectedLang] = useState<string>("en");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editedStrings, setEditedStrings] = useState<Record<string, string>>({});
  const [savingCms, setSavingCms] = useState(false);
  const [cmsMessage, setCmsMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Add Language Modal State
  const [showAddLangModal, setShowAddLangModal] = useState(false);
  const [newLangCode, setNewLangCode] = useState("");
  const [newLangName, setNewLangName] = useState("");
  const [newLangNative, setNewLangNative] = useState("");
  const [newLangFlag, setNewLangFlag] = useState("🌐");
  const [newLangDir, setNewLangDir] = useState<"ltr" | "rtl">("ltr");

  // Add Custom String Modal
  const [showAddStringModal, setShowAddStringModal] = useState(false);
  const [newStringKey, setNewStringKey] = useState("");
  const [newStringVal, setNewStringVal] = useState("");

  // Debugger State
  const [debugUrl, setDebugUrl] = useState("");
  const [debugLoading, setDebugLoading] = useState(false);
  const [debugResult, setDebugResult] = useState<any>(null);
  const [debugError, setDebugError] = useState<string | null>(null);
  const [debugTimeMs, setDebugTimeMs] = useState<number | null>(null);

  // Check saved authentication
  useEffect(() => {
    const savedSecret = sessionStorage.getItem("gramsave_dev_secret") || localStorage.getItem("gramsave_dev_secret");
    if (savedSecret) {
      setPasscode(savedSecret);
      verifySecret(savedSecret);
    }
  }, []);

  const verifySecret = async (secret: string) => {
    setLoadingStats(true);
    setAuthError(null);

    try {
      const res = await fetch(`/api/analytics?secret=${encodeURIComponent(secret)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuthError(data.error || "Invalid secret passcode.");
        setIsAuthenticated(false);
        setLoadingStats(false);
        return;
      }

      setIsAuthenticated(true);
      setAnalytics(data.analytics);
      setSystemInfo(data.systemInfo);

      if (rememberMe) {
        localStorage.setItem("gramsave_dev_secret", secret);
      } else {
        sessionStorage.setItem("gramsave_dev_secret", secret);
      }

      // Load translations for CMS
      loadCmsData();
    } catch (err: any) {
      setAuthError(err.message || "Failed to authenticate.");
      setIsAuthenticated(false);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setAuthError("Please enter the developer passcode.");
      return;
    }
    verifySecret(passcode.trim());
  };

  const handleLogout = () => {
    localStorage.removeItem("gramsave_dev_secret");
    sessionStorage.removeItem("gramsave_dev_secret");
    setIsAuthenticated(false);
    setPasscode("");
  };

  const loadCmsData = async () => {
    try {
      const res = await fetch("/api/translations");
      const data = await res.json();
      if (data.languages && data.strings) {
        setLanguages(data.languages);
        setAllStrings(data.strings);
        if (!selectedLang && data.languages.length > 0) {
          setSelectedLang(data.languages[0].code);
        }
      }
    } catch (e) {
      console.error("Failed to load CMS data:", e);
    }
  };

  // Switch selected language in CMS
  const handleSelectLanguage = (code: string) => {
    setSelectedLang(code);
    setEditedStrings({});
    setCmsMessage(null);
  };

  // Handle single string edit
  const handleStringChange = (key: string, val: string) => {
    setEditedStrings((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  // Save changes to current language
  const handleSaveStrings = async () => {
    if (Object.keys(editedStrings).length === 0) {
      setCmsMessage({ text: "No pending changes to save.", type: "error" });
      return;
    }

    setSavingCms(true);
    setCmsMessage(null);

    try {
      const res = await fetch("/api/translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: passcode,
          action: "update_strings",
          code: selectedLang,
          strings: editedStrings,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save changes.");
      }

      // Merge into local allStrings
      setAllStrings((prev) => ({
        ...prev,
        [selectedLang]: {
          ...(prev[selectedLang] || {}),
          ...editedStrings,
        },
      }));
      setEditedStrings({});
      setCmsMessage({ text: `Successfully saved changes for '${selectedLang.toUpperCase()}'!`, type: "success" });
      reloadTranslations();
    } catch (err: any) {
      setCmsMessage({ text: err.message || "Save failed.", type: "error" });
    } finally {
      setSavingCms(false);
    }
  };

  // Add a brand new language
  const handleAddLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLangCode.trim() || !newLangName.trim()) return;

    setSavingCms(true);
    try {
      const res = await fetch("/api/translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: passcode,
          action: "add_language",
          language: {
            code: newLangCode.trim().toLowerCase(),
            name: newLangName.trim(),
            nativeName: newLangNative.trim() || newLangName.trim(),
            flag: newLangFlag.trim() || "🌐",
            dir: newLangDir,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to add language.");

      setShowAddLangModal(false);
      const code = newLangCode.trim().toLowerCase();
      setNewLangCode("");
      setNewLangName("");
      setNewLangNative("");
      setNewLangFlag("🌐");

      await loadCmsData();
      setSelectedLang(code);
      setCmsMessage({ text: `Language '${code.toUpperCase()}' created and activated!`, type: "success" });
      reloadTranslations();
    } catch (err: any) {
      alert(err.message || "Failed to add language.");
    } finally {
      setSavingCms(false);
    }
  };

  // Add custom string key
  const handleAddCustomString = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStringKey.trim() || !newStringVal.trim()) return;

    const cleanKey = newStringKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
    setSavingCms(true);

    try {
      const res = await fetch("/api/translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: passcode,
          action: "update_strings",
          code: selectedLang,
          strings: { [cleanKey]: newStringVal.trim() },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to create string.");

      setShowAddStringModal(false);
      setNewStringKey("");
      setNewStringVal("");

      setAllStrings((prev) => ({
        ...prev,
        [selectedLang]: {
          ...(prev[selectedLang] || {}),
          [cleanKey]: newStringVal.trim(),
        },
      }));
      setCmsMessage({ text: `String key '${cleanKey}' added!`, type: "success" });
      reloadTranslations();
    } catch (err: any) {
      alert(err.message || "Failed to add string.");
    } finally {
      setSavingCms(false);
    }
  };

  // Toggle language active status
  const handleToggleLanguage = async (code: string) => {
    try {
      const res = await fetch("/api/translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: passcode,
          action: "toggle_language",
          code,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await loadCmsData();
        reloadTranslations();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Run link debugger
  const handleRunDebugger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!debugUrl.trim()) return;

    setDebugLoading(true);
    setDebugError(null);
    setDebugResult(null);
    const start = performance.now();

    try {
      const res = await fetch("/api/fetch-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: debugUrl.trim() }),
      });

      const data = await res.json();
      setDebugTimeMs(Math.round(performance.now() - start));

      if (!res.ok || !data.success) {
        setDebugError(data.error || `HTTP error ${res.status}`);
      } else {
        setDebugResult(data.data);
      }
    } catch (err: any) {
      setDebugError(err.message || "Network test failed.");
    } finally {
      setDebugLoading(false);
    }
  };

  // Filtered strings for CMS table
  const stringKeys = useMemo(() => {
    const enKeys = Object.keys(allStrings["en"] || {});
    const currentKeys = Object.keys(allStrings[selectedLang] || {});
    const allUnique = Array.from(new Set([...enKeys, ...currentKeys]));

    return allUnique.filter((key) => {
      // Category filter
      if (categoryFilter !== "all") {
        if (!key.startsWith(categoryFilter)) return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const enVal = (allStrings["en"]?.[key] || "").toLowerCase();
        const curVal = (allStrings[selectedLang]?.[key] || "").toLowerCase();
        if (!key.toLowerCase().includes(q) && !enVal.includes(q) && !curVal.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [allStrings, selectedLang, categoryFilter, searchQuery]);

  // Bookmarklet code string
  const bookmarkletCode = `javascript:(function(){var u=window.location.href;if(!u.includes('instagram.com')){alert('Please use this bookmarklet on an Instagram Reel or Post!');return;}window.open('https://gramsave.site/?url='+encodeURIComponent(u)+'&src=bookmarklet','_blank');})();`;

  // ---------------------------------------------------------------------------
  // 1. LOGIN SCREEN (When not authenticated)
  // ---------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="page-wrapper" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "20px" }}>
        <div
          style={{
            maxWidth: "420px",
            width: "100%",
            background: "var(--card-bg, rgba(255,255,255,0.05))",
            border: "1px solid var(--card-border, rgba(255,255,255,0.1))",
            borderRadius: "20px",
            padding: "36px 30px",
            boxShadow: "0 25px 60px -15px rgba(0,0,0,0.7)",
            backdropFilter: "blur(24px)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, #ec4899, #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 10px 25px -5px rgba(236,72,153,0.5)",
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>

          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
            Developer Portal
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "24px" }}>
            Enter your developer passcode to access analytics, language CMS, and system telemetry.
          </p>

          {authError && (
            <div
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#fca5a5",
                padding: "10px 14px",
                borderRadius: "10px",
                fontSize: "0.85rem",
                marginBottom: "18px",
                textAlign: "left",
              }}
            >
              ⚠️ {authError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ textAlign: "left" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}>
                Admin Secret Passcode
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode (default: gramsave2026)"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid var(--card-border, rgba(255,255,255,0.15))",
                  color: "#fff",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
                autoFocus
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", textAlign: "left" }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: "#ec4899", cursor: "pointer" }}
              />
              <label htmlFor="rememberMe" style={{ fontSize: "0.82rem", color: "var(--text-secondary)", cursor: "pointer" }}>
                Remember session on this device
              </label>
            </div>

            <button
              type="submit"
              disabled={loadingStats}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #ec4899, #a855f7)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.95rem",
                border: "none",
                cursor: loadingStats ? "not-allowed" : "pointer",
                boxShadow: "0 8px 20px -5px rgba(236,72,153,0.4)",
                transition: "all 0.2s ease",
              }}
            >
              {loadingStats ? "Verifying..." : "Unlock Dashboard →"}
            </button>
          </form>

          <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid var(--card-border)" }}>
            <Link href="/" style={{ color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none" }}>
              ← Return to GramSave Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. AUTHENTICATED DEVELOPER PORTAL
  // ---------------------------------------------------------------------------
  return (
    <div className="page-wrapper" style={{ minHeight: "100vh", background: "var(--bg-primary, #0b0c10)" }}>
      {/* Top Header */}
      <header
        style={{
          borderBottom: "1px solid var(--card-border, rgba(255,255,255,0.1))",
          background: "var(--header-bg, rgba(11,12,16,0.92))",
          backdropFilter: "blur(20px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
              <div className="logo-badge" style={{ width: "32px", height: "32px" }}>
                <span style={{ fontSize: "16px" }}>⚡</span>
              </div>
              <span className="brand-name" style={{ fontSize: "1.2rem" }}>
                Gram<span>Save</span>
              </span>
            </Link>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#ec4899",
                background: "rgba(236,72,153,0.15)",
                border: "1px solid rgba(236,72,153,0.3)",
                padding: "2px 8px",
                borderRadius: "6px",
              }}
            >
              Developer Mode
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link
              href="/"
              target="_blank"
              style={{
                fontSize: "0.82rem",
                color: "var(--text-secondary)",
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid var(--card-border)",
              }}
            >
              🌐 Open Site
            </Link>
            <button
              onClick={() => verifySecret(passcode)}
              style={{
                fontSize: "0.82rem",
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                border: "1px solid var(--card-border)",
                padding: "6px 12px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              🔄 Refresh
            </button>
            <button
              onClick={handleLogout}
              style={{
                fontSize: "0.82rem",
                background: "rgba(239,68,68,0.15)",
                color: "#f87171",
                border: "1px solid rgba(239,68,68,0.3)",
                padding: "6px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              🔒 Lock
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="container" style={{ display: "flex", gap: "4px", padding: "0 20px", overflowX: "auto" }}>
          {[
            { id: "analytics", label: "📊 Traffic & Downloads" },
            { id: "cms", label: `🌐 Multi-Language CMS (${languages.length})` },
            { id: "system", label: "🛠️ System & Diagnostics" },
            { id: "debugger", label: "🧪 Link Debugger" },
            { id: "bookmarklet", label: "🔖 1-Click Bookmarklet" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: "12px 16px",
                  fontSize: "0.88rem",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#ec4899" : "var(--text-secondary)",
                  background: "transparent",
                  border: "none",
                  borderBottom: isActive ? "2px solid #ec4899" : "2px solid transparent",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container" style={{ padding: "30px 20px 60px" }}>
        {/* ========================================================================= */}
        {/* TAB 1: TRAFFIC & DOWNLOADS ANALYTICS                                      */}
        {/* ========================================================================= */}
        {activeTab === "analytics" && (
          <div>
            {/* Top Metric Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
                marginBottom: "28px",
              }}
            >
              <div
                style={{
                  background: "var(--card-bg, rgba(255,255,255,0.04))",
                  border: "1px solid var(--card-border, rgba(255,255,255,0.1))",
                  borderRadius: "16px",
                  padding: "20px",
                }}
              >
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                  Total Site Visits
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", marginTop: "6px" }}>
                  {(analytics?.totalVisits || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#10b981", marginTop: "4px" }}>
                  ● Active traffic telemetry running
                </div>
              </div>

              <div
                style={{
                  background: "var(--card-bg, rgba(255,255,255,0.04))",
                  border: "1px solid var(--card-border, rgba(255,255,255,0.1))",
                  borderRadius: "16px",
                  padding: "20px",
                }}
              >
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                  Total Downloads
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#ec4899", marginTop: "6px" }}>
                  {(analytics?.totalDownloads || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Streams delivered via attachment proxy
                </div>
              </div>

              <div
                style={{
                  background: "var(--card-bg, rgba(255,255,255,0.04))",
                  border: "1px solid var(--card-border, rgba(255,255,255,0.1))",
                  borderRadius: "16px",
                  padding: "20px",
                }}
              >
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                  Active Languages
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#38bdf8", marginTop: "6px" }}>
                  {languages.filter((l) => l.active).length} <span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>/ {languages.length}</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Configured in site CMS
                </div>
              </div>

              <div
                style={{
                  background: "var(--card-bg, rgba(255,255,255,0.04))",
                  border: "1px solid var(--card-border, rgba(255,255,255,0.1))",
                  borderRadius: "16px",
                  padding: "20px",
                }}
              >
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                  Engine Health
                </div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#10b981", marginTop: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>✓ 100% Operational</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "6px" }}>
                  FFmpeg Muxer + yt-dlp Core
                </div>
              </div>
            </div>

            {/* Downloads by Type Breakdown & Traffic Sources */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px", marginBottom: "28px" }}>
              {/* Media Distribution */}
              <div
                style={{
                  background: "var(--card-bg, rgba(255,255,255,0.04))",
                  border: "1px solid var(--card-border, rgba(255,255,255,0.1))",
                  borderRadius: "16px",
                  padding: "24px",
                }}
              >
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", marginBottom: "16px" }}>
                  Downloads by Media Format
                </h3>
                {analytics?.downloadsByType &&
                  Object.entries(analytics.downloadsByType).map(([type, count]) => {
                    const total = analytics.totalDownloads || 1;
                    const pct = Math.round((count / total) * 100);
                    const colorMap: Record<string, string> = {
                      reel: "#ec4899",
                      video: "#a855f7",
                      story: "#f59e0b",
                      photo: "#06b6d4",
                      audio: "#10b981",
                      carousel: "#8b5cf6",
                    };
                    const barColor = colorMap[type] || "#3b82f6";
                    return (
                      <div key={type} style={{ marginBottom: "14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                          <span style={{ textTransform: "capitalize", fontWeight: 600, color: "var(--text-primary)" }}>
                            {type}
                          </span>
                          <span style={{ color: "var(--text-secondary)" }}>
                            {count} downloads ({pct}%)
                          </span>
                        </div>
                        <div style={{ height: "8px", borderRadius: "4px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: "4px" }}></div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Traffic Sources */}
              <div
                style={{
                  background: "var(--card-bg, rgba(255,255,255,0.04))",
                  border: "1px solid var(--card-border, rgba(255,255,255,0.1))",
                  borderRadius: "16px",
                  padding: "24px",
                }}
              >
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", marginBottom: "16px" }}>
                  Traffic Referrals
                </h3>
                {analytics?.trafficSources &&
                  Object.entries(analytics.trafficSources).map(([src, count]) => {
                    const total = analytics.totalVisits || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={src} style={{ marginBottom: "14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                          <span style={{ textTransform: "capitalize", fontWeight: 600, color: "var(--text-primary)" }}>
                            {src}
                          </span>
                          <span style={{ color: "var(--text-secondary)" }}>
                            {count} visits ({pct}%)
                          </span>
                        </div>
                        <div style={{ height: "8px", borderRadius: "4px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: "#38bdf8", borderRadius: "4px" }}></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Recent Live Activity Stream */}
            <div
              style={{
                background: "var(--card-bg, rgba(255,255,255,0.04))",
                border: "1px solid var(--card-border, rgba(255,255,255,0.1))",
                borderRadius: "16px",
                padding: "24px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>
                  Recent Activity Log
                </h3>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Showing last {analytics?.recentActivity?.length || 0} events
                </span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--card-border)", color: "var(--text-muted)" }}>
                      <th style={{ padding: "10px" }}>Event</th>
                      <th style={{ padding: "10px" }}>Format</th>
                      <th style={{ padding: "10px" }}>Quality / Detail</th>
                      <th style={{ padding: "10px" }}>Client IP</th>
                      <th style={{ padding: "10px" }}>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
                      analytics.recentActivity.map((ev) => (
                        <tr key={ev.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding: "10px" }}>
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                background: ev.type === "download" ? "rgba(236,72,153,0.15)" : "rgba(56,189,248,0.15)",
                                color: ev.type === "download" ? "#ec4899" : "#38bdf8",
                              }}
                            >
                              {ev.type.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: "10px", textTransform: "capitalize", fontWeight: 600 }}>{ev.format || "reel"}</td>
                          <td style={{ padding: "10px", color: "var(--text-secondary)" }}>{ev.quality || "-"}</td>
                          <td style={{ padding: "10px", color: "var(--text-muted)", fontFamily: "monospace" }}>{ev.ipMasked || "anonymized"}</td>
                          <td style={{ padding: "10px", color: "var(--text-muted)" }}>{new Date(ev.timestamp).toLocaleTimeString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>
                          No activity recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MULTI-LANGUAGE & TEXT CMS                                          */}
        {/* ========================================================================= */}
        {activeTab === "cms" && (
          <div>
            {/* CMS Top Controls & Actions */}
            <div
              style={{
                background: "var(--card-bg, rgba(255,255,255,0.04))",
                border: "1px solid var(--card-border, rgba(255,255,255,0.1))",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
                    Website Language &amp; Text CMS
                  </h2>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    View, edit, and add text in every language across all pages. Changes are saved immediately.
                  </p>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => setShowAddStringModal(true)}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid var(--card-border)",
                      color: "#fff",
                      padding: "8px 14px",
                      borderRadius: "10px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    + Add New Key
                  </button>
                  <button
                    onClick={() => setShowAddLangModal(true)}
                    style={{
                      background: "linear-gradient(135deg, #ec4899, #a855f7)",
                      border: "none",
                      color: "#fff",
                      padding: "8px 16px",
                      borderRadius: "10px",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 6px 15px -3px rgba(236,72,153,0.4)",
                    }}
                  >
                    + Add New Language
                  </button>
                </div>
              </div>

              {/* Language Pills Selection */}
              <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "8px" }}>
                {languages.map((l) => {
                  const isSelected = selectedLang === l.code;
                  return (
                    <button
                      key={l.code}
                      onClick={() => handleSelectLanguage(l.code)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 14px",
                        borderRadius: "10px",
                        background: isSelected ? "rgba(236,72,153,0.18)" : "rgba(255,255,255,0.04)",
                        border: isSelected ? "1px solid #ec4899" : "1px solid var(--card-border)",
                        color: isSelected ? "#fff" : "var(--text-secondary)",
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span style={{ fontSize: "1.1rem" }}>{l.flag}</span>
                      <span>{l.name}</span>
                      <span style={{ fontSize: "0.72rem", color: isSelected ? "#ec4899" : "var(--text-muted)", textTransform: "uppercase" }}>
                        ({l.code})
                      </span>
                      {!l.active && <span style={{ fontSize: "0.65rem", background: "rgba(239,68,68,0.2)", color: "#f87171", padding: "1px 4px", borderRadius: "4px" }}>off</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Success / Error Feedback Toast */}
            {cmsMessage && (
              <div
                style={{
                  padding: "12px 18px",
                  borderRadius: "12px",
                  marginBottom: "20px",
                  background: cmsMessage.type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                  border: `1px solid ${cmsMessage.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                  color: cmsMessage.type === "success" ? "#6ee7b7" : "#fca5a5",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{cmsMessage.text}</span>
                <button onClick={() => setCmsMessage(null)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}>✕</button>
              </div>
            )}

            {/* Filters & Floating Save Bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flex: 1 }}>
                <input
                  type="text"
                  placeholder="🔍 Search text keys or values..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "10px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--card-border)",
                    color: "#fff",
                    fontSize: "0.85rem",
                    minWidth: "240px",
                  }}
                />

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "10px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--card-border)",
                    color: "#fff",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  <option value="all">All Sections ({stringKeys.length})</option>
                  <option value="nav">Navigation Header</option>
                  <option value="hero">Hero &amp; Title</option>
                  <option value="tab">Media Tabs</option>
                  <option value="btn">Buttons &amp; Actions</option>
                  <option value="result">Download Results</option>
                  <option value="bookmarklet">Bookmarklet</option>
                  <option value="feature">Features Grid</option>
                  <option value="step">How It Works Steps</option>
                  <option value="faq">FAQ Accordion</option>
                  <option value="footer">Footer Copy</option>
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {Object.keys(editedStrings).length > 0 && (
                  <span style={{ fontSize: "0.82rem", color: "#f59e0b", fontWeight: 600 }}>
                    ● {Object.keys(editedStrings).length} unsaved changes
                  </span>
                )}
                <button
                  onClick={handleSaveStrings}
                  disabled={savingCms || Object.keys(editedStrings).length === 0}
                  style={{
                    padding: "9px 20px",
                    borderRadius: "10px",
                    background: Object.keys(editedStrings).length > 0 ? "linear-gradient(135deg, #10b981, #059669)" : "rgba(255,255,255,0.06)",
                    border: "none",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: Object.keys(editedStrings).length > 0 ? "pointer" : "default",
                    boxShadow: Object.keys(editedStrings).length > 0 ? "0 4px 14px rgba(16,185,129,0.4)" : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  {savingCms ? "Saving..." : "💾 Save Changes"}
                </button>
              </div>
            </div>

            {/* Searchable Key-Value Table */}
            <div
              style={{
                background: "var(--card-bg, rgba(255,255,255,0.04))",
                border: "1px solid var(--card-border, rgba(255,255,255,0.1))",
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "rgba(0,0,0,0.25)", borderBottom: "1px solid var(--card-border)", color: "var(--text-muted)" }}>
                      <th style={{ padding: "12px 16px", width: "22%" }}>String Key</th>
                      <th style={{ padding: "12px 16px", width: "35%" }}>Default (English)</th>
                      <th style={{ padding: "12px 16px", width: "43%" }}>
                        Translation ({languages.find((l) => l.code === selectedLang)?.name || selectedLang})
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stringKeys.length > 0 ? (
                      stringKeys.map((key) => {
                        const enVal = allStrings["en"]?.[key] || "";
                        const curVal = editedStrings[key] !== undefined ? editedStrings[key] : (allStrings[selectedLang]?.[key] || "");
                        const isEdited = editedStrings[key] !== undefined;

                        return (
                          <tr
                            key={key}
                            style={{
                              borderBottom: "1px solid rgba(255,255,255,0.04)",
                              background: isEdited ? "rgba(245,158,11,0.05)" : "transparent",
                            }}
                          >
                            <td style={{ padding: "12px 16px", verticalAlign: "top" }}>
                              <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#ec4899", fontWeight: 600 }}>
                                {key}
                              </span>
                            </td>
                            <td style={{ padding: "12px 16px", verticalAlign: "top", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                              {enVal}
                            </td>
                            <td style={{ padding: "12px 16px", verticalAlign: "top" }}>
                              {curVal.length > 60 || curVal.includes("\n") ? (
                                <textarea
                                  rows={2}
                                  value={curVal}
                                  onChange={(e) => handleStringChange(key, e.target.value)}
                                  style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    borderRadius: "8px",
                                    background: "rgba(0,0,0,0.3)",
                                    border: isEdited ? "1px solid #f59e0b" : "1px solid var(--card-border)",
                                    color: "#fff",
                                    fontSize: "0.85rem",
                                    resize: "vertical",
                                  }}
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={curVal}
                                  onChange={(e) => handleStringChange(key, e.target.value)}
                                  style={{
                                    width: "100%",
                                    padding: "7px 12px",
                                    borderRadius: "8px",
                                    background: "rgba(0,0,0,0.3)",
                                    border: isEdited ? "1px solid #f59e0b" : "1px solid var(--card-border)",
                                    color: "#fff",
                                    fontSize: "0.85rem",
                                  }}
                                />
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={3} style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                          No string keys match your filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SYSTEM & DIAGNOSTICS                                               */}
        {/* ========================================================================= */}
        {activeTab === "system" && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "20px",
              }}
            >
              {/* yt-dlp Diagnostic */}
              <div
                style={{
                  background: "var(--card-bg, rgba(255,255,255,0.04))",
                  border: "1px solid var(--card-border, rgba(255,255,255,0.1))",
                  borderRadius: "16px",
                  padding: "24px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>
                    yt-dlp Extraction Core
                  </h3>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: "6px",
                      background: systemInfo?.ytdlp?.available ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                      color: systemInfo?.ytdlp?.available ? "#10b981" : "#ef4444",
                    }}
                  >
                    {systemInfo?.ytdlp?.available ? "● Available" : "● Offline"}
                  </span>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "12px" }}>
                  Version: <strong>{systemInfo?.ytdlp?.version || "Not detected"}</strong>
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Primary high-fidelity media scraper used for reels, multi-slide sidecars, and stories.
                </p>
              </div>

              {/* FFmpeg Diagnostic */}
              <div
                style={{
                  background: "var(--card-bg, rgba(255,255,255,0.04))",
                  border: "1px solid var(--card-border, rgba(255,255,255,0.1))",
                  borderRadius: "16px",
                  padding: "24px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>
                    FFmpeg Real-time Muxer
                  </h3>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: "6px",
                      background: systemInfo?.ffmpeg?.available ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                      color: systemInfo?.ffmpeg?.available ? "#10b981" : "#ef4444",
                    }}
                  >
                    {systemInfo?.ffmpeg?.available ? "● Operational" : "● Offline"}
                  </span>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "12px" }}>
                  {systemInfo?.ffmpeg?.version || "Not detected"}
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Muxes separate 1080p DASH video streams and AAC audio streams on-the-fly with zero temp disk writes.
                </p>
              </div>

              {/* Instagram Session Cookies */}
              <div
                style={{
                  background: "var(--card-bg, rgba(255,255,255,0.04))",
                  border: "1px solid var(--card-border, rgba(255,255,255,0.1))",
                  borderRadius: "16px",
                  padding: "24px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>
                    Instagram Session Cookies
                  </h3>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: "6px",
                      background: systemInfo?.cookies?.exists ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                      color: systemInfo?.cookies?.exists ? "#10b981" : "#f59e0b",
                    }}
                  >
                    {systemInfo?.cookies?.exists ? "● Configured" : "○ Optional / Public Mode"}
                  </span>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Active Cookie Records: <strong>{systemInfo?.cookies?.lineCount || 0}</strong>
                </p>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "12px" }}>
                  File Size: <strong>{systemInfo?.cookies?.sizeBytes ? `${Math.round(systemInfo.cookies.sizeBytes / 1024)} KB` : "0 KB"}</strong>
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Allows bypass of login walls and age restrictions for sensitive reels and stories.
                </p>
              </div>

              {/* Server Telemetry */}
              <div
                style={{
                  background: "var(--card-bg, rgba(255,255,255,0.04))",
                  border: "1px solid var(--card-border, rgba(255,255,255,0.1))",
                  borderRadius: "16px",
                  padding: "24px",
                }}
              >
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", marginBottom: "14px" }}>
                  Server Environment
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  <li style={{ marginBottom: "8px" }}>Platform: <strong style={{ color: "#fff" }}>{systemInfo?.platform}</strong></li>
                  <li style={{ marginBottom: "8px" }}>Node.js: <strong style={{ color: "#fff" }}>{systemInfo?.nodeVersion}</strong></li>
                  <li style={{ marginBottom: "8px" }}>Memory: <strong style={{ color: "#fff" }}>{systemInfo?.memoryUsageMb} MB</strong></li>
                  <li style={{ marginBottom: "8px" }}>Uptime: <strong style={{ color: "#fff" }}>{Math.round((systemInfo?.uptimeSeconds || 0) / 60)} minutes</strong></li>
                  <li>Turnstile Bot Protection: <strong style={{ color: systemInfo?.turnstileEnabled ? "#10b981" : "#94a3b8" }}>{systemInfo?.turnstileEnabled ? "Active" : "Disabled (Direct Pass)"}</strong></li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: LIVE LINK DEBUGGER & URL TESTER                                    */}
        {/* ========================================================================= */}
        {activeTab === "debugger" && (
          <div
            style={{
              background: "var(--card-bg, rgba(255,255,255,0.04))",
              border: "1px solid var(--card-border, rgba(255,255,255,0.1))",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
              Live URL Tester &amp; Link Inspector
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
              Test any Instagram link in real-time to inspect exact scraper output, response latency, and available streams.
            </p>

            <form onSubmit={handleRunDebugger} style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
              <input
                type="url"
                value={debugUrl}
                onChange={(e) => setDebugUrl(e.target.value)}
                placeholder="https://www.instagram.com/reel/C3_example/ or /p/..."
                style={{
                  flex: 1,
                  minWidth: "280px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid var(--card-border)",
                  color: "#fff",
                  fontSize: "0.9rem",
                }}
              />
              <button
                type="submit"
                disabled={debugLoading}
                style={{
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #ec4899, #a855f7)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  border: "none",
                  cursor: debugLoading ? "not-allowed" : "pointer",
                }}
              >
                {debugLoading ? "Testing..." : "Test Extract →"}
              </button>
            </form>

            {debugError && (
              <div
                style={{
                  padding: "14px 18px",
                  borderRadius: "12px",
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#fca5a5",
                  fontSize: "0.88rem",
                  marginBottom: "20px",
                }}
              >
                ❌ Error: {debugError}
              </div>
            )}

            {debugResult && (
              <div>
                <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "16px" }}>
                  <span style={{ fontSize: "0.85rem", color: "#10b981", fontWeight: 700 }}>✓ Extracted Successfully</span>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Latency: {debugTimeMs} ms</span>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Type: {debugResult.type}</span>
                </div>

                <div
                  style={{
                    background: "rgba(0,0,0,0.5)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "12px",
                    padding: "16px",
                    fontFamily: "monospace",
                    fontSize: "0.82rem",
                    maxHeight: "400px",
                    overflowY: "auto",
                    color: "#a5f3fc",
                  }}
                >
                  <pre>{JSON.stringify(debugResult, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: 1-CLICK BROWSER BOOKMARKLET                                        */}
        {/* ========================================================================= */}
        {activeTab === "bookmarklet" && (
          <div
            style={{
              background: "var(--card-bg, rgba(255,255,255,0.04))",
              border: "1px solid var(--card-border, rgba(255,255,255,0.1))",
              borderRadius: "16px",
              padding: "28px",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
              1-Click Browser Bookmarklet
            </h2>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "24px", maxWidth: "600px" }}>
              Users can drag this button to their browser bookmarks bar. Whenever they browse Instagram on desktop, clicking it immediately opens GramSave and auto-extracts the post.
            </p>

            <div style={{ marginBottom: "24px" }}>
              <a
                href={bookmarkletCode}
                onClick={(e) => e.preventDefault()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #ec4899, #a855f7)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  textDecoration: "none",
                  cursor: "grab",
                  boxShadow: "0 8px 20px -5px rgba(236,72,153,0.5)",
                }}
              >
                <span>⬇ Save IG (Drag to Bookmarks Bar)</span>
              </a>
            </div>

            <div style={{ marginTop: "24px" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
                Bookmarklet JavaScript Code:
              </h4>
              <div
                style={{
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid var(--card-border)",
                  borderRadius: "10px",
                  padding: "12px",
                  fontFamily: "monospace",
                  fontSize: "0.82rem",
                  color: "#38bdf8",
                  wordBreak: "break-all",
                }}
              >
                {bookmarkletCode}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW LANGUAGE                                                   */}
      {/* ========================================================================= */}
      {showAddLangModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#181a20",
              border: "1px solid var(--card-border)",
              borderRadius: "18px",
              padding: "28px",
              maxWidth: "460px",
              width: "100%",
              boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
            }}
          >
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
              Add New Website Language
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
              The new language will be populated with English defaults. You can then translate strings via the CMS.
            </p>

            <form onSubmit={handleAddLanguage} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Language Code (e.g. de, it, ru, ja, zh)
                </label>
                <input
                  type="text"
                  required
                  value={newLangCode}
                  onChange={(e) => setNewLangCode(e.target.value)}
                  placeholder="de"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--card-border)",
                    color: "#fff",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                  English Name (e.g. German)
                </label>
                <input
                  type="text"
                  required
                  value={newLangName}
                  onChange={(e) => setNewLangName(e.target.value)}
                  placeholder="German"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--card-border)",
                    color: "#fff",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Native Name (e.g. Deutsch)
                </label>
                <input
                  type="text"
                  required
                  value={newLangNative}
                  onChange={(e) => setNewLangNative(e.target.value)}
                  placeholder="Deutsch"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--card-border)",
                    color: "#fff",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                    Flag Emoji (e.g. 🇩🇪)
                  </label>
                  <input
                    type="text"
                    value={newLangFlag}
                    onChange={(e) => setNewLangFlag(e.target.value)}
                    placeholder="🇩🇪"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid var(--card-border)",
                      color: "#fff",
                      fontSize: "1.1rem",
                    }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                    Direction
                  </label>
                  <select
                    value={newLangDir}
                    onChange={(e) => setNewLangDir(e.target.value as any)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid var(--card-border)",
                      color: "#fff",
                    }}
                  >
                    <option value="ltr">LTR (Left-to-Right)</option>
                    <option value="rtl">RTL (Right-to-Left)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddLangModal(false)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.06)",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCms}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #ec4899, #a855f7)",
                    border: "none",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {savingCms ? "Creating..." : "Create Language"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD CUSTOM STRING KEY                                              */}
      {/* ========================================================================= */}
      {showAddStringModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#181a20",
              border: "1px solid var(--card-border)",
              borderRadius: "18px",
              padding: "28px",
              maxWidth: "460px",
              width: "100%",
            }}
          >
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
              Add New Translation Key
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
              Add a new string key into the translation dictionary for `{selectedLang.toUpperCase()}`.
            </p>

            <form onSubmit={handleAddCustomString} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Key Name (e.g. promo_banner_text)
                </label>
                <input
                  type="text"
                  required
                  value={newStringKey}
                  onChange={(e) => setNewStringKey(e.target.value)}
                  placeholder="custom_key_name"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--card-border)",
                    color: "#fff",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Text Value
                </label>
                <textarea
                  rows={3}
                  required
                  value={newStringVal}
                  onChange={(e) => setNewStringVal(e.target.value)}
                  placeholder="Enter the text string..."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--card-border)",
                    color: "#fff",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddStringModal(false)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.06)",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCms}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #ec4899, #a855f7)",
                    border: "none",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {savingCms ? "Adding..." : "Add Key"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
