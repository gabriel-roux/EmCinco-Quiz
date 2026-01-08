import crypto from "crypto";

const FB_PIXEL_ID = process.env.FB_PIXEL_ID;
const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
const FB_API_VERSION = "v18.0";

interface UserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string;
  fbp?: string;
}

interface CustomData {
  currency?: string;
  value?: number;
  contentName?: string;
  contentCategory?: string;
  contentIds?: string[];
  contentType?: string;
  numItems?: number;
}

interface FacebookEvent {
  eventName: string;
  eventTime: number;
  eventSourceUrl: string;
  actionSource: "website";
  userData: {
    em?: string[];
    fn?: string[];
    ln?: string[];
    ph?: string[];
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string;
    fbp?: string;
  };
  customData?: {
    currency?: string;
    value?: number;
    content_name?: string;
    content_category?: string;
    content_ids?: string[];
    content_type?: string;
    num_items?: number;
  };
}

function hashData(data: string): string {
  return crypto.createHash("sha256").update(data.toLowerCase().trim()).digest("hex");
}

function prepareUserData(userData: UserData): FacebookEvent["userData"] {
  const prepared: FacebookEvent["userData"] = {};

  if (userData.email) {
    prepared.em = [hashData(userData.email)];
  }
  if (userData.firstName) {
    prepared.fn = [hashData(userData.firstName)];
  }
  if (userData.lastName) {
    prepared.ln = [hashData(userData.lastName)];
  }
  if (userData.phone) {
    prepared.ph = [hashData(userData.phone.replace(/\D/g, ""))];
  }
  if (userData.clientIpAddress) {
    prepared.client_ip_address = userData.clientIpAddress;
  }
  if (userData.clientUserAgent) {
    prepared.client_user_agent = userData.clientUserAgent;
  }
  if (userData.fbc) {
    prepared.fbc = userData.fbc;
  }
  if (userData.fbp) {
    prepared.fbp = userData.fbp;
  }

  return prepared;
}

function prepareCustomData(customData: CustomData): FacebookEvent["customData"] {
  const prepared: FacebookEvent["customData"] = {};

  if (customData.currency) {
    prepared.currency = customData.currency;
  }
  if (customData.value !== undefined) {
    prepared.value = customData.value;
  }
  if (customData.contentName) {
    prepared.content_name = customData.contentName;
  }
  if (customData.contentCategory) {
    prepared.content_category = customData.contentCategory;
  }
  if (customData.contentIds) {
    prepared.content_ids = customData.contentIds;
  }
  if (customData.contentType) {
    prepared.content_type = customData.contentType;
  }
  if (customData.numItems !== undefined) {
    prepared.num_items = customData.numItems;
  }

  return prepared;
}

export async function sendFacebookEvent(
  eventName: string,
  eventSourceUrl: string,
  userData: UserData,
  customData?: CustomData
): Promise<{ success: boolean; error?: string }> {
  if (!FB_PIXEL_ID || !FB_ACCESS_TOKEN) {
    console.warn("Facebook CAPI: Missing FB_PIXEL_ID or FB_ACCESS_TOKEN");
    return { success: false, error: "Missing Facebook credentials" };
  }

  const eventPayload: Record<string, any> = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: eventSourceUrl,
    action_source: "website",
    user_data: prepareUserData(userData),
  };

  if (customData) {
    eventPayload.custom_data = prepareCustomData(customData);
  }

  const payload = {
    data: [eventPayload],
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/${FB_API_VERSION}/${FB_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Facebook CAPI error:", result);
      return { success: false, error: result.error?.message || "Unknown error" };
    }

    console.log(`Facebook CAPI: ${eventName} event sent successfully`, result);
    return { success: true };
  } catch (error) {
    console.error("Facebook CAPI fetch error:", error);
    return { success: false, error: String(error) };
  }
}

export type FacebookEventName = 
  | "ViewContent"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase"
  | "Lead";
