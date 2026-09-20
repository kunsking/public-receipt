import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    database: process.env.NEXT_PUBLIC_SUPABASE_URL ? "configured" : "not_configured",
    aiConfigured: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL),
  });
}
