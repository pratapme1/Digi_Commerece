import type {
  AnalyticsRange,
  CatalogImportJob,
  CreateBrandProfileInput,
  CreateSpaceInput,
  InviteTeamMemberInput,
  HostSetupSnapshot,
  LivePanelSnapshot,
  LivePresenceEntry,
  LiveContentItem,
  OperationsSnapshot,
  RemoveTeamAccessInput,
  SubmitCatalogImportInput,
  SessionSummarySnapshot,
  SpaceMode,
  SpaceType,
  TeamInvite,
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

export interface OperationsSnapshotResponse extends OperationsSnapshot {}

export interface CreateBrandProfileResult {
  brandId: string;
}

export interface CreateSpaceResult {
  spaceId: string;
}

export interface AssignSpaceBrandInput {
  spaceId: string;
  brandProfileId: string;
}

export interface AssignSpaceBrandResult {
  spaceId: string;
  brandProfileId: string;
}

export interface ArchiveSpaceInput {
  spaceId: string;
}

export interface ArchiveSpaceResult {
  spaceId: string;
  archivedAt: string;
}

export interface DeleteSpaceInput {
  spaceId: string;
}

export interface DeleteSpaceResult {
  spaceId: string;
  deleted: true;
}

export interface InviteTeamMemberResult extends TeamInvite {}

export interface RemoveTeamAccessResult {
  memberId: string | null;
  inviteId: string | null;
}

export interface SubmitCatalogImportResult extends CatalogImportJob {}

export interface FetchOperationsSnapshotInput {
  range: AnalyticsRange;
}

export type {
  AnalyticsRange,
  CatalogImportJob,
  CreateBrandProfileInput,
  CreateSpaceInput,
  InviteTeamMemberInput,
  OperationsSnapshot,
  RemoveTeamAccessInput,
  SubmitCatalogImportInput,
};
