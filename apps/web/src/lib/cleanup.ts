import type { PageRow } from "./supabase/types";

export type CleanupAssetRow = {
  id: string;
  page_id: string | null;
  storage_path: string;
};

export type CleanupExpiredRepository = {
  listExpiredPages: (nowIso: string) => Promise<PageRow[]>;
  listAssetsForExpiredPages: (input: {
    pageIds: string[];
    storagePaths: string[];
  }) => Promise<CleanupAssetRow[]>;
  deleteStorageObjects: (storagePaths: string[]) => Promise<void>;
  deleteAssetsByIds: (assetIds: string[]) => Promise<void>;
  deletePages: (pageIds: string[]) => Promise<void>;
};

export type CleanupExpiredResult = {
  success: true;
  deletedPages: number;
  deletedAssets: number;
};

export class CleanupError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "CleanupError";
    this.status = status;
  }
}

export async function cleanupExpiredPages(
  repository: CleanupExpiredRepository,
  now: Date = new Date()
): Promise<CleanupExpiredResult> {
  const pages = await repository.listExpiredPages(now.toISOString());
  const pageIds = Array.from(new Set(pages.map((page) => page.id)));

  if (pageIds.length === 0) {
    return {
      success: true,
      deletedPages: 0,
      deletedAssets: 0
    };
  }

  const referencedStoragePaths = extractReferencedStoragePathsFromPages(pages);
  const assets = await repository.listAssetsForExpiredPages({
    pageIds,
    storagePaths: referencedStoragePaths
  });
  const storagePaths = Array.from(
    new Set(
      assets
        .map((asset) => asset.storage_path)
        .filter((path) => path.trim().length > 0)
    )
  );

  if (storagePaths.length > 0) {
    await repository.deleteStorageObjects(storagePaths);
  }

  await repository.deleteAssetsByIds(assets.map((asset) => asset.id));
  await repository.deletePages(pageIds);

  return {
    success: true,
    deletedPages: pageIds.length,
    deletedAssets: assets.length
  };
}

export function extractReferencedStoragePathsFromPages(pages: PageRow[]): string[] {
  const storagePaths = new Set<string>();
  const storageUrlPattern =
    /\/storage\/v1\/object\/public\/[^/\s)"'<>]+\/([^\s)"'<>]+)/g;

  for (const page of pages) {
    const content = `${page.markdown}\n${page.html}`;
    const matches = content.matchAll(storageUrlPattern);

    for (const match of matches) {
      const rawPath = match[1]?.split(/[?#]/, 1)[0];

      if (rawPath) {
        storagePaths.add(decodeURIComponent(rawPath));
      }
    }
  }

  return [...storagePaths];
}

export function requireCleanupSecret(
  requestUrl: string,
  expectedSecret: string
): void {
  if (!expectedSecret.trim()) {
    throw new CleanupError(503, "CLEANUP_SECRET is not configured.");
  }

  const providedSecret = new URL(requestUrl).searchParams.get("secret");

  if (!providedSecret || providedSecret !== expectedSecret) {
    throw new CleanupError(401, "Invalid cleanup secret.");
  }
}
