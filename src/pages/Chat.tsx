export default function Chat() {
    return (
      <div style={{ padding: 20, display: "grid", gap: 16 }}>
        <section style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Design Business Strategist</div>
          <div style={{ color: "#555" }}>
            This is where the chat UI will live. Next we’ll add:
            <ul style={{ marginTop: 10, paddingLeft: 18, color: "#555" }}>
              <li>Mandatory onboarding questionnaire</li>
              <li>User profile + memory</li>
              <li>Real chat with API (Cloudflare Workers)</li>
            </ul>
          </div>
        </section>
  
        <section style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Chat placeholder</div>
          <div
            style={{
              height: 220,
              border: "1px dashed #ccc",
              borderRadius: 12,
              padding: 12,
              color: "#777",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Chat coming next
          </div>
        </section>
      </div>
    );
  }
  