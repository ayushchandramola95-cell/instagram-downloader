"use client";

import { useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log unexpected runtime error
    console.error("Unhandled client error in GramSave application:", error);
  }, [error]);

  return (
    <div className="page-wrapper" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <Header />

      <main className="container" style={{ padding: "60px 20px 80px", textAlign: "center", maxWidth: "620px", margin: "0 auto" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "9999px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            color: "#dc2626",
            fontSize: "0.85rem",
            fontWeight: 700,
            marginBottom: "20px",
          }}
        >
          <span>⚠️</span>
          <span>Temporary Processing Error</span>
        </div>

        <h1
          style={{
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 900,
            lineHeight: 1.2,
            letterSpacing: "-0.03em",
            marginBottom: "16px",
            color: "#0f172a",
          }}
        >
          Something went wrong on our end
        </h1>

        <p
          style={{
            fontSize: "1.02rem",
            color: "#475569",
            lineHeight: 1.65,
            marginBottom: "32px",
          }}
        >
          An unexpected error occurred while loading this page or processing the media request. Please click below to try again or return to the main downloader.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: "var(--insta-gradient)",
              border: "none",
              color: "#ffffff",
              padding: "12px 28px",
              borderRadius: "14px",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(253, 29, 29, 0.35)",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>🔄 Try Again</span>
          </button>

          <Link
            href="/"
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
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Return to Home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
