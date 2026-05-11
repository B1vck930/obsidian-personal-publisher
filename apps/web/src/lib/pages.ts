import { verifyOwnerToken, hashOwnerToken } from "./auth";
import { calculateExpiresAt, isPagePubliclyAvailable } from "./expiration";
import { getPublicConfig } from "./env";
import { renderMarkdown } from "./markdown";
import { generateOwnerToken, generateSlug } from "./token";
import { defaultPublicPageConfig, isPublicPageTheme } from "./theme";
import { buildPublicPageUrl } from "./urls";
import type { PageInsert, PageRow, PageUpdate } from "./supabase/types";

export type PageInput = {
  title: string;
  markdown: string;
  theme: string;
  footerText: string;
  expiresInDays: number;
};

export type CreatePageResult = {
  pageId: string;
  slug: string;
  url: string;
  ownerToken: string;
  expiresAt: string;
};

export type UpdatePageResult = Omit<CreatePageResult, "ownerToken">;

export type PageRepository = {
  insertPage: (page: PageInsert) => Promise<PageRow>;
  getPageById: (id: string) => Promise<PageRow | null>;
  getPageBySlug: (slug: string) => Promise<PageRow | null>;
  updatePage: (id: string, patch: PageUpdate) => Promise<PageRow>;
  deletePage: (id: string) => Promise<void>;
};

export class PageApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "PageApiError";
    this.status = status;
  }
}

export async function createPage(
  repository: PageRepository,
  input: PageInput,
  now: Date = new Date()
): Promise<CreatePageResult> {
  const config = getPublicConfig();
  const ownerToken = generateOwnerToken();
  const expiresAt = calculateExpiresAt(now, input.expiresInDays);
  const slug = generateSlug();
  const page = await repository.insertPage({
    slug,
    title: input.title,
    markdown: input.markdown,
    html: renderMarkdown(input.markdown),
    theme: input.theme,
    footer_text: input.footerText,
    owner_token_hash: hashOwnerToken(ownerToken),
    expires_at: expiresAt
  });

  return {
    pageId: page.id,
    slug: page.slug,
    url: buildPublicPageUrl(config.siteUrl, page.slug),
    ownerToken,
    expiresAt: page.expires_at
  };
}

export async function updatePage(
  repository: PageRepository,
  id: string,
  ownerToken: string,
  input: PageInput,
  now: Date = new Date()
): Promise<UpdatePageResult> {
  const config = getPublicConfig();
  const existing = await requireOwnedPage(repository, id, ownerToken);
  const expiresAt = calculateExpiresAt(now, input.expiresInDays);
  const updated = await repository.updatePage(existing.id, {
    title: input.title,
    markdown: input.markdown,
    html: renderMarkdown(input.markdown),
    theme: input.theme,
    footer_text: input.footerText,
    updated_at: now.toISOString(),
    expires_at: expiresAt,
    deleted_at: null
  });

  return {
    pageId: updated.id,
    slug: updated.slug,
    url: buildPublicPageUrl(config.siteUrl, updated.slug),
    expiresAt: updated.expires_at
  };
}

export async function deletePage(
  repository: PageRepository,
  id: string,
  ownerToken: string
): Promise<void> {
  const existing = await requireOwnedPage(repository, id, ownerToken);
  await repository.deletePage(existing.id);
}

export async function getAvailablePublicPage(
  repository: PageRepository,
  slug: string,
  now: Date = new Date()
): Promise<PageRow | null> {
  const page = await repository.getPageBySlug(slug);

  return isPagePubliclyAvailable(page, now) ? page : null;
}

export function parseCreatePageBody(body: unknown): PageInput {
  return normalizePageInput(body);
}

export function parseUpdatePageBody(body: unknown): {
  ownerToken: string;
  page: PageInput;
} {
  const payload = getObject(body);
  const ownerToken = getRequiredString(payload, "ownerToken");

  return {
    ownerToken,
    page: normalizePageInput(payload)
  };
}

export function parseDeletePageBody(body: unknown): { ownerToken: string } {
  const payload = getObject(body);

  return {
    ownerToken: getRequiredString(payload, "ownerToken")
  };
}

async function requireOwnedPage(
  repository: PageRepository,
  id: string,
  ownerToken: string
): Promise<PageRow> {
  const page = await repository.getPageById(id);

  if (!page || page.deleted_at) {
    throw new PageApiError(404, "Page not found.");
  }

  if (!verifyOwnerToken(ownerToken, page.owner_token_hash)) {
    throw new PageApiError(403, "Invalid owner token.");
  }

  return page;
}

function normalizePageInput(body: unknown): PageInput {
  const payload = getObject(body);
  const config = getPublicConfig();
  const title = getRequiredString(payload, "title");
  const markdown = getRequiredString(payload, "markdown");
  const themeValue = getOptionalString(payload, "theme") ?? config.defaultTheme;
  const footerText =
    getOptionalString(payload, "footerText") ?? config.defaultFooterText;
  const expiresInDays = getOptionalNumber(payload, "expiresInDays") ?? config.defaultExpirationDays;

  return {
    title,
    markdown,
    theme: isPublicPageTheme(themeValue) ? themeValue : defaultPublicPageConfig.theme,
    footerText,
    expiresInDays
  };
}

function getObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new PageApiError(400, "Request body must be a JSON object.");
  }

  return value as Record<string, unknown>;
}

function getRequiredString(
  payload: Record<string, unknown>,
  key: string
): string {
  const value = payload[key];

  if (typeof value !== "string" || !value.trim()) {
    throw new PageApiError(400, `${key} is required.`);
  }

  return value.trim();
}

function getOptionalString(
  payload: Record<string, unknown>,
  key: string
): string | undefined {
  const value = payload[key];

  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new PageApiError(400, `${key} must be a string.`);
  }

  return value.trim() || undefined;
}

function getOptionalNumber(
  payload: Record<string, unknown>,
  key: string
): number | undefined {
  const value = payload[key];

  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new PageApiError(400, `${key} must be a positive number.`);
  }

  return value;
}
