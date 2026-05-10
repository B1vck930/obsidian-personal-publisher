import { NextResponse } from "next/server";

export function POST() {
  return NextResponse.json(
    { error: "Publishing is not implemented yet." },
    { status: 501 }
  );
}
