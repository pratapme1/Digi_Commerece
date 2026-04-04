import type { HostSetupSnapshot, SpaceMode, SpaceType } from "@digi/domain";

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

export interface HostSetupResponse extends HostSetupSnapshot {}
