import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getServerSupabaseEnv } from "../env";
import type { Database } from "./types";

export function createServerSupabaseClient() {
  const env = getServerSupabaseEnv();

  return createClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        fetch(input, {
          ...init,
          cache: "no-store"
        })
    }
  });
}
