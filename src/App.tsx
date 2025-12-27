import { useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";

type Page = "dashboard" | "chat";

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");

  const title = useMemo(() => {
    if (page === "dashboard") return "Dashboard";
    return "Chat";
  }, [page]);

  const subtitle = useMemo(() => {
    if (page === "dashboard") return "Your current focus and next step (placeholder).";
    return "Your Design Business Strategist (placeholder).";
  }, [page]);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar current={page} onNavigate={setPage} />

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header title={title} subtitle={subtitle} />
        <div style={{ flex: 1 }}>
          {page === "dashboard" ? <Dashboard onGoToChat={() => setPage("chat")} /> : <Chat />}
        </div>
      </main>
    </div>
  );
}
