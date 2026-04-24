/**
 * PWA service worker registration.
 *
 * The service worker is intentionally disabled inside iframes and on Lovable
 * preview hosts to avoid stale-cache issues during development. It only
 * activates in the published/deployed build.
 */
export function registerServiceWorker() {
  if (typeof window === "undefined") return;

  const isInIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  const host = window.location.hostname;
  const isPreviewHost =
    host.includes("id-preview--") ||
    host.includes("lovableproject.com") ||
    host.includes("lovable.app");

  if (isInIframe || isPreviewHost) {
    // Clean up any previously registered SW so preview reloads stay fresh.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
    }
    return;
  }

  if ("serviceWorker" in navigator) {
    import("virtual:pwa-register")
      .then(({ registerSW }) => {
        registerSW({ immediate: true });
      })
      .catch(() => {
        /* ignore — plugin only available in production build */
      });
  }
}
