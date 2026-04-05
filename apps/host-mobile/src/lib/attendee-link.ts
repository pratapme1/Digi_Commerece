import { buildAttendeeShareUrl, type LiveContentItem, type SessionStatus, type SpaceMode, type SpaceType } from "@digi/domain";

interface BuildHostAttendeeUrlInput {
  attendeeCount?: number;
  baseUrl: string;
  brandName?: string;
  demoMode: boolean;
  mode: SpaceMode;
  pinnedItem?: LiveContentItem | null;
  qrSlug: string;
  spaceName: string;
  spaceType: SpaceType;
  status: SessionStatus | "inactive";
}

export function buildHostAttendeeUrl(input: BuildHostAttendeeUrlInput): string {
  const baseUrl = buildAttendeeShareUrl(input.baseUrl, input.qrSlug);

  if (!input.demoMode) {
    return baseUrl;
  }

  const url = new URL(baseUrl);
  url.searchParams.set("demo", "1");
  url.searchParams.set("room", input.qrSlug);
  url.searchParams.set("spaceType", input.spaceType);
  url.searchParams.set("mode", input.mode);
  url.searchParams.set("session", input.status === "draft" || input.status === "scheduled" ? "inactive" : input.status);
  url.searchParams.set("spaceName", input.spaceName);

  if (input.brandName) {
    url.searchParams.set("brandName", input.brandName);
  }

  if (typeof input.attendeeCount === "number") {
    url.searchParams.set("attendees", String(input.attendeeCount));
  }

  if (input.pinnedItem) {
    url.searchParams.set("pinnedId", input.pinnedItem.id);
    url.searchParams.set("pinnedTitle", input.pinnedItem.title);
    url.searchParams.set("pinnedSubtitle", input.pinnedItem.subtitle);
    url.searchParams.set("pinnedCollectionId", input.pinnedItem.collectionId);
    url.searchParams.set("pinnedScreen", input.pinnedItem.screen);
    url.searchParams.set("pinnedCardId", input.pinnedItem.cardId);

    if (typeof input.pinnedItem.productIndex === "number") {
      url.searchParams.set("pinnedProductIndex", String(input.pinnedItem.productIndex));
    }
  }

  return url.toString();
}
