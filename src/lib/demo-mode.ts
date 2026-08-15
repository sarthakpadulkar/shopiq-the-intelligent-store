const DEMO_KEY = "shopiq.demoStaff";

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DEMO_KEY) === "true";
  } catch {
    return false;
  }
}

export function enableDemoMode(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DEMO_KEY, "true");
  } catch {
    // ignore
  }
}

export function disableDemoMode(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DEMO_KEY);
  } catch {
    // ignore
  }
}
