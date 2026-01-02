import { useMemo, useState } from "react";

export type UserProfile = {
  businessType: "Freelancer" | "Studio (2–4)" | "Agency (5+)";
  pricingModel: "Hourly" | "Fixed project" | "Productized packages" | "Mixed" | "Unclear";
  monthlyRevenue: "<£2k" | "£2k–£5k" | "£5k–£10k" | "£10k+";
  mainBottleneck:
    | "Low pricing / constant negotiation"
    | "Weak leads"
    | "Lack of processes"
    | "No time"
    | "Low confidence selling";
  goal12Months:
    | "Earn more without more hours"
    | "Fewer, better clients"
    | "Build scalable services"
    | "Build a small team"
    | "Clear, predictable systems";
  details: string;
  createdAtISO: string;
};

type Props = {
  onComplete: (profile: UserProfile) => void;
};

const API_ORIGIN = "https://api.getdesignstrategy.com";

export default function Onboarding({ onComplete }: Props) {
  const [businessType, setBusinessType] = useState<UserProfile["businessType"]>("Freelancer");
  const [pricingModel, setPricingModel] = useState<UserProfile["pricingModel"]>("Hourly");
  const [monthlyRevenue, setMonthlyRevenue] = useState<UserProfile["monthlyRevenue"]>("<£2k");
  const [mainBottleneck, setMainBottleneck] = useState<UserProfile["mainBottleneck"]>(
    "Low pricing / constant negotiation"
  );
  const [goal12Months, setGoal12Months] = useState<UserProfile["goal12Months"]>("Fewer, better clients");
  const [details, setDetails] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => details.trim().length >= 40, [details]);

  async function submit() {
    console.log("SUBMIT CLICKED");

    if (!canSubmit || loading) {
      console.log("SUBMIT BLOCKED", { canSubmit, loading, len: details.trim().length });
      return;
    }

    const ok = window.confirm(
      "Confirmação final:\n\n" +
        "• Estas respostas vão orientar toda a tua experiência e recomendações.\n" +
        "• Não vais poder editar estas respostas mais tarde.\n\n" +
        "Queres confirmar e continuar?"
    );
    if (!ok) return;

    setLoading(true);
    setError(null);

    const profile: UserProfile = {
      businessType,
      pricingModel,
      monthlyRevenue,
      mainBottleneck,
      goal12Months,
      details: details.trim(),
      createdAtISO: new Date().toISOString(),
    };

    console.log("POSTING TO /profile", profile);

    try {
      const res = await fetch(`${API_ORIGIN}/profile`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_type: profile.businessType,
          pricing_model: profile.pricingModel,
          monthly_revenue: profile.monthlyRevenue,
          main_bottleneck: profile.mainBottleneck,
          goal_12_months: profile.goal12Months,
          details: profile.details,
        }),
      });

      const responseText = await res.text().catch(() => "");
      console.log("POST /profile RESULT", { status: res.status, ok: res.ok, responseText });

      // 409 = profile já existe → tratar como sucesso (não mostrar erro)
      if (res.status === 409) {
        onComplete(profile);
        setLoading(false);
        return;
      }


      // Success
      onComplete(profile);
      setLoading(false);
      return;
    } catch (e: any) {
      console.log("POST /profile EXCEPTION", e);
      setError(String(e?.message || e));
      setLoading(false);
    }
  }

  const labelStyle: React.CSSProperties = { fontWeight: 700, marginBottom: 6 };
  const cardStyle: React.CSSProperties = { border: "1px solid #eee", borderRadius: 12, padding: 16 };

  return (
    <div style={{ padding: 20, maxWidth: 860 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 20 }}>Welcome — let’s set your baseline</div>
        <div style={{ color: "#666", marginTop: 6 }}>
          This takes ~2 minutes. It’s required so the strategist can stay consistent and tailored to your business.
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        <section style={cardStyle}>
          <div style={labelStyle}>1) What best describes your business?</div>
          <select
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value as any)}
            style={{ width: "100%", padding: 10 }}
          >
            <option>Freelancer</option>
            <option>Studio (2–4)</option>
            <option>Agency (5+)</option>
          </select>
        </section>

        <section style={cardStyle}>
          <div style={labelStyle}>2) How do you currently price projects?</div>
          <select
            value={pricingModel}
            onChange={(e) => setPricingModel(e.target.value as any)}
            style={{ width: "100%", padding: 10 }}
          >
            <option>Hourly</option>
            <option>Fixed project</option>
            <option>Productized packages</option>
            <option>Mixed</option>
            <option>Unclear</option>
          </select>
        </section>

        <section style={cardStyle}>
          <div style={labelStyle}>3) Monthly revenue range (average)</div>
          <select
            value={monthlyRevenue}
            onChange={(e) => setMonthlyRevenue(e.target.value as any)}
            style={{ width: "100%", padding: 10 }}
          >
            <option>{"<£2k"}</option>
            <option>{"£2k–£5k"}</option>
            <option>{"£5k–£10k"}</option>
            <option>{"£10k+"}</option>
          </select>
        </section>

        <section style={cardStyle}>
          <div style={labelStyle}>4) What is your main growth bottleneck right now?</div>
          <select
            value={mainBottleneck}
            onChange={(e) => setMainBottleneck(e.target.value as any)}
            style={{ width: "100%", padding: 10 }}
          >
            <option>Low pricing / constant negotiation</option>
            <option>Weak leads</option>
            <option>Lack of processes</option>
            <option>No time</option>
            <option>Low confidence selling</option>
          </select>
        </section>

        <section style={cardStyle}>
          <div style={labelStyle}>5) Where do you want to be in 12 months?</div>
          <select
            value={goal12Months}
            onChange={(e) => setGoal12Months(e.target.value as any)}
            style={{ width: "100%", padding: 10 }}
          >
            <option>Earn more without more hours</option>
            <option>Fewer, better clients</option>
            <option>Build scalable services</option>
            <option>Build a small team</option>
            <option>Clear, predictable systems</option>
          </select>
        </section>

        <section style={cardStyle}>
          <div style={labelStyle}>6) Describe your main problems and what you’ve tried so far</div>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Example: I’m stuck on hourly pricing. I tried fixed packages but clients compared me to cheap competitors..."
            style={{ width: "100%", minHeight: 140, padding: 10 }}
          />
          <div style={{ marginTop: 8, color: "#666", fontSize: 12 }}>
            Minimum 40 characters. This is what makes the strategist feel “personal”.
          </div>
        </section>

        {error && (
          <div style={{ padding: 12, border: "1px solid #f2c2c2", borderRadius: 10 }}>
            <div style={{ color: "#b00020", fontWeight: 700 }}>Error</div>
            <div style={{ color: "#b00020" }}>{error}</div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={submit}
            disabled={!canSubmit || loading}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: canSubmit && !loading ? "black" : "#999",
              color: "white",
              cursor: canSubmit && !loading ? "pointer" : "not-allowed",
            }}
          >
            {loading ? "Saving…" : "Finish onboarding"}
          </button>
        </div>
      </div>
    </div>
  );
}
