"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import type { AttendeeRoomEventInput } from "@digi/api-contracts";
import {
  buildAttendeeShareMessage,
  buildAttendeePresetFromEntries,
  createSeedSpaceContentEntries,
  formatTimeRemaining,
  isDemoBridgeMessage,
  resolvePinnedFeature,
  searchAttendeePreset,
  type AttendeeCollectionLink,
  type AttendeeFeature,
  type AttendeeRoomBootstrap,
  type AttendeeRoomStatus,
  type AttendeeScreen,
  type AttendeeSearchResult,
  type DemoRoomState,
  type LiveContentItem,
} from "@digi/domain";

import {
  buildBootstrapFromDemoRoom,
  buildDemoBootstrap,
  fetchAttendeeLiveState,
  fetchAttendeeRoom,
  getOrCreateAttendeeRef,
  normalizeSearchValue,
  recordAttendeeEvent,
} from "../lib/attendee-service";
import styles from "./attendee-space.module.css";

interface AttendeeSpaceProps {
  qrSlug: string;
  initialSearchParams: Record<string, string | string[] | undefined>;
}

interface ViewState {
  screen: "overview" | AttendeeScreen;
  collectionId?: string;
  cardId?: string;
  productIndex?: number;
  title?: string;
}

interface QueuedEvent {
  eventName: AttendeeRoomEventInput["eventName"];
  contentId?: string | null;
  contentTitle?: string | null;
}

function isRoomInteractive(status: AttendeeRoomStatus) {
  return status === "live" || status === "ending";
}

function buildStatusText(status: AttendeeRoomStatus) {
  if (status === "ended") {
    return {
      chip: "Session ended",
      title: "This live room just closed.",
      copy: "Your saved items remain in your own apps. Unsaved live content from this session is no longer available.",
      help: "This link stays valid. Refresh later if the host starts a new live session.",
      button: "Refresh space",
    };
  }

  return {
    chip: "Not live yet",
    title: "This space is not live right now.",
    copy: "The host has not started an attendee-facing session for this space yet.",
    help: "Keep this link. It becomes active again when the host goes live.",
    button: "Refresh space",
  };
}

function groupSearchResults(results: AttendeeSearchResult[]) {
  const groups = new Map<string, AttendeeSearchResult[]>();

  results.forEach((item) => {
    const current = groups.get(item.group) ?? [];
    current.push(item);
    groups.set(item.group, current);
  });

  return [...groups.entries()];
}

function buildRoomStateStyles(room: AttendeeRoomBootstrap | null) {
  if (!room) {
    return undefined;
  }

  return {
    "--brand-primary": room.brand.primaryColor,
    "--brand-paper": room.brand.secondaryColor,
    "--brand-serif": room.brand.fontFamily,
  } as CSSProperties;
}

export function AttendeeSpace({ qrSlug, initialSearchParams }: AttendeeSpaceProps) {
  const demoMode = normalizeSearchValue(initialSearchParams.demo) === "1";
  const demoRoomKey = normalizeSearchValue(initialSearchParams.room) ?? qrSlug;

  const [room, setRoom] = useState<AttendeeRoomBootstrap | null>(() =>
    demoMode ? buildDemoBootstrap(qrSlug, initialSearchParams) : null,
  );
  const [loading, setLoading] = useState(!demoMode);
  const [error, setError] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);
  const [showNameStep, setShowNameStep] = useState(false);
  const [attendeeName, setAttendeeName] = useState("");
  const [view, setView] = useState<ViewState>({ screen: "overview" });
  const [productIndex, setProductIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [pinNotice, setPinNotice] = useState<LiveContentItem | null>(null);
  const [offlineActive, setOfflineActive] = useState(() => (typeof navigator === "undefined" ? false : !navigator.onLine));
  const [queuedCount, setQueuedCount] = useState(0);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [expiryVisible, setExpiryVisible] = useState(false);
  const [endedOverlayVisible, setEndedOverlayVisible] = useState(false);
  const [attendeeRef] = useState(() => getOrCreateAttendeeRef(qrSlug));
  const lastPinnedIdRef = useRef<string | null>(null);
  const overviewTrackedRef = useRef(false);
  const sessionEndTrackedRef = useRef(false);
  const searchTrackedRef = useRef(false);
  const queuedEventsRef = useRef<QueuedEvent[]>([]);

  const resolvedEntries = room ? (room.contentEntries.length ? room.contentEntries : createSeedSpaceContentEntries(room.spaceType, room.spaceId)) : createSeedSpaceContentEntries("store", null);
  const preset = room ? buildAttendeePresetFromEntries(room.spaceType, resolvedEntries) : buildAttendeePresetFromEntries("store", resolvedEntries);
  const feature = room ? resolvePinnedFeature(preset, room.pinnedItem) : preset.feature;
  const searchResults = searchAttendeePreset(preset, searchQuery);
  const groupedResults = groupSearchResults(searchResults);
  const products = preset.content.products ?? [];
  const activeProduct = products[productIndex] ?? products[0] ?? null;
  const contact = preset.content.contact ?? null;
  const menu = preset.content.menu ?? null;
  const liveContent = preset.content.live ?? null;

  async function refreshRoomState(mode: "bootstrap" | "poll" = "poll") {
    try {
      if (demoMode) {
        if (typeof window !== "undefined" && window.opener) {
          window.opener.postMessage(
            {
              type: "digi-demo-room-request",
              room: demoRoomKey,
            },
            "*",
          );
        }
        return;
      }

      if (mode === "bootstrap") {
        setLoading(true);
      }

      const nextRoom = mode === "bootstrap" ? await fetchAttendeeRoom(qrSlug) : await fetchAttendeeLiveState(qrSlug);

      setRoom(nextRoom);
      setError(nextRoom ? null : "This space is unavailable.");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Something went wrong.");
    } finally {
      if (mode === "bootstrap") {
        setLoading(false);
      }
    }
  }

  async function sendEventNow(input: QueuedEvent) {
    if (!room) {
      return;
    }

    if (demoMode) {
      if (typeof window !== "undefined" && window.opener) {
        window.opener.postMessage(
          {
            type: "digi-demo-attendee-event",
            room: demoRoomKey,
            attendeeRef,
            attendeeName: attendeeName || null,
            eventName: input.eventName,
            contentId: input.contentId ?? null,
            contentTitle: input.contentTitle ?? null,
          },
          "*",
        );
        window.setTimeout(() => {
          void refreshRoomState("poll");
        }, 180);
      }
      return;
    }

    await recordAttendeeEvent({
      qrSlug: room.qrSlug,
      attendeeRef,
      attendeeName: attendeeName || null,
      eventName: input.eventName,
      contentId: input.contentId ?? null,
      contentTitle: input.contentTitle ?? null,
    });
    await refreshRoomState("poll");
  }

  async function queueOrSendEvent(input: QueuedEvent) {
    if (offlineActive && (input.eventName === "content_saved" || input.eventName === "offline_save_queued")) {
      queuedEventsRef.current.push({
        ...input,
        eventName: "offline_save_queued",
      });
      setQueuedCount(queuedEventsRef.current.length);
      return;
    }

    await sendEventNow(input);
  }

  async function registerPresence(nextName: string | null) {
    if (!room) {
      return;
    }

    if (demoMode) {
      if (typeof window !== "undefined" && window.opener) {
        window.opener.postMessage(
          {
            type: "digi-demo-attendee-presence",
            room: demoRoomKey,
            presence: {
              attendeeRef,
              attendeeName: nextName,
              joinedAt: new Date().toISOString(),
              lastSeenAt: new Date().toISOString(),
            },
          },
          "*",
        );
        window.setTimeout(() => {
          void refreshRoomState("poll");
        }, 180);
      }
      return;
    }

    await recordAttendeeEvent({
      qrSlug: room.qrSlug,
      attendeeRef,
      attendeeName: nextName,
      eventName: "presence_registered",
    });
    await refreshRoomState("poll");
  }

  async function completeEntry(nextName: string | null) {
    setError(null);

    try {
      if (nextName !== null) {
        setAttendeeName(nextName);
      }

      await registerPresence(nextName);
      setEntered(true);
      setShowNameStep(false);

      if (!overviewTrackedRef.current) {
        overviewTrackedRef.current = true;
        await sendEventNow({ eventName: "space_overview_viewed" });
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to enter this space.");
    }
  }

  async function handleSave(title: string, contentId?: string | null) {
    if (!room) {
      return;
    }

    const shareText = buildAttendeeShareMessage(room.spaceName, title);

    try {
      if (offlineActive) {
        await queueOrSendEvent({
          eventName: "offline_save_queued",
          contentId,
          contentTitle: title,
        });
        setShareMessage("Save queued. The activity will sync when you reconnect.");
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title,
          text: shareText,
          url: room.attendeeUrl,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
      }

      await queueOrSendEvent({
        eventName: "content_saved",
        contentId,
        contentTitle: title,
      });
      setShareMessage("Saved to your own device flow.");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to save this item right now.");
    }
  }

  async function openTarget(target: AttendeeFeature | AttendeeCollectionLink | AttendeeSearchResult | LiveContentItem, source: "feature" | "collection" | "search" | "pin") {
    if ("screen" in target && target.screen === "ps") {
      setProductIndex(target.productIndex ?? 0);
    }

    setView({
      screen: target.screen,
      collectionId: target.collectionId,
      cardId: target.cardId,
      productIndex: target.productIndex,
      title: target.title,
    });
    setPinNotice(null);

    const eventName =
      source === "search" ? "search_result_opened" :
      source === "pin" ? "card_viewed" :
      "collection_opened";

    await queueOrSendEvent({
      eventName,
      contentId: target.cardId,
      contentTitle: target.title,
    });
  }

  useEffect(() => {
    if (demoMode) {
      setLoading(false);
      return;
    }

    void refreshRoomState("bootstrap");
  }, [demoMode, qrSlug]);

  useEffect(() => {
    if (!demoMode || typeof window === "undefined") {
      return;
    }

    function handleMessage(event: MessageEvent) {
      if (!isDemoBridgeMessage(event.data)) {
        return;
      }

      if (event.data.type !== "digi-demo-room-state" || event.data.room !== demoRoomKey) {
        return;
      }

      const roomState = event.data.roomState as DemoRoomState | null;

      if (!roomState) {
        return;
      }

      setRoom(buildBootstrapFromDemoRoom(qrSlug, roomState, initialSearchParams));
    }

    window.addEventListener("message", handleMessage);
    void refreshRoomState("poll");

    const interval = window.opener
      ? window.setInterval(() => {
          void refreshRoomState("poll");
        }, 1400)
      : null;

    return () => {
      window.removeEventListener("message", handleMessage);
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [demoMode, demoRoomKey, qrSlug, initialSearchParams]);

  useEffect(() => {
    if (demoMode || typeof window === "undefined") {
      return;
    }

    const interval = window.setInterval(() => {
      void refreshRoomState("poll");
    }, 2200);

    return () => {
      window.clearInterval(interval);
    };
  }, [demoMode, qrSlug]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    function handleOnline() {
      setOfflineActive(false);
    }

    function handleOffline() {
      setOfflineActive(true);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (offlineActive || !queuedEventsRef.current.length) {
      return;
    }

    let cancelled = false;

    async function flushQueue() {
      while (!cancelled && queuedEventsRef.current.length) {
        const next = queuedEventsRef.current.shift();
        setQueuedCount(queuedEventsRef.current.length);

        if (!next) {
          break;
        }

        await sendEventNow(next);
      }

      if (!cancelled) {
        setShareMessage("Queued activity synced.");
      }
    }

    void flushQueue();

    return () => {
      cancelled = true;
    };
  }, [offlineActive, queuedCount]);

  useEffect(() => {
    if (!shareMessage || typeof window === "undefined") {
      return;
    }

    const timer = window.setTimeout(() => {
      setShareMessage(null);
    }, 2600);

    return () => {
      window.clearTimeout(timer);
    };
  }, [shareMessage]);

  useEffect(() => {
    if (!room?.endsAt || !isRoomInteractive(room.status) || typeof window === "undefined") {
      setExpiryVisible(false);
      return;
    }

    const endsAt = room.endsAt;

    function syncExpiry() {
      setExpiryVisible(new Date(endsAt).getTime() - Date.now() <= 5 * 60_000);
    }

    syncExpiry();

    const timer = window.setInterval(syncExpiry, 20_000);

    return () => {
      window.clearInterval(timer);
    };
  }, [room?.endsAt, room?.status]);

  useEffect(() => {
    if (!room?.pinnedItem || !entered) {
      return;
    }

    if (lastPinnedIdRef.current === room.pinnedItem.id) {
      return;
    }

    lastPinnedIdRef.current = room.pinnedItem.id;
    setPinNotice(room.pinnedItem);
    void queueOrSendEvent({
      eventName: "pin_received",
      contentId: room.pinnedItem.id,
      contentTitle: room.pinnedItem.title,
    });
  }, [entered, room?.pinnedItem?.id]);

  useEffect(() => {
    if (!room || room.status !== "ended" || !entered || sessionEndTrackedRef.current) {
      return;
    }

    sessionEndTrackedRef.current = true;
    setEndedOverlayVisible(true);
    void queueOrSendEvent({
      eventName: "session_end_viewed",
    });
  }, [entered, room?.status]);

  const stateStyle = buildRoomStateStyles(room);

  if (loading) {
    return (
      <main className={styles.shell} style={stateStyle}>
        <section className={styles.loadingCard}>
          <div className={styles.loadingChip}>PWA loading</div>
          <div className={styles.loadingHero} />
          <div className={styles.loadingLine} />
          <div className={`${styles.loadingLine} ${styles.loadingLineShort}`} />
          <div className={styles.loadingGrid}>
            <div className={styles.loadingTile} />
            <div className={styles.loadingTile} />
          </div>
        </section>
      </main>
    );
  }

  if (error && !room) {
    return (
      <main className={styles.shell} style={stateStyle}>
        <StatusCard
          buttonLabel="Retry"
          chip="Unavailable"
          copy={error}
          help="Check the QR link or ask the host to refresh the room."
          onRefresh={() => void refreshRoomState("bootstrap")}
          title="This space is unavailable."
        />
      </main>
    );
  }

  if (!room) {
    return (
      <main className={styles.shell} style={stateStyle}>
        <StatusCard
          buttonLabel="Retry"
          chip="Unavailable"
          copy="This space could not be found."
          help="Check the QR link or ask the host to share a fresh one."
          onRefresh={() => void refreshRoomState("bootstrap")}
          title="This space is unavailable."
        />
      </main>
    );
  }

  const interactive = isRoomInteractive(room.status);

  return (
    <main className={styles.shell} style={stateStyle}>
      {!interactive ? (
        <StatusCard
          buttonLabel={buildStatusText(room.status).button}
          chip={buildStatusText(room.status).chip}
          copy={buildStatusText(room.status).copy}
          help={buildStatusText(room.status).help}
          onRefresh={() => void refreshRoomState("bootstrap")}
          title={buildStatusText(room.status).title}
        />
      ) : !entered ? (
        showNameStep && room.mode === "identified" ? (
          <section className={styles.entryCard}>
            <div className={styles.brandMark}>{room.brand.mark}</div>
            <span className={styles.entryChip}>Identified entry</span>
            <h1 className={styles.entryTitle}>Your name</h1>
            <p className={styles.entryCopy}>
              Only visible to the host of this space. No account. No phone number unless you later choose to save a contact.
            </p>
            <label className={styles.fieldWrap}>
              <span className={styles.fieldLabel}>Name</span>
              <input
                aria-label="Name"
                className={styles.fieldInput}
                onChange={(event) => setAttendeeName(event.target.value)}
                placeholder="Type your name"
                value={attendeeName}
              />
            </label>
            <div className={styles.entryActions}>
              <button
                className={styles.primaryButton}
                onClick={() => void completeEntry(attendeeName.trim() || null)}
                type="button"
              >
                Continue
              </button>
              <button className={styles.secondaryButton} onClick={() => void completeEntry(null)} type="button">
                Skip for now
              </button>
            </div>
            {error ? <p className={styles.errorText}>{error}</p> : null}
          </section>
        ) : (
          <section className={styles.entryCard}>
            <div className={styles.entryTop}>
              <div className={styles.brandMark}>{room.brand.mark}</div>
              <div className={styles.verifiedPill}>✓ {room.verificationLabel}</div>
            </div>
            <h1 className={styles.entryTitle}>{room.spaceName}</h1>
            <p className={styles.entryCopy}>{preset.bootSubtitle}</p>
            <div className={styles.liveRow}>
              <div className={styles.livePill}>{room.attendeeCount} attendees · {room.endsAt ? formatTimeRemaining(room.endsAt) : "Live now"}</div>
              <div className={styles.livePill}>{room.mode === "identified" ? "Identified space" : "Anonymous space"}</div>
            </div>
            <div className={styles.noteCard}>
              <div className={styles.noteLabel}>What happens next</div>
              <div className={styles.noteCopy}>You enter the live room and can save anything important directly into your own apps.</div>
            </div>
            <button
              className={styles.primaryButton}
              onClick={() => {
                if (room.mode === "identified") {
                  setShowNameStep(true);
                  return;
                }
                void completeEntry(null);
              }}
              type="button"
            >
              Enter Space
            </button>
            {error ? <p className={styles.errorText}>{error}</p> : null}
          </section>
        )
      ) : (
        <section className={styles.roomFrame}>
          {pinNotice ? (
            <div className={styles.pinNotice}>
              <div className={styles.pinTop}>
                <div>
                  <div className={styles.pinLabel}>Host pin received</div>
                  <div className={styles.pinTitle}>{pinNotice.title}</div>
                </div>
                <div className={styles.pinChip}>Pinned now</div>
              </div>
              <p className={styles.pinCopy}>{pinNotice.subtitle || "The host highlighted a new item for everyone in this room."}</p>
              <div className={styles.pinActions}>
                <button className={styles.primaryButton} onClick={() => void openTarget(pinNotice, "pin")} type="button">
                  Open pinned item
                </button>
                <button
                  className={styles.secondaryButton}
                  onClick={() => {
                    setPinNotice(null);
                    void queueOrSendEvent({
                      eventName: "pin_dismissed",
                      contentId: pinNotice.id,
                      contentTitle: pinNotice.title,
                    });
                  }}
                  type="button"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : null}

          {offlineActive ? (
            <div className={styles.signalBanner}>
              You are offline. Save actions queue locally and sync when your connection returns.
            </div>
          ) : null}

          {expiryVisible ? (
            <div className={styles.warningBanner}>This live room is ending soon. Unsaved items disappear when the session closes.</div>
          ) : null}

          {view.screen === "overview" ? (
            <div className={styles.overview}>
              <div className={styles.overviewHeader}>
                <div className={styles.kickerRow}>
                  <span className={styles.stateBadge}>{room.status === "ending" ? "Ending soon" : "Live space"}</span>
                  <span className={styles.kickerCopy}>{preset.typeLabel} · {room.mode === "identified" ? "Identified entry" : "Anonymous entry"}</span>
                </div>
                <div className={styles.sectionEyebrow}>Space overview</div>
                <h2 className={styles.sectionTitle}>{room.spaceName}</h2>
                <p className={styles.sectionCopy}>{preset.overviewSubtitle}</p>
              </div>

              <label className={styles.searchWrap}>
                <span className={styles.searchLabel}>Search this space</span>
                <input
                  aria-label="Search this space"
                  className={styles.searchInput}
                  onChange={(event) => {
                    const nextQuery = event.target.value;
                    setSearchQuery(nextQuery);
                    if (nextQuery.trim() && !searchTrackedRef.current) {
                      searchTrackedRef.current = true;
                      void queueOrSendEvent({ eventName: "search_started" });
                    }
                    if (!nextQuery.trim()) {
                      searchTrackedRef.current = false;
                    }
                  }}
                  placeholder={preset.searchPlaceholder}
                  type="search"
                  value={searchQuery}
                />
                <span className={styles.searchMeta}>{preset.searchMeta}</span>
              </label>

              {feature ? (
                <article className={styles.featureCard}>
                  <div className={styles.featureTop}>
                    <div>
                      <div className={styles.featureEyebrow}>{feature.eyebrow}</div>
                      <h3 className={styles.featureTitle}>{feature.title}</h3>
                      <p className={styles.featureCopy}>{feature.copy}</p>
                    </div>
                    <div className={styles.featureMark}>{room.brand.mark}</div>
                  </div>
                  <div className={styles.featureMeta}>
                    <span>{feature.metaOne}</span>
                    <span>{feature.metaTwo}</span>
                  </div>
                  <div className={styles.featureActions}>
                    <button className={styles.primaryButton} onClick={() => void openTarget(feature, "feature")} type="button">
                      {feature.openLabel}
                    </button>
                    <button className={styles.secondaryButton} onClick={() => void handleSave(feature.saveTitle, feature.cardId)} type="button">
                      {feature.saveLabel}
                    </button>
                  </div>
                </article>
              ) : null}

              {!searchQuery.trim() ? (
                preset.collections.length ? (
                  <div className={styles.collectionGrid}>
                    {preset.collections.map((collection) => (
                      <button
                        className={styles.collectionCard}
                        key={`${collection.collectionId}-${collection.cardId}`}
                        onClick={() => void openTarget(collection, "collection")}
                        type="button"
                      >
                        <div className={styles.collectionIcon}>{collection.icon}</div>
                        <div className={styles.collectionBody}>
                          <div className={styles.collectionLabel}>{collection.label}</div>
                          <div className={styles.collectionTitle}>{collection.title}</div>
                          <p className={styles.collectionCopy}>{collection.description}</p>
                          <div className={styles.collectionMeta}>
                            <span>{collection.count}</span>
                            <span>{collection.note}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyTitle}>This space is live, but empty.</div>
                    <div className={styles.emptyCopy}>{preset.emptyStateCopy}</div>
                  </div>
                )
              ) : searchResults.length ? (
                <div className={styles.searchGroups}>
                  {groupedResults.map(([group, items]) => (
                    <section className={styles.searchGroup} key={group}>
                      <div className={styles.searchGroupLabel}>{group}</div>
                      {items.map((item) => (
                        <button
                          className={styles.searchResult}
                          key={`${group}-${item.cardId}-${item.title}`}
                          onClick={() => void openTarget(item, "search")}
                          type="button"
                        >
                          <div>
                            <div className={styles.searchResultTitle}>{item.title}</div>
                            <div className={styles.searchResultMeta}>{item.meta}</div>
                          </div>
                          <span className={styles.searchResultAction}>Open</span>
                        </button>
                      ))}
                    </section>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyTitle}>No matching results.</div>
                  <div className={styles.emptyCopy}>{preset.emptySearchCopy}</div>
                </div>
              )}

              <footer className={styles.footerRow}>
                <span>{preset.footNote}</span>
                <span>{room.endsAt ? formatTimeRemaining(room.endsAt) : "Live now"}</span>
              </footer>
            </div>
          ) : view.screen === "ps" && activeProduct ? (
            <div className={styles.detailView}>
              <div className={styles.detailHeader}>
                <button className={styles.backButton} onClick={() => setView({ screen: "overview" })} type="button">
                  Back to space
                </button>
                <div>
                  <div className={styles.sectionEyebrow}>Dealer products</div>
                  <h2 className={styles.sectionTitle}>{activeProduct.title}</h2>
                </div>
                <div className={styles.counterPill}>{productIndex + 1} / {products.length}</div>
              </div>
              <article className={styles.productCard}>
                <div className={styles.productTop}>
                  <div>
                    <div className={styles.productCategory}>{activeProduct.category}</div>
                    <div className={styles.productTitle}>{activeProduct.title}</div>
                    <div className={styles.productPrice}>{activeProduct.price} <span>{activeProduct.mrp}</span> <strong>{activeProduct.discount}</strong></div>
                  </div>
                  <div className={styles.counterPill}>{activeProduct.badge ?? activeProduct.sku}</div>
                </div>
                <div className={styles.productMeta}>
                  <span>{activeProduct.moq}</span>
                  <span>{activeProduct.margin}</span>
                </div>
                <div className={styles.specGrid}>
                  {activeProduct.specs.map((spec) => (
                    <div className={styles.specCell} key={spec.label}>
                      <div className={styles.specLabel}>{spec.label}</div>
                      <div className={styles.specValue}>{spec.value}</div>
                    </div>
                  ))}
                </div>
              </article>
              <div className={styles.navRow}>
                <button
                  className={styles.secondaryButton}
                  disabled={productIndex === 0}
                  onClick={() => {
                    const nextIndex = Math.max(0, productIndex - 1);
                    setProductIndex(nextIndex);
                    void queueOrSendEvent({
                      eventName: "card_viewed",
                      contentId: products[nextIndex]?.id,
                      contentTitle: products[nextIndex]?.title,
                    });
                  }}
                  type="button"
                >
                  Prev
                </button>
                <button
                  className={styles.secondaryButton}
                  disabled={productIndex === products.length - 1}
                  onClick={() => {
                    const nextIndex = Math.min(products.length - 1, productIndex + 1);
                    setProductIndex(nextIndex);
                    void queueOrSendEvent({
                      eventName: "card_viewed",
                      contentId: products[nextIndex]?.id,
                      contentTitle: products[nextIndex]?.title,
                    });
                  }}
                  type="button"
                >
                  Next
                </button>
              </div>
              <button className={styles.primaryButton} onClick={() => void handleSave(activeProduct.title, activeProduct.id)} type="button">
                Save Product Info
              </button>
            </div>
          ) : view.screen === "cs" && contact ? (
            <div className={styles.detailView}>
              <div className={styles.detailHeader}>
                <button className={styles.backButton} onClick={() => setView({ screen: "overview" })} type="button">
                  Back to space
                </button>
                <div>
                  <div className={styles.sectionEyebrow}>Verified contact</div>
                  <h2 className={styles.sectionTitle}>{contact.name}</h2>
                </div>
              </div>
              <article className={styles.contactCard}>
                <div className={styles.contactTop}>
                  <div className={styles.brandMark}>{room.brand.mark}</div>
                  <span className={styles.verifiedPill}>✓ {contact.verificationLabel}</span>
                </div>
                <div className={styles.contactName}>{contact.name}</div>
                <div className={styles.contactRole}>{contact.role}</div>
                <div className={styles.contactCompany}>{contact.company}</div>
                <div className={styles.contactRows}>
                  <div><strong>Phone</strong><span>{contact.phone}</span></div>
                  <div><strong>Email</strong><span>{contact.email}</span></div>
                  <div><strong>LinkedIn</strong><span>{contact.linkedin}</span></div>
                  <div><strong>Note</strong><span>{contact.note}</span></div>
                </div>
              </article>
              <button className={styles.primaryButton} onClick={() => void handleSave(contact.name, "host-contact")} type="button">
                Save to Contacts
              </button>
            </div>
          ) : view.screen === "ms" && menu ? (
            <div className={styles.detailView}>
              <div className={styles.detailHeader}>
                <button className={styles.backButton} onClick={() => setView({ screen: "overview" })} type="button">
                  Back to space
                </button>
                <div>
                  <div className={styles.sectionEyebrow}>{menu.serviceDescription}</div>
                  <h2 className={styles.sectionTitle}>{menu.serviceName}</h2>
                </div>
              </div>
              <article className={styles.menuCard}>
                <div className={styles.specialCard}>
                  <div className={styles.sectionEyebrow}>Chef special</div>
                  <div className={styles.menuSpecialTitle}>{menu.special.title}</div>
                  <div className={styles.menuSpecialMeta}>{menu.special.price}</div>
                  <p className={styles.sectionCopy}>{menu.special.description}</p>
                </div>
                {menu.sections.map((section) => (
                  <section className={styles.menuSection} key={section.title}>
                    <div className={styles.menuSectionTitle}>{section.title}</div>
                    {section.items.map((item) => (
                      <div className={styles.menuItem} key={item.title}>
                        <div>
                          <div className={styles.menuItemTitle}>{item.title}</div>
                          <div className={styles.menuItemCopy}>{item.description}</div>
                        </div>
                        <div className={styles.menuItemMeta}>
                          <span>{item.price}</span>
                          {item.tags?.length ? <span>{item.tags.join(" · ")}</span> : null}
                        </div>
                      </div>
                    ))}
                  </section>
                ))}
              </article>
              <button className={styles.primaryButton} onClick={() => void handleSave("Dinner menu", "menu")} type="button">
                Save Menu
              </button>
            </div>
          ) : view.screen === "ls" && liveContent ? (
            <div className={styles.detailView}>
              <div className={styles.detailHeader}>
                <button className={styles.backButton} onClick={() => setView({ screen: "overview" })} type="button">
                  Back to space
                </button>
                <div>
                  <div className={styles.sectionEyebrow}>{liveContent.presenterLabel}</div>
                  <h2 className={styles.sectionTitle}>{room.pinnedItem?.title ?? liveContent.spotlightTitle}</h2>
                </div>
              </div>
              <article className={styles.liveCard}>
                <div className={styles.sectionEyebrow}>{liveContent.spotlightEyebrow}</div>
                <p className={styles.sectionCopy}>{room.pinnedItem?.subtitle ?? "Follow the current room spotlight, then browse earlier shares if needed."}</p>
                <div className={styles.liveMeta}>
                  {(room.pinnedItem
                    ? [
                        { label: "Collection", value: room.pinnedItem.collectionId },
                        { label: "Screen", value: room.pinnedItem.screen },
                        { label: "Room", value: room.spaceName },
                      ]
                    : liveContent.spotlightMeta
                  ).map((item) => (
                    <div className={styles.liveMetaCell} key={item.label}>
                      <div className={styles.liveMetaValue}>{item.value}</div>
                      <div className={styles.specLabel}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </article>
              <section className={styles.timelineCard}>
                <div className={styles.sectionEyebrow}>{liveContent.timelineLabel}</div>
                {liveContent.timeline.map((item) => (
                  <div className={styles.timelineItem} key={item.id}>
                    <span className={styles.timelineIcon}>{item.icon}</span>
                    <div>
                      <div className={styles.timelineTitle}>{item.title}</div>
                      <div className={styles.timelineTime}>{item.timestamp}</div>
                    </div>
                    <button className={styles.inlineAction} onClick={() => void handleSave(item.saveTitle, item.id)} type="button">
                      Save
                    </button>
                  </div>
                ))}
              </section>
              <button className={styles.primaryButton} onClick={() => void handleSave(room.pinnedItem?.title ?? liveContent.spotlightTitle, room.pinnedItem?.id ?? "live-spotlight")} type="button">
                Save Spotlight
              </button>
            </div>
          ) : null}

          {shareMessage ? <div className={styles.toast}>{shareMessage}</div> : null}

          {endedOverlayVisible ? (
            <div className={styles.overlay}>
              <div className={styles.overlayCard}>
                <div className={styles.sectionEyebrow}>Session ended</div>
                <h3 className={styles.overlayTitle}>This live room just closed.</h3>
                <p className={styles.sectionCopy}>Your saved items remain in your own apps. Unsaved live content is no longer available.</p>
                <button
                  className={styles.primaryButton}
                  onClick={() => {
                    setEndedOverlayVisible(false);
                    void refreshRoomState("bootstrap");
                  }}
                  type="button"
                >
                  Refresh space
                </button>
              </div>
            </div>
          ) : null}
        </section>
      )}
    </main>
  );
}

function StatusCard({
  buttonLabel,
  chip,
  copy,
  help,
  onRefresh,
  title,
}: {
  buttonLabel: string;
  chip: string;
  copy: string;
  help: string;
  onRefresh: () => void;
  title: string;
}) {
  return (
    <section className={styles.entryCard}>
      <span className={styles.entryChip}>{chip}</span>
      <h1 className={styles.entryTitle}>{title}</h1>
      <p className={styles.entryCopy}>{copy}</p>
      <div className={styles.noteCard}>
        <div className={styles.noteLabel}>What to do next</div>
        <div className={styles.noteCopy}>{help}</div>
      </div>
      <button className={styles.primaryButton} onClick={onRefresh} type="button">
        {buttonLabel}
      </button>
    </section>
  );
}
