"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const LEVELS = [
  { value: 1, label: "Beginner", emoji: "🟢", desc: "Catching whitewash, first green waves" },
  { value: 2, label: "Intermediate", emoji: "🟡", desc: "Riding green waves, basic turns" },
  { value: 3, label: "Advanced", emoji: "🔴", desc: "Barrel riding, big wave comfortable" },
];
const BOARDS = ["Foam / Softboard", "Longboard (9'+)", "Funboard / Mid-length", "Shortboard", "Fish / Hybrid", "Gun"];
const STANCES = ["Regular", "Goofy", "Not sure"];
const CROWD_PREFS = ["Don't mind crowds", "Less crowded preferred", "Empty lineup or nothing"];
const REEF_COMFORTS = ["Sand only please", "Reef is fine with booties", "Reef no problem"];

interface Profile {
  level: number | null;
  boards: string[];
  stance: string;
  crowdPref: number | null;
  reefComfort: number | null;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10.5, fontWeight: 700, color: "#00d2b4", letterSpacing: "1.8px",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace", marginBottom: 10,
      textTransform: "uppercase" as const,
    }}>{children}</div>
  );
}

function Pill({ selected, children, onClick }: { selected: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: "11px 18px", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 500,
      background: selected ? "rgba(0,210,180,0.14)" : "rgba(255,255,255,0.04)",
      color: selected ? "#00d2b4" : "rgba(180,210,225,0.7)",
      border: selected ? "1px solid rgba(0,210,180,0.35)" : "1px solid rgba(255,255,255,0.07)",
      transition: "all 0.2s", whiteSpace: "nowrap",
    }}>{children}</button>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>({ level: null, boards: [], stance: "", crowdPref: null, reefComfort: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = "/auth"; return; }
      setUser(data.user);
      const { data: p } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
      if (p) {
        setProfile({
          level: p.level,
          boards: p.boards ?? [],
          stance: p.stance,
          crowdPref: p.crowd_pref,
          reefComfort: p.reef_comfort,
        });
      }
      setLoading(false);
    });
  }, []);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").upsert({
      id: user.id,
      level: profile.level,
      boards: profile.boards,
      stance: profile.stance,
      crowd_pref: profile.crowdPref,
      reef_comfort: profile.reefComfort,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const signOut = async () => {
    await createClient().auth.signOut();
    window.location.href = "/";
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#060f1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#00d2b4", fontSize: 14 }}>Loading...</div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(175deg, #060f1a 0%, #081a2a 30%, #0a2438 60%, #0c2e42 100%)",
      color: "#dce8f0",
    }}>
      {/* Header */}
      <header style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, #00d2b4, #00a896)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🌊</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.5px", lineHeight: 1 }}>SWELL-AI</div>
            <div style={{ fontSize: 9.5, color: "#00d2b4", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "2px", marginTop: 1 }}>GLOBAL SURF INTELLIGENCE</div>
          </div>
        </a>
        <button onClick={signOut} style={{ background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)", color: "#ff8a8a", borderRadius: 10, padding: "7px 14px", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>
          Sign out
        </button>
      </header>

      <div style={{ maxWidth: 540, margin: "0 auto", padding: "0 20px 60px" }}>

        {/* Avatar */}
        <div style={{ textAlign: "center", margin: "24px 0 32px" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #00d2b4, #00a896)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, color: "#060f1a", margin: "0 auto 12px" }}>
            {(user?.email ?? "?")[0].toUpperCase()}
          </div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{user?.email}</div>
          <div style={{ fontSize: 11, color: "#4a6a7a", marginTop: 4 }}>Surf profile</div>
        </div>

        {/* Level */}
        <div style={{ marginBottom: 32 }}>
          <Label>LEVEL</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {LEVELS.map(l => (
              <button key={l.value} onClick={() => setProfile(p => ({ ...p, level: l.value }))} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 14, cursor: "pointer", textAlign: "left", background: profile.level === l.value ? "rgba(0,210,180,0.1)" : "rgba(255,255,255,0.025)", border: profile.level === l.value ? "1px solid rgba(0,210,180,0.3)" : "1px solid rgba(255,255,255,0.06)", transition: "all 0.2s" }}>
                <span style={{ fontSize: 24 }}>{l.emoji}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: profile.level === l.value ? "#00d2b4" : "#b4d0e0" }}>{l.label}</div>
                  <div style={{ fontSize: 11, color: "#5a8ca8", marginTop: 2 }}>{l.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quiver */}
        <div style={{ marginBottom: 32 }}>
          <Label>MY QUIVER {profile.boards.length > 0 && <span style={{ color: "#4a6a7a", fontWeight: 400 }}>— {profile.boards.length} board{profile.boards.length > 1 ? "s" : ""}</span>}</Label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {BOARDS.map(b => (
              <Pill key={b} selected={profile.boards.includes(b)} onClick={() => setProfile(p => ({ ...p, boards: p.boards.includes(b) ? p.boards.filter(x => x !== b) : [...p.boards, b] }))}>
                {profile.boards.includes(b) ? "✓ " : ""}{b}
              </Pill>
            ))}
          </div>
        </div>

        {/* Stance */}
        <div style={{ marginBottom: 32 }}>
          <Label>STANCE</Label>
          <div style={{ display: "flex", gap: 8 }}>
            {STANCES.map(s => <Pill key={s} selected={profile.stance === s} onClick={() => setProfile(p => ({ ...p, stance: s }))}>{s}</Pill>)}
          </div>
        </div>

        {/* Crowd */}
        <div style={{ marginBottom: 32 }}>
          <Label>CROWD TOLERANCE</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {CROWD_PREFS.map((c, i) => (
              <Pill key={c} selected={profile.crowdPref === i} onClick={() => setProfile(p => ({ ...p, crowdPref: i }))}>
                {["🎉", "😌", "🏝️"][i]} {c}
              </Pill>
            ))}
          </div>
        </div>

        {/* Reef */}
        <div style={{ marginBottom: 40 }}>
          <Label>REEF COMFORT</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {REEF_COMFORTS.map((r, i) => (
              <Pill key={r} selected={profile.reefComfort === i} onClick={() => setProfile(p => ({ ...p, reefComfort: i }))}>
                {["🏖️", "🥾", "🤙"][i]} {r}
              </Pill>
            ))}
          </div>
        </div>

        {/* Save */}
        <button onClick={save} disabled={saving} style={{ width: "100%", padding: "17px", fontSize: 15, fontWeight: 700, background: saved ? "rgba(0,210,180,0.15)" : "linear-gradient(135deg, #00d2b4, #00a896)", color: saved ? "#00d2b4" : "#060f1a", border: saved ? "1px solid rgba(0,210,180,0.3)" : "none", borderRadius: 14, cursor: "pointer", transition: "all 0.3s", boxShadow: saved ? "none" : "0 8px 36px rgba(0,210,180,0.25)" }}>
          {saved ? "✓ Saved!" : saving ? "Saving..." : "Save changes"}
        </button>

        <a href="/" style={{ display: "block", textAlign: "center", marginTop: 16, fontSize: 13, color: "#5a8ca8", textDecoration: "none" }}>
          ← Back to surf recommendations
        </a>

      </div>
    </div>
  );
}
