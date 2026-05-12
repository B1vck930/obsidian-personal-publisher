import { describe, expect, it } from "vitest";
import {
  cleanupExpiredPages,
  CleanupError,
  extractReferencedStoragePathsFromPages,
  requireCleanupSecret,
  type CleanupExpiredRepository
} from "./cleanup";
import type { PageRow } from "./supabase/types";

describe("cleanup expired pages", () => {
  it("requires a valid cleanup secret", () => {
    expect(() =>
      requireCleanupSecret("https://example.com/api/cleanup-expired", "secret")
    ).toThrow(CleanupError);

    expect(() =>
      requireCleanupSecret(
        "https://example.com/api/cleanup-expired?secret=wrong",
        "secret"
      )
    ).toThrow(CleanupError);

    expect(() =>
      requireCleanupSecret(
        "https://example.com/api/cleanup-expired?secret=secret",
        "secret"
      )
    ).not.toThrow();
  });

  it("deletes expired pages, related asset rows, and storage objects", async () => {
    const calls: string[] = [];
    const repository = createRepository({
      expiredPages: [
        createPageRow({
          id: "page-1",
          expires_at: "2026-05-10T00:00:00.000Z",
          markdown:
            "![linked](https://project.supabase.co/storage/v1/object/public/note-assets/pages/temp/linked.png)"
        }),
        createPageRow({ id: "page-2", expires_at: "2026-05-11T00:00:00.000Z" })
      ],
      calls
    });

    const result = await cleanupExpiredPages(
      repository,
      new Date("2026-05-12T00:00:00.000Z")
    );

    expect(result).toEqual({
      success: true,
      deletedPages: 2,
      deletedAssets: 4
    });
    expect(calls).toEqual([
      "listExpiredPages:2026-05-12T00:00:00.000Z",
      "listAssetsForExpiredPages:page-1,page-2|pages/temp/linked.png",
      "deleteStorageObjects:pages/page-1/a.png,pages/page-1/b.png,pages/page-2/c.png,pages/temp/linked.png",
      "deleteAssetsByIds:asset-1,asset-2,asset-3,asset-4",
      "deletePages:page-1,page-2"
    ]);
  });

  it("does not delete anything when there are no expired pages", async () => {
    const calls: string[] = [];
    const result = await cleanupExpiredPages(
      createRepository({ expiredPages: [], calls }),
      new Date("2026-05-12T00:00:00.000Z")
    );

    expect(result).toEqual({
      success: true,
      deletedPages: 0,
      deletedAssets: 0
    });
    expect(calls).toEqual(["listExpiredPages:2026-05-12T00:00:00.000Z"]);
  });

  it("extracts storage paths from Supabase public URLs in page content", () => {
    expect(
      extractReferencedStoragePathsFromPages([
        createPageRow({
          markdown:
            "![alt](https://project.supabase.co/storage/v1/object/public/note-assets/pages/temp/one%20image.png?width=400)",
          html:
            '<img src="https://project.supabase.co/storage/v1/object/public/note-assets/pages/temp/two.png">'
        })
      ])
    ).toEqual(["pages/temp/one image.png", "pages/temp/two.png"]);
  });
});

function createRepository({
  expiredPages,
  calls
}: {
  expiredPages: PageRow[];
  calls: string[];
}): CleanupExpiredRepository {
  return {
    async listExpiredPages(nowIso) {
      calls.push(`listExpiredPages:${nowIso}`);

      return expiredPages;
    },
    async listAssetsForExpiredPages({ pageIds, storagePaths }) {
      calls.push(
        `listAssetsForExpiredPages:${pageIds.join(",")}|${storagePaths.join(",")}`
      );

      return [
        { id: "asset-1", page_id: "page-1", storage_path: "pages/page-1/a.png" },
        { id: "asset-2", page_id: "page-1", storage_path: "pages/page-1/b.png" },
        { id: "asset-3", page_id: "page-2", storage_path: "pages/page-2/c.png" },
        { id: "asset-4", page_id: null, storage_path: "pages/temp/linked.png" }
      ].filter(
        (asset) =>
          (asset.page_id && pageIds.includes(asset.page_id)) ||
          storagePaths.includes(asset.storage_path)
      );
    },
    async deleteStorageObjects(storagePaths) {
      calls.push(`deleteStorageObjects:${storagePaths.join(",")}`);
    },
    async deleteAssetsByIds(assetIds) {
      calls.push(`deleteAssetsByIds:${assetIds.join(",")}`);
    },
    async deletePages(pageIds) {
      calls.push(`deletePages:${pageIds.join(",")}`);
    }
  };
}

function createPageRow(overrides: Partial<PageRow> = {}): PageRow {
  return {
    id: "page-id",
    slug: "slug",
    title: "Title",
    markdown: "# Title",
    html: "",
    theme: "notion",
    footer_text: "Published by XIAOWANG - 18624433439",
    owner_token_hash: "hash",
    created_at: "2026-05-11T00:00:00.000Z",
    updated_at: "2026-05-11T00:00:00.000Z",
    expires_at: "2026-05-18T00:00:00.000Z",
    deleted_at: null,
    ...overrides
  };
}
