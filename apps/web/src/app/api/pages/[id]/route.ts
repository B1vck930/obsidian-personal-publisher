import { NextResponse } from "next/server";
import { corsOptionsResponse, withCors } from "../../../../lib/cors";
import { EnvError } from "../../../../lib/env";
import {
  deletePage,
  PageApiError,
  parseDeletePageBody,
  parseUpdatePageBody,
  updatePage
} from "../../../../lib/pages";
import { createSupabasePageRepository } from "../../../../lib/supabase/pageRepository";

export const dynamic = "force-dynamic";

const corsMethods = "PUT, DELETE, OPTIONS";

type PageRouteContext = {
  params: {
    id: string;
  };
};

export function OPTIONS(request: Request) {
  return corsOptionsResponse(request, corsMethods);
}

export async function PUT(request: Request, context: PageRouteContext) {
  try {
    const input = parseUpdatePageBody(await request.json());
    const result = await updatePage(
      createSupabasePageRepository(),
      context.params.id,
      input.ownerToken,
      input.page
    );

    return withCors(NextResponse.json(result), request, corsMethods);
  } catch (error) {
    return toErrorResponse(error, request);
  }
}

export async function DELETE(request: Request, context: PageRouteContext) {
  try {
    const input = parseDeletePageBody(await request.json());
    await deletePage(
      createSupabasePageRepository(),
      context.params.id,
      input.ownerToken
    );

    return withCors(NextResponse.json({ success: true }), request, corsMethods);
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
