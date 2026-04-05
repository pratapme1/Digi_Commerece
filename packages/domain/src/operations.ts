import type { HostBrandProfile, HostSetupSnapshot, HostSpace, SessionStatus, SpaceMode, SpaceType } from "./host";
import { getActiveSpaces, getPrimaryHostSpace } from "./host";
import type { SessionSummarySnapshot } from "./live-room";

export type AnalyticsRange = "7d" | "30d" | "all";
export type TeamRole = "owner" | "admin" | "operator" | "analyst";
export type InviteStatus = "pending" | "revoked" | "accepted";
export type ImportRowStatus = "accepted" | "rejected";
export type ImportJobStatus = "validated" | "partial" | "failed";
export type CatalogContentType = "product" | "contact" | "menu" | "story" | "offer";

export interface TeamMember {
  id: string;
  displayName: string;
  phone: string;
  role: TeamRole;
  status: "active";
  joinedAt: string;
  lastActiveAt: string | null;
}

export interface TeamInvite {
  id: string;
  displayName: string;
  phone: string;
  role: TeamRole;
  status: InviteStatus;
  invitedAt: string;
  respondedAt: string | null;
}

export interface CatalogImportRowResult {
  rowNumber: number;
  status: ImportRowStatus;
  spaceName: string;
  brandName: string;
  contentType: CatalogContentType | string;
  title: string;
  subtitle: string;
  sku: string;
  message: string;
}

export interface CatalogImportJob {
  id: string;
  fileName: string;
  source: "csv";
  status: ImportJobStatus;
  processedRows: number;
  acceptedRows: number;
  rejectedRows: number;
  createdAt: string;
  spaceId: string | null;
  rows: CatalogImportRowResult[];
}

export interface OperationsSessionRecord {
  sessionId: string;
  spaceId: string;
  spaceName: string;
  status: SessionStatus;
  startedAt: string | null;
  endedAt: string | null;
  attendeeCount: number;
  totalViews: number;
  totalSaves: number;
  topContent: SessionSummarySnapshot["topContent"];
}

export interface OperationsAnalyticsSnapshot {
  range: AnalyticsRange;
  sessionCount: number;
  activeSpaces: number;
  attendeeCount: number;
  totalViews: number;
  totalSaves: number;
  saveRate: number;
  topSpaces: Array<{
    spaceId: string;
    spaceName: string;
    sessionCount: number;
    attendeeCount: number;
    totalViews: number;
    totalSaves: number;
  }>;
  topContent: Array<{
    contentId: string;
    title: string;
    views: number;
    saves: number;
  }>;
  recentSessions: OperationsSessionRecord[];
}

export interface OperationsSnapshot {
  analytics: OperationsAnalyticsSnapshot;
  teamMembers: TeamMember[];
  teamInvites: TeamInvite[];
  importJobs: CatalogImportJob[];
  sessionHistory: OperationsSessionRecord[];
}

export interface DemoOperationsState {
  teamMembers: TeamMember[];
  teamInvites: TeamInvite[];
  importJobs: CatalogImportJob[];
  sessionHistory: OperationsSessionRecord[];
}

export interface CreateBrandProfileInput {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  makeDefault: boolean;
}

export interface CreateSpaceInput {
  name: string;
  brandProfileId: string;
  spaceType: SpaceType;
  mode: SpaceMode;
  defaultSessionDurationMinutes: number;
}

export interface AssignSpaceBrandInput {
  spaceId: string;
  brandProfileId: string;
}

export interface InviteTeamMemberInput {
  displayName: string;
  phone: string;
  role: TeamRole;
}

export interface RemoveTeamAccessInput {
  memberId?: string;
  inviteId?: string;
}

export interface SubmitCatalogImportInput {
  fileName: string;
  csvText: string;
  spaceId: string | null;
}

export const analyticsRangeOptions: Array<{ label: string; value: AnalyticsRange }> = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "All time", value: "all" },
];

export const teamRoleOptions: Array<{ label: string; value: TeamRole }> = [
  { label: "Owner", value: "owner" },
  { label: "Admin", value: "admin" },
  { label: "Operator", value: "operator" },
  { label: "Analyst", value: "analyst" },
];

const importContentTypes: CatalogContentType[] = ["product", "contact", "menu", "story", "offer"];

function createId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "space";
}

function buildQrSlug(name: string, existingSpaces: HostSpace[]): string {
  const base = slugify(name);
  let candidate = `${base}-demo`;
  let suffix = 2;

  while (existingSpaces.some((space) => space.qrSlug === candidate)) {
    candidate = `${base}-${suffix}-demo`;
    suffix += 1;
  }

  return candidate;
}

function formatPhone(phone: string): string {
  return phone.trim();
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        current += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells.map((cell) => cell.replace(/^"|"$/g, "").trim());
}

function getRangeStart(range: AnalyticsRange, now = new Date()): Date | null {
  if (range === "all") {
    return null;
  }

  const days = range === "7d" ? 7 : 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function isWithinRange(record: OperationsSessionRecord, rangeStart: Date | null): boolean {
  if (!rangeStart) {
    return true;
  }

  const stamp = record.endedAt ?? record.startedAt;
  if (!stamp) {
    return false;
  }

  return new Date(stamp).getTime() >= rangeStart.getTime();
}

function isValidHexColor(value: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(value.trim());
}

export function buildCatalogImportTemplateCsv(spaceName = "Dealer Day", brandName = "Primary Brand"): string {
  return [
    "space_name,brand_name,content_type,title,subtitle,sku",
    `${spaceName},${brandName},product,65W GaN charger dealer pricing,Dealer launch offer,VE-CH03`,
    `${spaceName},${brandName},contact,Ananya Reddy,Verified sales contact,`,
  ].join("\n");
}

export function validateCatalogImportCsv(
  csvText: string,
  setup: HostSetupSnapshot | null,
): {
  status: ImportJobStatus;
  processedRows: number;
  acceptedRows: number;
  rejectedRows: number;
  rows: CatalogImportRowResult[];
} {
  const trimmed = csvText.trim();

  if (!trimmed) {
    return {
      status: "failed",
      processedRows: 0,
      acceptedRows: 0,
      rejectedRows: 0,
      rows: [],
    };
  }

  const lines = trimmed.split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase());
  const requiredHeaders = ["space_name", "brand_name", "content_type", "title", "subtitle", "sku"];
  const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));

  if (missingHeaders.length) {
    return {
      status: "failed",
      processedRows: Math.max(0, lines.length - 1),
      acceptedRows: 0,
      rejectedRows: Math.max(0, lines.length - 1),
      rows: [
        {
          rowNumber: 1,
          status: "rejected",
          spaceName: "",
          brandName: "",
          contentType: "",
          title: "",
          subtitle: "",
          sku: "",
          message: `Missing headers: ${missingHeaders.join(", ")}`,
        },
      ],
    };
  }

  const spaces = setup?.spaces ?? [];
  const brands = setup?.brandProfiles ?? [];
  const rows: CatalogImportRowResult[] = [];

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const values = parseCsvLine(lines[lineIndex]);
    const record = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    const spaceName = record.space_name?.trim() ?? "";
    const brandName = record.brand_name?.trim() ?? "";
    const contentType = record.content_type?.trim() ?? "";
    const title = record.title?.trim() ?? "";
    const subtitle = record.subtitle?.trim() ?? "";
    const sku = record.sku?.trim() ?? "";
    const issues: string[] = [];

    if (!spaceName) {
      issues.push("space_name is required");
    } else if (!spaces.some((space) => space.name.toLowerCase() === spaceName.toLowerCase())) {
      issues.push("space_name does not match an existing space");
    }

    if (!brandName) {
      issues.push("brand_name is required");
    } else if (!brands.some((brand) => brand.name.toLowerCase() === brandName.toLowerCase())) {
      issues.push("brand_name does not match an existing brand");
    }

    if (!contentType) {
      issues.push("content_type is required");
    } else if (!importContentTypes.includes(contentType as CatalogContentType)) {
      issues.push(`content_type must be one of ${importContentTypes.join(", ")}`);
    }

    if (!title) {
      issues.push("title is required");
    }

    if (["product", "offer"].includes(contentType) && !sku) {
      issues.push("sku is required for product and offer rows");
    }

    rows.push({
      rowNumber: lineIndex + 1,
      status: issues.length ? "rejected" : "accepted",
      spaceName,
      brandName,
      contentType,
      title,
      subtitle,
      sku,
      message: issues.length ? issues.join("; ") : "Validated",
    });
  }

  const acceptedRows = rows.filter((row) => row.status === "accepted").length;
  const rejectedRows = rows.length - acceptedRows;
  let status: ImportJobStatus = "validated";

  if (!acceptedRows) {
    status = "failed";
  } else if (rejectedRows) {
    status = "partial";
  }

  return {
    status,
    processedRows: rows.length,
    acceptedRows,
    rejectedRows,
    rows,
  };
}

export function buildOperationsAnalytics(
  sessionHistory: OperationsSessionRecord[],
  spaces: HostSpace[],
  range: AnalyticsRange,
  now = new Date(),
): OperationsAnalyticsSnapshot {
  const rangeStart = getRangeStart(range, now);
  const filtered = sessionHistory
    .filter((record) => isWithinRange(record, rangeStart))
    .sort((left, right) => new Date(right.endedAt ?? right.startedAt ?? 0).getTime() - new Date(left.endedAt ?? left.startedAt ?? 0).getTime());
  const sessionCount = filtered.length;
  const attendeeCount = filtered.reduce((sum, record) => sum + record.attendeeCount, 0);
  const totalViews = filtered.reduce((sum, record) => sum + record.totalViews, 0);
  const totalSaves = filtered.reduce((sum, record) => sum + record.totalSaves, 0);
  const saveRate = totalViews ? Number((totalSaves / totalViews).toFixed(2)) : 0;

  const topSpaceMap = new Map<string, OperationsAnalyticsSnapshot["topSpaces"][number]>();
  const topContentMap = new Map<string, OperationsAnalyticsSnapshot["topContent"][number]>();

  filtered.forEach((record) => {
    const existingSpace = topSpaceMap.get(record.spaceId) ?? {
      spaceId: record.spaceId,
      spaceName: record.spaceName,
      sessionCount: 0,
      attendeeCount: 0,
      totalViews: 0,
      totalSaves: 0,
    };
    existingSpace.sessionCount += 1;
    existingSpace.attendeeCount += record.attendeeCount;
    existingSpace.totalViews += record.totalViews;
    existingSpace.totalSaves += record.totalSaves;
    topSpaceMap.set(record.spaceId, existingSpace);

    record.topContent.forEach((content) => {
      const existingContent = topContentMap.get(content.contentId) ?? {
        contentId: content.contentId,
        title: content.title,
        views: 0,
        saves: 0,
      };
      existingContent.views += content.views;
      existingContent.saves += content.saves;
      topContentMap.set(content.contentId, existingContent);
    });
  });

  return {
    range,
    sessionCount,
    activeSpaces: getActiveSpaces({ account: null, brandProfiles: [], spaces, liveSession: null }).length,
    attendeeCount,
    totalViews,
    totalSaves,
    saveRate,
    topSpaces: [...topSpaceMap.values()].sort((left, right) => {
      if (right.totalSaves !== left.totalSaves) {
        return right.totalSaves - left.totalSaves;
      }
      return right.totalViews - left.totalViews;
    }).slice(0, 3),
    topContent: [...topContentMap.values()].sort((left, right) => {
      if (right.saves !== left.saves) {
        return right.saves - left.saves;
      }
      return right.views - left.views;
    }).slice(0, 3),
    recentSessions: filtered.slice(0, 4),
  };
}

export function createDemoOperationsState(setup: HostSetupSnapshot | null, now = new Date()): DemoOperationsState {
  const primarySpace = getPrimaryHostSpace(setup);
  const accountName = setup?.account?.businessName ?? "Digi Workspace";
  const stamp = now.toISOString();
  const defaultHistory: OperationsSessionRecord[] = primarySpace
    ? [
        {
          sessionId: createId("session"),
          spaceId: primarySpace.id,
          spaceName: primarySpace.name,
          status: "ended",
          startedAt: new Date(now.getTime() - 36 * 60 * 60 * 1000).toISOString(),
          endedAt: new Date(now.getTime() - 35 * 60 * 60 * 1000).toISOString(),
          attendeeCount: 18,
          totalViews: 54,
          totalSaves: 14,
          topContent: [
            {
              contentId: "dealer-charger",
              title: "65W GaN charger dealer pricing",
              views: 21,
              saves: 8,
            },
          ],
        },
      ]
    : [];

  return {
    teamMembers: setup?.account
      ? [
          {
            id: createId("member"),
            displayName: `${accountName} owner`,
            phone: setup.account.primaryPhone ?? "+91 99999 99999",
            role: "owner",
            status: "active",
            joinedAt: stamp,
            lastActiveAt: stamp,
          },
          {
            id: createId("member"),
            displayName: "Kiran Patel",
            phone: "+91 99888 22110",
            role: "operator",
            status: "active",
            joinedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            lastActiveAt: new Date(now.getTime() - 40 * 60 * 1000).toISOString(),
          },
        ]
      : [],
    teamInvites: setup?.account
      ? [
          {
            id: createId("invite"),
            displayName: "Maya Kapoor",
            phone: "+91 90000 11223",
            role: "analyst",
            status: "pending",
            invitedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
            respondedAt: null,
          },
        ]
      : [],
    importJobs: primarySpace
      ? [
          {
            id: createId("import"),
            fileName: "dealer-pricing.csv",
            source: "csv",
            status: "validated",
            processedRows: 4,
            acceptedRows: 4,
            rejectedRows: 0,
            createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
            spaceId: primarySpace.id,
            rows: [
              {
                rowNumber: 2,
                status: "accepted",
                spaceName: primarySpace.name,
                brandName: setup?.brandProfiles[0]?.name ?? "Primary Brand",
                contentType: "product",
                title: "65W GaN charger dealer pricing",
                subtitle: "Dealer launch offer",
                sku: "VE-CH03",
                message: "Validated",
              },
            ],
          },
        ]
      : [],
    sessionHistory: defaultHistory,
  };
}

export function buildOperationsSnapshot(
  state: DemoOperationsState,
  spaces: HostSpace[],
  range: AnalyticsRange,
  now = new Date(),
): OperationsSnapshot {
  return {
    analytics: buildOperationsAnalytics(state.sessionHistory, spaces, range, now),
    teamMembers: state.teamMembers,
    teamInvites: state.teamInvites,
    importJobs: state.importJobs.slice().sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()),
    sessionHistory: state.sessionHistory.slice().sort((left, right) => new Date(right.endedAt ?? right.startedAt ?? 0).getTime() - new Date(left.endedAt ?? left.startedAt ?? 0).getTime()),
  };
}

export function recordDemoSessionSummary(
  state: DemoOperationsState,
  setup: HostSetupSnapshot | null,
  summary: SessionSummarySnapshot,
): DemoOperationsState {
  const space = getPrimaryHostSpace(setup);
  if (!space) {
    return state;
  }

  const nextRecord: OperationsSessionRecord = {
    sessionId: summary.sessionId,
    spaceId: space.id,
    spaceName: space.name,
    status: summary.status,
    startedAt: summary.startedAt,
    endedAt: summary.endedAt,
    attendeeCount: summary.attendeeCount,
    totalViews: summary.totalViews,
    totalSaves: summary.totalSaves,
    topContent: summary.topContent,
  };

  return {
    ...state,
    sessionHistory: [
      nextRecord,
      ...state.sessionHistory.filter((record) => record.sessionId !== summary.sessionId),
    ],
  };
}

export function applyDemoInviteTeamMember(state: DemoOperationsState, input: InviteTeamMemberInput): DemoOperationsState {
  return {
    ...state,
    teamInvites: [
      {
        id: createId("invite"),
        displayName: input.displayName.trim(),
        phone: formatPhone(input.phone),
        role: input.role,
        status: "pending",
        invitedAt: new Date().toISOString(),
        respondedAt: null,
      },
      ...state.teamInvites,
    ],
  };
}

export function applyDemoRemoveTeamAccess(state: DemoOperationsState, input: RemoveTeamAccessInput): DemoOperationsState {
  if (input.memberId) {
    return {
      ...state,
      teamMembers: state.teamMembers.filter((member) => member.id !== input.memberId || member.role === "owner"),
    };
  }

  if (input.inviteId) {
    return {
      ...state,
      teamInvites: state.teamInvites.map((invite) =>
        invite.id === input.inviteId
          ? { ...invite, status: "revoked", respondedAt: new Date().toISOString() }
          : invite,
      ),
    };
  }

  return state;
}

export function applyDemoCreateBrandProfile(
  setup: HostSetupSnapshot,
  input: CreateBrandProfileInput,
): HostSetupSnapshot {
  const createdAt = new Date().toISOString();
  const nextBrand: HostBrandProfile = {
    id: createId("brand"),
    accountId: setup.account?.id ?? createId("account"),
    name: input.name.trim(),
    logoUrl: null,
    primaryColor: input.primaryColor,
    secondaryColor: input.secondaryColor,
    fontFamily: input.fontFamily,
    isDefault: input.makeDefault,
    createdAt,
    updatedAt: createdAt,
  };

  return {
    ...setup,
    brandProfiles: setup.brandProfiles
      .map((brand) => (input.makeDefault ? { ...brand, isDefault: false } : brand))
      .concat(nextBrand),
  };
}

export function applyDemoCreateSpace(setup: HostSetupSnapshot, input: CreateSpaceInput): HostSetupSnapshot {
  const createdAt = new Date().toISOString();
  const nextSpace: HostSpace = {
    id: createId("space"),
    accountId: setup.account?.id ?? createId("account"),
    brandProfileId: input.brandProfileId,
    name: input.name.trim(),
    spaceType: input.spaceType,
    mode: input.mode,
    qrSlug: buildQrSlug(input.name, setup.spaces),
    defaultSessionDurationMinutes: input.defaultSessionDurationMinutes,
    isDefault: false,
    archivedAt: null,
    createdAt,
    updatedAt: createdAt,
  };

  return {
    ...setup,
    spaces: setup.spaces.concat(nextSpace),
  };
}

export function applyDemoAssignSpaceBrand(setup: HostSetupSnapshot, input: AssignSpaceBrandInput): HostSetupSnapshot {
  return {
    ...setup,
    spaces: setup.spaces.map((space) =>
      space.id === input.spaceId
        ? {
            ...space,
            brandProfileId: input.brandProfileId,
            updatedAt: new Date().toISOString(),
          }
        : space,
    ),
  };
}

export function applyDemoArchiveSpace(setup: HostSetupSnapshot, spaceId: string): HostSetupSnapshot {
  const nextSpaces = setup.spaces.map((space) =>
    space.id === spaceId
      ? {
          ...space,
          archivedAt: new Date().toISOString(),
          isDefault: false,
          updatedAt: new Date().toISOString(),
        }
      : space,
  );
  const activeSpaces = nextSpaces.filter((space) => !space.archivedAt);
  const hasDefault = activeSpaces.some((space) => space.isDefault);

  return {
    ...setup,
    spaces: nextSpaces.map((space, index) =>
      !space.archivedAt && !hasDefault && index === nextSpaces.findIndex((candidate) => !candidate.archivedAt)
        ? { ...space, isDefault: true }
        : space,
    ),
  };
}

export function applyDemoDeleteSpace(setup: HostSetupSnapshot, spaceId: string): HostSetupSnapshot {
  const remaining = setup.spaces.filter((space) => space.id !== spaceId);
  if (!remaining.length) {
    return setup;
  }

  const activeSpaces = remaining.filter((space) => !space.archivedAt);
  const hasDefault = activeSpaces.some((space) => space.isDefault);

  return {
    ...setup,
    spaces: remaining.map((space, index) =>
      !space.archivedAt && !hasDefault && index === remaining.findIndex((candidate) => !candidate.archivedAt)
        ? { ...space, isDefault: true }
        : space,
    ),
  };
}

export function applyDemoImportJob(
  state: DemoOperationsState,
  result: ReturnType<typeof validateCatalogImportCsv>,
  input: SubmitCatalogImportInput,
): DemoOperationsState {
  const nextJob: CatalogImportJob = {
    id: createId("import"),
    fileName: input.fileName.trim() || "catalog-import.csv",
    source: "csv",
    status: result.status,
    processedRows: result.processedRows,
    acceptedRows: result.acceptedRows,
    rejectedRows: result.rejectedRows,
    createdAt: new Date().toISOString(),
    spaceId: input.spaceId,
    rows: result.rows,
  };

  return {
    ...state,
    importJobs: [nextJob, ...state.importJobs],
  };
}

export function canArchiveSpace(spaces: HostSpace[], spaceId: string): boolean {
  const activeSpaces = spaces.filter((space) => !space.archivedAt);
  return activeSpaces.length > 1 && activeSpaces.some((space) => space.id === spaceId);
}

export function canDeleteSpace(spaces: HostSpace[], spaceId: string): boolean {
  return spaces.length > 1 && spaces.some((space) => space.id === spaceId);
}

export function describeImportStatus(status: ImportJobStatus): string {
  switch (status) {
    case "validated":
      return "Validated";
    case "partial":
      return "Partial";
    default:
      return "Failed";
  }
}

export function getBrandNameForSpace(brands: HostBrandProfile[], space: HostSpace): string {
  return brands.find((brand) => brand.id === space.brandProfileId)?.name ?? "Unassigned brand";
}

export function createEmptyOperationsSnapshot(range: AnalyticsRange = "30d"): OperationsSnapshot {
  return {
    analytics: {
      range,
      sessionCount: 0,
      activeSpaces: 0,
      attendeeCount: 0,
      totalViews: 0,
      totalSaves: 0,
      saveRate: 0,
      topSpaces: [],
      topContent: [],
      recentSessions: [],
    },
    teamMembers: [],
    teamInvites: [],
    importJobs: [],
    sessionHistory: [],
  };
}

export function validateBrandProfileInput(input: CreateBrandProfileInput): string | null {
  if (!input.name.trim()) {
    return "Brand name is required.";
  }

  if (!isValidHexColor(input.primaryColor) || !isValidHexColor(input.secondaryColor)) {
    return "Brand colors must be 6-digit hex values.";
  }

  return null;
}
