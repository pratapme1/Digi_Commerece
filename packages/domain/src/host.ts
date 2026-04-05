export type VerificationTier = "phone_verified" | "business_verified";
export type SpaceType = "meeting" | "event" | "store" | "restaurant" | "other";
export type SpaceMode = "identified" | "anonymous";
export type SessionStatus = "draft" | "scheduled" | "live" | "ending" | "ended";

export interface HostAccount {
  id: string;
  ownerUserId: string;
  businessName: string;
  verificationTier: VerificationTier;
  primaryPhone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HostBrandProfile {
  id: string;
  accountId: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HostSpace {
  id: string;
  accountId: string;
  brandProfileId: string;
  name: string;
  spaceType: SpaceType;
  mode: SpaceMode;
  qrSlug: string;
  defaultSessionDurationMinutes: number;
  isDefault: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HostSession {
  id: string;
  spaceId: string;
  status: SessionStatus;
  durationMinutes: number;
  scheduledStartAt: string | null;
  startedAt: string | null;
  endsAt: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HostSetupSnapshot {
  account: HostAccount | null;
  brandProfiles: HostBrandProfile[];
  spaces: HostSpace[];
  liveSession: HostSession | null;
}

export interface HostSetupDraft {
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

export const spaceTypeOptions: { label: string; value: SpaceType }[] = [
  { label: "Store", value: "store" },
  { label: "Restaurant", value: "restaurant" },
  { label: "Meeting", value: "meeting" },
  { label: "Event", value: "event" },
  { label: "Other", value: "other" },
];

export const spaceModeOptions: { label: string; value: SpaceMode }[] = [
  { label: "Identified", value: "identified" },
  { label: "Anonymous", value: "anonymous" },
];

export const hostFontOptions = [
  "Cormorant Garamond",
  "DM Sans",
  "Instrument Serif",
] as const;

export const durationOptions = [30, 45, 60, 90, 120] as const;

export function createHostSetupDraft(partial?: Partial<HostSetupDraft>): HostSetupDraft {
  return {
    businessName: "",
    brandName: "Primary Brand",
    primaryColor: "#1A1714",
    secondaryColor: "#F8F6F1",
    fontFamily: hostFontOptions[0],
    spaceName: "",
    spaceType: "store",
    mode: "identified",
    defaultSessionDurationMinutes: 60,
    ...partial,
  };
}

export function buildAttendeeShareUrl(baseUrl: string, qrSlug: string): string {
  const trimmedBase = baseUrl.replace(/\/+$/, "");
  const trimmedSlug = qrSlug.replace(/^\/+/, "");
  return `${trimmedBase}/${trimmedSlug}`;
}

export function getActiveSpaces(snapshot: HostSetupSnapshot | null): HostSpace[] {
  return snapshot?.spaces.filter((space) => !space.archivedAt) ?? [];
}

export function getPrimaryHostSpace(snapshot: HostSetupSnapshot | null): HostSpace | null {
  const activeSpaces = getActiveSpaces(snapshot);
  return activeSpaces.find((space) => space.isDefault) ?? activeSpaces[0] ?? null;
}

export function resolveHostRoute(authenticated: boolean, setup: HostSetupSnapshot | null): string {
  if (!authenticated) {
    return "/(auth)/phone";
  }

  if (!setup?.account) {
    return "/(setup)/account";
  }

  if (!setup.brandProfiles.length) {
    return "/(setup)/brand";
  }

  if (!getActiveSpaces(setup).length) {
    return "/(setup)/space";
  }

  return "/dashboard";
}

export function buildGoLiveWindow(durationMinutes: number, from = new Date()): {
  startsAt: string;
  endsAt: string;
} {
  const startsAt = from.toISOString();
  const endsAt = new Date(from.getTime() + durationMinutes * 60_000).toISOString();
  return { startsAt, endsAt };
}
