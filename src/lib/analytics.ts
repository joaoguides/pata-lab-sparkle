export function track(event: string, payload: Record<string, any> = {}) {
  // Send to dataLayer if it exists and log to console
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({ event, ...payload });
  
  if (import.meta.env.DEV) {
    console.log("[analytics]", event, payload);
  }
}