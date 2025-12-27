import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Onboarding, { type UserProfile } from "./pages/Onboarding";

type Page = "dashboard" | "chat";

const STORAGE_KEY = "gds_user_profile_v1";

function loadProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

function saveProfile(profile: UserProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Load profile once on app start
  useEffect(() => {
    const p = loadProfile();
    if (p) setProfile(p);
  }, []);

  // Gate: onboarding is mandatory
  if (!profile) {
    return (
      <Onboarding
        onComplete={(p) => {
          saveProfile(p);
          setProfile(p);
        }}
      />
    );
  }

  const title = page === "dashboard" ? "Dashboard" : "Chat";
  const subtitle =
    page === "dashboard"
      ? "Your current focus and next step (based on your onboarding)."
      : "Your Design Business Strategist (context-aware).";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar current={page} onNavigate={setPage} />

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header title={title} subtitle={subtitle} />

        <div style={{ flex: 1 }}>
          {page === "dashboard" ? (
            <Dashboard profile={profile} onGoToChat={() => setPage("chat")} />
          ) : (
            <Chat />
          )}
        </div>
      </main>
    </div>
  );
}
