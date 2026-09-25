import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="page-wrapper" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <Header />

      <main className="container" style={{ padding: "60px 20px 80px", textAlign: "center", maxWidth: "680px", margin: "0 auto" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "9999px",
            background: "rgba(236, 72, 153, 0.1)",
            border: "1px solid rgba(236, 72, 153, 0.25)",
            color: "#db2777",
            fontSize: "0.85rem",
            fontWeight: 700,
            marginBottom: "20px",
          }}
        >
          <span>Error 404</span>
          <span>•</span>
          <span>Page Not Found</span>
        </div>

        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            marginBottom: "16px",
            color: "#0f172a",
          }}
        >
          Oops! That page seems to be <span className="gradient-text">missing</span>.
        </h1>

        <p
          style={{
            fontSize: "1.05rem",
            color: "#475569",
            lineHeight: 1.65,
            marginBottom: "36px",
          }}
        >
          The page or tool you are looking for might have been moved, renamed, or is temporarily unavailable. Don&apos;t worry, you can easily download any Instagram media below!
        </p>

        {/* Action Buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap", marginBottom: "44px" }}>
          <Link
            href="/"
            style={{
              background: "var(--insta-gradient)",
              color: "#ffffff",
              padding: "12px 28px",
              borderRadius: "14px",
              fontWeight: 700,
              fontSize: "1rem",
              textDecoration: "none",
              boxShadow: "0 6px 20px rgba(253, 29, 29, 0.35)",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>Back to Home Downloader</span>
            <span>→</span>
          </Link>
          <Link
            href="/reels-downloader"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              color: "#0f172a",
              padding: "12px 24px",
              borderRadius: "14px",
              fontWeight: 600,
              fontSize: "1rem",
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            }}
          >
            Download Reels
          </Link>
        </div>

        {/* Quick Links Card */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid rgba(0, 0, 0, 0.08)",
            borderRadius: "20px",
            padding: "24px",
            boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.06)",
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "14px" }}>
            Popular GramSave Tools
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
            {[
              { label: "🎬 Reels Saver", href: "/reels-downloader" },
              { label: "⚡ Story Saver", href: "/story-saver" },
              { label: "📸 Photo Saver", href: "/photo-downloader" },
              { label: "🎵 Audio MP3", href: "/audio-downloader" },
              { label: "👤 Profile DP", href: "/profile-downloader" },
              { label: "📂 Carousel Album", href: "/carousel-downloader" },
            ].map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                style={{
                  padding: "10px 12px",
                  borderRadius: "10px",
                  background: "#f8fafc",
                  border: "1px solid rgba(0, 0, 0, 0.05)",
                  color: "#1e293b",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{tool.label}</span>
                <span style={{ color: "#ec4899", fontSize: "0.8rem" }}>→</span>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
