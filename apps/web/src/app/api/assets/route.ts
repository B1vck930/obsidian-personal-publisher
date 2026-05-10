import { NextResponse } from "next/server";

export function POST() {
  return NextResponse.json(
    { error: "Asset upload is not implemented yet." },
    { status: 501 }
  );
}
