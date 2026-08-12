import { supabase } from "@/integrations/supabase/client";
import { currentSession, touchSession } from "@/lib/session";

export type ShopIQEvent =
  | "session_started"
  | "search_performed"
  | "product_impression"
  | "product_viewed"
  | "product_selected"
  | "ai_message_sent"
  | "recommendation_clicked"
  | "try_on_started"
  | "try_on_completed"
  | "garment_changed"
  | "find_in_store_clicked"
  | "qr_generated";

interface TrackOptions {
  productId?: string | null;
  query?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Fire-and-forget anonymous event tracking. Never blocks the UI and never
 * carries personal data — only the temporary session id.
 */
export function track(event: ShopIQEvent, options: TrackOptions = {}) {
  touchSession();
  const session = currentSession();
  if (!session?.id) return;

  void supabase
    .from("analytics_events")
    .insert({
      session_id: session.id,
      store_id: session.storeId,
      product_id: options.productId ?? null,
      event_type: event,
      query: options.query ?? null,
      metadata: (options.metadata ?? {}) as never,
    })
    .then(() => undefined);
}

export function trackAiMessage(role: "user" | "assistant", content: string) {
  const session = currentSession();
  if (!session?.id) return;
  void supabase
    .from("ai_interactions")
    .insert({ session_id: session.id, role, content })
    .then(() => undefined);
}
