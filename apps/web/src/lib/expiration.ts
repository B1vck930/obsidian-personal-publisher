import { defaultPublicPageConfig } from "./theme";
import type { PageRow } from "./supabase/types";

const millisecondsPerDay = 24 * 60 * 60 * 1000;

export function calculateExpiresAt(
  now: Date = new Date(),
  expiresInDays: number = defaultPublicPageConfig.expirationDays
): string {
  const safeDays =
    Number.isFinite(expiresInDays) && expiresInDays > 0
      ? expiresInDays
      : defaultPublicPageConfig.expirationDays;

  return new Date(now.getTime() + safeDays * millisecondsPerDay).toISOString();
}

export function isPagePubliclyAvailable(
  page: Pick<PageRow, "deleted_at" | "expires_at"> | null,
  now: Date = new Date()
): boolean {
  if (!page || page.deleted_at) {
    return false;
  }

  return new Date(page.expires_at).getTime() > now.getTime();
}
