import { describe, expect, it } from "vitest";
import {
  publishPageToApi,
  unpublishPageInApi,
  type PagePublishPayload
} from "../src/publishApi";
import type { PublishedPageMetadata } from "../src/types";

describe("publish API client", () => {
  it("creates pages when no metadata exists", async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const result = await publishPageToApi({
      apiBaseUrl: "https://example.com/",
      payload: createPayload(),
      fetchImpl: async (url, init) => {
        calls.push({ url: String(url), init: init ?? {} });
        return Response.json(createPageResponse(), { status: 201 });
      }
    });

    expect(calls[0]).toMatchObject({
      url: "https://example.com/api/pages",
      init: { method: "POST" }
    });
    expect(result).toMatchObject({ ownerToken: "owner-token" });
  });

  it("updates pages when metadata exists", async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    await publishPageToApi({
      apiBaseUrl: "https://example.com",
      payload: createPayload({ title: "Updated" }),
      existingMetadata: createMetadata(),
      fetchImpl: async (url, init) => {
        calls.push({ url: String(url), init: init ?? {} });
        return Response.json(
          {
            pageId: "page-id",
            slug: "same-slug",
            url: "https://example.com/p/same-slug",
            expiresAt: "2026-05-19T00:00:00.000Z"
          },
          { status: 200 }
        );
      }
    });

    expect(calls[0]?.url).toBe("https://example.com/api/pages/page-id");
    expect(calls[0]?.init.method).toBe("PUT");
    expect(JSON.parse(String(calls[0]?.init.body))).toMatchObject({
      ownerToken: "owner-token",
      title: "Updated"
    });
  });

  it("unpublishes pages with owner token", async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    await unpublishPageInApi({
      apiBaseUrl: "https://example.com",
      metadata: createMetadata(),
      fetchImpl: async (url, init) => {
        calls.push({ url: String(url), init: init ?? {} });
        return Response.json({ success: true });
      }
    });

    expect(calls[0]?.url).toBe("https://example.com/api/pages/page-id");
    expect(calls[0]?.init.method).toBe("DELETE");
    expect(JSON.parse(String(calls[0]?.init.body))).toEqual({
      ownerToken: "owner-token"
    });
  });

  it("surfaces API errors", async () => {
    await expect(
      publishPageToApi({
        apiBaseUrl: "https://example.com",
        payload: createPayload(),
        fetchImpl: async () =>
          Response.json({ error: "Invalid owner token." }, { status: 403 })
      })
    ).rejects.toThrow("Invalid owner token.");
  });
});

function createPayload(overrides: Partial<PagePublishPayload> = {}): PagePublishPayload {
  return {
    title: "Title",
    markdown: "# Title",
    theme: "notion",
    footerText: "Footer",
    expiresInDays: 7,
    ...overrides
  };
}

function createPageResponse() {
  return {
    pageId: "page-id",
    slug: "same-slug",
    url: "https://example.com/p/same-slug",
    ownerToken: "owner-token",
    expiresAt: "2026-05-18T00:00:00.000Z"
  };
}

function createMetadata(): PublishedPageMetadata {
  return {
    ...createPageResponse(),
    publishedAt: "2026-05-11T00:00:00.000Z",
    updatedAt: "2026-05-11T00:00:00.000Z"
  };
}
