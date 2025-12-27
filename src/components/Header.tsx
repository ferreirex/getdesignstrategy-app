type Props = {
    title: string;
    subtitle?: string;
  };
  
  export default function Header({ title, subtitle }: Props) {
    return (
      <header style={{ padding: "16px 20px", borderBottom: "1px solid #eee" }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>{title}</div>
        {subtitle ? <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>{subtitle}</div> : null}
      </header>
    );
  }
  