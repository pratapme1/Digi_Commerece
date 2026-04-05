import { describe, expect, it } from "vitest";

import {
  buildSessionSummary,
  formatTimeRemaining,
  getLiveContentLibrary,
  summarizeLiveMetrics,
  type LiveActivityEvent,
  type LivePresenceEntry,
} from "../src";

describe("live room domain helpers", () => {
  const attendees: LivePresenceEntry[] = [
    {
      attendeeRef: "attendee-1",
      attendeeName: "Aarav Shah",
      joinedAt: "2026-04-05T10:00:00.000Z",
      lastSeenAt: "2026-04-05T10:05:00.000Z",
    },
    {
      attendeeRef: "attendee-2",
      attendeeName: "Neha Gupta",
      joinedAt: "2026-04-05T10:02:00.000Z",
      lastSeenAt: "2026-04-05T10:04:00.000Z",
    },
  ];

  const events: LiveActivityEvent[] = [
    {
      id: "event-1",
      name: "space_overview_viewed",
      createdAt: "2026-04-05T10:03:00.000Z",
      attendeeRef: "attendee-1",
      attendeeName: "Aarav Shah",
      contentId: "dealer-charger",
      contentTitle: "65W GaN charger dealer pricing",
    },
    {
      id: "event-2",
      name: "card_viewed",
      createdAt: "2026-04-05T10:03:20.000Z",
      attendeeRef: "attendee-2",
      attendeeName: "Neha Gupta",
      contentId: "dealer-charger",
      contentTitle: "65W GaN charger dealer pricing",
    },
    {
      id: "event-3",
      name: "content_saved",
      createdAt: "2026-04-05T10:03:30.000Z",
      attendeeRef: "attendee-2",
      attendeeName: "Neha Gupta",
      contentId: "dealer-charger",
      contentTitle: "65W GaN charger dealer pricing",
    },
  ];

  it("returns the expected live content library for a space type", () => {
    expect(getLiveContentLibrary("store")[0]?.id).toBe("dealer-charger");
    expect(getLiveContentLibrary("restaurant")[0]?.id).toBe("chef-special");
  });

  it("formats time remaining in a human-readable way", () => {
    expect(formatTimeRemaining("2026-04-05T11:30:00.000Z", new Date("2026-04-05T10:00:00.000Z"))).toBe("1h 30m remaining");
    expect(formatTimeRemaining("2026-04-05T10:12:00.000Z", new Date("2026-04-05T10:00:00.000Z"))).toBe("12m remaining");
  });

  it("summarizes live metrics from attendees and events", () => {
    expect(summarizeLiveMetrics(events, attendees)).toEqual({
      attendeeCount: 2,
      peakAttendeeCount: 2,
      totalViews: 2,
      totalSaves: 1,
      saveRate: 0.5,
    });
  });

  it("builds the session summary from the shared event stream", () => {
    const summary = buildSessionSummary(
      "session-1",
      "ended",
      "2026-04-05T10:00:00.000Z",
      "2026-04-05T11:00:00.000Z",
      60,
      events,
      attendees,
    );

    expect(summary.topContent[0]).toEqual({
      contentId: "dealer-charger",
      title: "65W GaN charger dealer pricing",
      views: 1,
      saves: 1,
    });
    expect(summary.shareText).toContain("2 attendees");
  });
});
