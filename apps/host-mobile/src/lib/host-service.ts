import type {
  ArchiveSpaceInput,
  ArchiveSpaceResult,
  AssignSpaceBrandInput,
  AssignSpaceBrandResult,
  CreateBrandProfileInput,
  CreateBrandProfileResult,
  CreateSpaceInput,
  CreateSpaceResult,
  DeleteSpaceInput,
  DeleteSpaceResult,
  EndLiveSessionInput,
  EndLiveSessionResult,
  FetchOperationsSnapshotInput,
  GoLiveInput,
  GoLiveResult,
  HostSetupResponse,
  InviteTeamMemberInput,
  InviteTeamMemberResult,
  LivePanelResponse,
  OperationsSnapshotResponse,
  PinLiveContentInput,
  PinLiveContentResult,
  RemoveTeamAccessInput,
  RemoveTeamAccessResult,
  SaveHostSetupInput,
  SubmitCatalogImportResult,
} from "@digi/api-contracts";
import {
  appendDemoEvent,
  buildAttendeeShareUrl,
  buildGoLiveWindow,
  buildSessionSummary,
  createDemoRoomState,
  createHostSetupDraft,
  getPrimaryHostSpace,
  getLiveContentLibrary,
  toLivePanelSnapshot,
  type HostSetupSnapshot,
  type DemoRoomState,
  type LiveActivityEvent,
  type LivePresenceEntry,
} from "@digi/domain";
import type { SupabaseClient } from "@supabase/supabase-js";

import { hostAppConfig } from "./config";

function createId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function createQrSlug(spaceName: string): string {
  return `${spaceName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "space"}-demo`;
}

function createLiveEvent(
  name: LiveActivityEvent["name"],
  contentId: string | null,
  contentTitle: string | null,
  attendeeRef: string | null = null,
  attendeeName: string | null = null,
): LiveActivityEvent {
  return {
    id: createId("event"),
    name,
    createdAt: new Date().toISOString(),
    attendeeRef,
    attendeeName,
    contentId,
    contentTitle,
  };
}

export function createDemoSnapshot(input: SaveHostSetupInput): HostSetupSnapshot {
  const accountId = createId("account");
  const brandId = createId("brand");
  const spaceId = createId("space");
  const timestamp = new Date().toISOString();
  const qrSlug = createQrSlug(input.spaceName || input.businessName);

  return {
    account: {
      id: accountId,
      ownerUserId: createId("user"),
      businessName: input.businessName,
      verificationTier: "phone_verified",
      primaryPhone: "+91 99999 99999",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    brandProfiles: [
      {
        id: brandId,
        accountId,
        name: input.brandName || input.businessName,
        logoUrl: null,
        primaryColor: input.primaryColor,
        secondaryColor: input.secondaryColor,
        fontFamily: input.fontFamily,
        isDefault: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    spaces: [
      {
        id: spaceId,
        accountId,
        brandProfileId: brandId,
        name: input.spaceName || input.businessName,
        spaceType: input.spaceType,
        mode: input.mode,
      qrSlug,
      defaultSessionDurationMinutes: input.defaultSessionDurationMinutes,
      isDefault: true,
      archivedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    ],
    liveSession: null,
  };
}

export function applyDemoGoLive(snapshot: HostSetupSnapshot, input: GoLiveInput): {
  nextSnapshot: HostSetupSnapshot;
  result: GoLiveResult;
  roomState: DemoRoomState;
} {
  const { startsAt, endsAt } = buildGoLiveWindow(input.durationMinutes);
  const space = snapshot.spaces.find((item) => item.id === input.spaceId) ?? getPrimaryHostSpace(snapshot);

  if (!space) {
    throw new Error("No space is available to go live.");
  }

  const liveSession = {
    id: createId("session"),
    spaceId: space.id,
    status: "live" as const,
    durationMinutes: input.durationMinutes,
    scheduledStartAt: null,
    startedAt: startsAt,
    endsAt,
    endedAt: null,
    createdAt: startsAt,
    updatedAt: startsAt,
  };

  const attendeeUrl = buildAttendeeShareUrl(hostAppConfig.attendeeBaseUrl, space.qrSlug);
  const roomState = appendDemoEvent(
    createDemoRoomState({
      sessionId: liveSession.id,
      spaceId: space.id,
      qrSlug: space.qrSlug,
      spaceName: space.name,
      spaceType: space.spaceType,
      mode: space.mode,
      attendeeUrl,
      startedAt: startsAt,
      endsAt,
      durationMinutes: input.durationMinutes,
    }),
    createLiveEvent("session_started", null, null),
  );

  return {
    nextSnapshot: {
      ...snapshot,
      liveSession,
    },
    result: {
      sessionId: liveSession.id,
      status: "live",
      startedAt: startsAt,
      endsAt,
      attendeeUrl,
    },
    roomState,
  };
}

export function getDemoLivePanel(roomState: DemoRoomState | null): LivePanelResponse | null {
  return roomState ? toLivePanelSnapshot(roomState) : null;
}

export function applyDemoPinLiveContent(
  roomState: DemoRoomState,
  input: PinLiveContentInput,
): {
  roomState: DemoRoomState;
  result: PinLiveContentResult;
} {
  const nextRoomState = appendDemoEvent(
    {
      ...roomState,
      pinnedItem: input.content,
    },
    createLiveEvent("featured_item_changed", input.content.id, input.content.title),
  );

  return {
    roomState: nextRoomState,
    result: {
      sessionId: input.sessionId,
      pinnedItem: input.content,
    },
  };
}

export function applyDemoAttendeePresence(
  roomState: DemoRoomState,
  presence: LivePresenceEntry,
): DemoRoomState {
  return appendDemoEvent(
    {
      ...roomState,
      attendees: [presence, ...roomState.attendees.filter((entry) => entry.attendeeRef !== presence.attendeeRef)],
    },
    createLiveEvent("presence_registered", null, null, presence.attendeeRef, presence.attendeeName),
  );
}

export function applyDemoAttendeeEvent(
  roomState: DemoRoomState,
  input: {
    attendeeRef: string;
    attendeeName?: string | null;
    eventName: LiveActivityEvent["name"];
    contentId?: string | null;
    contentTitle?: string | null;
  },
): DemoRoomState {
  return appendDemoEvent(
    roomState,
    createLiveEvent(
      input.eventName,
      input.contentId ?? null,
      input.contentTitle ?? null,
      input.attendeeRef,
      input.attendeeName ?? null,
    ),
  );
}

export function applyDemoEndLiveSession(
  roomState: DemoRoomState,
): {
  roomState: DemoRoomState;
  result: EndLiveSessionResult;
} {
  const endedAt = new Date().toISOString();
  const nextRoomState = appendDemoEvent(
    {
      ...roomState,
      status: "ended",
      endedAt,
    },
    createLiveEvent("session_ended", null, null),
  );
  const summary = buildSessionSummary(
    roomState.sessionId,
    "ended",
    roomState.startedAt,
    endedAt,
    roomState.durationMinutes,
    nextRoomState.events,
    nextRoomState.attendees,
  );

  return {
    roomState: {
      ...nextRoomState,
      endedAt,
      status: "ended",
    },
    result: {
      sessionId: roomState.sessionId,
      status: "ended",
      endedAt,
      summary,
    },
  };
}

export function getDefaultPinnedContent(snapshot: HostSetupSnapshot): ReturnType<typeof getLiveContentLibrary>[number] | null {
  const space = getPrimaryHostSpace(snapshot);
  if (!space) {
    return null;
  }

  return getLiveContentLibrary(space.spaceType)[0] ?? null;
}

export async function fetchHostSetup(client: SupabaseClient): Promise<HostSetupSnapshot> {
  const { data, error } = await client.rpc("digi_get_host_setup");

  if (error) {
    throw error;
  }

  return (data ?? {
    account: null,
    brandProfiles: [],
    spaces: [],
    liveSession: null,
  }) as HostSetupResponse;
}

export async function fetchOperationsSnapshot(
  client: SupabaseClient,
  input: FetchOperationsSnapshotInput,
): Promise<OperationsSnapshotResponse> {
  const { data, error } = await client.rpc("digi_get_operations_snapshot", {
    p_range: input.range,
  });

  if (error) {
    throw error;
  }

  return data as OperationsSnapshotResponse;
}

export async function saveHostSetup(
  client: SupabaseClient,
  input: SaveHostSetupInput,
): Promise<HostSetupSnapshot> {
  const { data, error } = await client.rpc("digi_save_host_setup", {
    p_business_name: input.businessName,
    p_brand_name: input.brandName,
    p_primary_color: input.primaryColor,
    p_secondary_color: input.secondaryColor,
    p_font_family: input.fontFamily,
    p_space_name: input.spaceName,
    p_space_type: input.spaceType,
    p_mode: input.mode,
    p_default_session_duration_minutes: input.defaultSessionDurationMinutes,
  });

  if (error) {
    throw error;
  }

  return data as HostSetupResponse;
}

export async function goLive(client: SupabaseClient, input: GoLiveInput): Promise<GoLiveResult> {
  const { data, error } = await client.rpc("digi_go_live", {
    p_space_id: input.spaceId,
    p_duration_minutes: input.durationMinutes,
  });

  if (error) {
    throw error;
  }

  const result = data as GoLiveResult;
  return {
    ...result,
    attendeeUrl: result.attendeeUrl.startsWith("http")
      ? result.attendeeUrl
      : buildAttendeeShareUrl(hostAppConfig.attendeeBaseUrl, result.attendeeUrl.replace(/^\/s\//, "")),
  };
}

export async function fetchLivePanel(
  client: SupabaseClient,
  spaceId?: string,
): Promise<LivePanelResponse | null> {
  const { data, error } = await client.rpc("digi_get_live_panel", {
    p_space_id: spaceId ?? null,
  });

  if (error) {
    throw error;
  }

  return (data as LivePanelResponse | null) ?? null;
}

export async function pinLiveContent(
  client: SupabaseClient,
  input: PinLiveContentInput,
): Promise<PinLiveContentResult> {
  const { data, error } = await client.rpc("digi_pin_live_content", {
    p_session_id: input.sessionId,
    p_content_id: input.content.id,
    p_content_title: input.content.title,
    p_content_subtitle: input.content.subtitle,
    p_collection_id: input.content.collectionId,
    p_attendee_screen: input.content.screen,
    p_card_id: input.content.cardId,
    p_product_index: input.content.productIndex ?? null,
  });

  if (error) {
    throw error;
  }

  return data as PinLiveContentResult;
}

export async function endLiveSession(
  client: SupabaseClient,
  input: EndLiveSessionInput,
): Promise<EndLiveSessionResult> {
  const { data, error } = await client.rpc("digi_end_live_session", {
    p_session_id: input.sessionId,
  });

  if (error) {
    throw error;
  }

  return data as EndLiveSessionResult;
}

export async function createBrandProfile(
  client: SupabaseClient,
  input: CreateBrandProfileInput,
): Promise<CreateBrandProfileResult> {
  const { data, error } = await client.rpc("digi_create_brand_profile", {
    p_name: input.name,
    p_primary_color: input.primaryColor,
    p_secondary_color: input.secondaryColor,
    p_font_family: input.fontFamily,
    p_make_default: input.makeDefault,
  });

  if (error) {
    throw error;
  }

  return data as CreateBrandProfileResult;
}

export async function createSpace(
  client: SupabaseClient,
  input: CreateSpaceInput,
): Promise<CreateSpaceResult> {
  const { data, error } = await client.rpc("digi_create_space", {
    p_name: input.name,
    p_brand_profile_id: input.brandProfileId,
    p_space_type: input.spaceType,
    p_mode: input.mode,
    p_default_session_duration_minutes: input.defaultSessionDurationMinutes,
  });

  if (error) {
    throw error;
  }

  return data as CreateSpaceResult;
}

export async function assignSpaceBrand(
  client: SupabaseClient,
  input: AssignSpaceBrandInput,
): Promise<AssignSpaceBrandResult> {
  const { data, error } = await client.rpc("digi_assign_space_brand", {
    p_space_id: input.spaceId,
    p_brand_profile_id: input.brandProfileId,
  });

  if (error) {
    throw error;
  }

  return data as AssignSpaceBrandResult;
}

export async function archiveSpace(
  client: SupabaseClient,
  input: ArchiveSpaceInput,
): Promise<ArchiveSpaceResult> {
  const { data, error } = await client.rpc("digi_archive_space", {
    p_space_id: input.spaceId,
  });

  if (error) {
    throw error;
  }

  return data as ArchiveSpaceResult;
}

export async function deleteSpace(
  client: SupabaseClient,
  input: DeleteSpaceInput,
): Promise<DeleteSpaceResult> {
  const { data, error } = await client.rpc("digi_delete_space", {
    p_space_id: input.spaceId,
  });

  if (error) {
    throw error;
  }

  return data as DeleteSpaceResult;
}

export async function inviteTeamMember(
  client: SupabaseClient,
  input: InviteTeamMemberInput,
): Promise<InviteTeamMemberResult> {
  const { data, error } = await client.rpc("digi_invite_team_member", {
    p_display_name: input.displayName,
    p_phone: input.phone,
    p_role: input.role,
  });

  if (error) {
    throw error;
  }

  return data as InviteTeamMemberResult;
}

export async function removeTeamAccess(
  client: SupabaseClient,
  input: RemoveTeamAccessInput,
): Promise<RemoveTeamAccessResult> {
  const { data, error } = await client.rpc("digi_remove_team_access", {
    p_member_id: input.memberId ?? null,
    p_invite_id: input.inviteId ?? null,
  });

  if (error) {
    throw error;
  }

  return data as RemoveTeamAccessResult;
}

export async function recordCatalogImport(
  client: SupabaseClient,
  input: {
    fileName: string;
    spaceId: string | null;
    processedRows: number;
    acceptedRows: number;
    rejectedRows: number;
    status: "validated" | "partial" | "failed";
    rows: unknown[];
  },
): Promise<SubmitCatalogImportResult> {
  const { data, error } = await client.rpc("digi_record_catalog_import", {
    p_space_id: input.spaceId,
    p_file_name: input.fileName,
    p_processed_rows: input.processedRows,
    p_accepted_rows: input.acceptedRows,
    p_rejected_rows: input.rejectedRows,
    p_status: input.status,
    p_rows: input.rows,
  });

  if (error) {
    throw error;
  }

  return data as SubmitCatalogImportResult;
}

export function createEmptyDraft() {
  return createHostSetupDraft();
}
