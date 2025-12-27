import { useState } from "react";

export default function Login({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestCode() {
    setLoading(true);
    setError(null);

    const res = await fetch("https://api.getdesignstrategy.com/auth/request-code", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Failed to send login code.");
      return;
    }

    setStep("code");
  }

  async function verifyCode() {
    setLoading(true);
    setError(null);

    const res = await fetch("https://api.getdesignstrategy.com/auth/verify", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Invalid or expired code.");
      return;
    }

    onLoggedIn();
  }

  return (
    <div style={{ maxWidth: 420, margin: "80px auto", padding: 24 }}>
      <h2>Login</h2>

      {step === "email" && (
        <>
          <p>Enter your email to receive a login code.</p>
          <input
            type="email"
            placeholder="you@studio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
          />
          <button disabled={loading || !email} onClick={requestCode}>
            {loading ? "Sending…" : "Send login code"}
          </button>
        </>
      )}

      {step === "code" && (
        <>
          <p>Enter the 6-digit code sent to {email}</p>
          <input
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
          />
          <button disabled={loading || code.length !== 6} onClick={verifyCode}>
            {loading ? "Verifying…" : "Verify & login"}
          </button>
        </>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
