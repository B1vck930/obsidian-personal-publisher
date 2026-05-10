import { NextResponse } from "next/server";

export function PUT() {
  return NextResponse.json(
    { error: "Page updates are not implemented yet." },
    { status: 501 }
  );
}

export function DELETE() {
  return NextResponse.json(
    { error: "Page deletion is not implemented yet." },
    { status: 501 }
  );
}
