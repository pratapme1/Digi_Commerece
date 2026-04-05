import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { hostAppConfig } from "./config";

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!hostAppConfig.supabaseUrl || !hostAppConfig.supabaseAnonKey) {
    return null;
  }

  if (!client) {
    client = createClient(hostAppConfig.supabaseUrl, hostAppConfig.supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        storage: AsyncStorage,
      },
    });
  }

  return client;
}
