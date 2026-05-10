import type { PersonalPublisherSettings } from "./types";

export const defaultSettings: PersonalPublisherSettings = {
  apiBaseUrl: "https://obsidian-personal-publisher.vercel.app",
  defaultTheme: "notion",
  defaultExpirationDays: 7,
  footerText: "Published by XIAOWANG - 18624433439",
  maxImageSizeMb: 5,
  publishedPages: {}
};

export const supportedThemes = ["notion", "minimal", "obsidian", "vercel"] as const;

export function normalizePositiveNumber(
  value: string,
  fallback: number,
  minimum = 1
): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < minimum) {
    return fallback;
  }

  return parsed;
}

export function normalizeSettings(
  settings: Partial<PersonalPublisherSettings> | null | undefined
): PersonalPublisherSettings {
  const loadedTheme = settings?.defaultTheme ?? defaultSettings.defaultTheme;

  return {
    apiBaseUrl: settings?.apiBaseUrl ?? defaultSettings.apiBaseUrl,
    defaultTheme: supportedThemes.includes(loadedTheme)
      ? loadedTheme
      : defaultSettings.defaultTheme,
    defaultExpirationDays: normalizePositiveNumber(
      String(settings?.defaultExpirationDays ?? defaultSettings.defaultExpirationDays),
      defaultSettings.defaultExpirationDays
    ),
    footerText: settings?.footerText ?? defaultSettings.footerText,
    maxImageSizeMb: normalizePositiveNumber(
      String(settings?.maxImageSizeMb ?? defaultSettings.maxImageSizeMb),
      defaultSettings.maxImageSizeMb
    ),
    publishedPages: settings?.publishedPages ?? {}
  };
}
