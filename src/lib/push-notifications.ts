// Utility to register the service worker, request notification permission,
// create a Web Push subscription, and persist it to Supabase.
//
// NOTE: For real push delivery you must set VITE_VAPID_PUBLIC_KEY (the base64
// URL-encoded public key from your VAPID key pair). Without it, the
// subscription will be created without applicationServerKey (only works for
// some browsers / GCM-backed endpoints).
//
// IMPORTANT: Service workers do NOT run inside the Lovable preview iframe.
// PWA + push features only activate on the published site.

import { supabase } from "@/integrations/supabase/client";

const SW_URL = "/service-worker.js";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) output[i] = rawData.charCodeAt(i);
  return output;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;
  try {
    const existing = await navigator.serviceWorker.getRegistration(SW_URL);
    if (existing) return existing;
    return await navigator.serviceWorker.register(SW_URL, { scope: "/" });
  } catch (err) {
    console.error("[push] Service worker registration failed:", err);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) return "denied";
  if (Notification.permission === "granted" || Notification.permission === "denied") {
    return Notification.permission;
  }
  return await Notification.requestPermission();
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;

  const permission = await requestNotificationPermission();
  if (permission !== "granted") {
    console.warn("[push] Notification permission not granted:", permission);
    return null;
  }

  const registration = await registerServiceWorker();
  if (!registration) return null;

  // Ensure SW is active before subscribing
  await navigator.serviceWorker.ready;

  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      ...(vapidKey ? { applicationServerKey: urlBase64ToUint8Array(vapidKey) } : {}),
    });
  }

  await savePushSubscription(subscription);
  return subscription;
}

export async function savePushSubscription(subscription: PushSubscription): Promise<void> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    console.warn("[push] Cannot save subscription: user not signed in.");
    return;
  }

  const payload = subscription.toJSON() as Record<string, unknown>;
  const endpoint = subscription.endpoint;

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: userData.user.id,
        endpoint,
        subscription: payload,
      },
      { onConflict: "endpoint" }
    );

  if (error) console.error("[push] Failed to save subscription:", error);
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!isPushSupported()) return;
  const registration = await navigator.serviceWorker.getRegistration(SW_URL);
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
}
