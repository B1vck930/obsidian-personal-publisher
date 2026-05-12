import "server-only";
import type { AssetUploadRepository } from "../assetUpload";
import { getAssetStorageEnv } from "../env";
import { createServerSupabaseClient } from "./server";

export function createSupabaseAssetRepository(): AssetUploadRepository {
  const supabase = createServerSupabaseClient();
  const env = getAssetStorageEnv();

  return {
    async uploadObject({ storagePath, file, contentType }) {
      const { error } = await supabase.storage
        .from(env.supabaseStorageBucket)
        .upload(storagePath, file, {
          contentType,
          upsert: false,
          cacheControl: "31536000"
        });

      if (error) {
        throw error;
      }

      const { data } = supabase.storage
        .from(env.supabaseStorageBucket)
        .getPublicUrl(storagePath);

      return { publicUrl: data.publicUrl };
    },
    async insertAsset(asset) {
      const { data, error } = await supabase
        .from("assets")
        .insert({
          page_id: asset.pageId,
          original_path: asset.originalPath,
          storage_path: asset.storagePath,
          public_url: asset.publicUrl
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return {
        id: data.id,
        page_id: data.page_id,
        original_path: data.original_path,
        storage_path: data.storage_path,
        public_url: data.public_url
      };
    }
  };
}
