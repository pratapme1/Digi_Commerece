import Constants from "expo-constants";

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

export const hostAppConfig = {
  supabaseUrl: extra.supabaseUrl ?? "",
  supabaseAnonKey: extra.supabaseAnonKey ?? "",
  attendeeBaseUrl: extra.attendeeBaseUrl ?? "https://spaces.app/s",
  demoModeEnabled:
    extra.demoModeEnabled === undefined ||
    extra.demoModeEnabled === "true" ||
    extra.demoModeEnabled === "1",
};
