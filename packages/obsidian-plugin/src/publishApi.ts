import type { PublishedPageMetadata } from "./types";

export type PagePublishPayload = {
  title: string;
  markdown: string;
  theme: string;
  footerText: string;
  expiresInDays: number;
};

export type CreatePageResponse = {
  pageId: string;
  slug: string;
  url: string;
  ownerToken: string;
  expiresAt: string;
};

export type UpdatePageResponse = Omit<CreatePageResponse, "ownerToken">;

export type PublishPageToApiOptions = {
  apiBaseUrl: string;
  payload: PagePublishPayload;
  existingMetadata?: PublishedPageMetadata;
  fetchImpl?: typeof fetch;
};

export class PublishApiError extends Error {
  status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "PublishApiError";
    this.status = status;
  }
}

export async function publishPageToApi({
  apiBaseUrl,
  payload,
  existingMetadata,
  fetchImpl = fetch
}: PublishPageToApiOptions): Promise<CreatePageResponse | UpdatePageResponse> {
  if (existingMetadata) {
    return updatePageInApi({
      apiBaseUrl,
      pageId: existingMetadata.pageId,
      ownerToken: existingMetadata.ownerToken,
      payload,
      fetchImpl
    });
  }

  return createPageInApi({ apiBaseUrl, payload, fetchImpl });
}

export async function createPageInApi({
  apiBaseUrl,
  payload,
  fetchImpl = fetch
}: {
  apiBaseUrl: string;
  payload: PagePublishPayload;
  fetchImpl?: typeof fetch;
}): Promise<CreatePageResponse> {
  return requestJson<CreatePageResponse>(fetchImpl, {
    method: "POST",
    url: `${trimTrailingSlash(apiBaseUrl)}/api/pages`,
    body: payload
  });
}

export async function updatePageInApi({
  apiBaseUrl,
  pageId,
  ownerToken,
  payload,
  fetchImpl = fetch
}: {
  apiBaseUrl: string;
  pageId: string;
  ownerToken: string;
  payload: PagePublishPayload;
  fetchImpl?: typeof fetch;
}): Promise<UpdatePageResponse> {
  return requestJson<UpdatePageResponse>(fetchImpl, {
    method: "PUT",
    url: `${trimTrailingSlash(apiBaseUrl)}/api/pages/${encodeURIComponent(pageId)}`,
    body: {
      ownerToken,
      ...payload
    }
  });
}

export async function unpublishPageInApi({
  apiBaseUrl,
  metadata,
  fetchImpl = fetch
}: {
  apiBaseUrl: string;
  metadata: PublishedPageMetadata;
  fetchImpl?: typeof fetch;
}): Promise<void> {
  await requestJson<{ success: true }>(fetchImpl, {
    method: "DELETE",
    url: `${trimTrailingSlash(apiBaseUrl)}/api/pages/${encodeURIComponent(metadata.pageId)}`,
    body: {
      ownerToken: metadata.ownerToken
    }
  });
}

async function requestJson<T>(
  fetchImpl: typeof fetch,
  request: {
    method: "POST" | "PUT" | "DELETE";
    url: string;
    body: Record<string, unknown>;
  }
): Promise<T> {
  let response: Response;

  try {
    response = await fetchImpl(request.url, {
      method: request.method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request.body)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown network error.";

    throw new PublishApiError(`Backend unavailable: ${message}`);
  }

  if (!response.ok) {
    const errorMessage = await safeReadError(response);
    throw new PublishApiError(
      errorMessage || `Request failed with status ${response.status}.`,
      response.status
    );
  }

  return (await response.json()) as T;
}

async function safeReadError(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as { error?: unknown };

    return typeof body.error === "string" ? body.error : null;
  } catch {
    return null;
  }
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}
