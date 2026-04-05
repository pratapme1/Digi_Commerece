import AsyncStorage from "@react-native-async-storage/async-storage";

import type { DemoOperationsState, DemoRoomState, HostSetupSnapshot } from "@digi/domain";

const DEMO_AUTH_KEY = "digi:host:demo-authenticated";
const DEMO_PHONE_KEY = "digi:host:demo-phone";
const DEMO_SETUP_KEY = "digi:host:demo-setup";
const DEMO_ROOM_KEY = "digi:host:demo-room";
const DEMO_OPERATIONS_KEY = "digi:host:demo-operations";

export async function loadDemoAuthenticated(): Promise<boolean> {
  return (await AsyncStorage.getItem(DEMO_AUTH_KEY)) === "true";
}

export async function persistDemoAuthenticated(value: boolean): Promise<void> {
  await AsyncStorage.setItem(DEMO_AUTH_KEY, value ? "true" : "false");
}

export async function loadDemoPhone(): Promise<string> {
  return (await AsyncStorage.getItem(DEMO_PHONE_KEY)) ?? "+91 99999 99999";
}

export async function persistDemoPhone(value: string): Promise<void> {
  await AsyncStorage.setItem(DEMO_PHONE_KEY, value);
}

export async function loadDemoSetup(): Promise<HostSetupSnapshot | null> {
  const raw = await AsyncStorage.getItem(DEMO_SETUP_KEY);
  return raw ? (JSON.parse(raw) as HostSetupSnapshot) : null;
}

export async function persistDemoSetup(setup: HostSetupSnapshot | null): Promise<void> {
  if (!setup) {
    await AsyncStorage.removeItem(DEMO_SETUP_KEY);
    return;
  }

  await AsyncStorage.setItem(DEMO_SETUP_KEY, JSON.stringify(setup));
}

export async function loadDemoRoom(): Promise<DemoRoomState | null> {
  const raw = await AsyncStorage.getItem(DEMO_ROOM_KEY);
  return raw ? (JSON.parse(raw) as DemoRoomState) : null;
}

export async function persistDemoRoom(room: DemoRoomState | null): Promise<void> {
  if (!room) {
    await AsyncStorage.removeItem(DEMO_ROOM_KEY);
    return;
  }

  await AsyncStorage.setItem(DEMO_ROOM_KEY, JSON.stringify(room));
}

export async function loadDemoOperations(): Promise<DemoOperationsState | null> {
  const raw = await AsyncStorage.getItem(DEMO_OPERATIONS_KEY);
  return raw ? (JSON.parse(raw) as DemoOperationsState) : null;
}

export async function persistDemoOperations(state: DemoOperationsState | null): Promise<void> {
  if (!state) {
    await AsyncStorage.removeItem(DEMO_OPERATIONS_KEY);
    return;
  }

  await AsyncStorage.setItem(DEMO_OPERATIONS_KEY, JSON.stringify(state));
}

export async function clearDemoState(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(DEMO_AUTH_KEY),
    AsyncStorage.removeItem(DEMO_PHONE_KEY),
    AsyncStorage.removeItem(DEMO_SETUP_KEY),
    AsyncStorage.removeItem(DEMO_ROOM_KEY),
    AsyncStorage.removeItem(DEMO_OPERATIONS_KEY),
  ]);
}
