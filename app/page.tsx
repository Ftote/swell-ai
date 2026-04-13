"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

// ============================================================
// BALI SPOTS DATABASE
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

const ZONES = ["All Bali", "Bukit", "Canggu", "Kuta", "Seminyak", "East Coast", "Nusa Lembongan", "Nusa Dua"];
const LEVELS = [
  { value: 1, label: "Beginner", emoji: "🟢", desc: "Catching whitewash, first green waves" },
  { value: 2, label: "Intermediate", emoji: "🟡", desc: "Riding green waves, basic turns" },
  { value: 3, label: "Advanced", emoji: "🔴", desc: "Barrel riding, big wave comfortable" },
];
const BOARDS = ["Foam / Softboard", "Longboard (9'+)", "Funboard / Mid-length", "Shortboard", "Fish / Hybrid", "Gun"];
const STANCES = ["Regular", "Goofy", "Not sure"];
const CROWD_PREFS = ["Don't mind crowds", "Less crowded preferred", "Empty lineup or nothing"];
const REEF_COMFORTS = ["Sand only please", "Reef is fine with booties", "Reef no problem"];

interface ForecastData {
  swellHeight: number;
  swellPeriod: number;
  swellDir: string;
  wind: string;
  windSpeed: number;
  waterTemp: number;
  tide: { state: string; height: string; nextHigh: string };
  fetchedAt?: string;
}

const FORECAST_FALLBACK: ForecastData = {
  swellHeight: 1.6, swellPeriod: 13, swellDir: "S", wind: "SE", windSpeed: 10,
  waterTemp: 28, tide: { state: "Rising", height: "mid", nextHigh: "11:30 AM" },
};

// ============================================================
// TYPES
// ============================================================
interface Spot {
  id: string; name: string; zone: string; type: string; direction: string;
  level: number; maxSwell: number; minSwell: number; idealWind: string;
  idealSwellDir: string; tideReq: string; danger: number; crowd: number;
  img: string; desc: string; access: string; bottom: string;
}
interface Profile {
  level: number | null; boards: string[]; stance: string;
  crowdPref: number | null; reefComfort: number | null;
}
interface ScoreResult { score: number; reasons: string[]; warnings: string[]; boardTip: string; }
type ScoredSpot = Spot & ScoreResult;

// ============================================================
// SCORING ENGINE
// ============================================================
function scoreSpot(spot: Spot, profile: Profile, forecast: ForecastData): ScoreResult {
  let score = 0;
  const reasons: string[] = [];
  const warnings: string[] = [];
  const fc = forecast;
  const tide = forecast.tide;
  const level = profile.level ?? 1;

  const diff = spot.level - level;
  if (diff === 0) { score += 35; reasons.push("Perfect match for your level"); }
  else if (diff === -1) { score += 25; reasons.push("Easy session — great for building confidence"); }
  else if (diff === 1 && level >= 2) { score += 12; reasons.push("A challenge — step-up spot"); warnings.push("Above your usual level, paddle out with caution"); }
  else if (diff >= 2) { score -= 30; warnings.push("This spot is way above your level — not recommended"); }
  else { score += 20; }

  if (fc.swellHeight >= spot.minSwell && fc.swellHeight <= spot.maxSwell) {
    score += 20; reasons.push(`${fc.swellHeight}m swell sits in this spot's sweet range`);
  } else if (fc.swellHeight < spot.minSwell) {
    score += 5; reasons.push("Swell might be a bit small for this spot");
  } else {
    score += 2; warnings.push("Swell is bigger than ideal here — expect power");
  }

  if (fc.swellDir === spot.idealSwellDir || (fc.swellDir === "S" && ["S", "SW"].includes(spot.idealSwellDir))) {
    score += 10; reasons.push("Swell direction lines up perfectly");
  } else { score += 3; }

  if (fc.wind === spot.idealWind) { score += 15; reasons.push(`${fc.wind} wind = offshore here, clean conditions`); }
  else if (fc.windSpeed < 8) { score += 10; reasons.push("Light wind, glassy conditions expected"); }
  else { score += 3; }

  const tideOk = spot.tideReq === "all" || spot.tideReq.includes(tide.height);
  if (tideOk) { score += 10; reasons.push(`Current ${tide.height} tide works well here`); }
  else { score -= 5; warnings.push(`Best at ${spot.tideReq} tide — check timing`); }

  const crowdPref = profile.crowdPref ?? 0;
  if (crowdPref === 2 && spot.crowd <= 2) { score += 10; reasons.push("Uncrowded lineup — just how you like it"); }
  else if (crowdPref === 1 && spot.crowd <= 3) { score += 7; }
  else if (crowdPref === 2 && spot.crowd >= 4) { score -= 8; warnings.push("This spot gets packed — heads up"); }
  else { score += 4; }

  const reefComfort = profile.reefComfort ?? 0;
  if (reefComfort === 0 && spot.bottom.toLowerCase().includes("reef")) {
    score -= 15; warnings.push("Reef bottom — you said you prefer sand");
  } else if (spot.bottom.toLowerCase().includes("sand") && reefComfort === 0) {
    score += 5; reasons.push("Sandy bottom — safe and forgiving");
  }

  if (profile.stance === "Regular" && spot.direction === "Right") score += 3;
  else if (profile.stance === "Regular" && spot.direction === "Left") score += 1;
  else if (profile.stance === "Goofy" && spot.direction === "Left") score += 3;
  else if (profile.stance === "Goofy" && spot.direction === "Right") score += 1;

  if (spot.danger >= 4 && level <= 1) {
    score -= 25;
    warnings.push("Dangerous for beginners — strong currents, sharp reef");
  }

  const pct = Math.max(0, Math.min(100, Math.round(score * 100 / 105)));

  let boardTip = "";
  const boards = profile.boards ?? [];
  const hasLong = boards.some(b => b.includes("Longboard") || b.includes("Foam") || b.includes("Funboard"));
  const hasShort = boards.some(b => b.includes("Shortboard") || b.includes("Fish") || b.includes("Gun"));

  if (level === 1) boardTip = "Stick to your biggest, most buoyant board for maximum wave count.";
  else if (forecast.swellHeight > 1.5 && spot.type === "Reef break") {
    boardTip = hasShort
      ? "Solid conditions — grab your shortboard or fish. Consider reef booties."
      : "Solid conditions — your mid-length will work great here.";
  } else if (forecast.swellHeight <= 1.0) {
    boardTip = hasLong
      ? "Small day — perfect for your longboard or funboard to maximize fun."
      : "Small day vibes — a fish or mid-length will help you catch more waves.";
  } else {
    boardTip = boards.length > 1
      ? `From your quiver, ${forecast.swellHeight > 1.2 ? (hasShort ? "your shortboard or fish" : "your mid-length") : (hasLong ? "your longboard or funboard" : "your fish")} is the call today.`
      : "Your go-to board should work great here today.";
  }

  return { score: pct, reasons: reasons.slice(0, 4), warnings, boardTip };
}

// ============================================================
// UI COMPONENTS
// ============================================================
function Card({ children, glow, style, onClick }: { children: React.ReactNode; glow?: boolean; style?: React.CSSProperties; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{
      background: glow ? "linear-gradient(135deg, rgba(0,210,180,0.08), rgba(0,180,160,0.02))" : "rgba(255,255,255,0.025)",
      border: glow ? "1px solid rgba(0,210,180,0.2)" : "1px solid rgba(255,255,255,0.06)",
      borderRadius: 18, padding: 20, transition: "all 0.25s ease",
      cursor: onClick ? "pointer" : "default", ...style,
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

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10.5, fontWeight: 700, color: "#00d2b4", letterSpacing: "1.8px",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace", marginBottom: 10, textTransform: "uppercase" as const,
    }}>{children}</div>
  );
}

function DangerBadge({ level }: { level: number }) {
  const colors: Record<number, string> = { 1: "#00d2b4", 2: "#00d2b4", 3: "#f5a623", 4: "#ff6b6b", 5: "#ff3b3b" };
  const labels: Record<number, string> = { 1: "Safe", 2: "Easy", 3: "Caution", 4: "Serious", 5: "Expert only" };
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, color: colors[level],
      background: `${colors[level]}15`, border: `1px solid ${colors[level]}30`,
      padding: "3px 8px", borderRadius: 6,
    }}>{labels[level]}</span>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function SwellAI() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Profile>({ level: null, boards: [], stance: "", crowdPref: null, reefComfort: null });
  const [results, setResults] = useState<ScoredSpot[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [zoneFilter, setZoneFilter] = useState("All Bali");
  const [anim, setAnim] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [forecast, setForecast] = useState<ForecastData>(FORECAST_FALLBACK);
  const [forecastLoading, setForecastLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [scrollDepth, setScrollDepth] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const pct = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;
      setScrollDepth(pct);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/forecast")
      .then(r => r.json())
      .then(data => { if (!data.error) setForecast(data); })
      .catch(() => {})
      .finally(() => setForecastLoading(false));

    const supabase = createClient();

    const loadProfile = async (userId: string): Promise<boolean> => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (data && data.level) {
        window.location.replace("/daily-brief");
        return true;
      }
      return false;
    };

    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        const redirected = await loadProfile(data.user.id);
        if (redirected) return; // stay on loading screen during navigation
      }
      setAuthChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const go = (s: number) => {
    setAnim(false);
    setTimeout(() => { setStep(s); setAnim(true); }, 250);
  };

  const analyze = async () => {
    setIsLoading(true);
    setLoadingProgress(0);
    go(3);

    // Always save to localStorage
    localStorage.setItem("swellai_profile", JSON.stringify(profile));

    // Also save to Supabase if logged in
    if (user) {
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
    }

    let i = 0;
    const iv = setInterval(() => {
      i++;
      setLoadingProgress(i * 25);
      if (i >= 4) {
        clearInterval(iv);
        setTimeout(() => {
          setIsLoading(false);
        }, 400);
      }
    }, 500);
  };

  const filteredResults = results?.filter(r => zoneFilter === "All Bali" || r.zone === zoneFilter);

  if (authChecking) return (
    <div style={{ minHeight: "100vh", background: "#060f1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>🌊</div>
        <div style={{ color: "#00d2b4", fontSize: 13, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "2px" }}>LOADING...</div>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(175deg,
        hsl(210, 70%, ${12 - scrollDepth * 8}%) 0%,
        hsl(210, 65%, ${10 - scrollDepth * 7}%) 30%,
        hsl(210, 60%, ${8 - scrollDepth * 6}%) 60%,
        hsl(210, 55%, ${6 - scrollDepth * 5}%) 100%)`,
      color: "#dce8f0", position: "relative",
      transition: "background 0.1s ease",
    }}>
      {/* Grain overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100, opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      {/* Animated wave bg */}
      <svg style={{ position: "fixed", bottom: 0, left: 0, width: "100%", height: "40%", opacity: 0.05, zIndex: 0 }} viewBox="0 0 1440 400" preserveAspectRatio="none">
        <path fill="#00d2b4">
          <animate attributeName="d" dur="12s" repeatCount="indefinite" values="M0 200C360 120 480 300 720 200S1200 280 1440 180V400H0Z;M0 220C300 160 520 260 720 220S1180 300 1440 200V400H0Z;M0 200C360 120 480 300 720 200S1200 280 1440 180V400H0Z" />
        </path>
      </svg>

      {/* HEADER */}
      <header style={{ padding: "20px 24px", position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, #00d2b4, #00a896)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 4px 24px rgba(0,210,180,0.25)" }}>🌊</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.5px", lineHeight: 1 }}>SWELL-AI</div>
            <div style={{ fontSize: 9.5, color: "#00d2b4", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "2px", marginTop: 1 }}>GLOBAL SURF INTELLIGENCE</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {step > 0 && step < 3 && (
            <button onClick={() => go(step - 1)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#6a9ab8", borderRadius: 10, padding: "7px 14px", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>← Back</button>
          )}
          {user ? (
            <a href="/profile" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#6a9ab8", borderRadius: 10, padding: "7px 14px", cursor: "pointer", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg, #00d2b4, #00a896)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#060f1a", fontWeight: 700 }}>
                {(user.email ?? "?")[0].toUpperCase()}
              </span>
              Profile
            </a>
          ) : (
            <a href="/auth" style={{ background: "linear-gradient(135deg, #00d2b4, #00a896)", color: "#060f1a", borderRadius: 10, padding: "7px 14px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
              Sign in
            </a>
          )}
        </div>
      </header>

      {/* CONTENT */}
      <div style={{
        maxWidth: 540, margin: "0 auto", padding: "0 20px 50px",
        position: "relative", zIndex: 10,
        opacity: anim ? 1 : 0, transform: anim ? "translateY(0)" : "translateY(16px)",
        transition: "all 0.25s ease",
      }}>

        {/* ===== STEP 0: WELCOME ===== */}
        {step === 0 && (
          <div>
            <div style={{ textAlign: "center", marginTop: 32, marginBottom: 40 }}>
              <div style={{ fontSize: 56, marginBottom: 20, filter: "drop-shadow(0 4px 20px rgba(0,210,180,0.3))" }}>🏄‍♂️</div>
              <h1 style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-1px", lineHeight: 1.15 }}>
                Stop guessing.<br />Start surfing.
              </h1>
              <p style={{ color: "#5a8ca8", fontSize: 15, marginTop: 14, lineHeight: 1.6 }}>
                Tell us your level. We tell you<br />
                <span style={{ color: "#00d2b4", fontWeight: 600 }}>exactly where to paddle out today</span>.
              </p>
            </div>

            <Card style={{ marginBottom: 20, padding: 24 }}>
              <div style={{ textAlign: "center", marginBottom: 18, fontSize: 13, color: "#5a8ca8", fontWeight: 500 }}>The old way</div>
              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                {[{ n: "1", t: "Read forecast", s: "Swell, wind, tides..." }, { n: "2", t: "Interpret", s: "Which spot works?" }, { n: "3", t: "Guess", s: "Hope for the best" }].map((x, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center", padding: 10, borderRadius: 10, background: "rgba(255,100,100,0.04)", border: "1px solid rgba(255,100,100,0.08)" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#ff6b6b", opacity: 0.5 }}>{x.n}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#ff6b6b", textDecoration: "line-through", opacity: 0.6 }}>{x.t}</div>
                    <div style={{ fontSize: 9.5, color: "#4a6a7a", marginTop: 3 }}>{x.s}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "linear-gradient(135deg, rgba(0,210,180,0.1), rgba(0,210,180,0.03))", border: "1px solid rgba(0,210,180,0.18)", borderRadius: 14, padding: 18, textAlign: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#00d2b4", letterSpacing: "0.5px" }}>THE SWELL-AI WAY</div>
                <div style={{ fontSize: 15, marginTop: 6, lineHeight: 1.5 }}>Your profile → AI picks the spot → You surf 🤙</div>
              </div>
            </Card>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 24 }}>
              {[{ v: "20+", l: "Bali spots" }, { v: forecastLoading ? "..." : "Live", l: "Forecast data" }, { v: "AI", l: "Personalized" }].map((s, i) => (
                <div key={i} style={{ textAlign: "center", padding: "14px 8px", borderRadius: 12, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#00d2b4" }}>{s.v}</div>
                  <div style={{ fontSize: 10, color: "#5a8ca8", marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>

            <button onClick={() => go(1)} style={{ width: "100%", padding: "17px 24px", fontSize: 16, fontWeight: 700, background: "linear-gradient(135deg, #00d2b4, #00a896)", color: "#060f1a", border: "none", borderRadius: 14, cursor: "pointer", boxShadow: "0 8px 36px rgba(0,210,180,0.28)" }}>
              Create my surf profile →
            </button>
          </div>
        )}

        {/* ===== STEP 1: LEVEL + BOARD + STANCE ===== */}
        {step === 1 && (
          <div>
            <div style={{ marginTop: 12, marginBottom: 6 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                {[1, 2].map(s => <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= 1 ? "#00d2b4" : "rgba(255,255,255,0.08)" }} />)}
              </div>
              <h2 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-0.5px" }}>Your surf level</h2>
              <p style={{ color: "#5a8ca8", fontSize: 13, margin: "6px 0 28px" }}>This is the most important part — be honest!</p>
            </div>

            <Label>LEVEL</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
              {LEVELS.map(l => (
                <button key={l.value} onClick={() => setProfile(p => ({ ...p, level: l.value }))} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 14, cursor: "pointer", textAlign: "left", background: profile.level === l.value ? "rgba(0,210,180,0.1)" : "rgba(255,255,255,0.025)", border: profile.level === l.value ? "1px solid rgba(0,210,180,0.3)" : "1px solid rgba(255,255,255,0.06)", transition: "all 0.2s" }}>
                  <span style={{ fontSize: 28 }}>{l.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: profile.level === l.value ? "#00d2b4" : "#b4d0e0" }}>{l.label}</div>
                    <div style={{ fontSize: 12, color: "#5a8ca8", marginTop: 2 }}>{l.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            <Label>YOUR QUIVER <span style={{ color: "#4a6a7a", fontWeight: 400 }}>(select all you have)</span></Label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 32 }}>
              {BOARDS.map(b => (
                <Pill key={b}
                  selected={profile.boards.includes(b)}
                  onClick={() => setProfile(p => ({
                    ...p,
                    boards: p.boards.includes(b)
                      ? p.boards.filter(x => x !== b)
                      : [...p.boards, b]
                  }))}>
                  {profile.boards.includes(b) ? "✓ " : ""}{b}
                </Pill>
              ))}
            </div>
            {profile.boards.length > 0 && (
              <div style={{ fontSize: 11, color: "#00d2b4", marginBottom: 16, marginTop: -20 }}>
                {profile.boards.length} board{profile.boards.length > 1 ? "s" : ""} selected
              </div>
            )}

            <Label>STANCE</Label>
            <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
              {STANCES.map(s => <Pill key={s} selected={profile.stance === s} onClick={() => setProfile(p => ({ ...p, stance: s }))}>{s}</Pill>)}
            </div>

            <button onClick={() => go(2)} disabled={!profile.level || profile.boards.length === 0 || !profile.stance} style={{ width: "100%", padding: "17px 24px", fontSize: 16, fontWeight: 700, background: (profile.level && profile.boards.length > 0 && profile.stance) ? "linear-gradient(135deg, #00d2b4, #00a896)" : "rgba(255,255,255,0.06)", color: (profile.level && profile.boards.length > 0 && profile.stance) ? "#060f1a" : "#3a5a6a", border: "none", borderRadius: 14, cursor: (profile.level && profile.boards.length > 0 && profile.stance) ? "pointer" : "default", transition: "all 0.3s" }}>
              Next — Preferences →
            </button>
          </div>
        )}

        {/* ===== STEP 2: PREFERENCES ===== */}
        {step === 2 && (
          <div>
            <div style={{ marginTop: 12, marginBottom: 6 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                {[1, 2].map(s => <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: "#00d2b4" }} />)}
              </div>
              <h2 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-0.5px" }}>Your preferences</h2>
              <p style={{ color: "#5a8ca8", fontSize: 13, margin: "6px 0 28px" }}>Helps us find your perfect vibe</p>
            </div>

            <Label>CROWD TOLERANCE</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
              {CROWD_PREFS.map((c, i) => (
                <Pill key={c} selected={profile.crowdPref === i} onClick={() => setProfile(p => ({ ...p, crowdPref: i }))}>
                  {["🎉", "😌", "🏝️"][i]} {c}
                </Pill>
              ))}
            </div>

            <Label>REEF COMFORT</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 36 }}>
              {REEF_COMFORTS.map((r, i) => (
                <Pill key={r} selected={profile.reefComfort === i} onClick={() => setProfile(p => ({ ...p, reefComfort: i }))}>
                  {["🏖️", "🥾", "🤙"][i]} {r}
                </Pill>
              ))}
            </div>

            <button onClick={analyze} disabled={profile.crowdPref === null || profile.reefComfort === null} style={{ width: "100%", padding: "17px 24px", fontSize: 16, fontWeight: 700, background: (profile.crowdPref !== null && profile.reefComfort !== null) ? "linear-gradient(135deg, #00d2b4, #00a896)" : "rgba(255,255,255,0.06)", color: (profile.crowdPref !== null && profile.reefComfort !== null) ? "#060f1a" : "#3a5a6a", border: "none", borderRadius: 14, cursor: (profile.crowdPref !== null && profile.reefComfort !== null) ? "pointer" : "default", transition: "all 0.3s" }}>
              🤖 Analyze conditions & find my spot →
            </button>
          </div>
        )}

        {/* ===== STEP 3: RESULTS ===== */}
        {step === 3 && (
          <div>
            {isLoading ? (
              <div style={{ textAlign: "center", marginTop: 80 }}>
                <div style={{ fontSize: 44, marginBottom: 24, animation: "pulse 1.5s ease infinite" }}>🤖</div>
                <div style={{ width: "60%", height: 4, borderRadius: 2, margin: "0 auto 16px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg, #00d2b4, #00a896)", width: `${loadingProgress}%`, transition: "width 0.4s ease" }} />
                </div>
                <div style={{ color: "#00d2b4", fontSize: 13, fontWeight: 500 }}>
                  {["Reading swell charts...", "Checking tide tables...", "Cross-referencing your profile...", "Scoring 20+ spots..."][Math.min(Math.floor(loadingProgress / 25), 3)]}
                </div>
              </div>
            ) : !isLoading && step === 3 ? (
              <div style={{ textAlign: "center", marginTop: 80 }}>
                <div style={{ fontSize: 56, marginBottom: 20 }}>🤙</div>
                <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.5px", marginBottom: 10 }}>Profile saved!</h2>
                <p style={{ color: "#5a8ca8", fontSize: 14, marginBottom: 36, lineHeight: 1.6 }}>
                  Your surf profile is ready.<br/>Check today&apos;s best spots for you.
                </p>
                <a href="/daily-brief" style={{ display: "block", width: "100%", padding: "17px", fontSize: 16, fontWeight: 700, background: "linear-gradient(135deg, #00d2b4, #00a896)", color: "#060f1a", border: "none", borderRadius: 14, cursor: "pointer", boxShadow: "0 8px 36px rgba(0,210,180,0.28)", textDecoration: "none" }}>
                  View my Daily Brief →
                </a>
              </div>
            ) : results && (
              <div>
                {/* Conditions card */}
                <Card style={{ marginTop: 12, marginBottom: 10, padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <Label>TODAY&apos;S CONDITIONS</Label>
                    <span style={{ fontSize: 10.5, color: "#4a6a7a" }}>Bali • {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                    {[
                      { l: "Swell", v: `${forecast.swellHeight}m`, s: `${forecast.swellPeriod}s ${forecast.swellDir}` },
                      { l: "Wind", v: forecast.wind, s: `${forecast.windSpeed} km/h` },
                      { l: "Tide", v: forecast.tide.state === "Rising" ? "↗" : "↘", s: forecast.tide.state },
                      { l: "High", v: forecast.tide.nextHigh, s: "" },
                      { l: "Water", v: `${forecast.waterTemp}°C`, s: "Warm" },
                    ].map((m, i) => (
                      <div key={i} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 9, color: "#4a6a7a", fontWeight: 600, marginBottom: 3 }}>{m.l}</div>
                        <div style={{ fontSize: 17, fontWeight: 800 }}>{m.v}</div>
                        <div style={{ fontSize: 9, color: "#5a8ca8" }}>{m.s}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Zone filter */}
                <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "10px 0 14px", marginBottom: 4 }}>
                  {ZONES.filter(z => z === "All Bali" || results.some(r => r.zone === z)).map(z => (
                    <button key={z} onClick={() => setZoneFilter(z)} style={{ padding: "7px 14px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap", cursor: "pointer", transition: "all 0.2s", background: zoneFilter === z ? "#00d2b4" : "rgba(255,255,255,0.04)", color: zoneFilter === z ? "#060f1a" : "#5a8ca8", border: zoneFilter === z ? "none" : "1px solid rgba(255,255,255,0.06)" }}>{z}</button>
                  ))}
                </div>

                <div style={{ fontSize: 12, color: "#4a6a7a", marginBottom: 14 }}>{filteredResults?.length} spots ranked for your profile</div>

                {/* Spot cards */}
                {filteredResults?.map((spot, i) => {
                  const isTop = i === 0 && zoneFilter === "All Bali";
                  const isOpen = expanded === spot.id;
                  return (
                    <Card key={spot.id} glow={isTop} onClick={() => setExpanded(isOpen ? null : spot.id)} style={{ marginBottom: 8, padding: 16, cursor: "pointer" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                            <span style={{ fontSize: 24 }}>{spot.img}</span>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
                                {isTop && <span style={{ color: "#00d2b4" }}>★</span>}
                                {spot.name}
                              </div>
                              <div style={{ fontSize: 11, color: "#4a6a7a", display: "flex", gap: 8, alignItems: "center", marginTop: 2 }}>
                                <span>{spot.zone}</span><span>•</span><span>{spot.type}</span><span>•</span><span>{spot.direction}</span>
                                <DangerBadge level={spot.danger} />
                              </div>
                            </div>
                          </div>
                          <div style={{ fontSize: 12, color: "#6a9ab8", marginTop: 4, lineHeight: 1.4 }}>{spot.desc}</div>
                        </div>
                        <div style={{ textAlign: "center", marginLeft: 12, flexShrink: 0 }}>
                          <div style={{ width: 48, height: 48, borderRadius: "50%", background: spot.score >= 65 ? "rgba(0,210,180,0.12)" : spot.score >= 40 ? "rgba(245,166,35,0.1)" : "rgba(255,107,107,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, color: spot.score >= 65 ? "#00d2b4" : spot.score >= 40 ? "#f5a623" : "#ff6b6b", border: `2px solid ${spot.score >= 65 ? "rgba(0,210,180,0.25)" : spot.score >= 40 ? "rgba(245,166,35,0.2)" : "rgba(255,107,107,0.2)"}` }}>{spot.score}</div>
                          <div style={{ fontSize: 8, color: "#4a6a7a", marginTop: 3, fontWeight: 700, letterSpacing: "0.5px" }}>MATCH</div>
                        </div>
                      </div>

                      {isOpen && (
                        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                          {spot.reasons.length > 0 && (
                            <>
                              <Label>WHY THIS SPOT</Label>
                              {spot.reasons.map((r, j) => (
                                <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 5 }}>
                                  <span style={{ color: "#00d2b4", fontSize: 11, marginTop: 1 }}>✓</span>
                                  <span style={{ fontSize: 12.5, color: "#8ab4cc" }}>{r}</span>
                                </div>
                              ))}
                            </>
                          )}
                          {spot.warnings.length > 0 && (
                            <div style={{ marginTop: 10 }}>
                              {spot.warnings.map((w, j) => (
                                <div key={j} style={{ background: "rgba(255,107,107,0.06)", border: "1px solid rgba(255,107,107,0.12)", borderRadius: 10, padding: "8px 12px", marginBottom: 4, fontSize: 12, color: "#ff8a8a" }}>⚠️ {w}</div>
                              ))}
                            </div>
                          )}
                          <div style={{ background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.12)", borderRadius: 10, padding: 12, marginTop: 10 }}>
                            <div style={{ fontSize: 9.5, fontWeight: 700, color: "#f5a623", letterSpacing: "1px", marginBottom: 4 }}>💡 BOARD TIP</div>
                            <div style={{ fontSize: 12.5, color: "#c4a864" }}>{spot.boardTip}</div>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
                            <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: "10px 12px" }}>
                              <div style={{ fontSize: 9, color: "#4a6a7a", fontWeight: 600 }}>ACCESS</div>
                              <div style={{ fontSize: 12, color: "#8ab4cc", marginTop: 2 }}>{spot.access}</div>
                            </div>
                            <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: "10px 12px" }}>
                              <div style={{ fontSize: 9, color: "#4a6a7a", fontWeight: 600 }}>BOTTOM</div>
                              <div style={{ fontSize: 12, color: "#8ab4cc", marginTop: 2 }}>{spot.bottom}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}

                <button onClick={() => { setResults(null); setExpanded(null); go(1); }} style={{ width: "100%", padding: "14px", marginTop: 14, fontSize: 13, fontWeight: 600, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#5a8ca8", borderRadius: 14, cursor: "pointer" }}>← Edit my profile</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
