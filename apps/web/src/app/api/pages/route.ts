import { NextResponse } from "next/server";
import { corsOptionsResponse, withCors } from "../../../lib/cors";
import { EnvError } from "../../../lib/env";
import {
  createPage,
  PageApiError,
  parseCreatePageBody
} from "../../../lib/pages";
import { createSupabasePageRepository } from "../../../lib/supabase/pageRepository";

export const dynamic = "force-dynamic";

const corsMethods = "POST, OPTIONS";

export function OPTIONS(request: Request) {
  return corsOptionsResponse(request, corsMethods);
}

export async function POST(request: Request) {
  try {
    const input = parseCreatePageBody(await request.json());
    const result = await createPage(createSupabasePageRepository(), input);

    return withCors(NextResponse.json(result, { status: 201 }), request, corsMethods);
  } catch (error) {
    return toErrorResponse(error, request);
  }
}

function toErrorResponse(error: unknown, request: Request) {
  if (error instanceof PageApiError) {
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
