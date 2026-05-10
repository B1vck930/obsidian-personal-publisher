export type PublicPageTheme = "minimal" | "notion" | "obsidian" | "vercel";

export type PublishedPageMetadata = {
  pageId: string;
  url: string;
  ownerToken: string;
  slug: string;
  publishedAt: string;
  updatedAt: string;
  expiresAt: string;
};

export type PersonalPublisherSettings = {
  apiBaseUrl: string;
  defaultTheme: PublicPageTheme;
  defaultExpirationDays: number;
  footerText: string;
  maxImageSizeMb: number;
  publishedPages: Record<string, PublishedPageMetadata>;
};
