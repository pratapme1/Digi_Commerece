import { describe, expect, it } from "vitest";

import {
  buildCatalogImportTemplateCsv,
  buildOperationsAnalytics,
  createDemoOperationsState,
  type HostSetupSnapshot,
  recordDemoSessionSummary,
  validateCatalogImportCsv,
} from "../src";

function createSetup(): HostSetupSnapshot {
  return {
    account: {
      id: "account_1",
      ownerUserId: "user_1",
      businessName: "Vega Auto",
      verificationTier: "business_verified",
      primaryPhone: "+91 99999 99999",
      createdAt: "2026-04-01T10:00:00.000Z",
      updatedAt: "2026-04-01T10:00:00.000Z",
    },
    brandProfiles: [
      {
        id: "brand_1",
        accountId: "account_1",
        name: "Primary Brand",
        logoUrl: null,
        primaryColor: "#1A1714",
        secondaryColor: "#F8F6F1",
        fontFamily: "Cormorant Garamond",
        isDefault: true,
        createdAt: "2026-04-01T10:00:00.000Z",
        updatedAt: "2026-04-01T10:00:00.000Z",
      },
    ],
    spaces: [
      {
        id: "space_1",
        accountId: "account_1",
        brandProfileId: "brand_1",
        name: "Dealer Day",
        spaceType: "store",
        mode: "identified",
        qrSlug: "dealer-day-demo",
        defaultSessionDurationMinutes: 60,
        isDefault: true,
        archivedAt: null,
        createdAt: "2026-04-01T10:00:00.000Z",
        updatedAt: "2026-04-01T10:00:00.000Z",
      },
    ],
    liveSession: null,
  };
}

describe("@digi/domain operations helpers", () => {
  it("builds a reusable catalog import template", () => {
    expect(buildCatalogImportTemplateCsv("Dealer Day", "Primary Brand")).toContain(
      "space_name,brand_name,content_type,title,subtitle,sku",
    );
  });

  it("validates catalog import CSV rows against known spaces and brands", () => {
    const setup = createSetup();
    const result = validateCatalogImportCsv(
      [
        "space_name,brand_name,content_type,title,subtitle,sku",
        "Dealer Day,Primary Brand,product,65W GaN charger,Dealer offer,VE-CH03",
        "Dealer Day,Unknown Brand,contact,Ananya Reddy,Sales contact,",
      ].join("\n"),
      setup,
    );

    expect(result.status).toBe("partial");
    expect(result.acceptedRows).toBe(1);
    expect(result.rejectedRows).toBe(1);
    expect(result.rows[1]?.message).toContain("brand_name does not match an existing brand");
  });

  it("builds analytics snapshots from session history", () => {
    const setup = createSetup();
    const analytics = buildOperationsAnalytics(
      [
        {
          sessionId: "session_1",
          spaceId: "space_1",
          spaceName: "Dealer Day",
          status: "ended",
          startedAt: "2026-04-04T08:00:00.000Z",
          endedAt: "2026-04-04T09:00:00.000Z",
          attendeeCount: 12,
          totalViews: 36,
          totalSaves: 9,
          topContent: [
            {
              contentId: "dealer-charger",
              title: "65W GaN charger dealer pricing",
              views: 12,
              saves: 5,
            },
          ],
        },
      ],
      setup.spaces,
      "30d",
      new Date("2026-04-05T09:00:00.000Z"),
    );

    expect(analytics.sessionCount).toBe(1);
    expect(analytics.totalViews).toBe(36);
    expect(analytics.totalSaves).toBe(9);
    expect(analytics.topContent[0]?.title).toBe("65W GaN charger dealer pricing");
  });

  it("records ended demo sessions into the operations history", () => {
    const setup = createSetup();
    const state = createDemoOperationsState(setup, new Date("2026-04-05T09:00:00.000Z"));
    const next = recordDemoSessionSummary(state, setup, {
      sessionId: "session_live",
      status: "ended",
      startedAt: "2026-04-05T09:00:00.000Z",
      endedAt: "2026-04-05T10:00:00.000Z",
      durationMinutes: 60,
      attendeeCount: 16,
      peakAttendeeCount: 16,
      totalViews: 48,
      totalSaves: 11,
      saveRate: 0.23,
      topContent: [
        {
          contentId: "dealer-pricing",
          title: "Volume pricing",
          views: 18,
          saves: 6,
        },
      ],
      shareText: "summary",
    });

    expect(next.sessionHistory[0]?.sessionId).toBe("session_live");
    expect(next.sessionHistory[0]?.totalSaves).toBe(11);
  });
});
