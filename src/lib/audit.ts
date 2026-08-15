import { supabase } from "@/integrations/supabase/client";

/**
 * Fire-and-forget audit trail for staff actions. Row-level security only
 * allows the signed-in user to insert rows for themselves.
 */
export function audit(
  action: string,
  entity?: string,
  entityId?: string,
  metadata: Record<string, unknown> = {},
) {
  void (async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    await supabase
      .from("audit_logs")
      .insert({
        user_id: data.user.id,
        action,
        entity: entity ?? null,
        entity_id: entityId ?? null,
        metadata: metadata as never,
      })
      .then(() => undefined);
  })();
}
