import type { UserProfile } from "../pages/Onboarding";

export default function ProfileSummary({ profile }: { profile: UserProfile }) {
  const rowStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "220px 1fr", gap: 10, padding: "8px 0" };
  const labelStyle: React.CSSProperties = { color: "#666", fontSize: 13 };
  const valueStyle: React.CSSProperties = { fontWeight: 600 };

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
      <div style={{ fontWeight: 800, marginBottom: 10 }}>Your onboarding profile (read-only)</div>

      <div style={rowStyle}>
        <div style={labelStyle}>Business type</div>
        <div style={valueStyle}>{profile.businessType}</div>
      </div>

      <div style={rowStyle}>
        <div style={labelStyle}>Pricing model</div>
        <div style={valueStyle}>{profile.pricingModel}</div>
      </div>

      <div style={rowStyle}>
        <div style={labelStyle}>Monthly revenue</div>
        <div style={valueStyle}>{profile.monthlyRevenue}</div>
      </div>

      <div style={rowStyle}>
        <div style={labelStyle}>Main bottleneck</div>
        <div style={valueStyle}>{profile.mainBottleneck}</div>
      </div>

      <div style={rowStyle}>
        <div style={labelStyle}>12-month goal</div>
        <div style={valueStyle}>{profile.goal12Months}</div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={labelStyle}>Details (what you tried)</div>
        <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{profile.details}</div>
      </div>

      <div style={{ marginTop: 12, color: "#666", fontSize: 12 }}>
        These answers are intentionally locked to keep guidance consistent. The strategist will adapt based on everything you write in chat going
        forward.
      </div>
    </div>
  );
}
