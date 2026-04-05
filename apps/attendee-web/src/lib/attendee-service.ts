"use client";

import type { AttendeeBootstrapResponse, AttendeeRoomEventInput, AttendeeRoomEventResult } from "@digi/api-contracts";
import {
  createSeedSpaceContentEntries,
  createAttendeeBrandTheme,
  getAttendeeVerificationLabel,
  type AttendeeRoomBootstrap,
  type AttendeeRoomStatus,
  type DemoRoomState,
  type LiveContentItem,
  type SpaceMode,
  type SpaceType,
} from "@digi/domain";

import { getAttendeeSupabaseClient } from "./supabase-browser";

type SearchParamMap = Record<string, string | string[] | undefined>;

function parseSpaceType(value: string | null | undefined): SpaceType {
  if (value === "meeting" || value === "event" || value === "store" || value === "restaurant" || value === "other") {
    return value;
  }

  return "store";
}

function parseMode(value: string | null | undefined): SpaceMode {
  return value === "anonymous" ? "anonymous" : "identified";
}

function parseStatus(value: string | null | undefined): AttendeeRoomStatus {
  if (value === "ending" || value === "inactive" || value === "ended") {
    return value;
  }

  return "live";
}

export function normalizeSearchValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function getOrCreateAttendeeRef(qrSlug: string): string {
  if (typeof window === "undefined") {
    return `attendee_${qrSlug}`;
  }

  const key = `digi:attendee-ref:${qrSlug}`;
  const existing = window.sessionStorage.getItem(key) ?? window.localStorage.getItem(key);

  if (existing) {
    return existing;
  }

  const generated = `attendee_${Math.random().toString(36).slice(2, 10)}`;
  window.sessionStorage.setItem(key, generated);
  return generated;
}

function parsePinnedItem(searchParams: SearchParamMap): LiveContentItem | null {
  const pinnedId = normalizeSearchValue(searchParams.pinnedId);

  if (!pinnedId) {
    return null;
  }

  return {
    id: pinnedId,
    title: normalizeSearchValue(searchParams.pinnedTitle) ?? "Pinned item",
    subtitle: normalizeSearchValue(searchParams.pinnedSubtitle) ?? "Host spotlight",
    collectionId: normalizeSearchValue(searchParams.pinnedCollectionId) ?? "live",
    screen: (normalizeSearchValue(searchParams.pinnedScreen) as LiveContentItem["screen"]) ?? "ls",
    cardId: normalizeSearchValue(searchParams.pinnedCardId) ?? pinnedId,
    productIndex: normalizeSearchValue(searchParams.pinnedProductIndex)
      ? Number(normalizeSearchValue(searchParams.pinnedProductIndex))
      : undefined,
  };
}

export function buildDemoBootstrap(qrSlug: string, searchParams: SearchParamMap): AttendeeRoomBootstrap {
  const spaceType = parseSpaceType(normalizeSearchValue(searchParams.spaceType) ?? normalizeSearchValue(searchParams.space));
  const mode = parseMode(normalizeSearchValue(searchParams.mode));
  const status = parseStatus(normalizeSearchValue(searchParams.session));
  const spaceName = normalizeSearchValue(searchParams.spaceName) ?? `${spaceType[0].toUpperCase()}${spaceType.slice(1)} Space`;
  const brandName = normalizeSearchValue(searchParams.brandName) ?? spaceName;
  const endsSoon = status === "ending";
  const endsAt = status === "live" || status === "ending"
    ? new Date(Date.now() + (endsSoon ? 4 : 92) * 60_000).toISOString()
    : null;

  return {
    spaceId: `demo_${qrSlug}`,
    qrSlug,
    attendeeUrl: `/s/${qrSlug}`,
    spaceName,
    spaceType,
    mode,
    verificationTier: null,
    verificationLabel: "Live verified",
    brand: createAttendeeBrandTheme({ name: brandName }),
    status,
    sessionId: status === "inactive" ? null : `demo_session_${qrSlug}`,
    startedAt: status === "inactive" ? null : new Date(Date.now() - 18 * 60_000).toISOString(),
    endsAt,
    endedAt: status === "ended" ? new Date().toISOString() : null,
    attendeeCount: Number(normalizeSearchValue(searchParams.attendees) ?? 0),
    pinnedItem: parsePinnedItem(searchParams),
    contentEntries: createSeedSpaceContentEntries(spaceType, `demo_${qrSlug}`),
  };
}

export function buildBootstrapFromDemoRoom(
  qrSlug: string,
  roomState: DemoRoomState,
  searchParams: SearchParamMap,
): AttendeeRoomBootstrap {
  const brandName = normalizeSearchValue(searchParams.brandName) ?? roomState.spaceName;

  return {
    spaceId: roomState.spaceId,
    qrSlug,
    attendeeUrl: roomState.attendeeUrl,
    spaceName: roomState.spaceName,
    spaceType: roomState.spaceType,
    mode: roomState.mode,
    verificationTier: null,
    verificationLabel: "Live verified",
    brand: createAttendeeBrandTheme({ name: brandName }),
    status: roomState.status === "draft" || roomState.status === "scheduled" ? "inactive" : roomState.status,
    sessionId: roomState.sessionId,
    startedAt: roomState.startedAt,
    endsAt: roomState.endsAt,
    endedAt: roomState.endedAt,
    attendeeCount: roomState.attendees.length,
    pinnedItem: roomState.pinnedItem,
    contentEntries: roomState.contentEntries ?? createSeedSpaceContentEntries(roomState.spaceType, roomState.spaceId),
  };
}

export async function fetchAttendeeRoom(qrSlug: string): Promise<AttendeeBootstrapResponse | null> {
  const client = getAttendeeSupabaseClient();

  if (!client) {
    throw new Error("Supabase runtime config is missing for the attendee app.");
  }

  const { data, error } = await client.rpc("digi_get_attendee_room", {
    p_qr_slug: qrSlug,
  });

  if (error) {
    throw error;
  }

  return (data as AttendeeBootstrapResponse | null) ?? null;
}

export async function fetchAttendeeLiveState(qrSlug: string): Promise<AttendeeBootstrapResponse | null> {
  const client = getAttendeeSupabaseClient();

  if (!client) {
    throw new Error("Supabase runtime config is missing for the attendee app.");
  }

  const { data, error } = await client.rpc("digi_get_attendee_live_state", {
    p_qr_slug: qrSlug,
  });

  if (error) {
    throw error;
  }

  return (data as AttendeeBootstrapResponse | null) ?? null;
}

export async function recordAttendeeEvent(input: AttendeeRoomEventInput): Promise<AttendeeRoomEventResult> {
  const client = getAttendeeSupabaseClient();

  if (!client) {
    throw new Error("Supabase runtime config is missing for the attendee app.");
  }

  const { data, error } = await client.rpc("digi_record_attendee_event", {
    p_qr_slug: input.qrSlug,
    p_attendee_ref: input.attendeeRef,
    p_attendee_name: input.attendeeName ?? null,
    p_event_name: input.eventName,
    p_content_id: input.contentId ?? null,
    p_content_title: input.contentTitle ?? null,
  });

  if (error) {
    throw error;
  }

  return data as AttendeeRoomEventResult;
}
