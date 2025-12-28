type Props = {
  profile: any; // vindo do App.tsx (DB profile)
  onGoToChat: () => void;
};

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 14,
        padding: 16,
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 10 }}>{title}</div>
      <div style={{ color: "#bbb", fontSize: 14, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12, padding: "8px 0" }}>
      <div style={{ color: "#999", fontSize: 13 }}>{label}</div>
      <div style={{ color: "#ddd", fontSize: 14 }}>{value}</div>
    </div>
  );
}

export default function Dashboard({ profile, onGoToChat }: Props) {
  const businessType = profile?.business_type ?? "-";
  const pricingModel = profile?.pricing_model ?? "-";
  const monthlyRevenue = profile?.monthly_revenue ?? "-";
  const mainBottleneck = profile?.main_bottleneck ?? "-";
  const goal12 = profile?.goal_12_months ?? "-";
  const details = profile?.details ?? "-";
  const createdAt = profile?.created_at ? new Date(profile.created_at).toLocaleString() : "-";

  // "Recommended next step" simples (placeholder inicial)
  const nextStep =
    mainBottleneck === "Low pricing / constant negotiation"
      ? "Define 3 packages com âncoras de valor e um ‘minimum engagement’ para parar negociação."
      : mainBottleneck === "Weak leads"
      ? "Escolhe 1 canal e 1 oferta e faz 10 outreach específicos por semana durante 4 semanas."
      : mainBottleneck === "Lack of processes"
      ? "Documenta o teu processo em 5 fases e cria 1 checklist por fase."
      : mainBottleneck === "No time"
      ? "Corta 20% do trabalho não faturável: elimina/automatiza tarefas repetidas esta semana."
      : "Treina 1 script de venda e faz 3 chamadas de diagnóstico sem proposta até ao fim da semana.";

  return (
    <div style={{ padding: 18, display: "grid", gap: 14, maxWidth: 980 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 900 }}>Welcome back</div>
          <div style={{ color: "#999", marginTop: 6, fontSize: 13 }}>
            Your onboarding is locked. These answers guide your strategist.
          </div>
        </div>

        <button
          onClick={onGoToChat}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #333",
            background: "black",
            color: "white",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Go to strategist
        </button>
      </div>

      <Card title="Recommended next step">
        <div style={{ color: "#e6e6e6", fontSize: 14 }}>{nextStep}</div>
        <div style={{ marginTop: 10, color: "#777", fontSize: 12 }}>
          (Isto é um placeholder simples. A seguir vamos ligar isto ao Chat para recomendar com base no teu perfil.)
        </div>
      </Card>

      <Card title="Your onboarding profile (locked)">
        <Row label="Business type" value={businessType} />
        <Row label="Pricing model" value={pricingModel} />
        <Row label="Monthly revenue" value={monthlyRevenue} />
        <Row label="Main bottleneck" value={mainBottleneck} />
        <Row label="12-month goal" value={goal12} />
        <Row label="Created at" value={createdAt} />

        <div style={{ marginTop: 12, color: "#999", fontSize: 13, fontWeight: 700 }}>
          Details (what you tried)
        </div>
        <div
          style={{
            marginTop: 8,
            padding: 12,
            border: "1px solid #222",
            borderRadius: 12,
            color: "#ddd",
            whiteSpace: "pre-wrap",
          }}
        >
          {details}
        </div>
      </Card>
    </div>
  );
}
