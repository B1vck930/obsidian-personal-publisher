import { describe, expect, it } from "vitest";
import {
  uploadMarkdownAssets,
  validateLocalAsset,
  type LocalAssetData
} from "../src/assetUpload";

describe("plugin asset upload", () => {
  it("replaces local image references with uploaded public URLs", async () => {
    const result = await uploadMarkdownAssets({
      markdown: "![[image.png]]\n![alt](folder/photo.webp)",
      apiBaseUrl: "https://example.com",
      maxImageSizeMb: 5,
      readAsset: async (path) => createAsset(path),
      uploadAsset: async (asset) => ({
        assetId: `asset-${asset.path}`,
        url: `https://cdn.example.com/${asset.path}`,
        storagePath: `pages/temp/${asset.fileName}`
      })
    });

    expect(result.markdown).toBe(
      "![image.png](https://cdn.example.com/image.png)\n![alt](https://cdn.example.com/folder/photo.webp)"
    );
    expect(result.uploadedAssets).toHaveLength(2);
    expect(result.warnings).toEqual([]);
  });

  it("warns for missing local images", async () => {
    const result = await uploadMarkdownAssets({
      markdown: "![[missing.png]]",
      apiBaseUrl: "https://example.com",
      maxImageSizeMb: 5,
      readAsset: async () => null,
      uploadAsset: async () => {
        throw new Error("should not upload");
      }
    });

    expect(result.warnings).toEqual([
      {
        path: "missing.png",
        reason: "missing",
        message: "Missing local image: missing.png"
      }
    ]);
  });

  it("warns for oversized images", () => {
    expect(
      validateLocalAsset(
        { fileName: "image.png", mimeType: "image/png", size: 6 },
        5
      )
    ).toMatchObject({ ok: false, reason: "oversized" });
  });

  it("warns for unsupported image types", () => {
    expect(
      validateLocalAsset(
        { fileName: "image.bmp", mimeType: "image/bmp", size: 1 },
        5
      )
    ).toMatchObject({ ok: false, reason: "unsupported" });
  });

  it("reports upload API errors", async () => {
    const result = await uploadMarkdownAssets({
      markdown: "![[image.png]]",
      apiBaseUrl: "https://example.com",
      maxImageSizeMb: 5,
      readAsset: async (path) => createAsset(path),
      uploadAsset: async () => {
        throw new Error("Upload failed");
      }
    });

    expect(result.warnings).toEqual([
      {
        path: "image.png",
        reason: "upload-failed",
        message: "Upload failed"
      }
    ]);
  });
});

function createAsset(path: string): LocalAssetData {
  return {
    path,
    fileName: path.split("/").pop() ?? path,
    data: new ArrayBuffer(4),
    mimeType: path.endsWith(".webp") ? "image/webp" : "image/png",
    size: 4
  };
}
