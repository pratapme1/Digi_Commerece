import { describe, expect, it } from "vitest";

import {
  buildAttendeePresetFromEntries,
  buildLiveContentLibraryFromEntries,
  createSeedSpaceContentEntries,
  mergeImportRowsIntoSpaceContentEntries,
} from "../src";

describe("@digi/domain content catalog helpers", () => {
  it("creates seed content entries from the shared presets", () => {
    const entries = createSeedSpaceContentEntries("store", "space-1");

    expect(entries.some((entry) => entry.contentType === "product")).toBe(true);
    expect(entries.some((entry) => entry.contentType === "contact")).toBe(true);
  });

  it("promotes imported rows into attendee-facing content", () => {
    const seedEntries = createSeedSpaceContentEntries("store", "space-1");
    const merged = mergeImportRowsIntoSpaceContentEntries("space-1", "store", seedEntries, [
      {
        rowNumber: 2,
        status: "accepted",
        contentType: "product",
        title: "Dealer launch combo pack",
        subtitle: "Launch-only pricing",
        sku: "VE-COMBO",
      },
      {
        rowNumber: 3,
        status: "accepted",
        contentType: "contact",
        title: "Rhea Sen",
        subtitle: "Regional sales lead",
        sku: "",
      },
    ]);
    const preset = buildAttendeePresetFromEntries("store", merged);
    const liveLibrary = buildLiveContentLibraryFromEntries("store", merged);

    expect(preset.searchIndex.some((item) => item.title === "Dealer launch combo pack")).toBe(true);
    expect(preset.content.contact?.name).toBe("Rhea Sen");
    expect(liveLibrary[0]?.title).toBe("Dealer launch combo pack");
  });
});
