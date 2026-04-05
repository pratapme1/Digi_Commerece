import type {
  HostSetupSnapshot,
  LivePanelSnapshot,
  LivePresenceEntry,
  LiveContentItem,
  SessionSummarySnapshot,
  SpaceMode,
  SpaceType,
} from "@digi/domain";

export interface SaveHostSetupInput {
  businessName: string;
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  spaceName: string;
  spaceType: SpaceType;
  mode: SpaceMode;
  defaultSessionDurationMinutes: number;
}

export interface GoLiveInput {
  spaceId: string;
  durationMinutes: number;
}

export interface GoLiveResult {
  sessionId: string;
  status: "live";
  startedAt: string;
  endsAt: string;
  attendeeUrl: string;
}

export interface LivePanelResponse extends LivePanelSnapshot {}

export interface PinLiveContentInput {
  sessionId: string;
  content: LiveContentItem;
}

export interface PinLiveContentResult {
  sessionId: string;
  pinnedItem: LiveContentItem | null;
}

export interface EndLiveSessionInput {
  sessionId: string;
}

export interface EndLiveSessionResult {
  sessionId: string;
  status: "ended";
  endedAt: string;
  summary: SessionSummarySnapshot;
}

export interface AttendeeRoomEventInput {
  qrSlug: string;
  attendeeRef: string;
  attendeeName?: string | null;
  eventName: string;
  contentId?: string | null;
  contentTitle?: string | null;
}

export interface AttendeeRoomEventResult {
  sessionId: string | null;
  status: string;
  attendeeCount: number;
  recentAttendees: LivePresenceEntry[];
}

export interface HostSetupResponse extends HostSetupSnapshot {}
