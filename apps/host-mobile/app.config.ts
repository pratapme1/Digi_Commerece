import path from "node:path";
import { loadEnvFile } from "node:process";

import type { ExpoConfig } from "expo/config";

loadEnvFile(path.resolve(__dirname, "../../.env"));

const config: ExpoConfig = {
  name: "Digi Host",
  slug: "digi-host",
  scheme: "digi-host",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  plugins: ["expo-router"],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    attendeeBaseUrl: process.env.EXPO_PUBLIC_ATTENDEE_BASE_URL ?? "https://spaces.app/s",
    demoModeEnabled: process.env.EXPO_PUBLIC_ENABLE_DEMO_MODE ?? "true",
  },
};

export default config;
