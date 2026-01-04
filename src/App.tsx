import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Feedback from "./pages/Feedback";
import Onboarding, { type UserProfile } from "./pages/Onboarding";
import Login from "./pages/Login";

type Page = "dashboard" | "chat" | "feedback";

type AuthState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; userId: string; isAdmin: boolean };

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
  const [profileState, setProfileState] = useState<ProfileState>({ status: "idle" });

  // 1) Check session
  useEffect(() => {
    (async () => {
      const { res, data } = await apiGet("/me");
      if (!res.ok) {
        setAuth({ status: "unauthenticated" });
        return;
      }
      if (data?.authenticated) {
        setAuth({
          status: "authenticated",
          userId: data.userId,
          isAdmin: Boolean(data?.isAdmin),
        });
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
        setProfileState({ status: "error", message: `Failed to load profile (${res.status})` });
        return;
      }

      // IMPORTANT: exists=true means onboarding already done
      if (data?.exists) {
        setProfileState({ status: "ready", profile: data?.profile ?? {} });
      } else {
        setProfileState({ status: "missing" });
      }
    })();
  }, [auth.status]);

  // Gate 0: session check
  if (auth.status === "loading") return <div style={{ padding: 20 }}>Loading…</div>;

  // Gate 1: Login mandatory
  if (auth.status === "unauthenticated") {
    return (
      <Login
        onLoggedIn={async () => {
          setAuth({ status: "loading" });
          const { res, data } = await apiGet("/me");
          if (res.ok && data?.authenticated) {
            setAuth({
              status: "authenticated",
              userId: data.userId,
              isAdmin: Boolean(data?.isAdmin),
            });
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

  // Gate 3: Onboarding mandatory
  if (profileState.status === "missing") {
    return (
      <Onboarding
        onComplete={async (_p: UserProfile) => {
          setProfileState({ status: "loading" });
          const { res, data } = await apiGet("/profile");
          if (res.ok && data?.exists) {
            setProfileState({ status: "ready", profile: data?.profile ?? {} });
            return;
          }
          setProfileState({ status: "missing" });
        }}
      />
    );
  }

  // App shell
  const title = page === "dashboard" ? "Dashboard" : page === "chat" ? "Chat" : "Feedback";
  const subtitle =
    page === "dashboard"
      ? "Your current focus and next step (based on your onboarding)."
      : page === "chat"
        ? "Your Design Business Strategist (context-aware)."
        : "Admin-only: ratings and comments from beta testers.";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        current={page}
        onNavigate={(p) => {
          // hard gate: non-admin cannot access feedback
          if (p === "feedback" && !auth.isAdmin) return;
          setPage(p);
        }}
        isAdmin={auth.isAdmin}
      />

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header title={title} subtitle={subtitle} />

        <div style={{ flex: 1 }}>
          {page === "dashboard" ? (
            <Dashboard profile={profileState.profile} onGoToChat={() => setPage("chat")} />
          ) : page === "chat" ? (
            <Chat />
          ) : (
            <Feedback />
          )}
        </div>
      </main>
    </div>
  );
}
