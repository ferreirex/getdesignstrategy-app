import { useEffect, useMemo, useState } from "react";

type FeedbackRow = {
  id: string;
  created_at: string;
  rating: "up" | "down";
  comment: string | null;

  // context
  user_email: string | null;
  assistant_message_id: string;
  assistant_reply: string | null;
  user_prompt: string | null;
};

const API_BASE = "https://api.getdesignstrategy.com";

export default function Feedback() {
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<"all" | "down" | "up">("all");
  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((r) => r.rating === filter);
  }, [rows, filter]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE}/admin/feedback`, { method: "GET", credentials: "include" });
        const data = await res.json().catch(() => null);

        if (cancelled) return;

        if (!res.ok) {
          setError(data?.message || data?.error || `Failed (${res.status}).`);
          setRows([]);
          setLoading(false);
          return;
        }

        if (!data?.ok || !Array.isArray(data.rows)) {
          setError("Unexpected response format.");
          setRows([]);
          setLoading(false);
          return;
        }

        setRows(data.rows);
        setLoading(false);
      } catch (e: any) {
        if (cancelled) return;
        setError(String(e?.message || e));
        setRows([]);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const card: React.CSSProperties = {
    border: "1px solid #eee",
    borderRadius: 14,
    padding: 16,
    background: "white",
  };

  const muted: React.CSSProperties = { color: "#666", fontSize: 13, lineHeight: 1.4 };

  return (
    <div style={{ padding: 20, maxWidth: 1100 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Feedback</div>
          <div style={muted}>Only visible to admin. Shows ratings + comments on assistant replies.</div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setFilter("all")}
            style={{
              padding: "8px 10px",
              borderRadius: 999,
              border: "1px solid #ddd",
              background: filter === "all" ? "black" : "white",
              color: filter === "all" ? "white" : "black",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            All
          </button>
          <button
            onClick={() => setFilter("down")}
            style={{
              padding: "8px 10px",
              borderRadius: 999,
              border: "1px solid #ddd",
              background: filter === "down" ? "black" : "white",
              color: filter === "down" ? "white" : "black",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            👎 Only
          </button>
          <button
            onClick={() => setFilter("up")}
            style={{
              padding: "8px 10px",
              borderRadius: 999,
              border: "1px solid #ddd",
              background: filter === "up" ? "black" : "white",
              color: filter === "up" ? "white" : "black",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            👍 Only
          </button>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        {loading ? (
          <div style={muted}>Loading…</div>
        ) : error ? (
          <div style={{ ...muted, color: "#b00020" }}>{error}</div>
        ) : filtered.length === 0 ? (
          <div style={muted}>No feedback yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {filtered.map((r) => (
              <section key={r.id} style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 800 }}>
                    {r.rating === "up" ? "👍 Good" : "👎 Not good"}{" "}
                    <span style={{ fontWeight: 600, color: "#666", marginLeft: 10 }}>
                      {new Date(r.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div style={muted}>{r.user_email ? `User: ${r.user_email}` : "User: —"}</div>
                </div>

                {r.comment && r.comment.trim() !== "" && (
                  <div style={{ marginTop: 10, padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
                    <div style={{ fontWeight: 800, marginBottom: 6 }}>Comment</div>
                    <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{r.comment}</div>
                  </div>
                )}

                <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                  {r.user_prompt && (
                    <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 12, background: "#fafafa" }}>
                      <div style={{ fontWeight: 800, marginBottom: 6 }}>User prompt</div>
                      <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{r.user_prompt}</div>
                    </div>
                  )}

                  {r.assistant_reply && (
                    <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
                      <div style={{ fontWeight: 800, marginBottom: 6 }}>Assistant reply</div>
                      <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{r.assistant_reply}</div>
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
