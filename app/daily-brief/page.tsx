"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase";
import SwellLogo from "@/components/SwellLogo";

const SpotMap = dynamic(() => import("./SpotMap"), { ssr: false });

// ============================================================
// SPOTS + SCORING (shared logic)
// ============================================================
const SPOTS = [
  // ── Bukit Peninsula (west-facing cliff coast) ──────────────────────────────
  { id: "uluwatu",     name: "Uluwatu",       zone: "Bukit",           type: "Reef break",  direction: "Left",       level: 3, maxSwell: 3.5, minSwell: 0.8, idealWind: "SE", idealSwellDir: "S",  tideReq: "mid-high", danger: 4, crowd: 5, img: "⚡",  desc: "World-class left, long barrels on the reef. Cave entry.",        access: "Steep stairs through cave",         bottom: "Sharp reef",          lat: -8.8291, lng: 115.0846 },
  { id: "padang",      name: "Padang Padang",  zone: "Bukit",           type: "Reef break",  direction: "Left",       level: 3, maxSwell: 3.0, minSwell: 1.2, idealWind: "SE", idealSwellDir: "SW", tideReq: "mid-low",  danger: 5, crowd: 4, img: "💀",  desc: "Heavy barrels over shallow reef. Only fires on solid swell.",    access: "Rock squeeze entry",                bottom: "Very shallow reef",   lat: -8.8117, lng: 115.0876 },
  { id: "bingin",      name: "Bingin",         zone: "Bukit",           type: "Reef break",  direction: "Left",       level: 2, maxSwell: 2.0, minSwell: 0.6, idealWind: "SE", idealSwellDir: "S",  tideReq: "mid-high", danger: 3, crowd: 4, img: "✨",  desc: "Fun left barrel, shorter ride. Great for improving intermediates.", access: "Long stairs down cliff",          bottom: "Reef (boots recommended)", lat: -8.8175, lng: 115.0905 },
  { id: "impossibles", name: "Impossibles",    zone: "Bukit",           type: "Reef break",  direction: "Left",       level: 3, maxSwell: 3.0, minSwell: 1.0, idealWind: "SE", idealSwellDir: "S",  tideReq: "mid",      danger: 4, crowd: 3, img: "🔥",  desc: "3 connecting sections, super long rides when it links up.",      access: "Cliff descent or paddle from Bingin", bottom: "Sharp reef",       lat: -8.8103, lng: 115.0884 },
  { id: "dreamland",   name: "Dreamland",      zone: "Bukit",           type: "Beach break", direction: "Both",       level: 1, maxSwell: 2.0, minSwell: 0.5, idealWind: "SE", idealSwellDir: "SW", tideReq: "all",      danger: 2, crowd: 3, img: "🏖️", desc: "Sandy beach break, fun peaks. Tourist-friendly.",               access: "Easy beach access",                 bottom: "Sand",                lat: -8.8010, lng: 115.0976 },
  { id: "balangan",    name: "Balangan",       zone: "Bukit",           type: "Reef break",  direction: "Left",       level: 2, maxSwell: 2.5, minSwell: 0.5, idealWind: "SE", idealSwellDir: "S",  tideReq: "mid-high", danger: 3, crowd: 3, img: "🌅",  desc: "Beautiful left with barrel sections. Mellow vibe.",             access: "Cliff stairs",                      bottom: "Reef with sand patches", lat: -8.7922, lng: 115.1049 },
  // ── Canggu / Seminyak / Kuta (west-facing beach coast) ────────────────────
  { id: "echo-beach",  name: "Echo Beach",     zone: "Canggu",          type: "Reef break",  direction: "Left",       level: 2, maxSwell: 2.5, minSwell: 0.5, idealWind: "SE", idealSwellDir: "S",  tideReq: "mid-high", danger: 3, crowd: 4, img: "💪",  desc: "Powerful left on the reef. Step up from Batu Bolong.",          access: "Beach with rocky entry",            bottom: "Reef",                lat: -8.6398, lng: 115.1508 },
  { id: "berawa",      name: "Berawa",         zone: "Canggu",          type: "Beach break", direction: "Both",       level: 1, maxSwell: 2.0, minSwell: 0.3, idealWind: "SE", idealSwellDir: "SW", tideReq: "all",      danger: 1, crowd: 4, img: "🌊",  desc: "Consistent beach break, good for all levels. Can get punchy.",  access: "Easy beach",                        bottom: "Sand",                lat: -8.6440, lng: 115.1432 },
  { id: "batu-bolong", name: "Batu Bolong",    zone: "Canggu",          type: "Beach break", direction: "Both",       level: 1, maxSwell: 1.8, minSwell: 0.3, idealWind: "SE", idealSwellDir: "SW", tideReq: "mid-high", danger: 1, crowd: 5, img: "🌴",  desc: "The social hub. Mellow waves, perfect for longboarding & beginners.", access: "Easy beach",               bottom: "Sand with some rocks", lat: -8.6511, lng: 115.1337 },
  { id: "oldmans",     name: "Old Man's",      zone: "Canggu",          type: "Beach break", direction: "Both",       level: 1, maxSwell: 1.5, minSwell: 0.3, idealWind: "SE", idealSwellDir: "SW", tideReq: "mid-high", danger: 1, crowd: 5, img: "☀️",  desc: "Super mellow, long crumbly waves. Beginner paradise.",          access: "Easy beach",                        bottom: "Sand",                lat: -8.6521, lng: 115.1328 },
  { id: "seminyak",    name: "Seminyak Beach", zone: "Seminyak",        type: "Beach break", direction: "Both",       level: 1, maxSwell: 1.8, minSwell: 0.3, idealWind: "SE", idealSwellDir: "SW", tideReq: "all",      danger: 1, crowd: 3, img: "🍹",  desc: "Less crowded alternative to Kuta. Decent peaks.",              access: "Easy beach",                        bottom: "Sand",                lat: -8.6896, lng: 115.1602 },
  { id: "kuta-beach",  name: "Kuta Beach",     zone: "Kuta",            type: "Beach break", direction: "Both",       level: 1, maxSwell: 1.5, minSwell: 0.2, idealWind: "SE", idealSwellDir: "SW", tideReq: "all",      danger: 1, crowd: 5, img: "🏄",  desc: "Where everyone learns to surf in Bali. Gentle whitewash.",     access: "Easy beach",                        bottom: "Sand",                lat: -8.7210, lng: 115.1671 },
  // ── East Coast ─────────────────────────────────────────────────────────────
  { id: "ketewel",     name: "Ketewel",        zone: "East Coast",      type: "Beach break", direction: "Both",       level: 2, maxSwell: 2.0, minSwell: 0.5, idealWind: "NW", idealSwellDir: "SE", tideReq: "all",      danger: 2, crowd: 1, img: "🌿",  desc: "Uncrowded black sand beach. Fun peaks when east swell hits.",   access: "Easy beach",                        bottom: "Sand (volcanic)",     lat: -8.5775, lng: 115.3128 },
  { id: "keramas",     name: "Keramas",        zone: "East Coast",      type: "Reef break",  direction: "Right",      level: 3, maxSwell: 2.5, minSwell: 0.8, idealWind: "NW", idealSwellDir: "SE", tideReq: "mid-high", danger: 4, crowd: 2, img: "🌙",  desc: "World-class right. Amazing for night surfing (lit). Fast & hollow.", access: "Easy beach entry",             bottom: "Reef",                lat: -8.5836, lng: 115.3012 },
  { id: "sanur",       name: "Sanur Reef",     zone: "East Coast",      type: "Reef break",  direction: "Right",      level: 2, maxSwell: 2.0, minSwell: 0.5, idealWind: "W",  idealSwellDir: "SE", tideReq: "mid-high", danger: 2, crowd: 2, img: "🐢",  desc: "Mellow right on the reef. Boat access. Chill crowd.",           access: "Boat from beach",                   bottom: "Reef (mellow)",       lat: -8.7048, lng: 115.2672 },
  // ── Nusa Lembongan ─────────────────────────────────────────────────────────
  { id: "shipwrecks",  name: "Shipwrecks",     zone: "Nusa Lembongan",  type: "Reef break",  direction: "Right",      level: 2, maxSwell: 2.5, minSwell: 0.5, idealWind: "SE", idealSwellDir: "S",  tideReq: "mid-high", danger: 3, crowd: 2, img: "🚢",  desc: "Long right-hander over reef. Boat or paddle access.",           access: "Boat from Lembongan",               bottom: "Reef",                lat: -8.6784, lng: 115.4512 },
  { id: "playgrounds", name: "Playgrounds",    zone: "Nusa Lembongan",  type: "Reef break",  direction: "Both",       level: 2, maxSwell: 2.0, minSwell: 0.5, idealWind: "SE", idealSwellDir: "S",  tideReq: "mid-high", danger: 2, crowd: 2, img: "🎪",  desc: "Fun left & right options. Mellow reef. Great for intermediates.", access: "Boat or paddle",               bottom: "Reef (friendly)",     lat: -8.6792, lng: 115.4538 },
  // ── Nusa Dua ───────────────────────────────────────────────────────────────
  { id: "sri-lanka",   name: "Sri Lanka",      zone: "Nusa Dua",        type: "Reef break",  direction: "Left/Right", level: 2, maxSwell: 2.5, minSwell: 0.5, idealWind: "NE", idealSwellDir: "S",  tideReq: "mid-high", danger: 3, crowd: 2, img: "🏝️", desc: "Quality reef break in front of resorts. A-frame peaks.",        access: "Paddle from beach",                 bottom: "Reef",                lat: -8.7870, lng: 115.2278 },
];

interface Profile { level: number | null; boards: string[]; stance: string; crowdPref: number | null; reefComfort: number | null; username?: string; avatarUrl?: string; }
interface HourlyWind { hour: number; speed: number; dir: string; deg: number; }
interface Forecast { swellHeight: number; swellPeriod: number; swellDir: string; wind: string; windSpeed: number; waterTemp: number; tide: { state: string; height: string; nextHigh: string }; hourlyWind?: HourlyWind[]; }
interface Spot { id: string; name: string; zone: string; type: string; direction: string; level: number; maxSwell: number; minSwell: number; idealWind: string; idealSwellDir: string; tideReq: string; danger: number; crowd: number; img: string; desc: string; access: string; bottom: string; lat: number; lng: number; }
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

function generateWhyText(spot: ScoredSpot, profile: Profile, forecast: Forecast): { title: string; body: string }[] {
  const sections: { title: string; body: string }[] = [];
  const level = profile.level ?? 1;

  // --- LEVEL MATCH ---
  const diff = spot.level - level;
  const levelNames = ["", "beginner", "intermediate", "advanced"];
  if (diff === 0) {
    sections.push({
      title: "Perfect level match",
      body: `${spot.name} is rated for ${levelNames[level]} surfers — exactly your level. This means the waves will challenge you without overwhelming you. You'll be able to read the sets, paddle into waves confidently, and focus on improving your technique rather than surviving.`,
    });
  } else if (diff === -1) {
    sections.push({
      title: "A relaxed session",
      body: `${spot.name} is designed for ${levelNames[spot.level]} surfers, and you're ${levelNames[level]}. This gives you an easy, low-pressure session — great when the conditions aren't ideal everywhere else. Use it to work on your fundamentals, footwork, or try new things without stress.`,
    });
  } else if (diff === 1) {
    sections.push({
      title: "A step-up challenge",
      body: `${spot.name} is rated ${levelNames[spot.level]} while you're ${levelNames[level]}. Pushing yourself at a slightly harder spot is one of the fastest ways to progress — but go with a buddy, stay aware of the lineup, and don't be afraid to sit and observe first.`,
    });
  }

  // --- SWELL ---
  const sh = forecast.swellHeight;
  const sp = forecast.swellPeriod;
  const swellInRange = sh >= spot.minSwell && sh <= spot.maxSwell;
  let swellBody = `Today's swell is ${sh}m at ${sp} seconds from the ${forecast.swellDir}. `;
  if (swellInRange) {
    swellBody += `This is exactly in ${spot.name}'s sweet spot (${spot.minSwell}–${spot.maxSwell}m). `;
    if (sp >= 14) swellBody += `A ${sp}s period means this is a powerful, well-organized groundswell — waves will be clean, consistent and have real push. `;
    else if (sp >= 10) swellBody += `A ${sp}s period gives solid, rideable waves with good shape. `;
    else swellBody += `A ${sp}s period is short — expect punchier, less organized waves but still surfable. `;
    if (forecast.swellDir === spot.idealSwellDir) swellBody += `The ${forecast.swellDir} swell direction hits ${spot.name} at the ideal angle, creating the best possible wave shape for this break.`;
    else swellBody += `Swell direction is slightly off-angle for this spot but still workable.`;
  } else if (sh < spot.minSwell) {
    swellBody += `It's a bit small for ${spot.name}'s ideal range (${spot.minSwell}–${spot.maxSwell}m), but you'll still find rideable waves — just pick your sets carefully and stay patient. `;
    swellBody += `On small days, positioning and timing matter more than power.`;
  } else {
    swellBody += `The swell is above ${spot.name}'s ideal range — expect bigger, more powerful surf than usual. `;
    swellBody += `The spot will still work, but conditions may be more demanding. Paddle with extra caution.`;
  }
  sections.push({ title: "Swell conditions", body: swellBody });

  // --- WIND ---
  let windBody = `Wind is ${forecast.wind} at ${forecast.windSpeed}km/h today. `;
  if (forecast.wind === spot.idealWind) {
    windBody += `${forecast.wind} winds are offshore at ${spot.name} — this is the holy grail. Offshore wind blows from land to sea, holding the wave face up and creating clean, groomed conditions. `;
    windBody += `The wave will stand up properly before breaking, giving you more time to read it and more wall to work with.`;
  } else if (forecast.windSpeed < 8) {
    windBody += `Even though it's not perfectly offshore here, light winds under 8km/h rarely ruin a session — the surface stays relatively smooth. `;
    windBody += `You'll see some chop but nothing too disruptive.`;
  } else {
    windBody += `The wind isn't ideal for this spot — onshore or cross-shore winds can chop up the surface and make wave faces messy. `;
    windBody += `Go early in the morning before the wind picks up, as most spots in Bali are cleanest at dawn.`;
  }
  sections.push({ title: "Wind & surface conditions", body: windBody });

  // --- TIDE ---
  let tideBody = `The tide is currently ${forecast.tide.state.toLowerCase()}, ${forecast.tide.height}. Next high tide: ${forecast.tide.nextHigh}. `;
  const tideOk = spot.tideReq === "all" || spot.tideReq.includes(forecast.tide.height);
  if (tideOk) {
    tideBody += `${spot.name} works well at ${spot.tideReq === "all" ? "all tides" : spot.tideReq + " tide"}, which is what you have now. `;
    if (spot.type === "Reef break") tideBody += `Reef breaks in Bali are especially tide-dependent: too low and the reef becomes dangerously shallow; too high and the waves lose their shape. Right now is the optimal window.`;
    else tideBody += `Beach breaks are more forgiving with tide — you're in good shape.`;
  } else {
    tideBody += `${spot.name} is best at ${spot.tideReq} tide. The current tide isn't perfect, but it may still be surfable — especially as it transitions. `;
    tideBody += `Watch how experienced locals are reading it before paddling out.`;
  }
  sections.push({ title: "Tide & timing", body: tideBody });

  // --- CROWD & REEF ---
  const crowdPref = profile.crowdPref ?? 0;
  let vibeBody = "";
  if (crowdPref >= 1 && spot.crowd <= 2) {
    vibeBody += `${spot.name} is one of Bali's quieter spots — you won't be fighting for waves. `;
    vibeBody += `Less crowd means more waves per hour, more space to experiment, and a much more relaxed vibe in the water. `;
  } else if (spot.crowd >= 4) {
    vibeBody += `${spot.name} gets busy. In a crowded lineup, priority rules matter — the surfer closest to the peak has right of way. `;
    vibeBody += `Paddle wide, observe the flow before committing to waves, and always communicate with fellow surfers.`;
  } else {
    vibeBody += `Crowd levels at ${spot.name} are moderate — manageable if you know the etiquette. `;
    vibeBody += `Arrive early (before 8am) for the best ratio of waves to people.`;
  }
  if (spot.bottom.toLowerCase().includes("reef")) {
    vibeBody += ` The bottom here is reef — wear booties if you're not fully comfortable with reef, stay on the wave until it's done (don't fall off early), and know your entry/exit before you paddle out.`;
  } else {
    vibeBody += ` Sandy bottom — no worries about the seafloor, just watch for rip currents.`;
  }
  sections.push({ title: "Crowd & vibe", body: vibeBody });

  return sections;
}

// Wind direction → offshore quality for west-facing Bali breaks
function windQuality(deg: number): "offshore" | "cross" | "onshore" {
  // Offshore for west coast = E quadrant (45°–180°) → wind from land
  if (deg >= 45 && deg <= 180) return "offshore";
  if ((deg > 180 && deg <= 225) || (deg > 315) || deg < 45) return "cross";
  return "onshore"; // W/NW/SW (225°–315°)
}

const QUALITY_COLORS = { offshore: "#00d2b4", cross: "#f5a623", onshore: "#ff6b6b" };

function WindChart({ hourlyWind }: { hourlyWind: HourlyWind[] }) {
  const now = new Date().getHours();

  if (!hourlyWind || hourlyWind.length === 0) return null;

  const maxSpeed = Math.max(...hourlyWind.map(h => h.speed), 30);
  const W = 540;
  const H = 100;
  const PAD_L = 30;
  const PAD_R = 10;
  const PAD_T = 8;
  const PAD_B = 30;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const n = hourlyWind.length;
  const barW = Math.floor(chartW / n) - 2;

  return (
    <div style={{ marginBottom: 24, animation: "fadeUp 0.5s ease 0.08s both" }}>
      <div style={{ fontSize: 9.5, fontWeight: 700, color: "#4a6a7a", letterSpacing: "2px", fontFamily: "monospace", marginBottom: 8 }}>
        WIND TODAY
      </div>
      <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "14px 12px 8px", overflow: "hidden" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
          {/* Y-axis grid + labels */}
          {[0, 10, 20, 30].map(spd => {
            const y = PAD_T + chartH - (spd / maxSpeed) * chartH;
            if (y < PAD_T) return null;
            return (
              <g key={spd}>
                <line x1={PAD_L} y1={y} x2={PAD_L + chartW} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                <text x={PAD_L - 4} y={y + 3.5} textAnchor="end" fontSize="10" fill="rgba(90,140,168,0.7)">{spd}</text>
              </g>
            );
          })}

          {/* Bars + direction arrows */}
          {hourlyWind.map((h, i) => {
            const x = PAD_L + i * (chartW / n) + 1;
            const barH = Math.max(4, (h.speed / maxSpeed) * chartH);
            const y = PAD_T + chartH - barH;
            const quality = windQuality(h.deg);
            const color = QUALITY_COLORS[quality];
            const isNow = h.hour === now;
            // Arrow: rotate SVG arrow by wind direction
            const cx = x + barW / 2;
            const cy = y - 10;
            return (
              <g key={h.hour}>
                {/* Bar */}
                <rect x={x} y={y} width={barW} height={barH}
                  fill={color} opacity={isNow ? 1 : 0.5} rx="2" />
                {/* Direction arrow */}
                <g transform={`translate(${cx}, ${cy}) rotate(${h.deg})`}>
                  <line x1="0" y1="5" x2="0" y2="-5" stroke={color} strokeWidth="1.5" opacity={isNow ? 1 : 0.7} />
                  <polygon points="0,-7 -2.5,-3 2.5,-3" fill={color} opacity={isNow ? 1 : 0.7} />
                </g>
                {/* Hour label */}
                <text x={cx} y={PAD_T + chartH + 12} textAnchor="middle" fontSize="9" fill={isNow ? "#dce8f0" : "rgba(90,140,168,0.65)"}>
                  {h.hour < 12 ? `${h.hour}` : h.hour === 12 ? "12" : `${h.hour - 12}`}
                  <tspan fontSize="7">{h.hour < 12 ? "am" : "pm"}</tspan>
                </text>
                {/* Speed label on current hour */}
                {isNow && (
                  <text x={cx} y={y - 18} textAnchor="middle" fontSize="10" fontWeight="700" fill={color}>{h.speed}km/h</text>
                )}
              </g>
            );
          })}

          {/* "now" highlight */}
          {hourlyWind.map((h, i) => {
            if (h.hour !== now) return null;
            const x = PAD_L + i * (chartW / n) + 1;
            return <rect key="now-bg" x={x - 1} y={PAD_T} width={barW + 2} height={chartH} fill="rgba(255,255,255,0.04)" rx="2" />;
          })}

          {/* Legend */}
          <text x={PAD_L} y={PAD_T + chartH + 24} fontSize="9" fill={QUALITY_COLORS.offshore}>● offshore</text>
          <text x={PAD_L + 66} y={PAD_T + chartH + 24} fontSize="9" fill={QUALITY_COLORS.cross}>● cross</text>
          <text x={PAD_L + 116} y={PAD_T + chartH + 24} fontSize="9" fill={QUALITY_COLORS.onshore}>● onshore</text>
          <text x={PAD_L + chartW} y={PAD_T + chartH + 24} textAnchor="end" fontSize="9" fill="rgba(90,140,168,0.5)">km/h</text>
        </svg>
      </div>
    </div>
  );
}

function TideChart({ nextHighStr, tideState }: { nextHighStr: string; tideState: string }) {
  // Parse "11:30 AM" → minutes from midnight
  const parseTimeStr = (str: string): number => {
    const parts = str.trim().split(" ");
    const [h, m] = parts[0].split(":").map(Number);
    const ampm = parts[1]?.toUpperCase();
    let hours = h;
    if (ampm === "PM" && h !== 12) hours = h + 12;
    if (ampm === "AM" && h === 12) hours = 0;
    return hours * 60 + (m || 0);
  };

  const highMin = parseTimeStr(nextHighStr);
  // Semi-diurnal: 12h25min period
  const PERIOD = 745;
  const MID = 0.9;
  const AMP = 0.7;
  const tide = (min: number) => MID + AMP * Math.cos((2 * Math.PI * (min - highMin)) / PERIOD);

  // Bali sunrise/sunset (fixed, minimal variation)
  const SUNRISE = 6 * 60 + 10;  // 06:10
  const SUNSET = 18 * 60 + 20;  // 18:20

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const W = 540;
  const H = 90;
  const PAD_L = 30;
  const PAD_R = 10;
  const PAD_T = 10;
  const PAD_B = 30;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const maxH = MID + AMP + 0.1;

  const toX = (min: number) => PAD_L + ((min - SUNRISE) / (SUNSET - SUNRISE)) * chartW;
  const toY = (h: number) => PAD_T + chartH - (h / maxH) * chartH;

  // Generate smooth path (every 10 min)
  const pts: [number, number][] = [];
  for (let t = SUNRISE; t <= SUNSET; t += 10) {
    pts.push([toX(t), toY(tide(t))]);
  }
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const fillPath = `${linePath} L${toX(SUNSET).toFixed(1)},${(PAD_T + chartH).toFixed(1)} L${PAD_L},${(PAD_T + chartH).toFixed(1)} Z`;

  // Current time (clamp inside chart)
  const nowClamped = Math.max(SUNRISE, Math.min(SUNSET, nowMin));
  const nowX = toX(nowClamped);
  const nowTideH = tide(nowClamped);
  const nowY = toY(nowTideH);

  // Hour ticks every 1h
  const ticks: number[] = [];
  for (let t = Math.ceil(SUNRISE / 60) * 60; t <= SUNSET; t += 60) ticks.push(t);

  // Y-axis labels
  const yMarks = [0, 0.5, 1.0, 1.5];

  return (
    <div style={{ marginBottom: 24, animation: "fadeUp 0.5s ease 0.05s both" }}>
      <div style={{ fontSize: 9.5, fontWeight: 700, color: "#4a6a7a", letterSpacing: "2px", fontFamily: "monospace", marginBottom: 8 }}>
        TIDE TODAY
      </div>
      <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "14px 12px 8px", overflow: "hidden" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
          {/* Y-axis grid lines + labels */}
          {yMarks.map(m => {
            const y = toY(m);
            if (y < PAD_T || y > PAD_T + chartH) return null;
            return (
              <g key={m}>
                <line x1={PAD_L} y1={y} x2={PAD_L + chartW} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                <text x={PAD_L - 4} y={y + 3.5} textAnchor="end" fontSize="10" fill="rgba(90,140,168,0.8)">{m}m</text>
              </g>
            );
          })}

          {/* Filled area under curve */}
          <path d={fillPath} fill="rgba(0,210,180,0.07)" />

          {/* Tide curve */}
          <path d={linePath} fill="none" stroke="#00d2b4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Current time line */}
          {nowMin >= SUNRISE && nowMin <= SUNSET && (
            <g>
              <line x1={nowX} y1={PAD_T} x2={nowX} y2={PAD_T + chartH} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3,3" />
              <circle cx={nowX} cy={nowY} r="4" fill="#00d2b4" stroke="#060f1a" strokeWidth="1.5" />
              <text x={nowX} y={nowY - 8} textAnchor="middle" fontSize="11" fontWeight="700" fill="#00d2b4">{nowTideH.toFixed(1)}m</text>
            </g>
          )}

          {/* Hour ticks — every hour */}
          {ticks.map(t => {
            const x = toX(t);
            const h = t / 60;
            const isSunrise = t === SUNRISE || Math.abs(t - SUNRISE) < 30;
            const isSunset = Math.abs(t - SUNSET) < 30;
            if (isSunrise || isSunset) return null; // handled separately
            const label = h < 12 ? `${h}` : h === 12 ? "12" : `${h - 12}`;
            const ampm = h < 12 ? "am" : "pm";
            return (
              <g key={t}>
                <line x1={x} y1={PAD_T + chartH} x2={x} y2={PAD_T + chartH + 3} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <text x={x} y={PAD_T + chartH + 12} textAnchor="middle" fontSize="9" fill="rgba(90,140,168,0.7)">{label}<tspan fontSize="7">{ampm}</tspan></text>
              </g>
            );
          })}

          {/* Sunrise */}
          <text x={PAD_L} y={PAD_T + chartH + 12} textAnchor="middle" fontSize="9" fill="rgba(245,166,35,0.9)">6:10</text>
          <text x={PAD_L} y={PAD_T + chartH + 24} textAnchor="middle" fontSize="13">🌅</text>

          {/* Sunset */}
          <text x={PAD_L + chartW} y={PAD_T + chartH + 12} textAnchor="middle" fontSize="9" fill="rgba(245,166,35,0.9)">18:20</text>
          <text x={PAD_L + chartW} y={PAD_T + chartH + 24} textAnchor="middle" fontSize="13">🌇</text>
        </svg>
      </div>
    </div>
  );
}

export default function DailyBrief() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [forecast, setForecast] = useState<Forecast>(FALLBACK_FORECAST);
  const [spots, setSpots] = useState<ScoredSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [boardPulse, setBoardPulse] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const [activeTab, setActiveTab] = useState<"call" | "map">("call");

  // Persist active tab across refreshes
  useEffect(() => {
    const saved = localStorage.getItem("swell_tab") as "call" | "map" | null;
    if (saved === "map" || saved === "call") setActiveTab(saved);
  }, []);

  const switchTab = (tab: "call" | "map") => {
    setActiveTab(tab);
    localStorage.setItem("swell_tab", tab);
  };
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [spotForecasts, setSpotForecasts] = useState<Record<string, Forecast>>({});

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

      // Fetch spot-specific forecasts for top 3 spots (parallel, each cached 24h on server)
      const top3 = scored.slice(0, 3);
      const sfEntries = await Promise.all(
        top3.map(async (s) => {
          try {
            const r = await fetch(`/api/forecast?lat=${s.lat}&lng=${s.lng}`);
            const d = await r.json();
            if (!d.error) return [s.id, d] as [string, Forecast];
          } catch {}
          return [s.id, fc] as [string, Forecast];
        })
      );
      const sfMap: Record<string, Forecast> = {};
      sfEntries.forEach(([id, f]) => { sfMap[id] = f; });
      setSpotForecasts(sfMap);

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

      {/* Header + tabs */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(6,15,26,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ padding: "14px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/daily-brief" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
            <SwellLogo size={34} />
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
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 0, padding: "0 16px", marginTop: 10 }}>
          {[
            { label: "Today's Call", icon: "★", id: "call" },
            { label: "Map", icon: "◎", id: "map" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id as "call" | "map")}
              style={{
                padding: "10px 18px", fontSize: 12, fontWeight: 700,
                background: "none", border: "none", cursor: "pointer",
                color: activeTab === tab.id ? "#00d2b4" : "#4a6a7a",
                borderBottom: activeTab === tab.id ? "2px solid #00d2b4" : "2px solid transparent",
                letterSpacing: "0.5px", transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <span style={{ fontSize: 11 }}>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* MAP VIEW */}
      {activeTab === "map" && <SpotMap spots={spots} />}

      <div style={{ maxWidth: 580, margin: "0 auto", padding: "24px 20px 60px", display: activeTab === "map" ? "none" : "block" }}>

        {/* ===== TODAY'S CALL ===== */}
        {top && (() => {
          const spotFc = spotForecasts[top.id] ?? forecast;
          const energyKj = Math.round(0.49 * Math.pow(spotFc.swellHeight, 2) * Math.pow(spotFc.swellPeriod, 2));
          const energyDisplay = energyKj >= 1000 ? `${(energyKj / 1000).toFixed(1)}MJ` : `${energyKj}kJ`;

          // Interpret conditions for this specific spot
          const swellOk = spotFc.swellHeight >= top.minSwell && spotFc.swellHeight <= top.maxSwell;
          const swellColor = swellOk ? "#00d2b4" : "#f5a623";
          const swellStatus = swellOk ? "In range" : spotFc.swellHeight < top.minSwell ? "Small" : "Big";

          const windOffshore = spotFc.wind === top.idealWind;
          const windLight = spotFc.windSpeed < 8;
          const windColor = windOffshore ? "#00d2b4" : windLight ? "#f5a623" : "#ff6b6b";
          const windStatus = windOffshore ? "Offshore" : windLight ? "Light" : "Onshore";

          const tideOk = top.tideReq === "all" || top.tideReq.includes(spotFc.tide.height);
          const tideColor = tideOk ? "#00d2b4" : "#f5a623";
          const tideStatus = tideOk ? "Good" : `Best ${top.tideReq}`;

          return (
            <div style={{ marginBottom: 28, animation: "fadeUp 0.5s ease" }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: "#00d2b4", letterSpacing: "2px", fontFamily: "monospace", marginBottom: 12 }}>
                ★ TODAY&apos;S CALL
              </div>

              {/* Main card */}
              <div style={{
                background: "linear-gradient(135deg, rgba(0,210,180,0.08), rgba(0,180,160,0.02))",
                border: "1px solid rgba(0,210,180,0.22)", borderRadius: 22,
                overflow: "hidden", position: "relative",
              }}>
                {/* BG wave */}
                <svg style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "40%", opacity: 0.05, pointerEvents: "none" }} viewBox="0 0 400 120" preserveAspectRatio="none">
                  <path fill="#00d2b4"><animate attributeName="d" dur="8s" repeatCount="indefinite" values="M0 60C100 30 200 90 400 60V120H0Z;M0 70C120 40 280 80 400 50V120H0Z;M0 60C100 30 200 90 400 60V120H0Z" /></path>
                </svg>

                {/* Spot identity */}
                <div style={{ padding: "22px 22px 0", position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 32, marginBottom: 6 }}>{top.img}</div>
                    <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.8px", margin: "0 0 4px" }}>{top.name}</h2>
                    <div style={{ fontSize: 12, color: "#5a8ca8" }}>{top.zone} · {top.type} · {top.direction}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      width: 60, height: 60, borderRadius: "50%",
                      background: "rgba(0,210,180,0.1)", border: "2px solid rgba(0,210,180,0.35)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20, fontWeight: 900, color: "#00d2b4",
                      animation: "pulse 2s ease infinite",
                    }}>{top.score}</div>
                    <div style={{ fontSize: 8, color: "#4a6a7a", marginTop: 4, fontWeight: 700, letterSpacing: "1px" }}>MATCH</div>
                  </div>
                </div>

                {/* Conditions for this spot */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, padding: "16px 22px" }}>
                  {[
                    { l: "SWELL", v: `${spotFc.swellHeight}m`, s: swellStatus, c: swellColor, sub: `${spotFc.swellPeriod}s · ${spotFc.swellDir}` },
                    { l: "ENERGY", v: energyDisplay, s: "today", c: "#8ab4cc", sub: `${top.minSwell}–${top.maxSwell}m range` },
                    { l: "WIND", v: spotFc.wind, s: windStatus, c: windColor, sub: `${spotFc.windSpeed} km/h` },
                    { l: "TIDE", v: spotFc.tide.state === "Rising" ? "↗" : "↘", s: tideStatus, c: tideColor, sub: `High ${spotFc.tide.nextHigh}` },
                  ].map((m, i) => (
                    <div key={i} style={{
                      textAlign: "center", borderRadius: 12, padding: "12px 6px",
                      background: `${m.c}10`,
                      border: `1px solid ${m.c}25`,
                    }}>
                      <div style={{ fontSize: 9, color: "#4a6a7a", fontWeight: 700, letterSpacing: "1px", marginBottom: 5 }}>{m.l}</div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: m.c, lineHeight: 1 }}>{m.v}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: m.c, marginTop: 4, opacity: 0.9 }}>{m.s}</div>
                      <div style={{ fontSize: 10, color: "#5a8ca8", marginTop: 3 }}>{m.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div style={{ padding: "0 22px 16px", fontSize: 12, color: "#7a9ab8", lineHeight: 1.6 }}>{top.desc}</div>

                {/* Warnings */}
                {top.warnings.length > 0 && (
                  <div style={{ padding: "0 22px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
                    {top.warnings.map((w, i) => (
                      <div key={i} style={{ background: "rgba(255,107,107,0.06)", border: "1px solid rgba(255,107,107,0.12)", borderRadius: 10, padding: "8px 12px", fontSize: 12, color: "#ff8a8a" }}>⚠️ {w}</div>
                    ))}
                  </div>
                )}

                {/* Wind + Tide charts inside the card */}
                <div style={{ padding: "0 14px 4px" }}>
                  {spotFc.hourlyWind && spotFc.hourlyWind.length > 0 && (
                    <WindChart hourlyWind={spotFc.hourlyWind} />
                  )}
                  <TideChart nextHighStr={spotFc.tide.nextHigh} tideState={spotFc.tide.state} />
                </div>

                {/* Why button */}
                <div style={{ padding: "0 22px 22px" }}>
                  <button onClick={() => setShowWhy(v => !v)} style={{
                    width: "100%", padding: "11px 16px",
                    background: showWhy ? "rgba(0,210,180,0.08)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${showWhy ? "rgba(0,210,180,0.25)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 12, cursor: "pointer", fontSize: 12, fontWeight: 600,
                    color: showWhy ? "#00d2b4" : "#6a9ab8",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    transition: "all 0.2s",
                  }}>
                    <span>Why we advise you this spot</span>
                    <span style={{ transition: "transform 0.2s", transform: showWhy ? "rotate(90deg)" : "none" }}>›</span>
                  </button>
                  {showWhy && profile && (
                    <div style={{ marginTop: 8, borderRadius: 14, overflow: "hidden", border: "1px solid rgba(0,210,180,0.1)", background: "rgba(0,0,0,0.2)" }}>
                      {generateWhyText(top, profile, forecast).map((section, i) => (
                        <div key={i} style={{ padding: "16px 18px", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                          <div style={{ fontSize: 9.5, fontWeight: 700, color: "#00d2b4", letterSpacing: "1.5px", fontFamily: "monospace", textTransform: "uppercase" as const, marginBottom: 6 }}>
                            {["🎯","🌊","💨","🌊","👥"][i]} {section.title}
                          </div>
                          <div style={{ fontSize: 12, color: "#8ab4cc", lineHeight: 1.7 }}>{section.body}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Board recommendation */}
        {boardRec && (
          <div style={{ marginBottom: 24, animation: "fadeUp 0.6s ease 0.15s both" }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: "#f5a623", letterSpacing: "2px", fontFamily: "monospace", marginBottom: 10 }}>
              🏄 GRAB THIS BOARD
            </div>
            <div style={{
              background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.2)",
              borderRadius: 18, padding: "18px 22px",
              display: "flex", alignItems: "center", gap: 18,
              animation: boardPulse ? "boardGlow 2s ease infinite" : "none",
            }}>
              <div style={{ fontSize: 40 }}>🏄‍♂️</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18, color: "#f5a623", marginBottom: 3 }}>{boardRec}</div>
                <div style={{ fontSize: 12, color: "#c4a864", lineHeight: 1.5 }}>{top?.boardTip}</div>
              </div>
            </div>
          </div>
        )}

        {/* 2nd + 3rd Call */}
        <div id="all-spots-section" style={{ animation: "fadeUp 0.6s ease 0.3s both" }}>
          {[
            { spot: spots[1], label: "2ND CALL", icon: "◈" },
            { spot: spots[2], label: "3RD CALL", icon: "◇" },
          ].filter(({ spot }) => !!spot).map(({ spot, label, icon }) => {
            const isOpen = expanded === spot.id;
            const sf = spotForecasts[spot.id] ?? forecast;

            // Spot-specific condition interpretation
            const sOk = sf.swellHeight >= spot.minSwell && sf.swellHeight <= spot.maxSwell;
            const sColor = sOk ? "#00d2b4" : "#f5a623";
            const sStatus = sOk ? "In range" : sf.swellHeight < spot.minSwell ? "Too small" : "Too big";

            const wOffshore = sf.wind === spot.idealWind;
            const wLight = sf.windSpeed < 8;
            const wColor = wOffshore ? "#00d2b4" : wLight ? "#f5a623" : "#ff6b6b";
            const wStatus = wOffshore ? "Offshore ✓" : wLight ? "Light" : "Onshore";

            const tOk = spot.tideReq === "all" || spot.tideReq.includes(sf.tide.height);
            const tColor = tOk ? "#00d2b4" : "#f5a623";
            const tStatus = tOk ? `${sf.tide.height} ✓` : `Best ${spot.tideReq}`;

            return (
              <div key={spot.id} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: "#4a6a7a", letterSpacing: "2px", fontFamily: "monospace", marginBottom: 10 }}>
                  {icon} {label}
                </div>
                <div
                  onClick={() => setExpanded(isOpen ? null : spot.id)}
                  style={{
                    background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 18, overflow: "hidden", cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  {/* Spot header */}
                  <div style={{ padding: "18px 18px 12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 26, marginBottom: 6 }}>{spot.img}</div>
                      <div style={{ fontWeight: 800, fontSize: 19, letterSpacing: "-0.5px", marginBottom: 3 }}>{spot.name}</div>
                      <div style={{ fontSize: 11, color: "#5a8ca8" }}>{spot.zone} · {spot.type} · {spot.direction}</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{
                        width: 50, height: 50, borderRadius: "50%",
                        background: spot.score >= 65 ? "rgba(0,210,180,0.08)" : "rgba(245,166,35,0.08)",
                        border: `2px solid ${spot.score >= 65 ? "rgba(0,210,180,0.25)" : "rgba(245,166,35,0.2)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 17, fontWeight: 900,
                        color: spot.score >= 65 ? "#00d2b4" : "#f5a623",
                      }}>{spot.score}</div>
                      <div style={{ fontSize: 8, color: "#4a6a7a", marginTop: 3, fontWeight: 700, letterSpacing: "1px" }}>MATCH</div>
                    </div>
                  </div>

                  {/* Conditions grid — spot specific */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, padding: "0 14px 14px" }}>
                    {[
                      { l: "SWELL", v: `${sf.swellHeight}m`, s: sStatus, c: sColor, sub: `${sf.swellDir}` },
                      { l: "PERIOD", v: `${sf.swellPeriod}s`, s: sf.swellDir, c: "#8ab4cc", sub: "swell" },
                      { l: "WIND", v: sf.wind, s: wStatus, c: wColor, sub: `${sf.windSpeed} km/h` },
                      { l: "TIDE", v: sf.tide.state === "Rising" ? "↗" : "↘", s: tStatus, c: tColor, sub: `H ${sf.tide.nextHigh}` },
                    ].map((m, i) => (
                      <div key={i} style={{
                        textAlign: "center", borderRadius: 10, padding: "10px 4px",
                        background: `${m.c}0d`, border: `1px solid ${m.c}20`,
                      }}>
                        <div style={{ fontSize: 8.5, color: "#4a6a7a", fontWeight: 700, letterSpacing: "1px", marginBottom: 4 }}>{m.l}</div>
                        <div style={{ fontSize: 19, fontWeight: 900, color: m.c, lineHeight: 1 }}>{m.v}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: m.c, marginTop: 3, opacity: 0.9 }}>{m.s}</div>
                        <div style={{ fontSize: 9, color: "#5a8ca8", marginTop: 2 }}>{m.sub}</div>
                      </div>
                    ))}
                  </div>

                  {spot.warnings.length > 0 && (
                    <div style={{ padding: "0 14px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
                      {spot.warnings.map((w, j) => (
                        <div key={j} style={{ background: "rgba(255,107,107,0.05)", border: "1px solid rgba(255,107,107,0.1)", borderRadius: 8, padding: "6px 12px", fontSize: 11, color: "#ff8a8a" }}>⚠️ {w}</div>
                      ))}
                    </div>
                  )}

                  {/* Wind + Tide charts — spot-specific */}
                  <div style={{ padding: "0 10px 8px" }}>
                    {sf.hourlyWind && sf.hourlyWind.length > 0 && (
                      <WindChart hourlyWind={sf.hourlyWind} />
                    )}
                    <TideChart nextHighStr={sf.tide.nextHigh} tideState={sf.tide.state} />
                  </div>

                  {isOpen && (
                    <div style={{ padding: "14px 18px 18px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontSize: 12, color: "#6a9ab8", lineHeight: 1.6, marginBottom: 12 }}>{spot.desc}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
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
              </div>
            );
          })}
        </div>

        <a href="/profile" style={{ display: "block", textAlign: "center", marginTop: 24, fontSize: 13, color: "#4a6a7a", textDecoration: "none" }}>
          ← Edit my profile
        </a>
      </div>
    </div>
  );
}
