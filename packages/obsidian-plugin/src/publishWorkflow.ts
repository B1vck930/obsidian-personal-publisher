import {
  uploadMarkdownAssets,
  type LocalAssetData,
  type UploadMarkdownAssetsResult
} from "./assetUpload";
import {
  publishPageToApi,
  unpublishPageInApi,
  type CreatePageResponse,
  type PagePublishPayload,
  type UpdatePageResponse
} from "./publishApi";
import type {
  PersonalPublisherSettings,
  PublishedPageMetadata
} from "./types";

export class PublishWorkflowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PublishWorkflowError";
  }
}

export type PublishMarkdownNoteOptions = {
  filePath: string;
  title: string;
  markdown: string;
  settings: PersonalPublisherSettings;
  existingMetadata?: PublishedPageMetadata;
  readAsset: (path: string) => Promise<LocalAssetData | null>;
  uploadAssets?: typeof uploadMarkdownAssets;
  publishPage?: typeof publishPageToApi;
  copyUrl?: (url: string) => Promise<void>;
  now?: Date;
};

export type PublishMarkdownNoteResult = {
  action: "created" | "updated";
  metadata: PublishedPageMetadata;
  uploadedAssets: number;
  copied: boolean;
};

export async function publishMarkdownNote({
  filePath,
  title,
  markdown,
  settings,
  existingMetadata,
  readAsset,
  uploadAssets = uploadMarkdownAssets,
  publishPage = publishPageToApi,
  copyUrl = copyTextToClipboard,
  now = new Date()
}: PublishMarkdownNoteOptions): Promise<PublishMarkdownNoteResult> {
  const uploadResult = await uploadAssets({
    markdown,
    apiBaseUrl: settings.apiBaseUrl,
    maxImageSizeMb: settings.maxImageSizeMb,
    ...(existingMetadata ? { pageId: existingMetadata.pageId } : {}),
    readAsset
  });

  assertNoUploadWarnings(title, uploadResult);

  const payload = buildPagePayload(title, uploadResult.markdown, settings);
  const pageResult = await publishPage({
    apiBaseUrl: settings.apiBaseUrl,
    payload,
    ...(existingMetadata ? { existingMetadata } : {})
  });
  const metadata = buildPublishedPageMetadata({
    filePath,
    pageResult,
    ...(existingMetadata ? { existingMetadata } : {}),
    now
  });
  const copied = await tryCopyUrl(copyUrl, metadata.url);

  return {
    action: existingMetadata ? "updated" : "created",
    metadata,
    uploadedAssets: uploadResult.uploadedAssets.length,
    copied
  };
}

export async function unpublishPublishedNote({
  apiBaseUrl,
  metadata,
  unpublishPage = unpublishPageInApi
}: {
  apiBaseUrl: string;
  metadata: PublishedPageMetadata;
  unpublishPage?: typeof unpublishPageInApi;
}): Promise<void> {
  await unpublishPage({ apiBaseUrl, metadata });
}

export function applyPublishedPageMetadata(
  settings: PersonalPublisherSettings,
  filePath: string,
  metadata: PublishedPageMetadata
): PersonalPublisherSettings {
  return {
    ...settings,
    publishedPages: {
      ...settings.publishedPages,
      [filePath]: metadata
    }
  };
}

export function removePublishedPageMetadata(
  settings: PersonalPublisherSettings,
  filePath: string
): PersonalPublisherSettings {
  const { [filePath]: _removed, ...publishedPages } = settings.publishedPages;

  return {
    ...settings,
    publishedPages
  };
}

export function buildPagePayload(
  title: string,
  markdown: string,
  settings: PersonalPublisherSettings
): PagePublishPayload {
  return {
    title,
    markdown,
    theme: settings.defaultTheme,
    footerText: settings.footerText,
    expiresInDays: settings.defaultExpirationDays
  };
}

export function buildPublishNotice(result: PublishMarkdownNoteResult): string {
  const verb = result.action === "created" ? "Published" : "Updated";
  const copiedLine = result.copied
    ? "URL copied to clipboard."
    : "Could not copy URL. Use the URL below.";

  return [
    `${verb} current note.`,
    copiedLine,
    `URL: ${result.metadata.url}`,
    `Uploaded assets: ${result.uploadedAssets}.`,
    `Expires at: ${result.metadata.expiresAt}.`
  ].join("\n");
}

export function buildUnpublishNotice(url: string): string {
  return `Unpublished current note.\nRemoved URL: ${url}`;
}

function buildPublishedPageMetadata({
  filePath,
  pageResult,
  existingMetadata,
  now
}: {
  filePath: string;
  pageResult: CreatePageResponse | UpdatePageResponse;
  existingMetadata?: PublishedPageMetadata;
  now: Date;
}): PublishedPageMetadata {
  const ownerToken =
    "ownerToken" in pageResult ? pageResult.ownerToken : existingMetadata?.ownerToken;

  if (!ownerToken) {
    throw new PublishWorkflowError("Missing owner token for published page.");
  }

  return {
    pageId: pageResult.pageId,
    slug: pageResult.slug,
    url: pageResult.url,
    ownerToken,
    publishedAt: existingMetadata?.publishedAt ?? now.toISOString(),
    updatedAt: now.toISOString(),
    expiresAt: pageResult.expiresAt
  };
}

function assertNoUploadWarnings(
  title: string,
  uploadResult: UploadMarkdownAssetsResult
): void {
  const firstWarning = uploadResult.warnings[0]?.message;

  if (firstWarning) {
    throw new PublishWorkflowError(
      [
        `Cannot publish "${title}". Fix image warnings first.`,
        `Warnings: ${uploadResult.warnings.length}.`,
        firstWarning
      ].join("\n")
    );
  }
}

async function tryCopyUrl(
  copyUrl: (url: string) => Promise<void>,
  url: string
): Promise<boolean> {
  try {
    await copyUrl(url);
    return true;
  } catch {
    return false;
  }
}

async function copyTextToClipboard(text: string): Promise<void> {
  if (!navigator.clipboard) {
    throw new Error("Clipboard API is unavailable.");
  }

  await navigator.clipboard.writeText(text);
}
