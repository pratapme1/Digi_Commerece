import type { SpaceContentCatalog } from "@digi/domain";

function canUseBrowserStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

const CONTENT_CATALOGS_KEY = "digi:content-catalogs";

export function loadBrowserContentCatalogs(): SpaceContentCatalog[] | null {
  if (!canUseBrowserStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(CONTENT_CATALOGS_KEY);
  return raw ? (JSON.parse(raw) as SpaceContentCatalog[]) : null;
}

export function persistBrowserContentCatalogs(catalogs: SpaceContentCatalog[] | null): void {
  if (!canUseBrowserStorage()) {
    return;
  }

  if (!catalogs) {
    window.localStorage.removeItem(CONTENT_CATALOGS_KEY);
    return;
  }

  window.localStorage.setItem(CONTENT_CATALOGS_KEY, JSON.stringify(catalogs));
}
