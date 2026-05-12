import { NextResponse } from "next/server";
import { AssetUploadError, uploadAsset } from "../../../lib/assetUpload";
import { EnvError } from "../../../lib/env";
import { createSupabaseAssetRepository } from "../../../lib/supabase/assetRepository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new AssetUploadError(400, "A file field is required.");
    }

    const pageId = getOptionalFormString(formData, "pageId");
    const originalPath = getOptionalFormString(formData, "originalPath");
    const result = await uploadAsset(createSupabaseAssetRepository(), {
      file,
      ...(pageId ? { pageId } : {}),
      ...(originalPath ? { originalPath } : {})
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

function getOptionalFormString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);

  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function toErrorResponse(error: unknown) {
  if (error instanceof AssetUploadError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof EnvError) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }

  const message = error instanceof Error ? error.message : "Unexpected error.";

  return NextResponse.json({ error: message }, { status: 500 });
}
