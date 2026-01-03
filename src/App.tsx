import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Onboarding, { type UserProfile } from "./pages/Onboarding";
import Login from "./pages/Login";

type Page = "dashboard" | "chat";

type AuthState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; userId: string };

type ProfileState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "missing" }
  | { status: "ready"; profile: any }
  | { status: "error"; message: string };

const API_ORIGIN = "https://api.getdesignstrategy.com";

async function apiGet(path: string) {
  const res = await fetch(`${API_ORIGIN}${path}`, {
    method: "GET",
    credentials: "include",
  });
  const text = await res.text().catch(() => "");
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { res, data };
}

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });
  const [profileState, setProfileState] = useState<ProfileState>({
    status: "idle",
  });

  // 1) Check session
  useEffect(() => {
    (async () => {
      const { res, data } = await apiGet("/me");
      if (!res.ok) {
        setAuth({ status: "unauthenticated" });
        return;
      }
      if (data?.authenticated) {
        setAuth({ status: "authenticated", userId: data.userId });
      } else {
        setAuth({ status: "unauthenticated" });
      }
    })();
  }, []);

  // 2) After authenticated, load profile from DB
  useEffect(() => {
    if (auth.status !== "authenticated") return;

    (async () => {
      setProfileState({ status: "loading" });

      const { res, data } = await apiGet("/profile");
      if (!res.ok) {
        setProfileState({
          status: "error",
          message: `Failed to load profile (${res.status})`,
        });
        return;
      }

      // IMPORTANT: treat exists=true as "ready" even if profile payload is missing/null.
      // This prevents users from being stuck in onboarding when profile already exists.
      if (data?.exists) {
        // Mesmo que o backend não devolva o profile completo,
        // exists=true significa que o onboarding já foi feito
        setProfileState({ status: "ready", profile: data?.profile ?? {} });
      } else {
        setProfileState({ status: "missing" });
      }
      
    })();
  }, [auth.status]);

  // Gate 0: session check
  if (auth.status === "loading") {
    return <div style={{ padding: 20 }}>Loading…</div>;
  }

  // Gate 1: Login mandatory
  if (auth.status === "unauthenticated") {
    return (
      <Login
        onLoggedIn={async () => {
          // Revalida sessão após login
          setAuth({ status: "loading" });
  
          const { res, data } = await apiGet("/me");
          if (res.ok && data?.authenticated) {
            setAuth({ status: "authenticated", userId: data.userId });
          } else {
            setAuth({ status: "unauthenticated" });
          }
        }}
      />
    );
  }
  

  // Gate 2: Profile check
  if (profileState.status === "idle" || profileState.status === "loading") {
    return <div style={{ padding: 20 }}>Loading profile…</div>;
  }

  if (profileState.status === "error") {
    return (
      <div style={{ padding: 20 }}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>Error</div>
        <div>{profileState.message}</div>
      </div>
    );
  }

  // Gate 3: Onboarding mandatory (DB-based)
  if (profileState.status === "missing") {
    return (
      <Onboarding
        onComplete={async (_p: UserProfile) => {
          // After onboarding saved (or already existed), reload profile from DB (source of truth)
          setProfileState({ status: "loading" });

          const { res, data } = await apiGet("/profile");

          // If profile exists, leave onboarding no matter what.
          if (res.ok && data?.exists) {
            setProfileState({ status: "ready", profile: data?.profile ?? {} });
            return;
          }

          // If still not exists, keep onboarding
          setProfileState({ status: "missing" });
        }}
      />
    );
  }

  // App shell
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
            <Dashboard profile={profileState.profile} onGoToChat={() => setPage("chat")} />
          ) : (
            <Chat />
          )}
        </div>
      </main>
    </div>
  );
}
