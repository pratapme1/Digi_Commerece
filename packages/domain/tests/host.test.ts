import { describe, expect, it } from "vitest";

import {
  buildAttendeeShareUrl,
  buildGoLiveWindow,
  createHostSetupDraft,
  resolveHostRoute,
} from "../src";

describe("@digi/domain host helpers", () => {
  it("builds a stable attendee share url", () => {
    expect(buildAttendeeShareUrl("https://spaces.app/s/", "/vega-dealer-day")).toBe(
      "https://spaces.app/s/vega-dealer-day",
    );
  });

  it("creates a predictable host draft", () => {
    const draft = createHostSetupDraft({ businessName: "Vega Auto" });

    expect(draft.businessName).toBe("Vega Auto");
    expect(draft.defaultSessionDurationMinutes).toBe(60);
    expect(draft.mode).toBe("identified");
  });

  it("resolves the host route from auth and setup state", () => {
    expect(resolveHostRoute(false, null)).toBe("/(auth)/phone");
    expect(
      resolveHostRoute(true, {
        account: null,
        brandProfiles: [],
        spaces: [],
        liveSession: null,
      }),
    ).toBe("/(setup)/account");
  });

  it("computes a live window from duration", () => {
    const start = new Date("2026-04-04T10:00:00.000Z");
    const liveWindow = buildGoLiveWindow(45, start);

    expect(liveWindow.startsAt).toBe("2026-04-04T10:00:00.000Z");
    expect(liveWindow.endsAt).toBe("2026-04-04T10:45:00.000Z");
  });
});
