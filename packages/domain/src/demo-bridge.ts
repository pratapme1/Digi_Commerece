import type { LiveActivityEvent, LiveEventName, LivePresenceEntry } from "./live-room";
import type { DemoRoomState } from "./live-room";

export type DemoBridgeMessage =
  | {
      type: "digi-demo-room-request";
      room: string;
    }
  | {
      type: "digi-demo-room-state";
      room: string;
      roomState: DemoRoomState | null;
    }
  | {
      type: "digi-demo-attendee-presence";
      room: string;
      presence: LivePresenceEntry;
    }
  | {
      type: "digi-demo-attendee-event";
      room: string;
      attendeeRef: string;
      attendeeName?: string | null;
      eventName: LiveEventName;
      contentId?: string | null;
      contentTitle?: string | null;
    };

export function isDemoBridgeMessage(value: unknown): value is DemoBridgeMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<DemoBridgeMessage>;
  return typeof candidate.type === "string" && candidate.type.startsWith("digi-demo-");
}

export function createDemoBridgePresenceEvent(input: {
  attendeeRef: string;
  attendeeName?: string | null;
  createdAt: string;
}): LiveActivityEvent {
  return {
    id: `event_${Math.random().toString(36).slice(2, 10)}`,
    name: "presence_registered",
    createdAt: input.createdAt,
    attendeeRef: input.attendeeRef,
    attendeeName: input.attendeeName ?? null,
    contentId: null,
    contentTitle: null,
  };
}
