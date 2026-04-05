import { describe, expect, it } from "vitest";

import {
  buildAttendeeShareMessage,
  createAttendeeBrandTheme,
  createBrandMark,
  getAttendeeSpacePreset,
  resolvePinnedFeature,
  searchAttendeePreset,
} from "../src";

describe("@digi/domain attendee helpers", () => {
  it("creates stable initials from a brand name", () => {
    expect(createBrandMark("Vega Prime")).toBe("VP");
    expect(createBrandMark("Digi")).toBe("DI");
  });

  it("returns the shared preset for a space type", () => {
    const preset = getAttendeeSpacePreset("store");

    expect(preset.feature?.title).toContain("dealer pricing");
    expect(preset.collections).toHaveLength(3);
  });

  it("searches the attendee preset index locally", () => {
    const preset = getAttendeeSpacePreset("restaurant");
    const matches = searchAttendeePreset(preset, "biryani");

    expect(matches).toHaveLength(1);
    expect(matches[0]?.title).toBe("Hyderabadi Dum Biryani");
  });

  it("promotes the current pin to the feature card", () => {
    const preset = getAttendeeSpacePreset("store");
    const feature = resolvePinnedFeature(preset, {
      id: "dealer-charger",
      title: "65W GaN charger dealer pricing",
      subtitle: "Live offer",
      collectionId: "products",
      screen: "ps",
      cardId: "VE-CH03",
      productIndex: 2,
    });

    expect(feature?.eyebrow).toBe("Pinned now");
    expect(feature?.openLabel).toBe("Open pinned item");
  });

  it("builds a brand theme with sensible defaults", () => {
    expect(createAttendeeBrandTheme({ name: "NextGen Ventures" })).toEqual({
      name: "NextGen Ventures",
      mark: "NV",
      primaryColor: "#1A1714",
      secondaryColor: "#F8F6F1",
      fontFamily: "Cormorant Garamond",
    });
  });

  it("creates a share-friendly save message", () => {
    expect(buildAttendeeShareMessage("Vega Dealer Day", "65W GaN charger dealer pricing")).toBe(
      "Vega Dealer Day: 65W GaN charger dealer pricing",
    );
  });
});
