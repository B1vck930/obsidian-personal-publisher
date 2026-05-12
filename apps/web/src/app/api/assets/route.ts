import { NextResponse } from "next/server";
import { AssetUploadError, uploadAsset } from "../../../lib/assetUpload";
import { corsOptionsResponse, withCors } from "../../../lib/cors";
import { EnvError } from "../../../lib/env";
import { createSupabaseAssetRepository } from "../../../lib/supabase/assetRepository";

export const dynamic = "force-dynamic";

const corsMethods = "POST, OPTIONS";

export function OPTIONS(request: Request) {
  return corsOptionsResponse(request, corsMethods);
}

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

    return withCors(NextResponse.json(result, { status: 201 }), request, corsMethods);
  } catch (error) {
    return toErrorResponse(error, request);
  }
}

function getOptionalFormString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);

  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function toErrorResponse(error: unknown, request: Request) {
  if (error instanceof AssetUploadError) {
    return withCors(
      NextResponse.json({ error: error.message }, { status: error.status }),
      request,
      corsMethods
    );
  }

  if (error instanceof EnvError) {
    return withCors(
      NextResponse.json({ error: error.message }, { status: 503 }),
      request,
      corsMethods
    );
  }

  const message = error instanceof Error ? error.message : "Unexpected error.";

  return withCors(
    NextResponse.json({ error: message }, { status: 500 }),
    request,
    corsMethods
  );
}
