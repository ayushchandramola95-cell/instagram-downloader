// Google Analytics 4 (GA4) Event Tracking Helper

type GtagFn = (...args: unknown[]) => void;

interface WindowWithGtag {
  gtag?: GtagFn;
}

export const trackGAEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number,
  additionalParams?: Record<string, unknown>
) => {
  if (typeof window !== "undefined") {
    const win = window as unknown as WindowWithGtag;
    if (typeof win.gtag === "function") {
      win.gtag("event", action, {
        event_category: category,
        event_label: label,
        value: value,
        ...additionalParams,
      });
    }
  }
};
