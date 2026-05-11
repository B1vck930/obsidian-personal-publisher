import { describe, expect, it } from "vitest";
import { hashOwnerToken } from "./auth";
import {
  PageApiError,
  parseDeletePageBody,
  parseUpdatePageBody,
  updatePage,
  type PageRepository
} from "./pages";
import type { PageRow } from "./supabase/types";

describe("page API helpers", () => {
  it("requires owner token for update", () => {
    expect(() => parseUpdatePageBody({ title: "A", markdown: "# A" })).toThrow(
      PageApiError
    );
  });

  it("requires owner token for delete", () => {
    expect(() => parseDeletePageBody({})).toThrow(PageApiError);
  });

  it("refreshes expiration on update", async () => {
    const ownerToken = "owner-token";
    const page = createPageRow({
      owner_token_hash: hashOwnerToken(ownerToken),
      expires_at: "2026-05-12T00:00:00.000Z"
    });
    const repository = createMemoryRepository(page);

    const result = await updatePage(
      repository,
      page.id,
      ownerToken,
      {
        title: "Updated",
        markdown: "# Updated",
        theme: "notion",
        footerText: "Footer",
        expiresInDays: 7
      },
      new Date("2026-05-11T00:00:00.000Z")
    );

    expect(result.slug).toBe(page.slug);
    expect(result.expiresAt).toBe("2026-05-18T00:00:00.000Z");
  });

  it("rejects invalid owner tokens", async () => {
    const page = createPageRow({
      owner_token_hash: hashOwnerToken("correct-token")
    });

    await expect(
      updatePage(
        createMemoryRepository(page),
        page.id,
        "wrong-token",
        {
          title: "Updated",
          markdown: "# Updated",
          theme: "notion",
          footerText: "Footer",
          expiresInDays: 7
        }
      )
    ).rejects.toMatchObject({ status: 403 });
  });
});

function createMemoryRepository(initialPage: PageRow): PageRepository {
  let page = initialPage;

  return {
    async insertPage() {
      return page;
    },
    async getPageById(id) {
      return page.id === id ? page : null;
    },
    async getPageBySlug(slug) {
      return page.slug === slug ? page : null;
    },
    async updatePage(id, patch) {
      if (id !== page.id) {
        throw new Error("Page not found.");
      }

      page = {
        ...page,
        ...patch
      };

      return page;
    },
    async deletePage() {
      page = {
        ...page,
        deleted_at: new Date().toISOString()
      };
    }
  };
}

function createPageRow(overrides: Partial<PageRow> = {}): PageRow {
  return {
    id: "page-id",
    slug: "same-slug",
    title: "Title",
    markdown: "# Title",
    html: "<h1>Title</h1>",
    theme: "notion",
    footer_text: "Published by XIAOWANG - 18624433439",
    owner_token_hash: hashOwnerToken("owner-token"),
    created_at: "2026-05-11T00:00:00.000Z",
    updated_at: "2026-05-11T00:00:00.000Z",
    expires_at: "2026-05-18T00:00:00.000Z",
    deleted_at: null,
    ...overrides
  };
}
