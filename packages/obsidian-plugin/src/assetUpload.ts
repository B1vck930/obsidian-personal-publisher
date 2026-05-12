import type { App, TFile } from "obsidian";
import { transformMarkdownAssets } from "./markdownTransform";

const supportedImageMimeTypes: Record<string, string> = {
  gif: "image/gif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  webp: "image/webp"
};

export type LocalAssetData = {
  path: string;
  fileName: string;
  data: ArrayBuffer;
  mimeType: string;
  size: number;
};

export type UploadedAssetResponse = {
  assetId: string;
  url: string;
  storagePath: string;
};

export type AssetUploadWarningReason =
  | "missing"
  | "oversized"
  | "unsupported"
  | "upload-failed";

export type AssetUploadWarning = {
  path: string;
  reason: AssetUploadWarningReason;
  message: string;
};

export type UploadMarkdownAssetsOptions = {
  markdown: string;
  apiBaseUrl: string;
  maxImageSizeMb: number;
  pageId?: string;
  readAsset: (path: string) => Promise<LocalAssetData | null>;
  uploadAsset?: (asset: LocalAssetData, options: UploadAssetRequestOptions) => Promise<UploadedAssetResponse>;
};

export type UploadAssetRequestOptions = {
  apiBaseUrl: string;
  pageId?: string;
};

export type UploadMarkdownAssetsResult = {
  markdown: string;
  uploadedAssets: UploadedAssetResponse[];
  warnings: AssetUploadWarning[];
};

export async function uploadMarkdownAssets({
  markdown,
  apiBaseUrl,
  maxImageSizeMb,
  pageId,
  readAsset,
  uploadAsset = uploadAssetToApi
}: UploadMarkdownAssetsOptions): Promise<UploadMarkdownAssetsResult> {
  const detected = transformMarkdownAssets(markdown);
  const assetUrlMap: Record<string, string> = {};
  const uploadedAssets: UploadedAssetResponse[] = [];
  const warnings: AssetUploadWarning[] = detected.warnings.map((warning) => ({
    path: warning.path,
    reason: warning.reason,
    message: warning.message
  }));
  const maxSizeBytes = maxImageSizeMb * 1024 * 1024;

  for (const path of detected.assetPaths) {
    const asset = await readAsset(path);

    if (!asset) {
      warnings.push({
        path,
        reason: "missing",
        message: `Missing local image: ${path}`
      });
      continue;
    }

    const validation = validateLocalAsset(asset, maxSizeBytes);

    if (!validation.ok) {
      warnings.push({
        path,
        reason: validation.reason,
        message: validation.message
      });
      continue;
    }

    try {
      const uploaded = await uploadAsset(asset, {
        apiBaseUrl,
        ...(pageId ? { pageId } : {})
      });
      assetUrlMap[path] = uploaded.url;
      uploadedAssets.push(uploaded);
    } catch (error) {
      warnings.push({
        path,
        reason: "upload-failed",
        message: error instanceof Error ? error.message : `Could not upload image: ${path}`
      });
    }
  }

  return {
    markdown: transformMarkdownAssets(markdown, { assetUrlMap }).markdown,
    uploadedAssets,
    warnings
  };
}

export async function uploadAssetToApi(
  asset: LocalAssetData,
  options: UploadAssetRequestOptions
): Promise<UploadedAssetResponse> {
  const formData = new FormData();
  formData.append(
    "file",
    new Blob([asset.data], { type: asset.mimeType }),
    asset.fileName
  );
  formData.append("originalPath", asset.path);

  if (options.pageId) {
    formData.append("pageId", options.pageId);
  }

  const response = await fetch(`${trimTrailingSlash(options.apiBaseUrl)}/api/assets`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const errorBody = await safeReadError(response);
    throw new Error(errorBody || `Image upload failed with status ${response.status}.`);
  }

  return (await response.json()) as UploadedAssetResponse;
}

export function createObsidianAssetReader(app: App) {
  return async (path: string): Promise<LocalAssetData | null> => {
    const file = app.metadataCache.getFirstLinkpathDest(path, "");

    if (!file) {
      return null;
    }

    const data = await app.vault.readBinary(file);

    return {
      path,
      fileName: file.name,
      data,
      mimeType: getMimeType(file),
      size: data.byteLength
    };
  };
}

export function validateLocalAsset(
  asset: Pick<LocalAssetData, "fileName" | "mimeType" | "size">,
  maxSizeBytes: number
):
  | { ok: true }
  | { ok: false; reason: "oversized" | "unsupported"; message: string } {
  if (asset.size > maxSizeBytes) {
    return {
      ok: false,
      reason: "oversized",
      message: `Image is larger than the configured maximum: ${asset.fileName}`
    };
  }

  if (!isSupportedImage(asset.fileName, asset.mimeType)) {
    return {
      ok: false,
      reason: "unsupported",
      message: `Unsupported image type: ${asset.fileName}`
    };
  }

  return { ok: true };
}

function getMimeType(file: TFile): string {
  return supportedImageMimeTypes[file.extension.toLowerCase()] ?? "application/octet-stream";
}

function isSupportedImage(fileName: string, mimeType: string): boolean {
  const extension = fileName.split(/[?#]/, 1)[0]?.split(".").pop()?.toLowerCase();

  return Boolean(
    extension &&
      supportedImageMimeTypes[extension] &&
      supportedImageMimeTypes[extension] === mimeType
  );
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

async function safeReadError(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as { error?: unknown };

    return typeof body.error === "string" ? body.error : null;
  } catch {
    return null;
  }
}


