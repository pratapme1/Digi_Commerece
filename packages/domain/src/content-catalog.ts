import type { AttendeeContactCard, AttendeeProductCard, AttendeeScreen, AttendeeSpacePreset } from "./attendee";
import { getAttendeeSpacePreset } from "./attendee";
import type { LiveContentItem } from "./live-room";
import type { SpaceType } from "./host";

export type SpaceContentType = "product" | "contact" | "menu" | "story" | "offer";
export type SpaceContentSource = "seed" | "import";

export interface SpaceContentEntry {
  id: string;
  spaceId: string | null;
  source: SpaceContentSource;
  contentType: SpaceContentType;
  title: string;
  subtitle: string;
  sku: string | null;
  collectionId: string;
  screen: AttendeeScreen;
  cardId: string;
  productIndex?: number;
  rank: number;
  metadata: Record<string, unknown>;
}

export interface SpaceContentCatalog {
  spaceId: string;
  entries: SpaceContentEntry[];
  updatedAt: string;
}

interface ImportableCatalogRow {
  contentType: string;
  message?: string;
  rowNumber: number;
  sku: string;
  status: string;
  subtitle: string;
  title: string;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
}

function createEntryId(prefix: string, value: string) {
  return `${prefix}-${slugify(value)}`;
}

function mapContentTypeToCollectionId(contentType: SpaceContentType): string {
  switch (contentType) {
    case "product":
      return "products";
    case "contact":
      return "contacts";
    case "menu":
      return "menu";
    default:
      return "live";
  }
}

function mapContentTypeToScreen(contentType: SpaceContentType): AttendeeScreen {
  switch (contentType) {
    case "product":
      return "ps";
    case "contact":
      return "cs";
    case "menu":
      return "ms";
    default:
      return "ls";
  }
}

function createEntry(input: Omit<SpaceContentEntry, "collectionId" | "screen"> & { collectionId?: string; screen?: AttendeeScreen }): SpaceContentEntry {
  return {
    ...input,
    collectionId: input.collectionId ?? mapContentTypeToCollectionId(input.contentType),
    screen: input.screen ?? mapContentTypeToScreen(input.contentType),
  };
}

function buildSeedEntriesFromPreset(spaceType: SpaceType, spaceId: string | null): SpaceContentEntry[] {
  const preset = getAttendeeSpacePreset(spaceType);
  const entries: SpaceContentEntry[] = [];
  const products = preset.content.products ?? [];

  products.forEach((product, index) => {
    entries.push(
      createEntry({
        id: createEntryId("product", product.id),
        spaceId,
        source: "seed",
        contentType: "product",
        title: product.title,
        subtitle: `${product.category} · ${product.price}`,
        sku: product.sku,
        cardId: product.id,
        productIndex: index,
        rank: index,
        metadata: {
          badge: product.badge ?? null,
          category: product.category,
          price: product.price,
          mrp: product.mrp,
          discount: product.discount,
          moq: product.moq,
          margin: product.margin,
          specs: product.specs,
        },
      }),
    );
  });

  if (preset.content.contact) {
    entries.push(
      createEntry({
        id: "contact-host-contact",
        spaceId,
        source: "seed",
        contentType: "contact",
        title: preset.content.contact.name,
        subtitle: `${preset.content.contact.role} · ${preset.content.contact.company}`,
        sku: null,
        cardId: "host-contact",
        rank: 0,
        metadata: {
          role: preset.content.contact.role,
          company: preset.content.contact.company,
          phone: preset.content.contact.phone,
          email: preset.content.contact.email,
          linkedin: preset.content.contact.linkedin,
          note: preset.content.contact.note,
          verificationLabel: preset.content.contact.verificationLabel,
        },
      }),
    );
  }

  if (preset.content.menu) {
    entries.push(
      createEntry({
        id: "menu-special",
        spaceId,
        source: "seed",
        contentType: "menu",
        title: preset.content.menu.special.title,
        subtitle: preset.content.menu.special.description,
        sku: null,
        cardId: "chef-special",
        rank: 0,
        metadata: {
          serviceName: preset.content.menu.serviceName,
          serviceDescription: preset.content.menu.serviceDescription,
          serviceDate: preset.content.menu.serviceDate,
          price: preset.content.menu.special.price,
          description: preset.content.menu.special.description,
          section: "Chef special",
          tags: ["Special"],
          special: true,
        },
      }),
    );

    let menuRank = 1;
    preset.content.menu.sections.forEach((section) => {
      section.items.forEach((item) => {
        entries.push(
          createEntry({
            id: createEntryId("menu", `${section.title}-${item.title}`),
            spaceId,
            source: "seed",
            contentType: "menu",
            title: item.title,
            subtitle: item.description,
            sku: null,
            cardId: createEntryId("menu-card", `${section.title}-${item.title}`),
            rank: menuRank,
            metadata: {
              serviceName: preset.content.menu?.serviceName,
              serviceDescription: preset.content.menu?.serviceDescription,
              serviceDate: preset.content.menu?.serviceDate,
              price: item.price,
              description: item.description,
              section: section.title,
              tags: item.tags ?? [],
              special: false,
            },
          }),
        );
        menuRank += 1;
      });
    });
  }

  if (preset.content.live) {
    preset.content.live.timeline.forEach((item, index) => {
      entries.push(
        createEntry({
          id: createEntryId("story", item.id),
          spaceId,
          source: "seed",
          contentType: index === 0 ? "offer" : "story",
          title: item.title,
          subtitle: item.timestamp,
          sku: null,
          cardId: item.id,
          rank: index,
          metadata: {
            icon: item.icon,
            timestamp: item.timestamp,
            saveTitle: item.saveTitle,
            presenterLabel: preset.content.live?.presenterLabel,
            spotlightEyebrow: preset.content.live?.spotlightEyebrow,
            spotlightTitle: preset.content.live?.spotlightTitle,
            spotlightMeta: preset.content.live?.spotlightMeta,
            timelineLabel: preset.content.live?.timelineLabel,
          },
        }),
      );
    });
  }

  return entries;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function sortCatalogEntries(entries: SpaceContentEntry[]): SpaceContentEntry[] {
  return entries
    .slice()
    .sort((left, right) => {
      if (left.source !== right.source) {
        return left.source === "import" ? -1 : 1;
      }

      if (left.rank !== right.rank) {
        return left.rank - right.rank;
      }

      return left.title.localeCompare(right.title);
    });
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function toProductCard(entry: SpaceContentEntry) {
  const metadata = entry.metadata;
  return {
    id: entry.cardId,
    sku: entry.sku ?? asString(metadata.sku, entry.cardId),
    badge: asString(metadata.badge) || undefined,
    category: asString(metadata.category, entry.source === "import" ? "Imported product" : "Product"),
    title: entry.title,
    price: asString(metadata.price, entry.source === "import" ? "Host-managed" : ""),
    mrp: asString(metadata.mrp),
    discount: asString(metadata.discount, entry.source === "import" ? "Imported" : ""),
    moq: asString(metadata.moq, entry.source === "import" ? "Imported via CSV" : ""),
    margin: asString(metadata.margin, entry.subtitle || "Host-managed item"),
    specs: Array.isArray(metadata.specs)
      ? (metadata.specs as Array<{ label: string; value: string }>)
      : entry.sku
        ? [{ label: "SKU", value: entry.sku }]
        : [{ label: "Source", value: entry.source === "import" ? "Imported" : "Seeded" }],
  };
}

function toContactCard(entry: SpaceContentEntry) {
  const metadata = entry.metadata;
  return {
    name: entry.title,
    role: asString(metadata.role, entry.subtitle || "Host contact"),
    company: asString(metadata.company, "Host workspace"),
    phone: asString(metadata.phone, "Available from host"),
    email: asString(metadata.email, "Shared on request"),
    linkedin: asString(metadata.linkedin, "Host-managed contact"),
    note: asString(metadata.note, entry.subtitle || "Host shared this contact"),
    verificationLabel: asString(metadata.verificationLabel, "Host shared"),
  };
}

function buildMenuContent(entries: SpaceContentEntry[], fallback: AttendeeSpacePreset["content"]["menu"]) {
  const base = fallback ?? null;
  const sortedEntries = sortCatalogEntries(entries);
  const specialEntry = sortedEntries.find((entry) => Boolean(entry.metadata.special)) ?? sortedEntries[0] ?? null;
  const grouped = new Map<string, Array<typeof sortedEntries[number]>>();

  sortedEntries.forEach((entry) => {
    const section = asString(entry.metadata.section, "Menu");
    const current = grouped.get(section) ?? [];
    current.push(entry);
    grouped.set(section, current);
  });

  return {
    serviceName: asString(specialEntry?.metadata.serviceName, base?.serviceName ?? "Current menu"),
    serviceDescription: asString(specialEntry?.metadata.serviceDescription, base?.serviceDescription ?? "Host-managed menu"),
    serviceDate: asString(specialEntry?.metadata.serviceDate, base?.serviceDate ?? "Today"),
    special: {
      title: specialEntry?.title ?? base?.special.title ?? "Chef special",
      price: asString(specialEntry?.metadata.price, base?.special.price ?? ""),
      description: specialEntry?.subtitle ?? base?.special.description ?? "Host spotlight",
    },
    sections: [...grouped.entries()].map(([title, sectionEntries]) => ({
      title,
      items: sectionEntries.map((entry) => ({
        title: entry.title,
        price: asString(entry.metadata.price, entry.sku ?? ""),
        description: entry.subtitle || asString(entry.metadata.description, "Host-managed menu item"),
        tags: asStringArray(entry.metadata.tags),
      })),
    })),
  };
}

function buildLiveContent(entries: SpaceContentEntry[], fallback: AttendeeSpacePreset["content"]["live"]) {
  const base = fallback ?? null;
  const sortedEntries = sortCatalogEntries(entries);
  const spotlight = sortedEntries[0] ?? null;

  return {
    presenterLabel: asString(spotlight?.metadata.presenterLabel, base?.presenterLabel ?? "Host spotlight"),
    spotlightEyebrow: asString(spotlight?.metadata.spotlightEyebrow, base?.spotlightEyebrow ?? "Live now"),
    spotlightTitle: spotlight?.title ?? base?.spotlightTitle ?? "Current live spotlight",
    spotlightMeta: Array.isArray(spotlight?.metadata.spotlightMeta)
      ? (spotlight?.metadata.spotlightMeta as Array<{ label: string; value: string }>)
      : base?.spotlightMeta ?? [],
    timelineLabel: asString(spotlight?.metadata.timelineLabel, base?.timelineLabel ?? "Live timeline"),
    timeline: sortedEntries.map((entry, index) => ({
      id: entry.cardId,
      icon: asString(entry.metadata.icon, index === 0 ? "★" : "•"),
      title: entry.title,
      timestamp: asString(entry.metadata.timestamp, entry.subtitle || "Host update"),
      saveTitle: asString(entry.metadata.saveTitle, entry.title),
    })),
  };
}

function buildFeatureFromEntries(
  spaceType: SpaceType,
  products: AttendeeProductCard[],
  contacts: AttendeeContactCard[],
  liveEntries: SpaceContentEntry[],
  fallback: AttendeeSpacePreset["feature"],
) {
  if (spaceType === "store" && products.length) {
    const product = products[0];
    return {
      screen: "ps" as const,
      collectionId: "products",
      cardId: product.id,
      productIndex: 0,
      eyebrow: "Featured now",
      title: product.title,
      copy: "Open the highlighted item first, then browse the rest of the host-managed catalog for this space.",
      metaOne: product.category,
      metaTwo: product.price || product.margin,
      openLabel: "Open featured item",
      saveLabel: "Save featured item",
      saveTitle: product.title,
    };
  }

  if (spaceType === "restaurant" && liveEntries.length) {
    const liveEntry = liveEntries[0];
    return {
      screen: liveEntry.screen,
      collectionId: liveEntry.collectionId,
      cardId: liveEntry.cardId,
      eyebrow: "Featured now",
      title: liveEntry.title,
      copy: "The host highlighted this menu or live item for everyone joining the room right now.",
      metaOne: "Live room",
      metaTwo: liveEntry.subtitle || "Host-managed content",
      openLabel: "Open featured item",
      saveLabel: "Save featured item",
      saveTitle: liveEntry.title,
    };
  }

  if (contacts.length) {
    const contact = contacts[0];
    return {
      screen: "cs" as const,
      collectionId: "contacts",
      cardId: "host-contact",
      eyebrow: "Featured contact",
      title: contact.name,
      copy: "The host shared a verified point of contact for this space.",
      metaOne: contact.role,
      metaTwo: contact.company,
      openLabel: "Open contact",
      saveLabel: "Save contact",
      saveTitle: contact.name,
    };
  }

  if (liveEntries.length) {
    const liveEntry = liveEntries[0];
    return {
      screen: liveEntry.screen,
      collectionId: liveEntry.collectionId,
      cardId: liveEntry.cardId,
      eyebrow: "Live update",
      title: liveEntry.title,
      copy: "Open the current host-managed spotlight or keep browsing the rest of the room.",
      metaOne: "Live room",
      metaTwo: liveEntry.subtitle || "Host-managed content",
      openLabel: "Open live item",
      saveLabel: "Save live item",
      saveTitle: liveEntry.title,
    };
  }

  return fallback;
}

export function createSeedSpaceContentEntries(spaceType: SpaceType, spaceId: string | null = null): SpaceContentEntry[] {
  return buildSeedEntriesFromPreset(spaceType, spaceId);
}

export function createSpaceContentCatalog(spaceId: string, spaceType: SpaceType, entries?: SpaceContentEntry[]): SpaceContentCatalog {
  return {
    spaceId,
    entries: (entries ?? createSeedSpaceContentEntries(spaceType, spaceId)).map((entry, index) => ({
      ...entry,
      spaceId,
      rank: entry.rank ?? index,
    })),
    updatedAt: new Date().toISOString(),
  };
}

export function findSpaceContentCatalog(catalogs: SpaceContentCatalog[], spaceId: string | null | undefined): SpaceContentCatalog | null {
  if (!spaceId) {
    return null;
  }

  return catalogs.find((catalog) => catalog.spaceId === spaceId) ?? null;
}

export function upsertSpaceContentCatalog(catalogs: SpaceContentCatalog[], nextCatalog: SpaceContentCatalog): SpaceContentCatalog[] {
  const existing = catalogs.some((catalog) => catalog.spaceId === nextCatalog.spaceId);
  const next = existing
    ? catalogs.map((catalog) => (catalog.spaceId === nextCatalog.spaceId ? nextCatalog : catalog))
    : catalogs.concat(nextCatalog);

  return next.sort((left, right) => left.spaceId.localeCompare(right.spaceId));
}

export function removeSpaceContentCatalog(catalogs: SpaceContentCatalog[], spaceId: string): SpaceContentCatalog[] {
  return catalogs.filter((catalog) => catalog.spaceId !== spaceId);
}

export function createSeedContentCatalogsForSpaces(spaces: Array<{ id: string; spaceType: SpaceType }>): SpaceContentCatalog[] {
  return spaces.map((space) => createSpaceContentCatalog(space.id, space.spaceType));
}

export function mergeImportRowsIntoSpaceContentEntries(
  spaceId: string,
  spaceType: SpaceType,
  existingEntries: SpaceContentEntry[],
  rows: ImportableCatalogRow[],
): SpaceContentEntry[] {
  const baseEntries = existingEntries.filter((entry) => entry.source !== "import");
  const acceptedRows = rows.filter((row) => row.status === "accepted");
  const importEntries = acceptedRows.map((row, index) => {
    const contentType = (row.contentType === "product" || row.contentType === "contact" || row.contentType === "menu" || row.contentType === "story" || row.contentType === "offer"
      ? row.contentType
      : "story") as SpaceContentType;
    const cardId = row.sku?.trim()
      ? row.sku.trim()
      : createEntryId(contentType, row.title);

    return createEntry({
      id: createEntryId("import", `${row.rowNumber}-${row.title}-${cardId}`),
      spaceId,
      source: "import",
      contentType,
      title: row.title.trim(),
      subtitle: row.subtitle.trim(),
      sku: row.sku.trim() || null,
      cardId,
      rank: index,
      metadata:
        contentType === "product"
          ? {
              badge: "Imported",
              category: spaceType === "store" ? "Catalog item" : "Imported product",
              price: "Host-managed",
              mrp: row.sku.trim() ? `SKU ${row.sku.trim()}` : "",
              discount: "Imported",
              moq: "Imported via CSV",
              margin: row.subtitle.trim() || "Host-managed item",
              specs: row.sku.trim()
                ? [{ label: "SKU", value: row.sku.trim() }]
                : [{ label: "Source", value: "Imported catalog" }],
            }
          : contentType === "contact"
            ? {
                role: row.subtitle.trim() || "Host contact",
                company: "Host workspace",
                phone: "Available from host",
                email: "Shared on request",
                linkedin: "Host-managed contact",
                note: row.message?.trim() || "Imported contact",
                verificationLabel: "Host shared",
              }
            : contentType === "menu"
              ? {
                  section: "Imported menu",
                  price: row.sku.trim() ? `SKU ${row.sku.trim()}` : "",
                  description: row.subtitle.trim() || "Imported menu item",
                  tags: ["Imported"],
                  serviceName: "Current menu",
                  serviceDescription: "Host-managed menu",
                  serviceDate: "Today",
                  special: index === 0,
                }
              : {
                  icon: contentType === "offer" ? "★" : "•",
                  timestamp: row.subtitle.trim() || "Imported update",
                  saveTitle: row.title.trim(),
                  presenterLabel: "Host spotlight",
                  spotlightEyebrow: contentType === "offer" ? "Featured offer" : "Live update",
                  spotlightMeta: [
                    { label: "Source", value: "Imported catalog" },
                    { label: "Space", value: spaceType },
                  ],
                  timelineLabel: "Live timeline",
                },
    });
  });

  return [...baseEntries, ...importEntries];
}

export function buildAttendeePresetFromEntries(spaceType: SpaceType, entries: SpaceContentEntry[]): AttendeeSpacePreset {
  const fallback = getAttendeeSpacePreset(spaceType);
  const resolvedEntries = entries.length ? sortCatalogEntries(entries) : createSeedSpaceContentEntries(spaceType, null);
  const productEntries = resolvedEntries.filter((entry) => entry.contentType === "product");
  const contactEntries = resolvedEntries.filter((entry) => entry.contentType === "contact");
  const menuEntries = resolvedEntries.filter((entry) => entry.contentType === "menu");
  const liveEntries = resolvedEntries.filter((entry) => entry.contentType === "story" || entry.contentType === "offer");
  const products = productEntries.length ? productEntries.map(toProductCard) : fallback.content.products ?? [];
  const contact = contactEntries.length ? toContactCard(contactEntries[0]) : fallback.content.contact ?? null;
  const menu = menuEntries.length ? buildMenuContent(menuEntries, fallback.content.menu) : fallback.content.menu ?? null;
  const live = liveEntries.length ? buildLiveContent(liveEntries, fallback.content.live) : fallback.content.live ?? null;
  const collections = [
    products.length
      ? {
          label: "Products",
          title: spaceType === "store" ? "Dealer products" : "Products",
          description: "Browse host-managed products and saved highlights for this space.",
          count: `${products.length} items`,
          icon: "◆",
          openLabel: "Open products",
          note: "Host-managed content",
          collectionId: "products",
          screen: "ps" as const,
          cardId: products[0]?.id ?? "products",
          productIndex: 0,
        }
      : null,
    contact
      ? {
          label: "Contacts",
          title: "Verified contact",
          description: "Open the primary contact shared for this live space.",
          count: "1 contact",
          icon: "☎",
          openLabel: "Open contact",
          note: "Verified by host",
          collectionId: "contacts",
          screen: "cs" as const,
          cardId: "host-contact",
        }
      : null,
    menu
      ? {
          label: "Menu",
          title: menu.serviceName,
          description: "Browse the host-managed menu and featured items.",
          count: `${menu.sections.reduce((total, section) => total + section.items.length, 0)} items`,
          icon: "🍽",
          openLabel: "Open menu",
          note: "Live menu",
          collectionId: "menu",
          screen: "ms" as const,
          cardId: "menu",
        }
      : null,
    liveEntries.length
      ? {
          label: "Live",
          title: live?.spotlightTitle ?? "Current spotlight",
          description: "Follow the current spotlight and earlier host-managed shares.",
          count: `${liveEntries.length} updates`,
          icon: "✦",
          openLabel: "Open live",
          note: "Live room",
          collectionId: "live",
          screen: "ls" as const,
          cardId: liveEntries[0]?.cardId ?? "live-spotlight",
        }
      : null,
  ].filter(Boolean) as AttendeeSpacePreset["collections"];

  const searchIndex = [
    ...productEntries.map((entry, index) => ({
      group: "Products",
      title: entry.title,
      meta: entry.subtitle || asString(entry.metadata.category, "Host-managed product"),
      collectionId: "products",
      screen: "ps" as const,
      cardId: entry.cardId,
      productIndex: index,
      contentId: entry.cardId,
    })),
    ...contactEntries.map((entry) => ({
      group: "Contacts",
      title: entry.title,
      meta: entry.subtitle || asString(entry.metadata.role, "Host contact"),
      collectionId: "contacts",
      screen: "cs" as const,
      cardId: entry.cardId,
      contentId: entry.cardId,
    })),
    ...menuEntries.map((entry) => ({
      group: "Menu",
      title: entry.title,
      meta: entry.subtitle || asString(entry.metadata.section, "Menu"),
      collectionId: "menu",
      screen: "ms" as const,
      cardId: entry.cardId,
      contentId: entry.cardId,
    })),
    ...liveEntries.map((entry) => ({
      group: "Live",
      title: entry.title,
      meta: entry.subtitle || asString(entry.metadata.timestamp, "Live update"),
      collectionId: "live",
      screen: "ls" as const,
      cardId: entry.cardId,
      contentId: entry.cardId,
    })),
  ];

  return {
    ...fallback,
    feature: buildFeatureFromEntries(spaceType, products, contact ? [contact] : [], liveEntries, fallback.feature),
    collections,
    searchIndex,
    content: {
      ...(products.length ? { products } : {}),
      ...(contact ? { contact } : {}),
      ...(menu ? { menu } : {}),
      ...(live ? { live } : {}),
    },
    emptyStateCopy: entries.length
      ? fallback.emptyStateCopy
      : "The host has not published attendee-facing content for this space yet.",
  };
}

export function buildLiveContentLibraryFromEntries(spaceType: SpaceType, entries: SpaceContentEntry[]): LiveContentItem[] {
  const resolvedEntries = entries.length ? sortCatalogEntries(entries) : createSeedSpaceContentEntries(spaceType, null);
  const pinnable = resolvedEntries.filter((entry) => entry.screen === "ps" || entry.screen === "cs" || entry.screen === "ms" || entry.screen === "ls");

  return pinnable.slice(0, 8).map((entry, index) => ({
    id: entry.id || createEntryId("live", `${entry.title}-${index}`),
    title: entry.title,
    subtitle: entry.subtitle || asString(entry.metadata.price) || asString(entry.metadata.timestamp) || "Host-managed content",
    collectionId: entry.collectionId,
    screen: entry.screen,
    cardId: entry.cardId,
    productIndex: entry.productIndex,
  }));
}
