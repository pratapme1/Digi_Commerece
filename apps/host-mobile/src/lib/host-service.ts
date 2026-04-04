import type {
  GoLiveInput,
  GoLiveResult,
  HostSetupResponse,
  SaveHostSetupInput,
} from "@digi/api-contracts";
import {
  buildAttendeeShareUrl,
  buildGoLiveWindow,
  createHostSetupDraft,
  type HostSetupSnapshot,
  type HostSpace,
} from "@digi/domain";
import type { SupabaseClient } from "@supabase/supabase-js";

import { hostAppConfig } from "./config";

function createId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function createQrSlug(spaceName: string): string {
  return `${spaceName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "space"}-demo`;
}

function getPrimarySpace(snapshot: HostSetupSnapshot): HostSpace | undefined {
  return snapshot.spaces.find((space) => space.isDefault) ?? snapshot.spaces[0];
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
} {
  const { startsAt, endsAt } = buildGoLiveWindow(input.durationMinutes);
  const space = snapshot.spaces.find((item) => item.id === input.spaceId) ?? getPrimarySpace(snapshot);

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
      attendeeUrl: buildAttendeeShareUrl(hostAppConfig.attendeeBaseUrl, space.qrSlug),
    },
  };
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

export function createEmptyDraft() {
  return createHostSetupDraft();
}
