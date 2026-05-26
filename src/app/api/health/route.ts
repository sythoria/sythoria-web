import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiBase, apiKey } = body;

    if (!apiBase) {
      return Response.json(
        { error: "Missing required field: apiBase" },
        { status: 400 },
      );
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const res = await fetch(apiBase, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "test",
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 1,
      }),
    });

    const ok = res.ok || res.status === 400;
    return Response.json({ ok, status: res.status });
  } catch {
    return Response.json({ ok: false, status: 0 });
  }
}
