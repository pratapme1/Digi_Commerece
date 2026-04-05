import type { SessionStatus, SpaceMode, SpaceType, VerificationTier } from "./host";
import type { LiveContentItem } from "./live-room";
import type { SpaceContentEntry } from "./content-catalog";

export type AttendeeScreen = "ps" | "cs" | "ms" | "ls";
export type AttendeeRoomStatus = Extract<SessionStatus, "live" | "ending" | "ended"> | "inactive";

export interface AttendeeBrandTheme {
  name: string;
  mark: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}

export interface AttendeeFeatureTarget {
  screen: AttendeeScreen;
  collectionId: string;
  cardId: string;
  productIndex?: number;
}

export interface AttendeeFeature extends AttendeeFeatureTarget {
  eyebrow: string;
  title: string;
  copy: string;
  metaOne: string;
  metaTwo: string;
  openLabel: string;
  saveLabel: string;
  saveTitle: string;
}

export interface AttendeeCollectionLink extends AttendeeFeatureTarget {
  label: string;
  title: string;
  description: string;
  count: string;
  icon: string;
  openLabel: string;
  note: string;
}

export interface AttendeeSearchResult extends AttendeeFeatureTarget {
  group: string;
  title: string;
  meta: string;
  contentId?: string;
}

export interface AttendeeProductCard {
  id: string;
  sku: string;
  badge?: string;
  category: string;
  title: string;
  price: string;
  mrp: string;
  discount: string;
  moq: string;
  margin: string;
  specs: Array<{ label: string; value: string }>;
}

export interface AttendeeContactCard {
  name: string;
  role: string;
  company: string;
  phone: string;
  email: string;
  linkedin: string;
  note: string;
  verificationLabel: string;
}

export interface AttendeeMenuItem {
  title: string;
  price: string;
  description: string;
  tags?: string[];
}

export interface AttendeeMenuSection {
  title: string;
  items: AttendeeMenuItem[];
}

export interface AttendeeMenuContent {
  serviceName: string;
  serviceDescription: string;
  serviceDate: string;
  special: {
    title: string;
    price: string;
    description: string;
  };
  sections: AttendeeMenuSection[];
}

export interface AttendeeLiveTimelineItem {
  id: string;
  icon: string;
  title: string;
  timestamp: string;
  saveTitle: string;
}

export interface AttendeeLiveContent {
  presenterLabel: string;
  spotlightEyebrow: string;
  spotlightTitle: string;
  spotlightMeta: Array<{ label: string; value: string }>;
  timelineLabel: string;
  timeline: AttendeeLiveTimelineItem[];
}

export interface AttendeeSpaceContent {
  products?: AttendeeProductCard[];
  contact?: AttendeeContactCard;
  menu?: AttendeeMenuContent;
  live?: AttendeeLiveContent;
}

export interface AttendeeSpacePreset {
  typeLabel: string;
  bootSubtitle: string;
  overviewSubtitle: string;
  searchPlaceholder: string;
  searchMeta: string;
  collectionSectionCopy: string;
  footNote: string;
  emptySearchCopy: string;
  emptyStateCopy: string;
  feature: AttendeeFeature | null;
  collections: AttendeeCollectionLink[];
  searchIndex: AttendeeSearchResult[];
  content: AttendeeSpaceContent;
}

export interface AttendeeRoomBootstrap {
  spaceId: string | null;
  qrSlug: string;
  attendeeUrl: string;
  spaceName: string;
  spaceType: SpaceType;
  mode: SpaceMode;
  verificationTier: VerificationTier | null;
  verificationLabel: string;
  brand: AttendeeBrandTheme;
  status: AttendeeRoomStatus;
  sessionId: string | null;
  startedAt: string | null;
  endsAt: string | null;
  endedAt: string | null;
  attendeeCount: number;
  pinnedItem: LiveContentItem | null;
  contentEntries: SpaceContentEntry[];
}

const STORE_PRODUCTS: AttendeeProductCard[] = [
  {
    id: "VE-C01",
    sku: "VE-C01",
    badge: "Hot",
    category: "Cables",
    title: "USB-C Braided Cable 1m",
    price: "₹149",
    mrp: "₹180",
    discount: "−18%",
    moq: "MOQ 50 units",
    margin: "Dealer margin 42%",
    specs: [
      { label: "Power", value: "100W PD" },
      { label: "Data", value: "10 Gbps" },
      { label: "Material", value: "Nylon braid" },
      { label: "Stock", value: "1,000 units" },
    ],
  },
  {
    id: "VE-C02",
    sku: "VE-C02",
    badge: "New",
    category: "Cables",
    title: "USB-C Braided Cable 2m",
    price: "₹199",
    mrp: "₹240",
    discount: "−17%",
    moq: "MOQ 50 units",
    margin: "Dealer margin 42%",
    specs: [
      { label: "Power", value: "100W PD" },
      { label: "Length", value: "2 metres" },
      { label: "Material", value: "Nylon braid" },
      { label: "Stock", value: "800 units" },
    ],
  },
  {
    id: "VE-CH03",
    sku: "VE-CH03",
    badge: "Hot",
    category: "Charging",
    title: "65W GaN Dual USB-C Charger",
    price: "₹899",
    mrp: "₹1,199",
    discount: "−25%",
    moq: "MOQ 25 units",
    margin: "Dealer margin 44%",
    specs: [
      { label: "Output", value: "65W GaN" },
      { label: "Ports", value: "2× USB-C" },
      { label: "Protocol", value: "PD 3.0" },
      { label: "Stock", value: "500 units" },
    ],
  },
  {
    id: "VE-PB01",
    sku: "VE-PB01",
    category: "Power banks",
    title: "10,000mAh Power Bank",
    price: "₹799",
    mrp: "₹999",
    discount: "−20%",
    moq: "MOQ 25 units",
    margin: "Dealer margin 40%",
    specs: [
      { label: "Capacity", value: "10,000mAh" },
      { label: "Output", value: "22.5W" },
      { label: "Ports", value: "USB-C + A" },
      { label: "Stock", value: "750 units" },
    ],
  },
  {
    id: "VE-PB02",
    sku: "VE-PB02",
    badge: "New",
    category: "Power banks",
    title: "20,000mAh Power Bank",
    price: "₹1,299",
    mrp: "₹1,699",
    discount: "−24%",
    moq: "MOQ 20 units",
    margin: "Dealer margin 43%",
    specs: [
      { label: "Capacity", value: "20,000mAh" },
      { label: "Output", value: "45W" },
      { label: "Ports", value: "2× USB-C" },
      { label: "Stock", value: "400 units" },
    ],
  },
  {
    id: "VE-CH06",
    sku: "VE-CH06",
    category: "Charging",
    title: "Wireless Charging Pad 15W",
    price: "₹599",
    mrp: "₹799",
    discount: "−25%",
    moq: "MOQ 30 units",
    margin: "Dealer margin 41%",
    specs: [
      { label: "Power", value: "15W Qi" },
      { label: "Compat.", value: "All Qi devices" },
      { label: "Cert.", value: "BIS, CE" },
      { label: "Stock", value: "600 units" },
    ],
  },
];

const HOST_CONTACT: AttendeeContactCard = {
  name: "Ananya Reddy",
  role: "Chief Executive Officer",
  company: "NextGen Ventures Pvt. Ltd.",
  phone: "+91 98765 43210",
  email: "ananya@nextgen.in",
  linkedin: "linkedin.com/in/ananya-r",
  note: "WhatsApp available",
  verificationLabel: "GST Verified",
};

const RESTAURANT_MENU: AttendeeMenuContent = {
  serviceName: "Amara Kitchen",
  serviceDescription: "Modern Indian · Fine casual",
  serviceDate: "26 January 2026",
  special: {
    title: "Lamb raan with saffron rice",
    price: "₹680",
    description: "Slow-braised for 8 hours. Served with roomali roti and mint raita.",
  },
  sections: [
    {
      title: "Starters",
      items: [
        {
          title: "Pani Puri Shot",
          price: "₹220",
          description: "Jaljeera water, tamarind chutney, potato masala.",
          tags: ["Veg"],
        },
        {
          title: "Tandoori Prawns",
          price: "₹480",
          description: "Jumbo king prawns, ajwain marinade, pickled onion.",
          tags: ["Signature"],
        },
        {
          title: "Dal Ke Kabab",
          price: "₹280",
          description: "Chana dal, fresh herbs, smoked chutney.",
          tags: ["Veg", "New"],
        },
      ],
    },
    {
      title: "Mains",
      items: [
        {
          title: "Butter Chicken",
          price: "₹420",
          description: "Old Delhi recipe, stone-ground spices, charcoal naan.",
        },
        {
          title: "Paneer Lababdar",
          price: "₹360",
          description: "Fresh cottage cheese, rich tomato gravy, kasuri methi.",
          tags: ["Veg"],
        },
        {
          title: "Hyderabadi Dum Biryani",
          price: "₹520",
          description: "Slow-cooked, saffron kewra, served with raita.",
          tags: ["Spicy"],
        },
      ],
    },
    {
      title: "Desserts",
      items: [
        {
          title: "Gulab Jamun Cheesecake",
          price: "₹240",
          description: "Indian fusion cheesecake with rose water and pistachio.",
          tags: ["Veg", "New"],
        },
        {
          title: "Kulfi Falooda",
          price: "₹180",
          description: "Malai kulfi, rose syrup, basil seeds, vermicelli.",
          tags: ["Veg"],
        },
      ],
    },
  ],
};

const STORE_LIVE: AttendeeLiveContent = {
  presenterLabel: "Live · Vega Dealer Day",
  spotlightEyebrow: "Presented now",
  spotlightTitle: "65W GaN Charger — Dealer Exclusive Price",
  spotlightMeta: [
    { label: "Dealer price", value: "₹899" },
    { label: "Margin", value: "44%" },
    { label: "In stock", value: "500" },
  ],
  timelineLabel: "Earlier in this session",
  timeline: [
    {
      id: "launch-sheet",
      icon: "📋",
      title: "Retail launch sheet",
      timestamp: "Shared 14 min ago",
      saveTitle: "Retail launch sheet",
    },
    {
      id: "pricing",
      icon: "🏷️",
      title: "Volume pricing — up to 22% off",
      timestamp: "Shared 29 min ago",
      saveTitle: "Volume pricing",
    },
    {
      id: "contacts",
      icon: "👥",
      title: "Sales team contacts · 5 people",
      timestamp: "Shared at start",
      saveTitle: "Sales team contacts",
    },
  ],
};

const ATTENDEE_PRESETS: Record<SpaceType, AttendeeSpacePreset> = {
  store: {
    typeLabel: "Store space",
    bootSubtitle:
      "Enter the live dealer showcase for this room. Browse pricing, products, and saved contacts without installing anything.",
    overviewSubtitle: "Open the featured item or browse only the collections shared in this dealer session.",
    searchPlaceholder: "Search products, offers, or contacts",
    searchMeta: "Search is instant from the current session cache. No loading state once the attendee enters.",
    collectionSectionCopy: "Only the pricing, live shares, and contacts attached to this dealer space appear here.",
    footNote: "Saving always leaves Spaces through your own device flow. Unsaved dealer content disappears when the session ends.",
    emptySearchCopy: "Try a product line, pricing term, or the host contact shared in this room.",
    emptyStateCopy: "The host has not pushed the dealer set into this space yet. Keep the page open and refresh if the live room changes.",
    feature: {
      screen: "ps",
      collectionId: "products",
      cardId: "VE-CH03",
      productIndex: 2,
      eyebrow: "Featured now",
      title: "65W GaN charger dealer pricing",
      copy: "Start with the live offer, then move through the rest of the line without leaving this session.",
      metaOne: "Live offer",
      metaTwo: "6 items ready",
      openLabel: "Open featured item",
      saveLabel: "Save featured item",
      saveTitle: "Featured dealer pricing",
    },
    collections: [
      {
        screen: "ps",
        collectionId: "products",
        cardId: "VE-C01",
        productIndex: 0,
        label: "Catalog",
        title: "Dealer products",
        description: "Six fast-moving charging and cable products with pricing, margin, and stock context.",
        count: "6 items",
        icon: "⚡",
        openLabel: "Open products",
        note: "Browse card by card or jump by category.",
      },
      {
        screen: "ls",
        collectionId: "live",
        cardId: "live-spotlight",
        label: "Live share",
        title: "Live spotlight",
        description: "What the host just pinned, plus the earlier commercial shares from this same session.",
        count: "3 shares",
        icon: "●",
        openLabel: "Open live session",
        note: "Use this when the room is actively presenting.",
      },
      {
        screen: "cs",
        collectionId: "contacts",
        cardId: "host-contact",
        label: "Contact",
        title: "Sales contact",
        description: "One verified contact card for the person running the dealer room right now.",
        count: "1 card",
        icon: "✦",
        openLabel: "Open contact card",
        note: "Save only if you want it in your own phone.",
      },
    ],
    searchIndex: [
      {
        group: "Dealer products",
        title: "65W GaN Dual USB-C Charger",
        meta: "Charging · Dealer exclusive price",
        screen: "ps",
        collectionId: "products",
        cardId: "VE-CH03",
        productIndex: 2,
      },
      {
        group: "Dealer products",
        title: "USB-C Braided Cable 1m",
        meta: "Cables · 100W PD",
        screen: "ps",
        collectionId: "products",
        cardId: "VE-C01",
        productIndex: 0,
      },
      {
        group: "Dealer products",
        title: "Wireless Charging Pad 15W",
        meta: "Charging · Qi certified",
        screen: "ps",
        collectionId: "products",
        cardId: "VE-CH06",
        productIndex: 5,
      },
      {
        group: "Live session",
        title: "Volume pricing — up to 22% off",
        meta: "Pinned 29 minutes ago",
        screen: "ls",
        collectionId: "live",
        cardId: "pricing",
      },
      {
        group: "Live session",
        title: "Retail launch sheet",
        meta: "Pinned 14 minutes ago",
        screen: "ls",
        collectionId: "live",
        cardId: "pricing",
      },
      {
        group: "Sales contact",
        title: "Ananya Reddy",
        meta: "Verified host contact",
        screen: "cs",
        collectionId: "contacts",
        cardId: "host-contact",
      },
    ],
    content: {
      products: STORE_PRODUCTS,
      contact: HOST_CONTACT,
      live: STORE_LIVE,
    },
  },
  business_card: {
    typeLabel: "Business card space",
    bootSubtitle:
      "Enter the live business-card room for this host. Open the verified contact card first, then follow the current host spotlight if you need a next step.",
    overviewSubtitle: "This room stays lightweight: one contact card plus a narrow live handoff from the current host.",
    searchPlaceholder: "Search the host card or current handoff",
    searchMeta: "Search uses the room cache immediately after entry. No new loading state is introduced while typing.",
    collectionSectionCopy: "Only the approved business-card items appear here. The room stays intentionally narrow.",
    footNote:
      "Spaces does not keep a contact inbox. Saved items are handed off to your phone and disappear from the room when the session ends.",
    emptySearchCopy: "Try the host name, company name, or the current live handoff.",
    emptyStateCopy: "The room is live, but the host has not shared attendee-facing material yet.",
    feature: {
      screen: "cs",
      collectionId: "contacts",
      cardId: "host-contact",
      eyebrow: "Start here",
      title: "Host contact card",
      copy: "Open the verified contact first, then save it only if you need to follow up after the session.",
      metaOne: "1 verified card",
      metaTwo: "Identified room",
      openLabel: "Open host card",
      saveLabel: "Save host card",
      saveTitle: "Host contact card",
    },
    collections: [
      {
        screen: "cs",
        collectionId: "contacts",
        cardId: "host-contact",
        label: "Contact",
        title: "Host card",
        description: "A single verified contact card for the person running this business-card room.",
        count: "1 card",
        icon: "✦",
        openLabel: "Open card",
        note: "Used when the host wants attendees to save details selectively.",
      },
      {
        screen: "ls",
        collectionId: "live",
        cardId: "walkthrough",
        label: "Live handoff",
        title: "Current next step",
        description: "A narrow stream of host handoff moments from the current room.",
        count: "2 handoffs",
        icon: "●",
        openLabel: "Open handoff",
        note: "Use this when the room is actively presenting.",
      },
    ],
    searchIndex: [
      {
        group: "Host card",
        title: "Ananya Reddy",
        meta: "Founder · Verified host",
        screen: "cs",
        collectionId: "contacts",
        cardId: "host-contact",
      },
      {
        group: "Host card",
        title: "NextGen Ventures Pvt. Ltd.",
        meta: "Company on the shared card",
        screen: "cs",
        collectionId: "contacts",
        cardId: "host-contact",
      },
      {
        group: "Live handoff",
        title: "Book a product walkthrough",
        meta: "Shared 14 minutes ago",
        screen: "ls",
        collectionId: "live",
        cardId: "walkthrough",
      },
    ],
    content: {
      contact: HOST_CONTACT,
      live: {
        ...STORE_LIVE,
        presenterLabel: "Live · Business card handoff",
        spotlightTitle: "Current business-card handoff",
        spotlightMeta: [
          { label: "Room", value: "Founder handoff" },
          { label: "Watching", value: "8" },
          { label: "Mode", value: "Identified" },
        ],
        timeline: [
          {
            id: "walkthrough",
            icon: "✦",
            title: "Book a product walkthrough",
            timestamp: "Shared 14 min ago",
            saveTitle: "Product walkthrough",
          },
          {
            id: "host-contact",
            icon: "👥",
            title: "Primary host contact",
            timestamp: "Shared at start",
            saveTitle: "Host contact card",
          },
        ],
      },
    },
  },
  restaurant: {
    typeLabel: "Restaurant space",
    bootSubtitle:
      "Enter the live table-side menu for this service. Browse only the dishes the restaurant has published right now.",
    overviewSubtitle: "This room opens straight into the current service menu, chef special, and search for dish names.",
    searchPlaceholder: "Search dishes or dietary tags",
    searchMeta: "Search is instant and local once the service menu is loaded.",
    collectionSectionCopy: "The menu is the only attendee-facing collection in this restaurant service.",
    footNote: "Saved menu items leave through your own device. The room itself does not keep a history after service ends.",
    emptySearchCopy: "Try a dish name like biryani, prawns, or cheesecake.",
    emptyStateCopy: "The restaurant has opened the room, but the service menu has not been published yet.",
    feature: {
      screen: "ms",
      collectionId: "menu",
      cardId: "chef-special",
      eyebrow: "Chef special",
      title: "Lamb raan with saffron rice",
      copy: "Start with tonight’s special, then search or browse the rest of the menu only if you want more detail.",
      metaOne: "Live menu",
      metaTwo: "3 sections",
      openLabel: "Open menu",
      saveLabel: "Save menu",
      saveTitle: "Dinner menu",
    },
    collections: [
      {
        screen: "ms",
        collectionId: "menu",
        cardId: "menu",
        label: "Menu",
        title: "Tonight’s service menu",
        description: "A clean, type-first menu with specials, starters, mains, and desserts for this live service.",
        count: "8 dishes",
        icon: "🍽",
        openLabel: "Open menu",
        note: "Search jumps by dish name without leaving the service.",
      },
    ],
    searchIndex: [
      {
        group: "Tonight’s menu",
        title: "Lamb Raan with Saffron Rice",
        meta: "Chef special",
        screen: "ms",
        collectionId: "menu",
        cardId: "chef-special",
      },
      {
        group: "Tonight’s menu",
        title: "Hyderabadi Dum Biryani",
        meta: "Mains · Spicy",
        screen: "ms",
        collectionId: "menu",
        cardId: "menu",
      },
      {
        group: "Tonight’s menu",
        title: "Gulab Jamun Cheesecake",
        meta: "Dessert · New",
        screen: "ms",
        collectionId: "menu",
        cardId: "menu",
      },
    ],
    content: {
      menu: RESTAURANT_MENU,
    },
  },
};

export function createBrandMark(name: string): string {
  const tokens = name
    .trim()
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);

  if (!tokens.length) {
    return "DG";
  }

  if (tokens.length === 1) {
    return tokens[0].slice(0, 2).toUpperCase();
  }

  return `${tokens[0][0]}${tokens[1][0]}`.toUpperCase();
}

export function getAttendeeVerificationLabel(tier: VerificationTier | null): string {
  if (tier === "business_verified") {
    return "Business verified";
  }

  if (tier === "phone_verified") {
    return "Phone verified";
  }

  return "Live verified";
}

export function createAttendeeBrandTheme(input?: Partial<AttendeeBrandTheme>): AttendeeBrandTheme {
  const name = input?.name?.trim() || "Digi";

  return {
    name,
    mark: input?.mark?.trim() || createBrandMark(name),
    primaryColor: input?.primaryColor || "#1A1714",
    secondaryColor: input?.secondaryColor || "#F8F6F1",
    fontFamily: input?.fontFamily || "Cormorant Garamond",
  };
}

export function getAttendeeSpacePreset(spaceType: SpaceType): AttendeeSpacePreset {
  return ATTENDEE_PRESETS[spaceType] ?? ATTENDEE_PRESETS.business_card;
}

export function searchAttendeePreset(preset: AttendeeSpacePreset, query: string): AttendeeSearchResult[] {
  const trimmed = query.trim().toLowerCase();

  if (!trimmed) {
    return [];
  }

  return preset.searchIndex.filter((item) => {
    const haystack = `${item.group} ${item.title} ${item.meta}`.toLowerCase();
    return haystack.includes(trimmed);
  });
}

export function buildAttendeeShareMessage(spaceName: string, itemTitle: string): string {
  return `${spaceName}: ${itemTitle}`;
}

export function resolvePinnedFeature(
  preset: AttendeeSpacePreset,
  pinnedItem: LiveContentItem | null,
): AttendeeFeature | null {
  if (!pinnedItem) {
    return preset.feature;
  }

  return {
    screen: pinnedItem.screen as AttendeeScreen,
    collectionId: pinnedItem.collectionId,
    cardId: pinnedItem.cardId,
    productIndex: pinnedItem.productIndex,
    eyebrow: "Pinned now",
    title: pinnedItem.title,
    copy: "The host highlighted this item for everyone in the room. Open it directly or keep browsing the rest of the space.",
    metaOne: "Host pin",
    metaTwo: pinnedItem.subtitle,
    openLabel: "Open pinned item",
    saveLabel: "Save pinned item",
    saveTitle: pinnedItem.title,
  };
}
