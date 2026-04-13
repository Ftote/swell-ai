"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

// ============================================================
// SPOTS + SCORING (shared logic)
// ============================================================
const SPOTS = [
  { id: "uluwatu", name: "Uluwatu", zone: "Bukit", type: "Reef break", direction: "Left", level: 3, maxSwell: 3.5, minSwell: 0.8, idealWind: "SE", idealSwellDir: "S", tideReq: "mid-high", danger: 4, crowd: 5, img: "⚡", desc: "World-class left, long barrels on the reef. Cave entry.", access: "Steep stairs through cave", bottom: "Sharp reef" },
  { id: "padang", name: "Padang Padang", zone: "Bukit", type: "Reef break", direction: "Left", level: 3, maxSwell: 3.0, minSwell: 1.2, idealWind: "SE", idealSwellDir: "SW", tideReq: "mid-low", danger: 5, crowd: 4, img: "💀", desc: "Heavy barrels over shallow reef. Only fires on solid swell.", access: "Rock squeeze entry", bottom: "Very shallow reef" },
  { id: "bingin", name: "Bingin", zone: "Bukit", type: "Reef break", direction: "Left", level: 2, maxSwell: 2.0, minSwell: 0.6, idealWind: "SE", idealSwellDir: "S", tideReq: "mid-high", danger: 3, crowd: 4, img: "✨", desc: "Fun left barrel, shorter ride. Great for improving intermediates.", access: "Long stairs down cliff", bottom: "Reef (boots recommended)" },
  { id: "dreamland", name: "Dreamland", zone: "Bukit", type: "Beach break", direction: "Both", level: 1, maxSwell: 2.0, minSwell: 0.5, idealWind: "SE", idealSwellDir: "SW", tideReq: "all", danger: 2, crowd: 3, img: "🏖️", desc: "Sandy beach break, fun peaks. Tourist-friendly.", access: "Easy beach access", bottom: "Sand" },
  { id: "balangan", name: "Balangan", zone: "Bukit", type: "Reef break", direction: "Left", level: 2, maxSwell: 2.5, minSwell: 0.5, idealWind: "SE", idealSwellDir: "S", tideReq: "mid-high", danger: 3, crowd: 3, img: "🌅", desc: "Beautiful left with barrel sections. Mellow vibe.", access: "Cliff stairs", bottom: "Reef with sand patches" },
  { id: "impossibles", name: "Impossibles", zone: "Bukit", type: "Reef break", direction: "Left", level: 3, maxSwell: 3.0, minSwell: 1.0, idealWind: "SE", idealSwellDir: "S", tideReq: "mid", danger: 4, crowd: 3, img: "🔥", desc: "3 connecting sections, super long rides when it links up.", access: "Cliff descent or paddle from Bingin", bottom: "Sharp reef" },
  { id: "batu-bolong", name: "Batu Bolong", zone: "Canggu", type: "Beach break", direction: "Both", level: 1, maxSwell: 1.8, minSwell: 0.3, idealWind: "SE", idealSwellDir: "SW", tideReq: "mid-high", danger: 1, crowd: 5, img: "🌴", desc: "The social hub. Mellow waves, perfect for longboarding & beginners.", access: "Easy beach", bottom: "Sand with some rocks" },
  { id: "oldmans", name: "Old Man's", zone: "Canggu", type: "Beach break", direction: "Both", level: 1, maxSwell: 1.5, minSwell: 0.3, idealWind: "SE", idealSwellDir: "SW", tideReq: "mid-high", danger: 1, crowd: 5, img: "☀️", desc: "Super mellow, long crumbly waves. Beginner paradise.", access: "Easy beach", bottom: "Sand" },
  { id: "berawa", name: "Berawa", zone: "Canggu", type: "Beach break", direction: "Both", level: 1, maxSwell: 2.0, minSwell: 0.3, idealWind: "SE", idealSwellDir: "SW", tideReq: "all", danger: 1, crowd: 4, img: "🌊", desc: "Consistent beach break, good for all levels. Can get punchy.", access: "Easy beach", bottom: "Sand" },
  { id: "echo-beach", name: "Echo Beach", zone: "Canggu", type: "Reef break", direction: "Left", level: 2, maxSwell: 2.5, minSwell: 0.5, idealWind: "SE", idealSwellDir: "S", tideReq: "mid-high", danger: 3, crowd: 4, img: "💪", desc: "Powerful left on the reef. Step up from Batu Bolong.", access: "Beach with rocky entry", bottom: "Reef" },
  { id: "kuta-beach", name: "Kuta Beach", zone: "Kuta", type: "Beach break", direction: "Both", level: 1, maxSwell: 1.5, minSwell: 0.2, idealWind: "SE", idealSwellDir: "SW", tideReq: "all", danger: 1, crowd: 5, img: "🏄", desc: "Where everyone learns to surf in Bali. Gentle whitewash.", access: "Easy beach", bottom: "Sand" },
  { id: "seminyak", name: "Seminyak Beach", zone: "Seminyak", type: "Beach break", direction: "Both", level: 1, maxSwell: 1.8, minSwell: 0.3, idealWind: "SE", idealSwellDir: "SW", tideReq: "all", danger: 1, crowd: 3, img: "🍹", desc: "Less crowded alternative to Kuta. Decent peaks.", access: "Easy beach", bottom: "Sand" },
  { id: "keramas", name: "Keramas", zone: "East Coast", type: "Reef break", direction: "Right", level: 3, maxSwell: 2.5, minSwell: 0.8, idealWind: "NW", idealSwellDir: "SE", tideReq: "mid-high", danger: 4, crowd: 2, img: "🌙", desc: "World-class right. Amazing for night surfing (lit). Fast & hollow.", access: "Easy beach entry", bottom: "Reef" },
  { id: "sanur", name: "Sanur Reef", zone: "East Coast", type: "Reef break", direction: "Right", level: 2, maxSwell: 2.0, minSwell: 0.5, idealWind: "W", idealSwellDir: "SE", tideReq: "mid-high", danger: 2, crowd: 2, img: "🐢", desc: "Mellow right on the reef. Boat access. Chill crowd.", access: "Boat from beach", bottom: "Reef (mellow)" },
  { id: "ketewel", name: "Ketewel", zone: "East Coast", type: "Beach break", direction: "Both", level: 2, maxSwell: 2.0, minSwell: 0.5, idealWind: "NW", idealSwellDir: "SE", tideReq: "all", danger: 2, crowd: 1, img: "🌿", desc: "Uncrowded black sand beach. Fun peaks when east swell hits.", access: "Easy beach", bottom: "Sand (volcanic)" },
  { id: "shipwrecks", name: "Shipwrecks", zone: "Nusa Lembongan", type: "Reef break", direction: "Right", level: 2, maxSwell: 2.5, minSwell: 0.5, idealWind: "SE", idealSwellDir: "S", tideReq: "mid-high", danger: 3, crowd: 2, img: "🚢", desc: "Long right-hander over reef. Boat or paddle access.", access: "Boat from Lembongan", bottom: "Reef" },
  { id: "playgrounds", name: "Playgrounds", zone: "Nusa Lembongan", type: "Reef break", direction: "Both", level: 2, maxSwell: 2.0, minSwell: 0.5, idealWind: "SE", idealSwellDir: "S", tideReq: "mid-high", danger: 2, crowd: 2, img: "🎪", desc: "Fun left & right options. Mellow reef. Great for intermediates.", access: "Boat or paddle", bottom: "Reef (friendly)" },
  { id: "sri-lanka", name: "Sri Lanka", zone: "Nusa Dua", type: "Reef break", direction: "Left/Right", level: 2, maxSwell: 2.5, minSwell: 0.5, idealWind: "NE", idealSwellDir: "S", tideReq: "mid-high", danger: 3, crowd: 2, img: "🏝️", desc: "Quality reef break in front of resorts. A-frame peaks.", access: "Paddle from beach", bottom: "Reef" },
];

interface Profile { level: number | null; boards: string[]; stance: string; crowdPref: number | null; reefComfort: number | null; username?: string; avatarUrl?: string; }
interface Forecast { swellHeight: number; swellPeriod: number; swellDir: string; wind: string; windSpeed: number; waterTemp: number; tide: { state: string; height: string; nextHigh: string }; }
interface Spot { id: string; name: string; zone: string; type: string; direction: string; level: number; maxSwell: number; minSwell: number; idealWind: string; idealSwellDir: string; tideReq: string; danger: number; crowd: number; img: string; desc: string; access: string; bottom: string; }
interface ScoredSpot extends Spot { score: number; reasons: string[]; warnings: string[]; boardTip: string; }

const FALLBACK_FORECAST: Forecast = { swellHeight: 1.6, swellPeriod: 13, swellDir: "S", wind: "SE", windSpeed: 10, waterTemp: 28, tide: { state: "Rising", height: "mid", nextHigh: "11:30 AM" } };

function scoreSpot(spot: Spot, profile: Profile, forecast: Forecast) {
  let score = 0; const reasons: string[] = []; const warnings: string[] = [];
  const fc = forecast; const tide = forecast.tide; const level = profile.level ?? 1;
  const diff = spot.level - level;
  if (diff === 0) { score += 35; reasons.push("Perfect match for your level"); }
  else if (diff === -1) { score += 25; reasons.push("Easy session — great for building confidence"); }
  else if (diff === 1 && level >= 2) { score += 12; reasons.push("A challenge — step-up spot"); warnings.push("Above your usual level"); }
  else if (diff >= 2) { score -= 30; warnings.push("Way above your level"); }
  else { score += 20; }
  if (fc.swellHeight >= spot.minSwell && fc.swellHeight <= spot.maxSwell) { score += 20; reasons.push(`${fc.swellHeight}m swell in sweet range`); }
  else if (fc.swellHeight < spot.minSwell) { score += 5; reasons.push("Swell a bit small"); }
  else { score += 2; warnings.push("Swell bigger than ideal"); }
  if (fc.swellDir === spot.idealSwellDir || (fc.swellDir === "S" && ["S","SW"].includes(spot.idealSwellDir))) { score += 10; reasons.push("Swell direction perfect"); } else { score += 3; }
  if (fc.wind === spot.idealWind) { score += 15; reasons.push(`${fc.wind} wind = offshore`); }
  else if (fc.windSpeed < 8) { score += 10; reasons.push("Light wind, glassy"); }
  else { score += 3; }
  const tideOk = spot.tideReq === "all" || spot.tideReq.includes(tide.height);
  if (tideOk) { score += 10; reasons.push(`${tide.height} tide works well`); } else { score -= 5; warnings.push(`Best at ${spot.tideReq} tide`); }
  const crowdPref = profile.crowdPref ?? 0;
  if (crowdPref === 2 && spot.crowd <= 2) { score += 10; reasons.push("Uncrowded lineup"); }
  else if (crowdPref === 1 && spot.crowd <= 3) { score += 7; }
  else if (crowdPref === 2 && spot.crowd >= 4) { score -= 8; warnings.push("Gets packed here"); }
  else { score += 4; }
  const reefComfort = profile.reefComfort ?? 0;
  if (reefComfort === 0 && spot.bottom.toLowerCase().includes("reef")) { score -= 15; warnings.push("Reef bottom — you prefer sand"); }
  else if (spot.bottom.toLowerCase().includes("sand") && reefComfort === 0) { score += 5; reasons.push("Sandy bottom"); }
  if (profile.stance === "Regular" && spot.direction === "Right") score += 3;
  else if (profile.stance === "Goofy" && spot.direction === "Left") score += 3;
  if (spot.danger >= 4 && level <= 1) { score -= 25; warnings.push("Dangerous for beginners"); }
  const pct = Math.max(0, Math.min(100, Math.round(score * 100 / 105)));

  const boards = profile.boards ?? [];
  const hasLong = boards.some(b => b.includes("Longboard") || b.includes("Foam") || b.includes("Funboard"));
  const hasShort = boards.some(b => b.includes("Shortboard") || b.includes("Fish") || b.includes("Gun"));
  let boardTip = "";
  if (level === 1) boardTip = "Biggest board in your quiver.";
  else if (fc.swellHeight > 1.5 && spot.type === "Reef break") boardTip = hasShort ? "Shortboard or fish today." : "Your mid-length will work great.";
  else if (fc.swellHeight <= 1.0) boardTip = hasLong ? "Longboard or funboard — max fun." : "Fish or mid-length for small waves.";
  else boardTip = boards.length > 1 ? (fc.swellHeight > 1.2 ? (hasShort ? "Shortboard or fish." : "Mid-length.") : (hasLong ? "Longboard or funboard." : "Fish.")) : "Your go-to board.";

  return { score: pct, reasons: reasons.slice(0, 4), warnings, boardTip };
}

function getBoardRecommendation(profile: Profile, forecast: Forecast): string {
  const boards = profile.boards ?? [];
  if (boards.length === 0) return "";
  const hasLong = boards.some(b => b.includes("Longboard") || b.includes("Foam") || b.includes("Funboard"));
  const hasShort = boards.some(b => b.includes("Shortboard") || b.includes("Fish") || b.includes("Gun"));
  const hasMid = boards.some(b => b.includes("Funboard") || b.includes("Mid-length"));
  if (profile.level === 1) return boards.find(b => b.includes("Foam") || b.includes("Longboard")) ?? boards[0];
  if (forecast.swellHeight > 1.8) return boards.find(b => b.includes("Gun") || b.includes("Shortboard")) ?? (hasShort ? boards.find(b => b.includes("Fish")) ?? boards[0] : boards[0]);
  if (forecast.swellHeight > 1.2) return boards.find(b => b.includes("Shortboard") || b.includes("Fish")) ?? boards[0];
  if (forecast.swellHeight <= 1.0) return boards.find(b => b.includes("Longboard") || b.includes("Funboard") || b.includes("Foam")) ?? boards[0];
  return hasMid ? (boards.find(b => b.includes("Mid") || b.includes("Funboard")) ?? boards[0]) : boards[0];
}

const dangerColors: Record<number, string> = { 1: "#00d2b4", 2: "#00d2b4", 3: "#f5a623", 4: "#ff6b6b", 5: "#ff3b3b" };
const dangerLabels: Record<number, string> = { 1: "Safe", 2: "Easy", 3: "Caution", 4: "Serious", 5: "Expert only" };

export default function DailyBrief() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [forecast, setForecast] = useState<Forecast>(FALLBACK_FORECAST);
  const [spots, setSpots] = useState<ScoredSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [boardPulse, setBoardPulse] = useState(false);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const supabase = createClient();

    const init = async () => {
      // Load forecast
      let fc = FALLBACK_FORECAST;
      try {
        const r = await fetch("/api/forecast");
        const d = await r.json();
        if (!d.error) fc = d;
      } catch {}
      setForecast(fc);

      // Load profile from Supabase or localStorage
      let prof: Profile | null = null;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (p?.level) {
          prof = { level: p.level, boards: p.boards ?? [], stance: p.stance, crowdPref: p.crowd_pref, reefComfort: p.reef_comfort };
          setUsername(p.username ?? "");
          setAvatarUrl(p.avatar_url ?? "");
        }
      }
      if (!prof) {
        const local = localStorage.getItem("swellai_profile");
        if (local) { try { prof = JSON.parse(local); } catch {} }
      }
      if (!prof) { window.location.href = "/"; return; }

      setProfile(prof);
      const scored = SPOTS.map(s => ({ ...s, ...scoreSpot(s, prof!, fc) })).sort((a, b) => b.score - a.score);
      setSpots(scored);
      setLoading(false);

      // Animate board recommendation
      setTimeout(() => setBoardPulse(true), 800);
    };

    init();
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#060f1a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <div style={{ fontSize: 40, animation: "pulse 1.5s ease infinite" }}>🌊</div>
      <div style={{ color: "#00d2b4", fontSize: 13, fontWeight: 500, fontFamily: "monospace", letterSpacing: "2px" }}>LOADING YOUR BRIEF...</div>
      <style>{`@keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:0.7} }`}</style>
    </div>
  );

  const top = spots[0];
  const boardRec = profile ? getBoardRecommendation(profile, forecast) : "";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(175deg, #060f1a 0%, #081a2a 40%, #0a2438 100%)", color: "#dce8f0" }}>
      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.08);} }
        @keyframes boardGlow { 0%,100%{box-shadow:0 0 20px rgba(0,210,180,0.2);} 50%{box-shadow:0 0 40px rgba(0,210,180,0.5), 0 0 80px rgba(0,210,180,0.2);} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
      `}</style>

      {/* Header */}
      <header style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, background: "rgba(6,15,26,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, #00d2b4, #00a896)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🌊</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: "-0.5px", lineHeight: 1 }}>SWELL-AI</div>
            <div style={{ fontSize: 8, color: "#00d2b4", fontFamily: "monospace", letterSpacing: "2px" }}>DAILY BRIEF</div>
          </div>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: "#4a6a7a" }}>{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
          <a href="/profile" style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "6px 12px", textDecoration: "none", color: "#6a9ab8", fontSize: 12 }}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="avatar" style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg, #00d2b4, #00a896)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#060f1a", fontWeight: 700 }}>
                {username ? username[0].toUpperCase() : "?"}
              </div>
            )}
            {username || "Profile"}
          </a>
        </div>
      </header>

      <div style={{ maxWidth: 580, margin: "0 auto", padding: "24px 20px 60px" }}>

        {/* Conditions bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6, marginBottom: 28, animation: "fadeUp 0.5s ease" }}>
          {[
            { l: "SWELL", v: `${forecast.swellHeight}m`, s: `${forecast.swellPeriod}s ${forecast.swellDir}` },
            { l: "WIND", v: forecast.wind, s: `${forecast.windSpeed}km/h` },
            { l: "TIDE", v: forecast.tide.state === "Rising" ? "↗" : "↘", s: forecast.tide.state },
            { l: "HIGH", v: forecast.tide.nextHigh, s: "" },
            { l: "WATER", v: `${forecast.waterTemp}°`, s: "Warm" },
          ].map((m, i) => (
            <div key={i} style={{ textAlign: "center", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "10px 4px" }}>
              <div style={{ fontSize: 8, color: "#4a6a7a", fontWeight: 700, letterSpacing: "1px", marginBottom: 4 }}>{m.l}</div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{m.v}</div>
              <div style={{ fontSize: 9, color: "#5a8ca8", marginTop: 2 }}>{m.s}</div>
            </div>
          ))}
        </div>

        {/* Hero — Top spot */}
        {top && (
          <div style={{ marginBottom: 24, animation: "fadeUp 0.6s ease 0.1s both" }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: "#00d2b4", letterSpacing: "2px", fontFamily: "monospace", marginBottom: 10 }}>
              ★ TODAY&apos;S CALL
            </div>
            <div style={{
              background: "linear-gradient(135deg, rgba(0,210,180,0.1), rgba(0,180,160,0.03))",
              border: "1px solid rgba(0,210,180,0.25)", borderRadius: 22, padding: 24,
              position: "relative", overflow: "hidden",
            }}>
              {/* BG wave animation */}
              <svg style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "60%", opacity: 0.06, pointerEvents: "none" }} viewBox="0 0 400 120" preserveAspectRatio="none">
                <path fill="#00d2b4">
                  <animate attributeName="d" dur="8s" repeatCount="indefinite" values="M0 60C100 30 200 90 400 60V120H0Z;M0 70C120 40 280 80 400 50V120H0Z;M0 60C100 30 200 90 400 60V120H0Z" />
                </path>
              </svg>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>{top.img}</div>
                  <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 4px" }}>{top.name}</h2>
                  <div style={{ fontSize: 12, color: "#5a8ca8", marginBottom: 12 }}>{top.zone} · {top.type} · {top.direction}</div>
                  <div style={{ fontSize: 13, color: "#8ab4cc", lineHeight: 1.5, marginBottom: 16 }}>{top.desc}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {top.reasons.map((r, i) => (
                      <span key={i} style={{ fontSize: 11, background: "rgba(0,210,180,0.08)", border: "1px solid rgba(0,210,180,0.15)", borderRadius: 8, padding: "4px 10px", color: "#00d2b4" }}>✓ {r}</span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: "center", marginLeft: 20, flexShrink: 0 }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: "50%",
                    background: "rgba(0,210,180,0.12)", border: "3px solid rgba(0,210,180,0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, fontWeight: 900, color: "#00d2b4",
                    animation: "pulse 2s ease infinite",
                  }}>{top.score}</div>
                  <div style={{ fontSize: 8, color: "#4a6a7a", marginTop: 4, fontWeight: 700, letterSpacing: "1px" }}>MATCH</div>
                </div>
              </div>

              {top.warnings.length > 0 && (
                <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                  {top.warnings.map((w, i) => (
                    <div key={i} style={{ background: "rgba(255,107,107,0.06)", border: "1px solid rgba(255,107,107,0.12)", borderRadius: 10, padding: "8px 12px", fontSize: 12, color: "#ff8a8a" }}>⚠️ {w}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Board recommendation */}
        {boardRec && (
          <div style={{ marginBottom: 28, animation: "fadeUp 0.6s ease 0.2s both" }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: "#f5a623", letterSpacing: "2px", fontFamily: "monospace", marginBottom: 10 }}>
              🏄 GRAB THIS BOARD
            </div>
            <div style={{
              background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.2)",
              borderRadius: 18, padding: "20px 24px",
              display: "flex", alignItems: "center", gap: 20,
              animation: boardPulse ? "boardGlow 2s ease infinite" : "none",
            }}>
              <div style={{ fontSize: 48 }}>🏄‍♂️</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 20, color: "#f5a623", marginBottom: 4 }}>{boardRec}</div>
                <div style={{ fontSize: 13, color: "#c4a864", lineHeight: 1.5 }}>{top?.boardTip}</div>
              </div>
            </div>
          </div>
        )}

        {/* All spots */}
        <div style={{ animation: "fadeUp 0.6s ease 0.3s both" }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: "#4a6a7a", letterSpacing: "2px", fontFamily: "monospace", marginBottom: 12 }}>
            ALL SPOTS — RANKED FOR YOU
          </div>
          {spots.map((spot, i) => {
            const isOpen = expanded === spot.id;
            return (
              <div key={spot.id} onClick={() => setExpanded(isOpen ? null : spot.id)} style={{
                background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 16, padding: 14, marginBottom: 8, cursor: "pointer",
                transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#2a4a5a", width: 20, textAlign: "center" }}>#{i + 1}</div>
                  <span style={{ fontSize: 20 }}>{spot.img}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{spot.name}</div>
                    <div style={{ fontSize: 11, color: "#4a6a7a", display: "flex", gap: 6, alignItems: "center", marginTop: 2 }}>
                      <span>{spot.zone}</span><span>·</span><span>{spot.type}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: dangerColors[spot.danger], background: `${dangerColors[spot.danger]}15`, border: `1px solid ${dangerColors[spot.danger]}30`, padding: "2px 6px", borderRadius: 5 }}>{dangerLabels[spot.danger]}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: spot.score >= 65 ? "rgba(0,210,180,0.1)" : spot.score >= 40 ? "rgba(245,166,35,0.08)" : "rgba(255,107,107,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: spot.score >= 65 ? "#00d2b4" : spot.score >= 40 ? "#f5a623" : "#ff6b6b", border: `2px solid ${spot.score >= 65 ? "rgba(0,210,180,0.2)" : spot.score >= 40 ? "rgba(245,166,35,0.15)" : "rgba(255,107,107,0.15)"}` }}>{spot.score}</div>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ fontSize: 12, color: "#6a9ab8", marginBottom: 10, lineHeight: 1.5 }}>{spot.desc}</div>
                    {spot.reasons.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                        {spot.reasons.map((r, j) => <span key={j} style={{ fontSize: 11, background: "rgba(0,210,180,0.06)", border: "1px solid rgba(0,210,180,0.12)", borderRadius: 8, padding: "4px 10px", color: "#00d2b4" }}>✓ {r}</span>)}
                      </div>
                    )}
                    {spot.warnings.map((w, j) => <div key={j} style={{ background: "rgba(255,107,107,0.06)", border: "1px solid rgba(255,107,107,0.1)", borderRadius: 8, padding: "7px 12px", fontSize: 12, color: "#ff8a8a", marginBottom: 6 }}>⚠️ {w}</div>)}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                      <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "8px 12px" }}>
                        <div style={{ fontSize: 9, color: "#4a6a7a", fontWeight: 600 }}>ACCESS</div>
                        <div style={{ fontSize: 12, color: "#8ab4cc", marginTop: 2 }}>{spot.access}</div>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "8px 12px" }}>
                        <div style={{ fontSize: 9, color: "#4a6a7a", fontWeight: 600 }}>BOTTOM</div>
                        <div style={{ fontSize: 12, color: "#8ab4cc", marginTop: 2 }}>{spot.bottom}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <a href="/" style={{ display: "block", textAlign: "center", marginTop: 20, fontSize: 13, color: "#4a6a7a", textDecoration: "none" }}>
          ← Edit my profile
        </a>
      </div>
    </div>
  );
}
