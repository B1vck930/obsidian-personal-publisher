import { randomUUID } from "node:crypto";

export const defaultMaxAssetSizeBytes = 5 * 1024 * 1024;

export const supportedImageTypes = {
  gif: "image/gif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  webp: "image/webp"
} as const;

export type SupportedImageExtension = keyof typeof supportedImageTypes;

export type AssetUploadInput = {
  file: File;
  pageId?: string;
  originalPath?: string;
  maxSizeBytes?: number;
};

export type AssetUploadRecord = {
  id: string;
  page_id: string | null;
  original_path: string;
  storage_path: string;
  public_url: string;
};

export type AssetUploadRepository = {
  uploadObject: (input: {
    storagePath: string;
    file: File;
    contentType: string;
  }) => Promise<{ publicUrl: string }>;
  insertAsset: (asset: {
    pageId: string | null;
    originalPath: string;
    storagePath: string;
    publicUrl: string;
  }) => Promise<AssetUploadRecord>;
};

export type AssetUploadResult = {
  assetId: string;
  url: string;
  storagePath: string;
};

export class AssetUploadError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AssetUploadError";
    this.status = status;
  }
}

export async function uploadAsset(
  repository: AssetUploadRepository,
  input: AssetUploadInput
): Promise<AssetUploadResult> {
  const validation = validateAssetFile(input.file, input.maxSizeBytes);

  if (!validation.ok) {
    throw new AssetUploadError(validation.status, validation.message);
  }

  const originalPath = input.originalPath?.trim() || input.file.name;
  const storagePath = createSafeStoragePath({
    fileName: input.file.name || originalPath,
    ...(input.pageId ? { pageId: input.pageId } : {})
  });
  const uploaded = await repository.uploadObject({
    storagePath,
    file: input.file,
    contentType: validation.contentType
  });
  const record = await repository.insertAsset({
    pageId: input.pageId ?? null,
    originalPath,
    storagePath,
    publicUrl: uploaded.publicUrl
  });

  return {
    assetId: record.id,
    url: record.public_url,
    storagePath: record.storage_path
  };
}

export function validateAssetFile(
  file: Pick<File, "name" | "size" | "type">,
  maxSizeBytes = defaultMaxAssetSizeBytes
):
  | { ok: true; contentType: string }
  | { ok: false; status: number; message: string } {
  if (file.size <= 0) {
    return { ok: false, status: 400, message: "File is empty." };
  }

  if (file.size > maxSizeBytes) {
    return { ok: false, status: 413, message: "File exceeds the maximum image size." };
  }

  const extension = getSupportedImageExtension(file.name);

  if (!extension) {
    return { ok: false, status: 415, message: "Unsupported image type." };
  }

  const expectedType = supportedImageTypes[extension];

  if (file.type && file.type !== expectedType) {
    return { ok: false, status: 415, message: "Unsupported image type." };
  }

  return { ok: true, contentType: file.type || expectedType };
}

export function createSafeStoragePath({
  fileName,
  pageId
}: {
  fileName: string;
  pageId?: string;
}): string {
  const safeFileName = sanitizeFileName(fileName);
  const ownerSegment = sanitizePathSegment(pageId || "temp");

  return `pages/${ownerSegment}/${randomUUID()}-${safeFileName}`;
}

export function sanitizeFileName(fileName: string): string {
  const baseName = fileName.replace(/\\/g, "/").split("/").pop() || "image";
  const safe = baseName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return safe || "image";
}

function sanitizePathSegment(value: string): string {
  const safe = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return safe || "temp";
}

function getSupportedImageExtension(fileName: string): SupportedImageExtension | null {
  const extension = fileName
    .split(/[?#]/, 1)[0]
    ?.split(".")
    .pop()
    ?.toLowerCase();

  return extension && extension in supportedImageTypes
    ? (extension as SupportedImageExtension)
    : null;
}


