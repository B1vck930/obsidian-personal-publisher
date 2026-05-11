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
    }
  });
}
