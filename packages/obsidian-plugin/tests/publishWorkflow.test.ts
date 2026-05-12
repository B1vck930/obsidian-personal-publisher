import { describe, expect, it } from "vitest";
import {
  applyPublishedPageMetadata,
  buildPublishNotice,
  publishMarkdownNote,
  PublishWorkflowError,
  removePublishedPageMetadata,
  unpublishPublishedNote
} from "../src/publishWorkflow";
import { defaultSettings } from "../src/settingsCore";
import type { PersonalPublisherSettings, PublishedPageMetadata } from "../src/types";

describe("publish workflow", () => {
  it("creates metadata for a first publish and copies the URL", async () => {
    const result = await publishMarkdownNote({
      filePath: "folder/note.md",
      title: "Note",
      markdown: "# Note",
      settings: createSettings(),
      readAsset: async () => null,
      uploadAssets: async () => ({
        markdown: "# Note",
        uploadedAssets: [],
        warnings: []
      }),
      publishPage: async ({ payload }) => ({
        pageId: "page-id",
        slug: "slug",
        url: "https://example.com/p/slug",
        ownerToken: "owner-token",
        expiresAt: "2026-05-18T00:00:00.000Z"
      }),
      copyUrl: async (url) => {
        expect(url).toBe("https://example.com/p/slug");
      },
      now: new Date("2026-05-11T00:00:00.000Z")
    });

    expect(result.action).toBe("created");
    expect(result.metadata).toMatchObject({
      pageId: "page-id",
      ownerToken: "owner-token",
      publishedAt: "2026-05-11T00:00:00.000Z",
      updatedAt: "2026-05-11T00:00:00.000Z"
    });
    expect(result.copied).toBe(true);
  });

  it("updates existing metadata while keeping the same URL", async () => {
    const existing = createMetadata();
    const result = await publishMarkdownNote({
      filePath: "note.md",
      title: "Updated",
      markdown: "# Updated",
      settings: createSettings(),
      existingMetadata: existing,
      readAsset: async () => null,
      uploadAssets: async (options) => {
        expect(options.pageId).toBe("page-id");
        return { markdown: "# Updated", uploadedAssets: [], warnings: [] };
      },
      publishPage: async ({ existingMetadata }) => {
        expect(existingMetadata?.pageId).toBe("page-id");
        return {
          pageId: "page-id",
          slug: "same-slug",
          url: "https://example.com/p/same-slug",
          expiresAt: "2026-05-19T00:00:00.000Z"
        };
      },
      copyUrl: async () => undefined,
      now: new Date("2026-05-12T00:00:00.000Z")
    });

    expect(result.action).toBe("updated");
    expect(result.metadata.url).toBe(existing.url);
    expect(result.metadata.ownerToken).toBe(existing.ownerToken);
    expect(result.metadata.publishedAt).toBe(existing.publishedAt);
    expect(result.metadata.updatedAt).toBe("2026-05-12T00:00:00.000Z");
  });

  it("stores and removes local metadata", () => {
    const settings = createSettings();
    const metadata = createMetadata();
    const withMetadata = applyPublishedPageMetadata(settings, "note.md", metadata);

    expect(withMetadata.publishedPages["note.md"]).toBe(metadata);
    expect(removePublishedPageMetadata(withMetadata, "note.md").publishedPages).toEqual({});
  });

  it("blocks publishing when image upload has warnings", async () => {
    await expect(
      publishMarkdownNote({
        filePath: "note.md",
        title: "Image Note",
        markdown: "![[missing.png]]",
        settings: createSettings(),
        readAsset: async () => null,
        uploadAssets: async () => ({
          markdown: "![[missing.png]]",
          uploadedAssets: [],
          warnings: [
            {
              path: "missing.png",
              reason: "missing",
              message: "Missing local image: missing.png"
            }
          ]
        }),
        publishPage: async () => {
          throw new Error("should not publish");
        }
      })
    ).rejects.toThrow(PublishWorkflowError);
  });

  it("reports clipboard failure without failing publish", async () => {
    const result = await publishMarkdownNote({
      filePath: "note.md",
      title: "Note",
      markdown: "# Note",
      settings: createSettings(),
      readAsset: async () => null,
      uploadAssets: async () => ({
        markdown: "# Note",
        uploadedAssets: [],
        warnings: []
      }),
      publishPage: async () => ({
        pageId: "page-id",
        slug: "slug",
        url: "https://example.com/p/slug",
        ownerToken: "owner-token",
        expiresAt: "2026-05-18T00:00:00.000Z"
      }),
      copyUrl: async () => {
        throw new Error("clipboard blocked");
      }
    });

    expect(result.copied).toBe(false);
    expect(buildPublishNotice(result)).toContain("Could not copy URL");
  });

  it("calls the unpublish API", async () => {
    const metadata = createMetadata();
    let called = false;

    await unpublishPublishedNote({
      apiBaseUrl: "https://example.com",
      metadata,
      unpublishPage: async (input) => {
        called = true;
        expect(input.metadata).toBe(metadata);
      }
    });

    expect(called).toBe(true);
  });
});

function createSettings(): PersonalPublisherSettings {
  return {
    ...defaultSettings,
    apiBaseUrl: "https://example.com"
  };
}

function createMetadata(): PublishedPageMetadata {
  return {
    pageId: "page-id",
    slug: "same-slug",
    url: "https://example.com/p/same-slug",
    ownerToken: "owner-token",
    publishedAt: "2026-05-11T00:00:00.000Z",
    updatedAt: "2026-05-11T00:00:00.000Z",
    expiresAt: "2026-05-18T00:00:00.000Z"
  };
}
