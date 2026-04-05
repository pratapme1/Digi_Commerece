import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";

import type {
  EndLiveSessionResult,
  GoLiveResult,
  LivePanelResponse,
  SaveHostSetupInput,
} from "@digi/api-contracts";
import {
  createHostSetupDraft,
  type HostSetupDraft,
  type HostSetupSnapshot,
  type LiveContentItem,
  type SessionSummarySnapshot,
} from "@digi/domain";

import {
  clearDemoState,
  loadDemoAuthenticated,
  loadDemoPhone,
  loadDemoRoom,
  loadDemoSetup,
  persistDemoAuthenticated,
  persistDemoPhone,
  persistDemoRoom,
  persistDemoSetup,
} from "./lib/demo-state";
import { hostAppConfig } from "./lib/config";
import { clearBrowserRoomState, loadBrowserRoomState, persistBrowserRoomState } from "./lib/live-room-bridge";
import {
  applyDemoEndLiveSession,
  applyDemoGoLive,
  applyDemoPinLiveContent,
  createDemoSnapshot,
  createEmptyDraft,
  endLiveSession,
  fetchHostSetup,
  fetchLivePanel,
  getDemoLivePanel,
  goLive,
  pinLiveContent,
  saveHostSetup,
} from "./lib/host-service";
import { getSupabaseClient } from "./lib/supabase";

interface HostAppContextValue {
  ready: boolean;
  busy: boolean;
  authenticated: boolean;
  demoMode: boolean;
  error: string | null;
  pendingPhone: string;
  draft: HostSetupDraft;
  setup: HostSetupSnapshot | null;
  livePanel: LivePanelResponse | null;
  sessionSummary: SessionSummarySnapshot | null;
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  startDemoMode: () => Promise<void>;
  updateDraft: (patch: Partial<HostSetupDraft>) => void;
  saveCurrentSetup: () => Promise<HostSetupSnapshot>;
  goLiveNow: (durationMinutes: number) => Promise<GoLiveResult>;
  refreshSetup: () => Promise<void>;
  refreshLivePanel: () => Promise<void>;
  pinCurrentItem: (content: LiveContentItem) => Promise<void>;
  endCurrentSession: () => Promise<EndLiveSessionResult>;
  signOut: () => Promise<void>;
}

const HostAppContext = createContext<HostAppContextValue | null>(null);

function parseError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

function getPrimarySpace(snapshot: HostSetupSnapshot | null) {
  return snapshot?.spaces.find((item) => item.isDefault) ?? snapshot?.spaces[0] ?? null;
}

async function loadPreferredDemoRoom(snapshot: HostSetupSnapshot | null) {
  const primarySpace = getPrimarySpace(snapshot);
  return (primarySpace ? loadBrowserRoomState(primarySpace.qrSlug) : null) ?? (await loadDemoRoom());
}

export function HostAppProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingPhone, setPendingPhone] = useState("+91 ");
  const [draft, setDraft] = useState<HostSetupDraft>(createHostSetupDraft());
  const [setup, setSetup] = useState<HostSetupSnapshot | null>(null);
  const [livePanel, setLivePanel] = useState<LivePanelResponse | null>(null);
  const [sessionSummary, setSessionSummary] = useState<SessionSummarySnapshot | null>(null);

  useEffect(() => {
    let isMounted = true;
    const client = getSupabaseClient();

    async function bootstrap() {
      try {
        if (hostAppConfig.demoModeEnabled) {
          const [demoAuthenticated, demoPhone, demoSetup] = await Promise.all([
            loadDemoAuthenticated(),
            loadDemoPhone(),
            loadDemoSetup(),
          ]);

          if (isMounted && demoAuthenticated) {
            const demoRoom = await loadPreferredDemoRoom(demoSetup ?? null);
            const nextLivePanel = getDemoLivePanel(demoRoom);
            setDemoMode(true);
            setAuthenticated(true);
            setPendingPhone(demoPhone);
            setSetup(demoSetup);
            setLivePanel(nextLivePanel);
            setSessionSummary(nextLivePanel?.summary ?? null);
          }
        }

        if (client) {
          const {
            data: { session },
          } = await client.auth.getSession();

          if (isMounted && session) {
            const nextSetup = await fetchHostSetup(client);
            const primarySpace = getPrimarySpace(nextSetup);
            setAuthenticated(true);
            setPendingPhone(session.user.phone ?? "+91 ");
            setSetup(nextSetup);
            setLivePanel(await fetchLivePanel(client, primarySpace?.id));
          }
        }
      } catch (nextError) {
        if (isMounted) {
          setError(parseError(nextError));
        }
      } finally {
        if (isMounted) {
          setReady(true);
        }
      }
    }

    void bootstrap();

    if (!client) {
      return () => {
        isMounted = false;
      };
    }

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(Boolean(session));
      setDemoMode(false);
      setPendingPhone(session?.user.phone ?? "+91 ");

      if (!session) {
        setSetup(null);
        setLivePanel(null);
        setSessionSummary(null);
      } else {
        void refreshSetupFromClient(client);
      }
    });

    async function refreshSetupFromClient(supabaseClient: NonNullable<ReturnType<typeof getSupabaseClient>>) {
      try {
        const nextSetup = await fetchHostSetup(supabaseClient);
        const primarySpace = getPrimarySpace(nextSetup);
        setSetup(nextSetup);
        setLivePanel(await fetchLivePanel(supabaseClient, primarySpace?.id));
      } catch (nextError) {
        setError(parseError(nextError));
      }
    }

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function requestOtp(phone: string) {
    const client = getSupabaseClient();

    setBusy(true);
    setError(null);

    try {
      if (!client) {
        throw new Error("Supabase credentials are missing. Use demo mode or add mobile runtime config.");
      }

      await client.auth.signInWithOtp({ phone });
      setPendingPhone(phone);
    } catch (nextError) {
      setError(parseError(nextError));
      throw nextError;
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp(phone: string, code: string) {
    const client = getSupabaseClient();

    setBusy(true);
    setError(null);

    try {
      if (!client) {
        throw new Error("Supabase credentials are missing. Use demo mode or add mobile runtime config.");
      }

      const { error: verifyError } = await client.auth.verifyOtp({
        phone,
        token: code,
        type: "sms",
      });

      if (verifyError) {
        throw verifyError;
      }

      const nextSetup = await fetchHostSetup(client);
      const primarySpace = getPrimarySpace(nextSetup);
      setPendingPhone(phone);
      setAuthenticated(true);
      setSetup(nextSetup);
      setLivePanel(await fetchLivePanel(client, primarySpace?.id));
    } catch (nextError) {
      setError(parseError(nextError));
      throw nextError;
    } finally {
      setBusy(false);
    }
  }

  async function startDemoMode() {
    setBusy(true);
    setError(null);

    try {
      const demoSetup = await loadDemoSetup();
      const demoRoom = await loadPreferredDemoRoom(demoSetup ?? null);
      const nextLivePanel = getDemoLivePanel(demoRoom);

      setDemoMode(true);
      setAuthenticated(true);
      setPendingPhone("+91 99999 99999");
      setSetup(demoSetup ?? null);
      setLivePanel(nextLivePanel);
      setSessionSummary(nextLivePanel?.summary ?? null);
      await Promise.all([
        persistDemoAuthenticated(true),
        persistDemoPhone("+91 99999 99999"),
      ]);
    } finally {
      setBusy(false);
    }
  }

  function updateDraft(patch: Partial<HostSetupDraft>) {
    setDraft((currentDraft: HostSetupDraft) => ({ ...currentDraft, ...patch }));
  }

  async function saveCurrentSetup() {
    const input: SaveHostSetupInput = {
      businessName: draft.businessName.trim(),
      brandName: draft.brandName.trim(),
      primaryColor: draft.primaryColor,
      secondaryColor: draft.secondaryColor,
      fontFamily: draft.fontFamily,
      spaceName: draft.spaceName.trim(),
      spaceType: draft.spaceType,
      mode: draft.mode,
      defaultSessionDurationMinutes: draft.defaultSessionDurationMinutes,
    };

    setBusy(true);
    setError(null);

    try {
      if (demoMode) {
        const nextSetup = createDemoSnapshot(input);
        setSetup(nextSetup);
        await persistDemoSetup(nextSetup);
        return nextSetup;
      }

      const client = getSupabaseClient();

      if (!client) {
        throw new Error("Supabase credentials are missing. Use demo mode or add mobile runtime config.");
      }

      const nextSetup = await saveHostSetup(client, input);
      setSetup(nextSetup);
      setDraft(createEmptyDraft());
      return nextSetup;
    } catch (nextError) {
      setError(parseError(nextError));
      throw nextError;
    } finally {
      setBusy(false);
    }
  }

  async function goLiveNow(durationMinutes: number) {
    setBusy(true);
    setError(null);

    try {
      const currentSetup = setup;
      const space = getPrimarySpace(currentSetup);

      if (!currentSetup || !space) {
        throw new Error("Finish setup before going live.");
      }

      if (demoMode) {
        const { nextSnapshot, result, roomState } = applyDemoGoLive(currentSetup, {
          durationMinutes,
          spaceId: space.id,
        });
        const nextLivePanel = getDemoLivePanel(roomState);

        setSetup(nextSnapshot);
        setLivePanel(nextLivePanel);
        setSessionSummary(null);
        await Promise.all([
          persistDemoSetup(nextSnapshot),
          persistDemoRoom(roomState),
        ]);
        persistBrowserRoomState(roomState);
        return result;
      }

      const client = getSupabaseClient();

      if (!client) {
        throw new Error("Supabase credentials are missing. Use demo mode or add mobile runtime config.");
      }

      const result = await goLive(client, {
        durationMinutes,
        spaceId: space.id,
      });
      const nextSetup = await fetchHostSetup(client);
      setSetup(nextSetup);
      setSessionSummary(null);
      setLivePanel(await fetchLivePanel(client, space.id));
      return result;
    } catch (nextError) {
      setError(parseError(nextError));
      throw nextError;
    } finally {
      setBusy(false);
    }
  }

  async function refreshSetup() {
    setError(null);

    if (demoMode) {
      const demoSetup = await loadDemoSetup();
      const demoRoom = await loadPreferredDemoRoom(demoSetup ?? null);
      const nextLivePanel = getDemoLivePanel(demoRoom);
      setSetup(demoSetup ?? null);
      setLivePanel(nextLivePanel);
      setSessionSummary(nextLivePanel?.summary ?? null);
      return;
    }

    const client = getSupabaseClient();

    if (!client || !authenticated) {
      return;
    }

    const nextSetup = await fetchHostSetup(client);
    const primarySpace = getPrimarySpace(nextSetup);
    setSetup(nextSetup);
    setLivePanel(await fetchLivePanel(client, primarySpace?.id));
  }

  async function refreshLivePanel() {
    setError(null);

    if (demoMode) {
      const room = await loadPreferredDemoRoom(setup);
      const nextLivePanel = getDemoLivePanel(room);
      setLivePanel(nextLivePanel);
      setSessionSummary(nextLivePanel?.summary ?? null);
      return;
    }

    const client = getSupabaseClient();

    if (!client || !authenticated) {
      return;
    }

    const primarySpace = getPrimarySpace(setup);
    const nextLivePanel = await fetchLivePanel(client, primarySpace?.id);
    setLivePanel(nextLivePanel);
    setSessionSummary(nextLivePanel?.summary ?? null);
  }

  async function pinCurrentItem(content: LiveContentItem) {
    setBusy(true);
    setError(null);

    try {
      if (!livePanel) {
        throw new Error("Start a live session before pinning content.");
      }

      if (demoMode) {
        const room = await loadPreferredDemoRoom(setup);

        if (!room) {
          throw new Error("Demo room state is missing.");
        }

        const next = applyDemoPinLiveContent(room, {
          sessionId: livePanel.sessionId,
          content,
        });
        const nextLivePanel = getDemoLivePanel(next.roomState);

        setLivePanel(nextLivePanel);
        await persistDemoRoom(next.roomState);
        persistBrowserRoomState(next.roomState);
        return;
      }

      const client = getSupabaseClient();

      if (!client) {
        throw new Error("Supabase credentials are missing. Use demo mode or add mobile runtime config.");
      }

      await pinLiveContent(client, {
        sessionId: livePanel.sessionId,
        content,
      });
      const primarySpace = getPrimarySpace(setup);
      setLivePanel(await fetchLivePanel(client, primarySpace?.id));
    } catch (nextError) {
      setError(parseError(nextError));
      throw nextError;
    } finally {
      setBusy(false);
    }
  }

  async function endCurrentSession() {
    setBusy(true);
    setError(null);

    try {
      if (!livePanel) {
        throw new Error("There is no active session to end.");
      }

      if (demoMode) {
        const room = await loadPreferredDemoRoom(setup);
        const currentSetup = setup;

        if (!room) {
          throw new Error("Demo room state is missing.");
        }

        const next = applyDemoEndLiveSession(room);
        const nextLivePanel = getDemoLivePanel(next.roomState);
        const nextSetup = currentSetup
          ? {
              ...currentSetup,
              liveSession: null,
            }
          : currentSetup;

        setLivePanel(nextLivePanel);
        setSessionSummary(next.result.summary);
        setSetup(nextSetup);
        await Promise.all([
          persistDemoRoom(next.roomState),
          persistDemoSetup(nextSetup),
        ]);
        persistBrowserRoomState(next.roomState);
        return next.result;
      }

      const client = getSupabaseClient();

      if (!client) {
        throw new Error("Supabase credentials are missing. Use demo mode or add mobile runtime config.");
      }

      const result = await endLiveSession(client, {
        sessionId: livePanel.sessionId,
      });
      const nextSetup = await fetchHostSetup(client);
      setSessionSummary(result.summary);
      setSetup(nextSetup);
      setLivePanel(null);
      return result;
    } catch (nextError) {
      setError(parseError(nextError));
      throw nextError;
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    setError(null);

    try {
      if (demoMode) {
        if (setup?.spaces[0]?.qrSlug) {
          clearBrowserRoomState(setup.spaces[0].qrSlug);
        }
        await clearDemoState();
        setDemoMode(false);
        setAuthenticated(false);
        setSetup(null);
        setLivePanel(null);
        setSessionSummary(null);
        setDraft(createHostSetupDraft());
        return;
      }

      const client = getSupabaseClient();

      if (client) {
        await client.auth.signOut();
      }

      setAuthenticated(false);
      setSetup(null);
      setLivePanel(null);
      setSessionSummary(null);
      setDraft(createHostSetupDraft());
    } catch (nextError) {
      setError(parseError(nextError));
      throw nextError;
    } finally {
      setBusy(false);
    }
  }

  const value: HostAppContextValue = {
    ready,
    busy,
    authenticated,
    demoMode,
    error,
    pendingPhone,
    draft,
    setup,
    livePanel,
    sessionSummary,
    requestOtp,
    verifyOtp,
    startDemoMode,
    updateDraft,
    saveCurrentSetup,
    goLiveNow,
    refreshSetup,
    refreshLivePanel,
    pinCurrentItem,
    endCurrentSession,
    signOut,
  };

  return <HostAppContext.Provider value={value}>{children}</HostAppContext.Provider>;
}

export function useHostApp() {
  const value = useContext(HostAppContext);

  if (!value) {
    throw new Error("useHostApp must be used within HostAppProvider");
  }

  return value;
}
