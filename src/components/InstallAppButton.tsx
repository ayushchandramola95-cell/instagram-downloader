"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as installed PWA already
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    ) {
      setTimeout(() => setIsStandalone(true), 0);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    if (isAppleDevice) {
      setTimeout(() => {
        setIsIOS(true);
        setIsInstallable(true);
      }, 0);
    }

    // Android / Chrome PWA install trigger
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  if (isStandalone || !isInstallable) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIosTip(true);
      setTimeout(() => setShowIosTip(false), 5000);
      return;
    }

    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        className="pwa-install-btn"
        onClick={handleInstallClick}
        title="Install GramSave to your Home Screen"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
          <line x1="12" y1="18" x2="12.01" y2="18"></line>
        </svg>
        <span>Install App</span>
      </button>

      {showIosTip && (
        <div className="ios-install-tooltip">
          <span>Tap Safari Share <strong>⎋</strong> and select <strong>&quot;Add to Home Screen&quot;</strong> 📲</span>
        </div>
      )}
    </div>
  );
}
