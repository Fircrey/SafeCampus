import { NextRequest, NextResponse } from "next/server";

const FLASK_URL = process.env.FLASK_URL ?? "http://localhost:5000";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const body = await request.text();

    const flaskRes = await fetch(`${FLASK_URL}/api/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body,
    });

    const responseText = await flaskRes.text();
    return new NextResponse(responseText, {
      status: flaskRes.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json(
      { error: "Error interno del proxy" },
      { status: 500 }
    );
  }
}

export const maxDuration = 30;
export const dynamic = "force-dynamic";
