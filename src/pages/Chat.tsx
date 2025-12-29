import { useEffect, useRef, useState } from "react";

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
};

const API_ORIGIN = "https://api.getdesignstrategy.com";

function uid(prefix = "m") {
  return `${prefix}_${crypto.randomUUID()}`;
}

function Bubble({ role, content }: { role: Msg["role"]; content: string }) {
  const isUser = role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
      <div
        style={{
          maxWidth: 760,
          padding: 12,
          borderRadius: 14,
          border: "1px solid #222",
          background: isUser ? "black" : "rgba(255,255,255,0.02)",
          color: isUser ? "white" : "#ddd",
          whiteSpace: "pre-wrap",
          lineHeight: 1.5,
          fontSize: 14,
        }}
      >
        {content}
      </div>
    </div>
  );
}

function parseISOToMs(iso: string) {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : Date.now();
}

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement | null>(null);

  // Load history once on mount
  useEffect(() => {
    (async () => {
      setLoadingHistory(true);
      setError(null);

      try {
        const res = await fetch(`${API_ORIGIN}/chat/history`, {
          method: "GET",
          credentials: "include",
        });

        const txt = await res.text().catch(() => "");
        let data: any = null;
        try {
          data = txt ? JSON.parse(txt) : null;
        } catch {
          data = txt;
        }

        if (!res.ok) {
          if (res.status === 401) {
            setError("Not authenticated. Please log in again.");
          } else {
            setError(`History API error (${res.status}): ${typeof data === "string" ? data : JSON.stringify(data)}`);
          }
          setMessages([
            {
              id: uid("a"),
              role: "assistant",
              content:
                "I couldn’t load your history. Try refreshing. If it persists, you may need to log in again.",
              ts: Date.now(),
            },
          ]);
          setLoadingHistory(false);
          return;
        }

        const hist = Array.isArray(data?.history) ? data.history : [];
        if (hist.length === 0) {
          // First-time UX
          setMessages([
            {
              id: uid("a"),
              role: "assistant",
              content:
                "Tell me what you’re working on right now (project + offer), and what feels like the biggest friction in getting better clients or charging more.",
              ts: Date.now(),
            },
          ]);
          setLoadingHistory(false);
          return;
        }

        const mapped: Msg[] = hist.map((r: any) => ({
          id: String(r.id || uid("h")),
          role: r.role === "assistant" ? "assistant" : "user",
          content: String(r.content || ""),
          ts: parseISOToMs(String(r.created_at || "")),
        }));

        setMessages(mapped);
        setLoadingHistory(false);
      } catch (e: any) {
        setError(String(e?.message || e));
        setMessages([
          {
            id: uid("a"),
            role: "assistant",
            content: "I couldn’t load your history due to a network error. Try refreshing.",
            ts: Date.now(),
          },
        ]);
        setLoadingHistory(false);
      }
    })();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending, loadingHistory]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    setError(null);
    setSending(true);

    const userMsg: Msg = { id: uid("u"), role: "user", content: text, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await fetch(`${API_ORIGIN}/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const bodyText = await res.text().catch(() => "");
      let data: any = null;
      try {
        data = bodyText ? JSON.parse(bodyText) : null;
      } catch {
        data = bodyText;
      }

      if (!res.ok) {
        if (res.status === 401) {
          setError("Not authenticated. Please log in again.");
        } else {
          setError(`Chat API error (${res.status}): ${typeof data === "string" ? data : JSON.stringify(data)}`);
        }
        setSending(false);
        return;
      }

      const reply = data?.reply || "(No reply)";
      const assistantMsg: Msg = { id: uid("a"), role: "assistant", content: reply, ts: Date.now() };
      setMessages((prev) => [...prev, assistantMsg]);

      setSending(false);
    } catch (e: any) {
      setError(String(e?.message || e));
      setSending(false);
    }
  }

  return (
    <div style={{ padding: 18, maxWidth: 980, height: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ color: "#999", fontSize: 13 }}>
        This strategist uses your onboarding profile (locked) to stay consistent. History is stored per user.
      </div>

      <div
        style={{
          flex: 1,
          border: "1px solid #222",
          borderRadius: 14,
          padding: 14,
          overflow: "auto",
          display: "grid",
          gap: 10,
          background: "rgba(255,255,255,0.01)",
        }}
      >
        {loadingHistory ? (
          <Bubble role="assistant" content="Loading history…" />
        ) : (
          messages.map((m) => <Bubble key={m.id} role={m.role} content={m.content} />)
        )}

        {sending && <Bubble role="assistant" content="Thinking…" />}

        <div ref={endRef} />
      </div>

      {error && (
        <div style={{ padding: 12, border: "1px solid #f2c2c2", borderRadius: 12, color: "#b00020" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 12,
            border: "1px solid #222",
            background: "transparent",
            color: "white",
            outline: "none",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
        />
        <button
          onClick={send}
          disabled={sending || !input.trim()}
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid #333",
            background: sending || !input.trim() ? "#444" : "black",
            color: "white",
            cursor: sending || !input.trim() ? "not-allowed" : "pointer",
            fontWeight: 800,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
