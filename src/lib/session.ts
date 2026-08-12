import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "shopiq.session";
const IDLE_KEY = "shopiq.lastActive";
export const IDLE_TIMEOUT_MS = 3 * 60 * 1000; // configurable shared-screen reset

export interface AnonSession {
  id: string;
  code: string;
  storeId: string | null;
}

let cached: AnonSession | null = null;
let creating: Promise<AnonSession | null> | null = null;

function randomCode() {
  return `session_${Math.random().toString(16).slice(2, 8)}`;
}

function read(): AnonSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AnonSession) : null;
  } catch {
    return null;
  }
}

export function currentSession(): AnonSession | null {
  if (cached) return cached;
  cached = read();
  return cached;
}

export function touchSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(IDLE_KEY, String(Date.now()));
}

export function isIdleExpired(): boolean {
  if (typeof window === "undefined") return false;
  const last = Number(window.sessionStorage.getItem(IDLE_KEY) ?? 0);
  if (!last) return false;
  return Date.now() - last > IDLE_TIMEOUT_MS;
}

/** Creates (or reuses) an anonymous, PII-free session for the in-store screen. */
export async function startSession(storeId?: string | null): Promise<AnonSession | null> {
  const existing = currentSession();
  if (existing) {
    touchSession();
    return existing;
  }
  if (creating) return creating;

  creating = (async () => {
    const code = randomCode();
    const { data, error } = await supabase
      .from("anonymous_sessions")
      .insert({ session_code: code, store_id: storeId ?? null })
      .select("id, session_code, store_id")
      .single();

    if (error || !data) {
      // Offline-tolerant: keep a local-only session so the screen still works.
      const local = { id: "", code, storeId: storeId ?? null };
      cached = local;
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(local));
      touchSession();
      return local;
    }

    const session: AnonSession = {
      id: data.id,
      code: data.session_code,
      storeId: data.store_id,
    };
    cached = session;
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    touchSession();
    return session;
  })();

  const result = await creating;
  creating = null;
  return result;
}

/** Wipes every trace of the shopper: session, try-on photo, conversation. */
export async function endSession() {
  const session = currentSession();
  if (session?.id) {
    await supabase
      .from("anonymous_sessions")
      .update({ ended_at: new Date().toISOString() })
      .eq("id", session.id);
  }
  cached = null;
  if (typeof window !== "undefined") {
    window.sessionStorage.clear();
  }
}
