"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { attendeeAppConfig } from "./config";

let client: SupabaseClient | null = null;

export function getAttendeeSupabaseClient(): SupabaseClient | null {
  if (!attendeeAppConfig.supabaseUrl || !attendeeAppConfig.supabaseAnonKey) {
    return null;
  }

  if (!client) {
    client = createClient(attendeeAppConfig.supabaseUrl, attendeeAppConfig.supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return client;
}
