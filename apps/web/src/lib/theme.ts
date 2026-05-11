export const defaultPublicPageConfig = {
  theme: "notion",
  footerText: "Published by XIAOWANG - 18624433439",
  expirationDays: 7
} as const;

export type PublicPageTheme = "minimal" | "notion" | "obsidian" | "vercel";

const publicPageThemes = new Set<string>(["minimal", "notion", "obsidian", "vercel"]);

export function isPublicPageTheme(value: unknown): value is PublicPageTheme {
  return typeof value === "string" && publicPageThemes.has(value);
}
