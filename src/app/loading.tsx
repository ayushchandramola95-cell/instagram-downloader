export default function Loading() {
  return (
    <div style={{ width: "100%", minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      {/* Top Animated Shimmer Progress Bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "linear-gradient(90deg, #833ab4, #fd1d1d, #fcb045, #833ab4)",
          backgroundSize: "200% 100%",
          animation: "loadingShimmer 1.5s infinite linear",
          zIndex: 99999,
        }}
      />

      {/* Gentle Pulsing Skeleton */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "var(--insta-gradient)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 20px rgba(253, 29, 29, 0.3)",
            animation: "pulseDot 1.8s infinite ease-in-out",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
        </div>
        <span style={{ fontSize: "0.92rem", fontWeight: 600, color: "#64748b", letterSpacing: "0.02em" }}>
          Loading GramSave...
        </span>
      </div>

      <style>{`
        @keyframes loadingShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
