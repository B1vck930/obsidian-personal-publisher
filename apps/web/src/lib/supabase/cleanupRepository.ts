import "server-only";
import type { CleanupExpiredRepository } from "../cleanup";
import { getAssetStorageEnv } from "../env";
import { createServerSupabaseClient } from "./server";

const storageRemoveBatchSize = 1000;

export function createSupabaseCleanupRepository(): CleanupExpiredRepository {
  const supabase = createServerSupabaseClient();
  const env = getAssetStorageEnv();

  return {
    async listExpiredPages(nowIso) {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .lte("expires_at", nowIso);

      if (error) {
        throw error;
      }

      return data ?? [];
    },
    async listAssetsForExpiredPages({ pageIds, storagePaths }) {
      const assetsById = new Map<string, { id: string; page_id: string | null; storage_path: string }>();

      if (pageIds.length > 0) {
        const { data, error } = await supabase
          .from("assets")
          .select("id,page_id,storage_path")
          .in("page_id", pageIds);

        if (error) {
          throw error;
        }

        for (const asset of data ?? []) {
          assetsById.set(asset.id, asset);
        }
      }

      if (storagePaths.length > 0) {
        const { data, error } = await supabase
          .from("assets")
          .select("id,page_id,storage_path")
          .in("storage_path", storagePaths);

        if (error) {
          throw error;
        }

        for (const asset of data ?? []) {
          assetsById.set(asset.id, asset);
        }
      }

      return [...assetsById.values()];
    },
    async deleteStorageObjects(storagePaths) {
      if (storagePaths.length === 0) {
        return;
      }

      for (let index = 0; index < storagePaths.length; index += storageRemoveBatchSize) {
        const batch = storagePaths.slice(index, index + storageRemoveBatchSize);
        const { error } = await supabase.storage
          .from(env.supabaseStorageBucket)
          .remove(batch);

        if (error) {
          throw error;
        }
      }
    },
    async deleteAssetsByIds(assetIds) {
      if (assetIds.length === 0) {
        return;
      }

      const { error } = await supabase.from("assets").delete().in("id", assetIds);

      if (error) {
        throw error;
      }
    },
    async deletePages(pageIds) {
      if (pageIds.length === 0) {
        return;
      }

      const { error } = await supabase.from("pages").delete().in("id", pageIds);

      if (error) {
        throw error;
      }
    }
  };
}
