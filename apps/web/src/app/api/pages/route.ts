import { NextResponse } from "next/server";
import { EnvError } from "../../../lib/env";
import {
  createPage,
  PageApiError,
  parseCreatePageBody
} from "../../../lib/pages";
import { createSupabasePageRepository } from "../../../lib/supabase/pageRepository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const input = parseCreatePageBody(await request.json());
    const result = await createPage(createSupabasePageRepository(), input);

    return NextResponse.json(result, { status: 201 });
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
