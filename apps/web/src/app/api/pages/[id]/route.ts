import { NextResponse } from "next/server";
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

type PageRouteContext = {
  params: {
    id: string;
  };
};

export async function PUT(request: Request, context: PageRouteContext) {
  try {
    const input = parseUpdatePageBody(await request.json());
    const result = await updatePage(
      createSupabasePageRepository(),
      context.params.id,
      input.ownerToken,
      input.page
    );

    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
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

    return NextResponse.json({ success: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}

function toErrorResponse(error: unknown) {
  if (error instanceof PageApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof EnvError) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }

  const message = error instanceof Error ? error.message : "Unexpected error.";

  return NextResponse.json({ error: message }, { status: 500 });
}
