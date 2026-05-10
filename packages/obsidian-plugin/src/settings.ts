import type { PersonalPublisherSettings } from "./types";

export const defaultSettings: PersonalPublisherSettings = {
  apiBaseUrl: "https://your-vercel-app.vercel.app",
  defaultTheme: "notion",
  defaultExpirationDays: 7,
  footerText: "Published by XIAOWANG - 18624433439",
  maxImageSizeMb: 5,
  publishedPages: {}
};
