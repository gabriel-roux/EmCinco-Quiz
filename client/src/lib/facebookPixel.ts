declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    _fbq: any;
  }
}

const FB_PIXEL_ID = import.meta.env.VITE_FB_PIXEL_ID;

export function initFacebookPixel(): void {
  if (typeof window === "undefined" || !FB_PIXEL_ID) return;

  (function(f: any, b: Document, e: string, v: string, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode?.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  window.fbq("init", FB_PIXEL_ID);
  window.fbq("track", "PageView");
}

export function trackEvent(
  eventName: string,
  params?: Record<string, any>
): void {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, params);
  }
}

export function trackViewContent(contentName: string, value?: number): void {
  trackEvent("ViewContent", {
    content_name: contentName,
    currency: "BRL",
    value: value,
  });
}

export function trackInitiateCheckout(value: number, contentIds: string[]): void {
  trackEvent("InitiateCheckout", {
    currency: "BRL",
    value: value,
    content_ids: contentIds,
    content_type: "product",
    num_items: 1,
  });
}

export function trackAddPaymentInfo(value: number): void {
  trackEvent("AddPaymentInfo", {
    currency: "BRL",
    value: value,
  });
}

export function trackPurchase(value: number, contentIds: string[]): void {
  trackEvent("Purchase", {
    currency: "BRL",
    value: value,
    content_ids: contentIds,
    content_type: "product",
    num_items: 1,
  });
}

export function trackLead(contentName?: string): void {
  trackEvent("Lead", {
    content_name: contentName || "Quiz Lead",
  });
}

interface UserData {
  email?: string;
  firstName?: string;
  fbc?: string;
  fbp?: string;
}

interface CustomData {
  currency?: string;
  value?: number;
  contentName?: string;
  contentIds?: string[];
}

export async function sendServerEvent(
  eventName: string,
  userData: UserData,
  customData?: CustomData
): Promise<void> {
  try {
    const fbc = document.cookie.match(/_fbc=([^;]+)/)?.[1] || "";
    const fbp = document.cookie.match(/_fbp=([^;]+)/)?.[1] || "";

    await fetch("/api/facebook/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName,
        eventSourceUrl: window.location.href,
        userData: {
          ...userData,
          clientUserAgent: navigator.userAgent,
          fbc,
          fbp,
        },
        customData,
      }),
    });
  } catch (error) {
    console.error("Failed to send server event:", error);
  }
}
