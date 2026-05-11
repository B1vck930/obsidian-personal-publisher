import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getWebEnv } from "../env";
import type { Database } from "./types";

export function createServerSupabaseClient() {
  const env = getWebEnv();

  return createClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
