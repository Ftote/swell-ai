"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const supabase = createClient();

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/` } });

    if (error) {
      setMessage({ text: error.message, error: true });
    } else if (mode === "signup") {
      setMessage({ text: "Check your email to confirm your account!", error: false });
    } else {
      window.location.href = "/";
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) setMessage({ text: error.message, error: true });
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(175deg, #060f1a 0%, #081a2a 30%, #0a2438 60%, #0c2e42 100%)",
      color: "#dce8f0", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, #00d2b4, #00a896)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🌊</div>
            <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.5px" }}>SWELL-AI</div>
          </div>
          <div style={{ fontSize: 14, color: "#5a8ca8" }}>
            {mode === "login" ? "Welcome back 🤙" : "Join the crew 🏄‍♂️"}
          </div>
        </div>

        {/* Card */}
        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 28 }}>

          {/* Google button */}
          <button onClick={handleGoogle} disabled={loading} style={{
            width: "100%", padding: "14px", borderRadius: 12, cursor: "pointer",
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#dce8f0", fontSize: 14, fontWeight: 600, display: "flex",
            alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20,
            transition: "all 0.2s",
          }}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.2 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.6-8 19.6-20 0-1.3-.1-2.7-.4-4z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.6-2.8-11.3-7L6 33.8C9.4 39.6 16.2 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.8l6.2 5.2C40.9 35.8 44 30.3 44 24c0-1.3-.1-2.7-.4-4z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            <span style={{ fontSize: 11, color: "#4a6a7a" }}>or with email</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmail}>
            <div style={{ marginBottom: 12 }}>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" required
                style={{
                  width: "100%", padding: "13px 16px", borderRadius: 12, fontSize: 14,
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  color: "#dce8f0", outline: "none",
                }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Password" required minLength={6}
                style={{
                  width: "100%", padding: "13px 16px", borderRadius: 12, fontSize: 14,
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  color: "#dce8f0", outline: "none",
                }}
              />
            </div>

            {message && (
              <div style={{
                padding: "10px 14px", borderRadius: 10, marginBottom: 16, fontSize: 13,
                background: message.error ? "rgba(255,107,107,0.08)" : "rgba(0,210,180,0.08)",
                border: `1px solid ${message.error ? "rgba(255,107,107,0.2)" : "rgba(0,210,180,0.2)"}`,
                color: message.error ? "#ff8a8a" : "#00d2b4",
              }}>{message.text}</div>
            )}

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "14px", borderRadius: 12, cursor: "pointer",
              background: "linear-gradient(135deg, #00d2b4, #00a896)",
              color: "#060f1a", fontSize: 15, fontWeight: 700, border: "none",
              boxShadow: "0 8px 36px rgba(0,210,180,0.25)", transition: "all 0.2s",
            }}>
              {loading ? "..." : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          {/* Toggle */}
          <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#5a8ca8" }}>
            {mode === "login" ? "No account? " : "Already have one? "}
            <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(null); }}
              style={{ background: "none", border: "none", color: "#00d2b4", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
