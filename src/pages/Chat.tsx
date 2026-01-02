import { useEffect, useMemo, useRef, useState } from "react";

type ChatItem = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
};

type Offers = {
  ok: true;
  offers: {
    monthly: { enabled: boolean; price: string };
    lifetime: { enabled: boolean; price: string };
  };
};

const API_BASE = "https://api.getdesignstrategy.com";

export default function Chat() {
  const [history, setHistory] = useState<ChatItem[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [paywall, setPaywall] = useState<{ show: boolean; text?: string } | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<"monthly" | "lifetime" | null>(null);

  const [offers, setOffers] = useState<Offers | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const canSend = useMemo(() => message.trim().length > 0 && !sending, [message, sending]);

  const lifetimeVisible = useMemo(() => {
    if (!offers) return true; // fallback
    return Boolean(offers.offers?.lifetime?.enabled);
  }, [offers]);

  useEffect(() => {
    let cancelled = false;

    async function loadOffers() {
      try {
        const res = await fetch(`${API_BASE}/billing/offers`, { method: "GET" });
        const data = (await res.json().catch(() => null)) as Offers | null;
        if (cancelled) return;
        if (res.ok && data?.ok) setOffers(data);
      } catch {
        // ignore
      }
    }

    async function loadHistory() {
      try {
        const res = await fetch(`${API_BASE}/chat/history`, { credentials: "include" });
        const data = await res.json().catch(() => null);

        if (cancelled) return;
        if (!res.ok) return;

        if (data?.history && Array.isArray(data.history)) {
          setHistory(data.history);
        }
      } catch {
        // ignore
      }
    }

    loadOffers();
    loadHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, paywall]);

  async function startCheckout(plan: "monthly" | "lifetime") {
    if (checkoutLoading) return;
    setCheckoutLoading(plan);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/billing/checkout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.message || data?.error || `Checkout failed (${res.status}).`);
        setCheckoutLoading(null);
        return;
      }

      if (!data?.url) {
        setError("Checkout URL missing.");
        setCheckoutLoading(null);
        return;
      }

      window.location.href = data.url;
    } catch (e: any) {
      setError(String(e?.message || e));
      setCheckoutLoading(null);
    }
  }

  async function send() {
    if (!canSend) return;

    const text = message.trim();
    setMessage("");
    setSending(true);
    setError(null);
    setPaywall(null);

    setHistory((h) => [...h, { role: "user", content: text }]);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json().catch(() => null);

      if (res.status === 402) {
        setPaywall({
          show: true,
          text: data?.message || "Free limit reached. Please upgrade to continue.",
        });
        setSending(false);
        return;
      }

      if (!res.ok) {
        const msg = data?.detail || data?.message || data?.error || `Request failed (${res.status}).`;
        setError(msg);
        setSending(false);
        return;
      }

      const reply = String(data?.reply || "");
      setHistory((h) => [...h, { role: "assistant", content: reply }]);
      setSending(false);
    } catch (e: any) {
      setError(String(e?.message || e));
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const bubble = (role: "user" | "assistant"): React.CSSProperties => ({
    maxWidth: 760,
    padding: 12,
    borderRadius: 12,
    border: "1px solid #eee",
    background: role === "user" ? "black" : "white",
    color: role === "user" ? "white" : "black",
    alignSelf: role === "user" ? "flex-end" : "flex-start",
    whiteSpace: "pre-wrap",
    lineHeight: 1.45,
  });

  return (
    <div style={{ padding: 20, height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        {history.map((m, idx) => (
          <div key={m.id || idx} style={bubble(m.role)}>
            {m.content}
          </div>
        ))}

        {paywall?.show && (
          <div
            style={{
              border: "1px solid #f2c2c2",
              borderRadius: 14,
              padding: 14,
              background: "white",
              maxWidth: 760,
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Upgrade required</div>
            <div style={{ color: "#333", marginBottom: 10 }}>{paywall.text}</div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => startCheckout("monthly")}
                disabled={checkoutLoading !== null}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  background: checkoutLoading === "monthly" ? "#999" : "black",
                  color: "white",
                  cursor: checkoutLoading ? "not-allowed" : "pointer",
                }}
              >
                {checkoutLoading === "monthly"
                  ? "Redirecting…"
                  : `Upgrade — ${offers?.offers?.monthly?.price || "£9/month"}`}
              </button>

              {lifetimeVisible && (
                <button
                  onClick={() => startCheckout("lifetime")}
                  disabled={checkoutLoading !== null}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #ddd",
                    background: checkoutLoading === "lifetime" ? "#999" : "white",
                    color: "black",
                    cursor: checkoutLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {checkoutLoading === "lifetime"
                    ? "Redirecting…"
                    : `Get Lifetime — ${offers?.offers?.lifetime?.price || "£49 one-time"}`}
                </button>
              )}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {error && (
        <div style={{ marginTop: 10, padding: 10, border: "1px solid #f2c2c2", borderRadius: 10 }}>
          <div style={{ color: "#b00020", fontWeight: 800 }}>Error</div>
          <div style={{ color: "#b00020" }}>{error}</div>
        </div>
      )}

      <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Write your message…"
          style={{
            flex: 1,
            minHeight: 44,
            maxHeight: 140,
            padding: 10,
            borderRadius: 12,
            border: "1px solid #ddd",
            resize: "vertical",
          }}
        />

        <button
          onClick={send}
          disabled={!canSend}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #ddd",
            background: canSend ? "black" : "#999",
            color: "white",
            cursor: canSend ? "pointer" : "not-allowed",
            minWidth: 110,
          }}
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </div>
    </div>
  );
}
