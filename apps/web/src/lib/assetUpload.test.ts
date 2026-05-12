import { describe, expect, it } from "vitest";
import {
  createSafeStoragePath,
  uploadAsset,
  validateAssetFile,
  type AssetUploadRepository
} from "./assetUpload";

describe("asset upload validation", () => {
  it("accepts supported image files", () => {
    expect(
      validateAssetFile(new File(["data"], "image.png", { type: "image/png" }))
    ).toEqual({ ok: true, contentType: "image/png" });
  });

  it("rejects unsupported file types", () => {
    expect(validateAssetFile(new File(["data"], "doc.pdf", { type: "application/pdf" }))).toMatchObject({
      ok: false,
      status: 415
    });
  });

  it("rejects files over the max size", () => {
    expect(
      validateAssetFile(new File(["data"], "image.png", { type: "image/png" }), 1)
    ).toMatchObject({ ok: false, status: 413 });
  });

  it("creates safe storage paths", () => {
    const path = createSafeStoragePath({
      pageId: "Page ID/../Unsafe",
      fileName: "../Folder/My Image.PNG"
    });

    expect(path).toMatch(/^pages\/page-id-unsafe\/[a-f0-9-]+-my-image\.png$/);
    expect(path).not.toContain("..");
    expect(path).not.toContain("\\\\");
  });

  it("returns uploaded asset metadata", async () => {
    const repository = createRepository();
    const result = await uploadAsset(repository, {
      file: new File(["data"], "image.png", { type: "image/png" }),
      pageId: "page-id",
      originalPath: "folder/image.png"
    });

    expect(result.url).toBe("https://cdn.example.com/image.png");
    expect(result.storagePath).toContain("pages/page-id/");
  });

  it("surfaces storage upload failures", async () => {
    const repository = createRepository(new Error("storage unavailable"));

    await expect(
      uploadAsset(repository, {
        file: new File(["data"], "image.png", { type: "image/png" })
      })
    ).rejects.toThrow("storage unavailable");
  });
});

function createRepository(uploadError?: Error): AssetUploadRepository {
  return {
    async uploadObject() {
      if (uploadError) {
        throw uploadError;
      }

      return { publicUrl: "https://cdn.example.com/image.png" };
    },
    async insertAsset(asset) {
      return {
        id: "asset-id",
        page_id: asset.pageId,
        original_path: asset.originalPath,
        storage_path: asset.storagePath,
        public_url: asset.publicUrl
      };
    }
  };
}
