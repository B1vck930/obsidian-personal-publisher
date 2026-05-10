export const defaultPublicPageConfig = {
  theme: "notion",
  footerText: "Published by XIAOWANG - 18624433439",
  expirationDays: 7
} as const;

export type PublicPageTheme = "minimal" | "notion" | "obsidian" | "vercel";
