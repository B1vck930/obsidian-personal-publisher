import { NextResponse } from "next/server";
import {
  cleanupExpiredPages,
  CleanupError,
  requireCleanupSecret
} from "../../../lib/cleanup";
import { EnvError, getCleanupEnv } from "../../../lib/env";
import { createSupabaseCleanupRepository } from "../../../lib/supabase/cleanupRepository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    requireCleanupSecretParameter(request.url);

    const env = getCleanupEnv();

    requireCleanupSecret(request.url, env.cleanupSecret);

    const result = await cleanupExpiredPages(createSupabaseCleanupRepository());

    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}

function toErrorResponse(error: unknown) {
  if (error instanceof CleanupError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof EnvError) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }

  const message = error instanceof Error ? error.message : "Unexpected error.";

  return NextResponse.json({ error: message }, { status: 500 });
}

function requireCleanupSecretParameter(requestUrl: string): void {
  const providedSecret = new URL(requestUrl).searchParams.get("secret");

  if (!providedSecret) {
    throw new CleanupError(401, "Invalid cleanup secret.");
  }
}
