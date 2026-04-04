import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";

import type { GoLiveResult, SaveHostSetupInput } from "@digi/api-contracts";
import { createHostSetupDraft, type HostSetupDraft, type HostSetupSnapshot } from "@digi/domain";

import { clearDemoState, loadDemoAuthenticated, loadDemoPhone, loadDemoSetup, persistDemoAuthenticated, persistDemoPhone, persistDemoSetup } from "./lib/demo-state";
import { hostAppConfig } from "./lib/config";
import { applyDemoGoLive, createDemoSnapshot, createEmptyDraft, fetchHostSetup, goLive, saveHostSetup } from "./lib/host-service";
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
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  startDemoMode: () => Promise<void>;
  updateDraft: (patch: Partial<HostSetupDraft>) => void;
  saveCurrentSetup: () => Promise<HostSetupSnapshot>;
  goLiveNow: (durationMinutes: number) => Promise<GoLiveResult>;
  refreshSetup: () => Promise<void>;
  signOut: () => Promise<void>;
}

const HostAppContext = createContext<HostAppContextValue | null>(null);

function parseError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
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
            setDemoMode(true);
            setAuthenticated(true);
            setPendingPhone(demoPhone);
            setSetup(demoSetup);
          }
        }

        if (client) {
          const {
            data: { session },
          } = await client.auth.getSession();

          if (isMounted && session) {
            setAuthenticated(true);
            setPendingPhone(session.user.phone ?? "+91 ");
            setSetup(await fetchHostSetup(client));
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
      } else {
        void refreshSetupFromClient(client);
      }
    });

    async function refreshSetupFromClient(supabaseClient: NonNullable<ReturnType<typeof getSupabaseClient>>) {
      try {
        setSetup(await fetchHostSetup(supabaseClient));
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

      setPendingPhone(phone);
      setAuthenticated(true);
      setSetup(await fetchHostSetup(client));
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
      setDemoMode(true);
      setAuthenticated(true);
      setPendingPhone("+91 99999 99999");
      setSetup((await loadDemoSetup()) ?? null);
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
      const space =
        currentSetup?.spaces.find((item: HostSetupSnapshot["spaces"][number]) => item.isDefault) ??
        currentSetup?.spaces[0];

      if (!currentSetup || !space) {
        throw new Error("Finish setup before going live.");
      }

      if (demoMode) {
        const { nextSnapshot, result } = applyDemoGoLive(currentSetup, {
          durationMinutes,
          spaceId: space.id,
        });
        setSetup(nextSnapshot);
        await persistDemoSetup(nextSnapshot);
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
      setSetup(await fetchHostSetup(client));
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
      setSetup((await loadDemoSetup()) ?? null);
      return;
    }

    const client = getSupabaseClient();

    if (!client || !authenticated) {
      return;
    }

    setSetup(await fetchHostSetup(client));
  }

  async function signOut() {
    setBusy(true);
    setError(null);

    try {
      if (demoMode) {
        await clearDemoState();
        setDemoMode(false);
        setAuthenticated(false);
        setSetup(null);
        setDraft(createHostSetupDraft());
        return;
      }

      const client = getSupabaseClient();

      if (client) {
        await client.auth.signOut();
      }

      setAuthenticated(false);
      setSetup(null);
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
    requestOtp,
    verifyOtp,
    startDemoMode,
    updateDraft,
    saveCurrentSetup,
    goLiveNow,
    refreshSetup,
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
