import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    { error: "Cleanup is not implemented yet." },
    { status: 501 }
  );
}
