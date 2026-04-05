import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";

import type {
  EndLiveSessionResult,
  GoLiveResult,
  LivePanelResponse,
  SaveHostSetupInput,
} from "@digi/api-contracts";
import {
  applyDemoArchiveSpace,
  applyDemoAssignSpaceBrand,
  applyDemoCreateBrandProfile,
  applyDemoCreateSpace,
  applyDemoDeleteSpace,
  applyDemoImportJob,
  applyDemoInviteTeamMember,
  applyDemoRemoveTeamAccess,
  buildOperationsSnapshot,
  createDemoOperationsState,
  createEmptyOperationsSnapshot,
  createHostSetupDraft,
  getPrimaryHostSpace,
  recordDemoSessionSummary,
  validateBrandProfileInput,
  validateCatalogImportCsv,
  type AnalyticsRange,
  type CreateBrandProfileInput,
  type CreateSpaceInput,
  type HostSetupDraft,
  type HostSetupSnapshot,
  type InviteTeamMemberInput,
  type LiveContentItem,
  type OperationsSnapshot,
  type RemoveTeamAccessInput,
  type SessionSummarySnapshot,
  type SubmitCatalogImportInput,
} from "@digi/domain";

import {
  clearDemoState,
  loadDemoAuthenticated,
  loadDemoOperations,
  loadDemoPhone,
  loadDemoRoom,
  loadDemoSetup,
  persistDemoAuthenticated,
  persistDemoOperations,
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
  archiveSpace,
  assignSpaceBrand,
  createBrandProfile,
  createDemoSnapshot,
  createEmptyDraft,
  createSpace,
  deleteSpace,
  endLiveSession,
  fetchHostSetup,
  fetchLivePanel,
  fetchOperationsSnapshot,
  getDemoLivePanel,
  goLive,
  inviteTeamMember,
  pinLiveContent,
  recordCatalogImport,
  removeTeamAccess,
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
  operations: OperationsSnapshot | null;
  operationsRange: AnalyticsRange;
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  startDemoMode: () => Promise<void>;
  updateDraft: (patch: Partial<HostSetupDraft>) => void;
  saveCurrentSetup: () => Promise<HostSetupSnapshot>;
  goLiveNow: (durationMinutes: number) => Promise<GoLiveResult>;
  refreshSetup: () => Promise<void>;
  refreshLivePanel: () => Promise<void>;
  refreshOperations: (range?: AnalyticsRange) => Promise<void>;
  pinCurrentItem: (content: LiveContentItem) => Promise<void>;
  endCurrentSession: () => Promise<EndLiveSessionResult>;
  createBrand: (input: CreateBrandProfileInput) => Promise<void>;
  createNewSpace: (input: CreateSpaceInput) => Promise<void>;
  assignBrandToSpace: (spaceId: string, brandProfileId: string) => Promise<void>;
  inviteTeamAccess: (input: InviteTeamMemberInput) => Promise<void>;
  removeTeamAccessEntry: (input: RemoveTeamAccessInput) => Promise<void>;
  submitCatalogImport: (input: SubmitCatalogImportInput) => Promise<void>;
  archiveSpaceById: (spaceId: string) => Promise<void>;
  deleteSpaceById: (spaceId: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const HostAppContext = createContext<HostAppContextValue | null>(null);

function parseError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

async function loadPreferredDemoRoom(snapshot: HostSetupSnapshot | null) {
  const primarySpace = getPrimaryHostSpace(snapshot);
  return (primarySpace ? loadBrowserRoomState(primarySpace.qrSlug) : null) ?? (await loadDemoRoom());
}

async function loadPreferredDemoOperations(snapshot: HostSetupSnapshot | null) {
  const stored = await loadDemoOperations();

  if (stored) {
    return stored;
  }

  const seeded = createDemoOperationsState(snapshot);
  await persistDemoOperations(seeded);
  return seeded;
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
  const [operations, setOperations] = useState<OperationsSnapshot | null>(null);
  const [operationsRange, setOperationsRange] = useState<AnalyticsRange>("30d");

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
            const [demoRoom, demoOperations] = await Promise.all([
              loadPreferredDemoRoom(demoSetup ?? null),
              loadPreferredDemoOperations(demoSetup ?? null),
            ]);
            const nextLivePanel = getDemoLivePanel(demoRoom);

            setDemoMode(true);
            setAuthenticated(true);
            setPendingPhone(demoPhone);
            setSetup(demoSetup);
            setLivePanel(nextLivePanel);
            setSessionSummary(nextLivePanel?.summary ?? null);
            setOperations(buildOperationsSnapshot(demoOperations, demoSetup?.spaces ?? [], operationsRange));
          }
        }

        if (client) {
          const {
            data: { session },
          } = await client.auth.getSession();

          if (isMounted && session) {
            const nextSetup = await fetchHostSetup(client);
            const primarySpace = getPrimaryHostSpace(nextSetup);
            const nextOperations = nextSetup.account
              ? await fetchOperationsSnapshot(client, { range: operationsRange })
              : createEmptyOperationsSnapshot(operationsRange);

            setAuthenticated(true);
            setPendingPhone(session.user.phone ?? "+91 ");
            setSetup(nextSetup);
            setLivePanel(await fetchLivePanel(client, primarySpace?.id));
            setOperations(nextOperations);
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
        setOperations(null);
      } else {
        void refreshSetupFromClient(client);
      }
    });

    async function refreshSetupFromClient(supabaseClient: NonNullable<ReturnType<typeof getSupabaseClient>>) {
      try {
        const nextSetup = await fetchHostSetup(supabaseClient);
        const primarySpace = getPrimaryHostSpace(nextSetup);
        const nextOperations = nextSetup.account
          ? await fetchOperationsSnapshot(supabaseClient, { range: operationsRange })
          : createEmptyOperationsSnapshot(operationsRange);

        setSetup(nextSetup);
        setLivePanel(await fetchLivePanel(supabaseClient, primarySpace?.id));
        setOperations(nextOperations);
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
      const primarySpace = getPrimaryHostSpace(nextSetup);
      const nextOperations = nextSetup.account
        ? await fetchOperationsSnapshot(client, { range: operationsRange })
        : createEmptyOperationsSnapshot(operationsRange);

      setPendingPhone(phone);
      setAuthenticated(true);
      setSetup(nextSetup);
      setLivePanel(await fetchLivePanel(client, primarySpace?.id));
      setOperations(nextOperations);
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
      const [demoRoom, demoOperations] = await Promise.all([
        loadPreferredDemoRoom(demoSetup ?? null),
        loadPreferredDemoOperations(demoSetup ?? null),
      ]);
      const nextLivePanel = getDemoLivePanel(demoRoom);

      setDemoMode(true);
      setAuthenticated(true);
      setPendingPhone("+91 99999 99999");
      setSetup(demoSetup ?? null);
      setLivePanel(nextLivePanel);
      setSessionSummary(nextLivePanel?.summary ?? null);
      setOperations(buildOperationsSnapshot(demoOperations, demoSetup?.spaces ?? [], operationsRange));
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
        const nextOperationsState = createDemoOperationsState(nextSetup);

        setSetup(nextSetup);
        setOperations(buildOperationsSnapshot(nextOperationsState, nextSetup.spaces, operationsRange));
        await Promise.all([
          persistDemoSetup(nextSetup),
          persistDemoOperations(nextOperationsState),
        ]);
        return nextSetup;
      }

      const client = getSupabaseClient();

      if (!client) {
        throw new Error("Supabase credentials are missing. Use demo mode or add mobile runtime config.");
      }

      const nextSetup = await saveHostSetup(client, input);
      setSetup(nextSetup);
      setDraft(createEmptyDraft());
      setOperations(
        nextSetup.account
          ? await fetchOperationsSnapshot(client, { range: operationsRange })
          : createEmptyOperationsSnapshot(operationsRange),
      );
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
      const space = getPrimaryHostSpace(currentSetup);

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
      setOperations(await fetchOperationsSnapshot(client, { range: operationsRange }));
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
      const [demoRoom, demoOperationsState] = await Promise.all([
        loadPreferredDemoRoom(demoSetup ?? null),
        loadPreferredDemoOperations(demoSetup ?? null),
      ]);
      const nextLivePanel = getDemoLivePanel(demoRoom);

      setSetup(demoSetup ?? null);
      setLivePanel(nextLivePanel);
      setSessionSummary(nextLivePanel?.summary ?? null);
      setOperations(buildOperationsSnapshot(demoOperationsState, demoSetup?.spaces ?? [], operationsRange));
      return;
    }

    const client = getSupabaseClient();

    if (!client || !authenticated) {
      return;
    }

    const nextSetup = await fetchHostSetup(client);
    const primarySpace = getPrimaryHostSpace(nextSetup);
    const nextOperations = nextSetup.account
      ? await fetchOperationsSnapshot(client, { range: operationsRange })
      : createEmptyOperationsSnapshot(operationsRange);

    setSetup(nextSetup);
    setLivePanel(await fetchLivePanel(client, primarySpace?.id));
    setOperations(nextOperations);
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

    const primarySpace = getPrimaryHostSpace(setup);
    const nextLivePanel = await fetchLivePanel(client, primarySpace?.id);
    setLivePanel(nextLivePanel);
    setSessionSummary(nextLivePanel?.summary ?? null);
  }

  async function refreshOperations(range = operationsRange) {
    setError(null);
    setOperationsRange(range);

    if (demoMode) {
      const demoOperationsState = await loadPreferredDemoOperations(setup);
      setOperations(buildOperationsSnapshot(demoOperationsState, setup?.spaces ?? [], range));
      return;
    }

    const client = getSupabaseClient();

    if (!client || !authenticated) {
      return;
    }

    if (!setup?.account) {
      setOperations(createEmptyOperationsSnapshot(range));
      return;
    }

    setOperations(await fetchOperationsSnapshot(client, { range }));
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
      const primarySpace = getPrimaryHostSpace(setup);
      setLivePanel(await fetchLivePanel(client, primarySpace?.id));
      setOperations(await fetchOperationsSnapshot(client, { range: operationsRange }));
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
        const nextOperationsState = recordDemoSessionSummary(
          await loadPreferredDemoOperations(currentSetup),
          nextSetup,
          next.result.summary,
        );

        setLivePanel(nextLivePanel);
        setSessionSummary(next.result.summary);
        setSetup(nextSetup);
        setOperations(buildOperationsSnapshot(nextOperationsState, nextSetup?.spaces ?? [], operationsRange));
        await Promise.all([
          persistDemoRoom(next.roomState),
          persistDemoSetup(nextSetup),
          persistDemoOperations(nextOperationsState),
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
      setOperations(await fetchOperationsSnapshot(client, { range: operationsRange }));
      return result;
    } catch (nextError) {
      setError(parseError(nextError));
      throw nextError;
    } finally {
      setBusy(false);
    }
  }

  async function createBrand(input: CreateBrandProfileInput) {
    setBusy(true);
    setError(null);

    try {
      const validationError = validateBrandProfileInput(input);
      if (validationError) {
        throw new Error(validationError);
      }

      if (!setup) {
        throw new Error("Finish setup before creating more brands.");
      }

      if (demoMode) {
        const nextSetup = applyDemoCreateBrandProfile(setup, input);
        setSetup(nextSetup);
        await persistDemoSetup(nextSetup);
        await refreshOperations();
        return;
      }

      const client = getSupabaseClient();

      if (!client) {
        throw new Error("Supabase credentials are missing. Use demo mode or add mobile runtime config.");
      }

      await createBrandProfile(client, input);
      const nextSetup = await fetchHostSetup(client);

      setSetup(nextSetup);
      setOperations(await fetchOperationsSnapshot(client, { range: operationsRange }));
    } catch (nextError) {
      setError(parseError(nextError));
      throw nextError;
    } finally {
      setBusy(false);
    }
  }

  async function createNewSpace(input: CreateSpaceInput) {
    setBusy(true);
    setError(null);

    try {
      if (!setup) {
        throw new Error("Finish setup before creating more spaces.");
      }

      if (demoMode) {
        const nextSetup = applyDemoCreateSpace(setup, input);
        setSetup(nextSetup);
        await persistDemoSetup(nextSetup);
        await refreshOperations();
        return;
      }

      const client = getSupabaseClient();

      if (!client) {
        throw new Error("Supabase credentials are missing. Use demo mode or add mobile runtime config.");
      }

      await createSpace(client, input);
      const nextSetup = await fetchHostSetup(client);

      setSetup(nextSetup);
      setOperations(await fetchOperationsSnapshot(client, { range: operationsRange }));
    } catch (nextError) {
      setError(parseError(nextError));
      throw nextError;
    } finally {
      setBusy(false);
    }
  }

  async function assignBrandToSpace(spaceId: string, brandProfileId: string) {
    setBusy(true);
    setError(null);

    try {
      if (!setup) {
        throw new Error("Finish setup before editing spaces.");
      }

      if (demoMode) {
        const nextSetup = applyDemoAssignSpaceBrand(setup, { spaceId, brandProfileId });
        setSetup(nextSetup);
        await persistDemoSetup(nextSetup);
        await refreshOperations();
        return;
      }

      const client = getSupabaseClient();

      if (!client) {
        throw new Error("Supabase credentials are missing. Use demo mode or add mobile runtime config.");
      }

      await assignSpaceBrand(client, { spaceId, brandProfileId });
      const nextSetup = await fetchHostSetup(client);

      setSetup(nextSetup);
      setOperations(await fetchOperationsSnapshot(client, { range: operationsRange }));
    } catch (nextError) {
      setError(parseError(nextError));
      throw nextError;
    } finally {
      setBusy(false);
    }
  }

  async function inviteTeamAccess(input: InviteTeamMemberInput) {
    setBusy(true);
    setError(null);

    try {
      if (demoMode) {
        const nextState = applyDemoInviteTeamMember(await loadPreferredDemoOperations(setup), input);
        setOperations(buildOperationsSnapshot(nextState, setup?.spaces ?? [], operationsRange));
        await persistDemoOperations(nextState);
        return;
      }

      const client = getSupabaseClient();

      if (!client) {
        throw new Error("Supabase credentials are missing. Use demo mode or add mobile runtime config.");
      }

      await inviteTeamMember(client, input);
      setOperations(await fetchOperationsSnapshot(client, { range: operationsRange }));
    } catch (nextError) {
      setError(parseError(nextError));
      throw nextError;
    } finally {
      setBusy(false);
    }
  }

  async function removeTeamAccessEntry(input: RemoveTeamAccessInput) {
    setBusy(true);
    setError(null);

    try {
      if (demoMode) {
        const nextState = applyDemoRemoveTeamAccess(await loadPreferredDemoOperations(setup), input);
        setOperations(buildOperationsSnapshot(nextState, setup?.spaces ?? [], operationsRange));
        await persistDemoOperations(nextState);
        return;
      }

      const client = getSupabaseClient();

      if (!client) {
        throw new Error("Supabase credentials are missing. Use demo mode or add mobile runtime config.");
      }

      await removeTeamAccess(client, input);
      setOperations(await fetchOperationsSnapshot(client, { range: operationsRange }));
    } catch (nextError) {
      setError(parseError(nextError));
      throw nextError;
    } finally {
      setBusy(false);
    }
  }

  async function submitCatalogImport(input: SubmitCatalogImportInput) {
    setBusy(true);
    setError(null);

    try {
      const validation = validateCatalogImportCsv(input.csvText, setup);

      if (demoMode) {
        const nextState = applyDemoImportJob(await loadPreferredDemoOperations(setup), validation, input);
        setOperations(buildOperationsSnapshot(nextState, setup?.spaces ?? [], operationsRange));
        await persistDemoOperations(nextState);
        return;
      }

      const client = getSupabaseClient();

      if (!client) {
        throw new Error("Supabase credentials are missing. Use demo mode or add mobile runtime config.");
      }

      await recordCatalogImport(client, {
        fileName: input.fileName,
        spaceId: input.spaceId,
        processedRows: validation.processedRows,
        acceptedRows: validation.acceptedRows,
        rejectedRows: validation.rejectedRows,
        status: validation.status,
        rows: validation.rows,
      });
      setOperations(await fetchOperationsSnapshot(client, { range: operationsRange }));
    } catch (nextError) {
      setError(parseError(nextError));
      throw nextError;
    } finally {
      setBusy(false);
    }
  }

  async function archiveSpaceById(spaceId: string) {
    setBusy(true);
    setError(null);

    try {
      if (!setup) {
        throw new Error("Finish setup before archiving spaces.");
      }

      if (demoMode) {
        const nextSetup = applyDemoArchiveSpace(setup, spaceId);
        setSetup(nextSetup);
        await persistDemoSetup(nextSetup);
        await refreshOperations();
        return;
      }

      const client = getSupabaseClient();

      if (!client) {
        throw new Error("Supabase credentials are missing. Use demo mode or add mobile runtime config.");
      }

      await archiveSpace(client, { spaceId });
      const nextSetup = await fetchHostSetup(client);

      setSetup(nextSetup);
      setOperations(await fetchOperationsSnapshot(client, { range: operationsRange }));
    } catch (nextError) {
      setError(parseError(nextError));
      throw nextError;
    } finally {
      setBusy(false);
    }
  }

  async function deleteSpaceById(spaceId: string) {
    setBusy(true);
    setError(null);

    try {
      if (!setup) {
        throw new Error("Finish setup before deleting spaces.");
      }

      if (demoMode) {
        const nextSetup = applyDemoDeleteSpace(setup, spaceId);

        setSetup(nextSetup);
        await persistDemoSetup(nextSetup);
        await refreshOperations();
        return;
      }

      const client = getSupabaseClient();

      if (!client) {
        throw new Error("Supabase credentials are missing. Use demo mode or add mobile runtime config.");
      }

      await deleteSpace(client, { spaceId });
      const nextSetup = await fetchHostSetup(client);

      setSetup(nextSetup);
      setOperations(await fetchOperationsSnapshot(client, { range: operationsRange }));
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
        const primarySpace = getPrimaryHostSpace(setup);

        if (primarySpace?.qrSlug) {
          clearBrowserRoomState(primarySpace.qrSlug);
        }

        await clearDemoState();
        setDemoMode(false);
        setAuthenticated(false);
        setSetup(null);
        setLivePanel(null);
        setSessionSummary(null);
        setOperations(createEmptyOperationsSnapshot());
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
      setOperations(null);
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
    operations,
    operationsRange,
    requestOtp,
    verifyOtp,
    startDemoMode,
    updateDraft,
    saveCurrentSetup,
    goLiveNow,
    refreshSetup,
    refreshLivePanel,
    refreshOperations,
    pinCurrentItem,
    endCurrentSession,
    createBrand,
    createNewSpace,
    assignBrandToSpace,
    inviteTeamAccess,
    removeTeamAccessEntry,
    submitCatalogImport,
    archiveSpaceById,
    deleteSpaceById,
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
