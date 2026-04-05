import type { SessionStatus, SpaceMode, SpaceType } from "./host";

export type LiveEventName =
  | "session_started"
  | "session_ended"
  | "featured_item_changed"
  | "presence_registered"
  | "space_overview_viewed"
  | "collection_opened"
  | "search_started"
  | "search_result_opened"
  | "card_viewed"
  | "content_saved"
  | "pin_received"
  | "pin_dismissed"
  | "offline_save_queued"
  | "session_end_viewed";

export interface LiveContentItem {
  id: string;
  title: string;
  subtitle: string;
  collectionId: string;
  screen: "ps" | "cs" | "ms" | "ls";
  cardId: string;
  productIndex?: number;
}

export interface LivePresenceEntry {
  attendeeRef: string;
  attendeeName: string | null;
  joinedAt: string;
  lastSeenAt: string;
}

export interface LiveActivityEvent {
  id: string;
  name: LiveEventName;
  createdAt: string;
  attendeeRef: string | null;
  attendeeName: string | null;
  contentId: string | null;
  contentTitle: string | null;
}

export interface LiveMetricsSnapshot {
  attendeeCount: number;
  peakAttendeeCount: number;
  totalViews: number;
  totalSaves: number;
  saveRate: number;
}

export interface SessionSummarySnapshot extends LiveMetricsSnapshot {
  sessionId: string;
  status: SessionStatus;
  startedAt: string | null;
  endedAt: string | null;
  durationMinutes: number;
  topContent: Array<{
    contentId: string;
    title: string;
    views: number;
    saves: number;
  }>;
  shareText: string;
}

export interface LivePanelSnapshot {
  sessionId: string;
  spaceId: string;
  qrSlug: string;
  status: SessionStatus;
  startedAt: string | null;
  endsAt: string | null;
  endedAt: string | null;
  pinnedItem: LiveContentItem | null;
  attendees: LivePresenceEntry[];
  recentAttendees: LivePresenceEntry[];
  metrics: LiveMetricsSnapshot;
  summary: SessionSummarySnapshot | null;
}

export interface DemoRoomState {
  sessionId: string;
  spaceId: string;
  qrSlug: string;
  spaceName: string;
  spaceType: SpaceType;
  mode: SpaceMode;
  attendeeUrl: string;
  status: SessionStatus;
  startedAt: string | null;
  endsAt: string | null;
  endedAt: string | null;
  durationMinutes: number;
  pinnedItem: LiveContentItem | null;
  attendees: LivePresenceEntry[];
  events: LiveActivityEvent[];
}

function createContent(
  id: string,
  title: string,
  subtitle: string,
  collectionId: string,
  screen: LiveContentItem["screen"],
  cardId: string,
  productIndex?: number,
): LiveContentItem {
  return { id, title, subtitle, collectionId, screen, cardId, productIndex };
}

const STORE_LIVE_CONTENT: LiveContentItem[] = [
  createContent("dealer-charger", "65W GaN charger dealer pricing", "Live offer · Charging", "products", "ps", "VE-CH03", 2),
  createContent("dealer-pricing", "Volume pricing — up to 22% off", "Pinned pricing share", "live", "ls", "pricing"),
  createContent("dealer-contact", "Ananya Reddy", "Verified sales contact", "contacts", "cs", "host-contact"),
];

const MEETING_LIVE_CONTENT: LiveContentItem[] = [
  createContent("meeting-host-card", "Host contact card", "Verified meeting host", "contacts", "cs", "host-contact"),
];

const RESTAURANT_LIVE_CONTENT: LiveContentItem[] = [
  createContent("chef-special", "Lamb raan with saffron rice", "Chef special", "menu", "ms", "chef-special"),
  createContent("service-menu", "Tonight’s service menu", "Menu collection", "menu", "ms", "menu"),
];

const EVENT_LIVE_CONTENT: LiveContentItem[] = [
  createContent("event-spotlight", "Current live spotlight", "Keynote spotlight", "live", "ls", "live-spotlight"),
  createContent("event-deck", "Company deck — FY2026", "Earlier session share", "live", "ls", "deck"),
  createContent("event-contacts", "Sales Team Contacts · 5 people", "Earlier session share", "live", "ls", "contacts"),
];

const OTHER_LIVE_CONTENT: LiveContentItem[] = [
  createContent("generic-spotlight", "Current live spotlight", "Session highlight", "live", "ls", "live-spotlight"),
];

export function getLiveContentLibrary(spaceType: SpaceType): LiveContentItem[] {
  switch (spaceType) {
    case "store":
      return STORE_LIVE_CONTENT;
    case "meeting":
      return MEETING_LIVE_CONTENT;
    case "restaurant":
      return RESTAURANT_LIVE_CONTENT;
    case "event":
      return EVENT_LIVE_CONTENT;
    default:
      return OTHER_LIVE_CONTENT;
  }
}

export function formatTimeRemaining(endsAt: string | null, now = new Date()): string {
  if (!endsAt) {
    return "Live now";
  }

  const deltaMs = new Date(endsAt).getTime() - now.getTime();

  if (deltaMs <= 0) {
    return "Ending now";
  }

  const totalMinutes = Math.max(1, Math.round(deltaMs / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }

  return `${minutes}m remaining`;
}

export function summarizeLiveMetrics(events: LiveActivityEvent[], attendees: LivePresenceEntry[]): LiveMetricsSnapshot {
  const totalViews = events.filter((event) => ["space_overview_viewed", "collection_opened", "search_result_opened", "card_viewed"].includes(event.name)).length;
  const totalSaves = events.filter((event) => ["content_saved", "offline_save_queued"].includes(event.name)).length;
  const attendeeCount = attendees.length;
  const peakAttendeeCount = attendeeCount;
  const saveRate = totalViews === 0 ? 0 : Number((totalSaves / totalViews).toFixed(2));

  return {
    attendeeCount,
    peakAttendeeCount,
    totalViews,
    totalSaves,
    saveRate,
  };
}

export function buildSessionSummary(
  sessionId: string,
  status: SessionStatus,
  startedAt: string | null,
  endedAt: string | null,
  durationMinutes: number,
  events: LiveActivityEvent[],
  attendees: LivePresenceEntry[],
): SessionSummarySnapshot {
  const metrics = summarizeLiveMetrics(events, attendees);
  const byContent = new Map<string, { title: string; views: number; saves: number }>();

  events.forEach((event) => {
    if (!event.contentId || !event.contentTitle) {
      return;
    }

    const current = byContent.get(event.contentId) ?? {
      title: event.contentTitle,
      views: 0,
      saves: 0,
    };

    if (["collection_opened", "search_result_opened", "card_viewed", "pin_received"].includes(event.name)) {
      current.views += 1;
    }

    if (["content_saved", "offline_save_queued"].includes(event.name)) {
      current.saves += 1;
    }

    byContent.set(event.contentId, current);
  });

  const topContent = [...byContent.entries()]
    .map(([contentId, value]) => ({
      contentId,
      title: value.title,
      views: value.views,
      saves: value.saves,
    }))
    .sort((left, right) => {
      if (right.saves !== left.saves) {
        return right.saves - left.saves;
      }

      return right.views - left.views;
    })
    .slice(0, 3);

  const shareText = `Live session summary: ${metrics.attendeeCount} attendees, ${metrics.totalViews} content views, ${metrics.totalSaves} saves, and ${topContent[0]?.title ?? "no standout item"} as the top content.`;

  return {
    ...metrics,
    sessionId,
    status,
    startedAt,
    endedAt,
    durationMinutes,
    topContent,
    shareText,
  };
}

export function createDemoRoomState(input: {
  sessionId: string;
  spaceId: string;
  qrSlug: string;
  spaceName: string;
  spaceType: SpaceType;
  mode: SpaceMode;
  attendeeUrl: string;
  startedAt: string;
  endsAt: string;
  durationMinutes: number;
}): DemoRoomState {
  return {
    sessionId: input.sessionId,
    spaceId: input.spaceId,
    qrSlug: input.qrSlug,
    spaceName: input.spaceName,
    spaceType: input.spaceType,
    mode: input.mode,
    attendeeUrl: input.attendeeUrl,
    status: "live",
    startedAt: input.startedAt,
    endsAt: input.endsAt,
    endedAt: null,
    durationMinutes: input.durationMinutes,
    pinnedItem: null,
    attendees: [],
    events: [],
  };
}

export function upsertDemoPresence(
  state: DemoRoomState,
  presence: LivePresenceEntry,
): DemoRoomState {
  const existing = state.attendees.find((entry) => entry.attendeeRef === presence.attendeeRef);
  const attendees = existing
    ? state.attendees.map((entry) => (entry.attendeeRef === presence.attendeeRef ? { ...entry, ...presence } : entry))
    : [presence, ...state.attendees];

  return {
    ...state,
    attendees: attendees
      .slice()
      .sort((left, right) => new Date(right.lastSeenAt).getTime() - new Date(left.lastSeenAt).getTime()),
  };
}

export function appendDemoEvent(
  state: DemoRoomState,
  event: LiveActivityEvent,
): DemoRoomState {
  return {
    ...state,
    events: [...state.events, event].slice(-100),
  };
}

export function toLivePanelSnapshot(state: DemoRoomState): LivePanelSnapshot {
  const metrics = summarizeLiveMetrics(state.events, state.attendees);
  const summary =
    state.status === "ended"
      ? buildSessionSummary(
          state.sessionId,
          state.status,
          state.startedAt,
          state.endedAt ?? state.endsAt,
          state.durationMinutes,
          state.events,
          state.attendees,
        )
      : null;

  return {
    sessionId: state.sessionId,
    spaceId: state.spaceId,
    qrSlug: state.qrSlug,
    status: state.status,
    startedAt: state.startedAt,
    endsAt: state.endsAt,
    endedAt: state.endedAt,
    pinnedItem: state.pinnedItem,
    attendees: state.attendees,
    recentAttendees: state.attendees.slice(0, 8),
    metrics: {
      ...metrics,
      peakAttendeeCount: Math.max(metrics.peakAttendeeCount, state.attendees.length),
    },
    summary,
  };
}
