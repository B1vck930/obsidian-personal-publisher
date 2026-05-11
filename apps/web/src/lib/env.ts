import { defaultPublicPageConfig, isPublicPageTheme } from "./theme";

type EnvSource = Record<string, string | undefined>;

export type WebEnv = {
  siteUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  supabaseStorageBucket: string;
  cleanupSecret: string;
  defaultTheme: string;
  defaultExpirationDays: number;
  defaultFooterText: string;
};

export type ServerSupabaseEnv = Pick<
  WebEnv,
  "supabaseUrl" | "supabaseServiceRoleKey"
>;

const requiredWebEnvKeys = [
  "NEXT_PUBLIC_SITE_URL",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_STORAGE_BUCKET",
  "CLEANUP_SECRET"
] as const;

const requiredServerSupabaseEnvKeys = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY"
] as const;

type RequiredEnvKey =
  | (typeof requiredWebEnvKeys)[number]
  | (typeof requiredServerSupabaseEnvKeys)[number];

export class EnvError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnvError";
  }
}

export function getWebEnv(source: EnvSource = process.env): WebEnv {
  const missing = requiredWebEnvKeys.filter((key) => !source[key]);

  if (missing.length > 0) {
    throw new EnvError(`Missing required environment variables: ${missing.join(", ")}`);
  }

  const supabaseUrl = getRequired(source, "SUPABASE_URL");

  if (supabaseUrl.includes("/rest/v1")) {
    throw new EnvError("SUPABASE_URL must be the project URL and must not include /rest/v1.");
  }

  const expirationDays = parseExpirationDays(source.DEFAULT_EXPIRATION_DAYS);
  const theme = isPublicPageTheme(source.DEFAULT_THEME)
    ? source.DEFAULT_THEME
    : defaultPublicPageConfig.theme;

  return {
    siteUrl: trimTrailingSlash(getRequired(source, "NEXT_PUBLIC_SITE_URL")),
    supabaseUrl,
    supabaseAnonKey: getRequired(source, "SUPABASE_ANON_KEY"),
    supabaseServiceRoleKey: getRequired(source, "SUPABASE_SERVICE_ROLE_KEY"),
    supabaseStorageBucket: getRequired(source, "SUPABASE_STORAGE_BUCKET"),
    cleanupSecret: getRequired(source, "CLEANUP_SECRET"),
    defaultTheme: theme,
    defaultExpirationDays: expirationDays,
    defaultFooterText:
      source.DEFAULT_FOOTER_TEXT?.trim() || defaultPublicPageConfig.footerText
  };
}

export function getServerSupabaseEnv(
  source: EnvSource = process.env
): ServerSupabaseEnv {
  const missing = requiredServerSupabaseEnvKeys.filter((key) => !source[key]);

  if (missing.length > 0) {
    throw new EnvError(`Missing required environment variables: ${missing.join(", ")}`);
  }

  const supabaseUrl = getRequired(source, "SUPABASE_URL");

  if (supabaseUrl.includes("/rest/v1")) {
    throw new EnvError("SUPABASE_URL must be the project URL and must not include /rest/v1.");
  }

  return {
    supabaseUrl,
    supabaseServiceRoleKey: getRequired(source, "SUPABASE_SERVICE_ROLE_KEY")
  };
}

export function getPublicConfig(source: EnvSource = process.env) {
  const expirationDays = parseExpirationDays(source.DEFAULT_EXPIRATION_DAYS);
  const theme = isPublicPageTheme(source.DEFAULT_THEME)
    ? source.DEFAULT_THEME
    : defaultPublicPageConfig.theme;

  return {
    siteUrl: trimTrailingSlash(
      source.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    ),
    defaultTheme: theme,
    defaultExpirationDays: expirationDays,
    defaultFooterText:
      source.DEFAULT_FOOTER_TEXT?.trim() || defaultPublicPageConfig.footerText
  };
}

function getRequired(source: EnvSource, key: RequiredEnvKey): string {
  const value = source[key]?.trim();

  if (!value) {
    throw new EnvError(`Missing required environment variable: ${key}`);
  }

  return value;
}

function parseExpirationDays(value: string | undefined): number {
  const parsed = Number(value ?? defaultPublicPageConfig.expirationDays);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return defaultPublicPageConfig.expirationDays;
  }

  return parsed;
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}
