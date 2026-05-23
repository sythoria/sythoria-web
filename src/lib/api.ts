export async function chatStream({
  apiBase,
  apiKey,
  model,
  messages,
  temperature,
  onChunk,
  onDone,
  onError,
  signal,
}: {
  apiBase: string;
  apiKey: string;
  model: string;
  messages: { role: string; content: string }[];
  temperature: number;
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (err: unknown) => void;
  signal?: AbortSignal;
}) {
  try {
    const res = await fetch(apiBase, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        stream: true,
      }),
      signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`API error ${res.status}: ${text || res.statusText}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === "data: [DONE]") continue;
        if (!trimmed.startsWith("data: ")) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) onChunk(delta);
        } catch {
          // skip malformed JSON lines
        }
      }
    }

    onDone();
  } catch (err) {
    if (signal?.aborted) return;
    onError(err);
  }
}

export async function chatCompletionTools({
  apiBase,
  apiKey,
  model,
  messages,
  tools,
  temperature,
  signal,
}: {
  apiBase: string;
  apiKey: string;
  model: string;
  messages: { role: string; content: string | null; tool_calls?: unknown[]; tool_call_id?: string; name?: string }[];
  tools: unknown[];
  temperature: number;
  signal?: AbortSignal;
}): Promise<{ choices?: { message: { content: string | null; tool_calls?: { id: string; function: { name: string; arguments: string } }[] } }[] }> {
  const res = await fetch(apiBase, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model,
      messages,
      tools,
      temperature,
      stream: false,
    }),
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}

export async function checkApiConnection(apiBase: string, apiKey: string): Promise<boolean> {
  try {
    const res = await fetch(apiBase, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: "test",
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 1,
      }),
    });
    return res.ok || res.status === 400;
  } catch {
    return false;
  }
}
