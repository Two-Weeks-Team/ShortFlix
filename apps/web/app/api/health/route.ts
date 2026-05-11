import { NextResponse } from "next/server";

// Cloud Run startup/liveness probe target. Must respond 200 with minimal latency.
// Force dynamic to avoid SSG attempting to build this at compile time.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  return NextResponse.json(
    { status: "ok", service: "shortflix-web" },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
