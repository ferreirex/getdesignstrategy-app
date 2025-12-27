type Props = {
    current: "dashboard" | "chat";
    onNavigate: (page: "dashboard" | "chat") => void;
  };
  
  export default function Sidebar({ current, onNavigate }: Props) {
    const itemClass = (active: boolean) =>
      [
        "w-full text-left px-3 py-2 rounded",
        active ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100",
        "border border-gray-200",
      ].join(" ");
  
    return (
      <aside style={{ width: 260, padding: 16, borderRight: "1px solid #eee" }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700 }}>Get Design Strategy</div>
          <div style={{ fontSize: 12, color: "#666" }}>Private beta</div>
        </div>
  
        <nav style={{ display: "grid", gap: 8 }}>
          <button className={itemClass(current === "dashboard")} onClick={() => onNavigate("dashboard")}>
            Dashboard
          </button>
          <button className={itemClass(current === "chat")} onClick={() => onNavigate("chat")}>
            Chat
          </button>
        </nav>
  
        <div style={{ marginTop: 16, fontSize: 12, color: "#666" }}>
          Tip: We’ll add onboarding + login next.
        </div>
      </aside>
    );
  }
  