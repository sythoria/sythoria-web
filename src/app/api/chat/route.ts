import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiBase, apiKey, model, messages, temperature, stream } = body;

    if (!apiBase || !model || !messages) {
      return new Response(JSON.stringify({ error: "Missing required fields: apiBase, model, messages" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const upstreamRes = await fetch(apiBase, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages,
        temperature: temperature ?? 0.7,
        stream: stream ?? false,
      }),
    });

    if (!upstreamRes.ok) {
      const text = await upstreamRes.text().catch(() => "");
      return new Response(text || `Upstream error ${upstreamRes.status}`, {
        status: upstreamRes.status,
        headers: { "Content-Type": "application/json" },
      });
    }

  if (stream) {
    const transformStream = new TransformStream({
        async transform(chunk, controller) {
          controller.enqueue(chunk);
        },
      });

      (async () => {
        const reader = upstreamRes.body?.getReader();
        if (!reader) return;

        const writer = transformStream.writable.getWriter();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            await writer.write(value);
          }
        } finally {
          await writer.close();
        }
      })();

      return new Response(transformStream.readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const data = await upstreamRes.json();
    return Response.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
