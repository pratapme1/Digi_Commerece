import type { DemoRoomState } from "@digi/domain";

function canUseBrowserStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function buildRoomBridgeKey(qrSlug: string): string {
  return `digi:live-room:${qrSlug}`;
}

export function loadBrowserRoomState(qrSlug: string): DemoRoomState | null {
  if (!canUseBrowserStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(buildRoomBridgeKey(qrSlug));
  return raw ? (JSON.parse(raw) as DemoRoomState) : null;
}

export function persistBrowserRoomState(state: DemoRoomState | null): void {
  if (!canUseBrowserStorage() || !state) {
    return;
  }

  window.localStorage.setItem(buildRoomBridgeKey(state.qrSlug), JSON.stringify(state));
}

export function clearBrowserRoomState(qrSlug: string): void {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.localStorage.removeItem(buildRoomBridgeKey(qrSlug));
}

export function subscribeBrowserRoomState(
  qrSlug: string,
  listener: (state: DemoRoomState | null) => void,
): () => void {
  if (!canUseBrowserStorage()) {
    return () => undefined;
  }

  const key = buildRoomBridgeKey(qrSlug);
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== key) {
      return;
    }

    listener(event.newValue ? (JSON.parse(event.newValue) as DemoRoomState) : null);
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener("storage", handleStorage);
  };
}
