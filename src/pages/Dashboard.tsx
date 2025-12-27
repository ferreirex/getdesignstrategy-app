export default function Dashboard({ onGoToChat }: { onGoToChat: () => void }) {
    return (
      <div style={{ padding: 20, display: "grid", gap: 16 }}>
        <section style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Welcome to Get Design Strategy</div>
          <div style={{ color: "#555" }}>
            Your design business strategist, on demand. This is a simple scaffold — we’ll add onboarding, memory, and the
            real chat next.
          </div>
        </section>
  
        <section style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Recommended next action</div>
          <div style={{ color: "#555", marginBottom: 12 }}>Start by opening the strategist chat.</div>
          <button
            onClick={onGoToChat}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "black",
              color: "white",
              cursor: "pointer",
              width: "fit-content",
            }}
          >
            Go to strategist
          </button>
        </section>
  
        <section style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Your profile (placeholder)</div>
          <div style={{ color: "#555" }}>
            We’ll show onboarding answers here later (business type, pricing model, bottleneck, 12-month goal).
          </div>
        </section>
      </div>
    );
  }
  