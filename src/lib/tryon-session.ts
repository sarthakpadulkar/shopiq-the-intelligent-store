import { useSyncExternalStore } from "react";
import type { Product } from "@/lib/types";

export interface TryOnGarment {
  productId: string;
  name: string;
  image: string;
  tryOnType: Product["try_on_type"];
}

/**
 * Result of a try-on attempt. `demo: true` means the AI provider was not
 * available and a clearly-labelled preview was shown instead — never a fake
 * photorealistic result.
 */
export interface TryOnResult {
  image?: string;
  demo?: boolean;
  reason?: string;
}

export interface TryOnState {
  /** The single camera photo — captured once, reused for every garment. */
  personImage: string | null;
  startedAt: number | null;
  current: TryOnGarment | null;
  history: TryOnGarment[];
  results: Record<string, TryOnResult>; // productId -> generated look
  status: "idle" | "generating" | "ready" | "error";
  error: string | null;
}

const PHOTO_KEY = "shopiq.tryon.photo";

let state: TryOnState = {
  personImage: null,
  startedAt: null,
  current: null,
  history: [],
  results: {},
  status: "idle",
  error: null,
};

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function set(patch: Partial<TryOnState>) {
  state = { ...state, ...patch };
  emit();
}

export function hydrateTryOn() {
  if (typeof window === "undefined" || state.personImage) return;
  const photo = window.sessionStorage.getItem(PHOTO_KEY);
  if (photo) state = { ...state, personImage: photo, startedAt: Date.now() };
}

export const tryOnStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  get: () => state,
  setPhoto(dataUrl: string) {
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(PHOTO_KEY, dataUrl);
      } catch {
        /* photo stays in memory only */
      }
    }
    set({ personImage: dataUrl, startedAt: Date.now(), status: "idle", error: null });
  },
  beginGenerating(garment: TryOnGarment) {
    set({ current: garment, status: "generating", error: null });
  },
  completed(garment: TryOnGarment, result: TryOnResult) {
    set({
      status: "ready",
      error: null,
      results: { ...state.results, [garment.productId]: result },
      history: [garment, ...state.history.filter((g) => g.productId !== garment.productId)].slice(
        0,
        12,
      ),
    });
  },
  failed(message: string) {
    set({ status: "error", error: message });
  },
  /** Clears the photo and every temporary try-on artefact. */
  end() {
    if (typeof window !== "undefined") window.sessionStorage.removeItem(PHOTO_KEY);
    state = {
      personImage: null,
      startedAt: null,
      current: null,
      history: [],
      results: {},
      status: "idle",
      error: null,
    };
    emit();
  },
};

const serverSnapshot: TryOnState = {
  personImage: null,
  startedAt: null,
  current: null,
  history: [],
  results: {},
  status: "idle",
  error: null,
};

export function useTryOn(): TryOnState {
  return useSyncExternalStore(
    tryOnStore.subscribe,
    () => state,
    () => serverSnapshot,
  );
}
