import { describe, expect, it } from "vitest";
import {
  getAssetStorageEnv,
  getPublicConfig,
  getServerSupabaseEnv,
  getWebEnv
} from "./env";

describe("web env", () => {
  it("reads footer config from one place", () => {
    expect(
      getPublicConfig({
        DEFAULT_FOOTER_TEXT: "Custom footer"
      }).defaultFooterText
    ).toBe("Custom footer");
  });

  it("rejects Supabase REST URLs", () => {
    expect(() =>
      getWebEnv({
        NEXT_PUBLIC_SITE_URL: "https://example.com",
        SUPABASE_URL: "https://example.supabase.co/rest/v1",
        SUPABASE_ANON_KEY: "anon",
        SUPABASE_SERVICE_ROLE_KEY: "service",
        SUPABASE_STORAGE_BUCKET: "note-assets",
        CLEANUP_SECRET: "secret"
      })
    ).toThrow(/must not include/);
  });

  it("only requires Supabase URL and service role for server database access", () => {
    expect(
      getServerSupabaseEnv({
        SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "service"
      })
    ).toEqual({
      supabaseUrl: "https://example.supabase.co",
      supabaseServiceRoleKey: "service"
    });
  });

  it("only requires Supabase storage variables for asset uploads", () => {
    expect(
      getAssetStorageEnv({
        SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "service",
        SUPABASE_STORAGE_BUCKET: "note-assets"
      })
    ).toEqual({
      supabaseUrl: "https://example.supabase.co",
      supabaseServiceRoleKey: "service",
      supabaseStorageBucket: "note-assets"
    });
  });
});
