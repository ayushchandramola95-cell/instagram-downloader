// Google Analytics 4 (GA4) Event Tracking Helper

export const trackGAEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number,
  additionalParams?: Record<string, unknown>
) => {
  if (typeof window !== "undefined" && typeof (window as unknown as { gtag?: Function }).gtag === "function") {
    (window as unknown as { gtag: Function }).gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
      ...additionalParams,
    });
  }
};
