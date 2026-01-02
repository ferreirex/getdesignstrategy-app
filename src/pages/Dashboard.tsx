import { useEffect, useMemo, useState } from "react";
import ProfileSummary from "../components/ProfileSummary";

type Offers = {
  ok: true;
  offers: {
    monthly: { enabled: boolean; price: string };
    lifetime: { enabled: boolean; price: string };
  };
};

type BillingStatus =
  | {
      ok: true;
      subscription: {
        plan: "free" | "monthly" | "lifetime";
        status: "active" | "inactive";
        current_period_end: string | null;
        active: boolean;
      };
    }
  | { error: string };

type Props = {
  profile: any;
  onGoToChat: () => void;
};

const API_BASE = "https://api.getdesignstrategy.com";

export default function Dashboard({ profile, onGoToChat }: Props) {
  const [offers, setOffers] = useState<Offers | null>(null);
  const [billing, setBilling] = useState<BillingStatus | null>(null);

  const [loadingOffers, setLoadingOffers] = useState(true);
  const [loadingBilling, setLoadingBilling] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<"monthly" | "lifetime" | null>(null);

  const isActive = useMemo(() => {
    if (!billing || "error" in billing) return false;
    return Boolean(billing.subscription?.active);
  }, [billing]);

  const planLabel = useMemo(() => {
    if (!billing || "error" in billing) return "—";
    const p = billing.subscription.plan;
    if (p === "monthly") return "Monthly";
    if (p === "lifetime") return "Lifetime";
    return "Free";
  }, [billing]);

  const lifetimeVisible = useMemo(() => {
    if (!offers) return true; // fallback: show until loaded
    return Boolean(offers.offers?.lifetime?.enabled);
  }, [offers]);

  useEffect(() => {
    let cancelled = false;

    async function loadOffers() {
      setLoadingOffers(true);
      try {
        const res = await fetch(`${API_BASE}/billing/offers`, { method: "GET" });
        const data = (await res.json().catch(() => null)) as Offers | null;
        if (cancelled) return;
        if (res.ok && data?.ok) setOffers(data);
      } catch {
        // ignore (fallback keeps lifetime visible)
      } finally {
        if (!cancelled) setLoadingOffers(false);
      }
    }

    async function loadBilling() {
      setLoadingBilling(true);
      try {
        const res = await fetch(`${API_BASE}/billing/status`, { method: "GET", credentials: "include" });
        const data = (await res.json().catch(() => null)) as BillingStatus | null;
        if (cancelled) return;

        if (!res.ok || !data) {
          setError(`Billing status failed (${res.status}).`);
          setBilling(null);
          return;
        }
        if ("error" in data) {
          setError(data.error || "Billing status error.");
          setBilling(data);
          return;
        }
        setBilling(data);
      } catch (e: any) {
        if (cancelled) return;
        setError(String(e?.message || e));
      } finally {
        if (!cancelled) setLoadingBilling(false);
      }
    }

    loadOffers();
    loadBilling();

    return () => {
      cancelled = true;
    };
  }, []);

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

      const data = (await res.json().catch(() => null)) as any;

      if (!res.ok) {
        const msg = data?.error || data?.message || `Checkout failed (${res.status}).`;
        setError(msg);
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

  const card: React.CSSProperties = {
    border: "1px solid #eee",
    borderRadius: 14,
    padding: 16,
    background: "white",
  };

  const h2: React.CSSProperties = { fontWeight: 800, fontSize: 18, marginBottom: 8 };
  const muted: React.CSSProperties = { color: "#666", fontSize: 13, lineHeight: 1.4 };

  return (
    <div style={{ padding: 20, maxWidth: 980 }}>
      <div style={{ display: "grid", gap: 14 }}>
        <section style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
            <div>
              <div style={h2}>Your profile snapshot</div>
              <div style={muted}>Based on your locked onboarding answers.</div>
            </div>

            <button
              onClick={onGoToChat}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: "black",
                color: "white",
                cursor: "pointer",
              }}
            >
              Go to Chat
            </button>
          </div>

          <div style={{ marginTop: 12 }}>
            <ProfileSummary profile={profile} />
          </div>
        </section>

        <section style={card}>
          <div style={h2}>Plan & access</div>

          {loadingBilling ? (
            <div style={muted}>Loading billing status…</div>
          ) : error ? (
            <div style={{ ...muted, color: "#b00020" }}>{error}</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={muted}>
                Current plan: <b style={{ color: "black" }}>{planLabel}</b>{" "}
                {isActive ? (
                  <span style={{ marginLeft: 8, color: "green", fontWeight: 700 }}>Active</span>
                ) : (
                  <span style={{ marginLeft: 8, color: "#b00020", fontWeight: 700 }}>Not active</span>
                )}
              </div>

              {!isActive && (
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

                  {!loadingOffers && !lifetimeVisible && (
                    <div style={muted}>Lifetime is currently unavailable.</div>
                  )}
                </div>
              )}

              {isActive && <div style={muted}>You have full access.</div>}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
