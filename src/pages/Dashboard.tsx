import type { UserProfile } from "./Onboarding";
import ProfileSummary from "../components/ProfileSummary";

export default function Dashboard({
  onGoToChat,
  profile,
}: {
  onGoToChat: () => void;
  profile: UserProfile;
}) {
  return (
    <div style={{ padding: 20, display: "grid", gap: 16 }}>
      <section style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
        <div style={{ fontWeight: 800, marginBottom: 6 }}>Welcome back</div>
        <div style={{ color: "#555" }}>
          Your strategist is now calibrated to your business baseline. From this point forward, recommendations will stay consistent and improve based
          on what you write in chat.
        </div>
      </section>

      <section style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
        <div style={{ fontWeight: 800, marginBottom: 6 }}>Recommended next action</div>
        <div style={{ color: "#555", marginBottom: 12 }}>
          Start with pricing and revenue clarity: open the strategist and describe your last client negotiation.
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
            width: "fit-content",
          }}
        >
          Go to strategist
        </button>
      </section>

      <ProfileSummary profile={profile} />
    </div>
  );
}
