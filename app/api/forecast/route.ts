import { NextResponse } from "next/server";

// Bali central coordinates (south coast — covers Bukit + Canggu)
const LAT = -8.85;
const LNG = 115.08;

function degreesToCompass(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function getTideState(now: Date): { state: string; height: string; nextHigh: string } {
  // Semi-diurnal model — same cosine formula as the TideChart component
  // so state, height and chart curve are always consistent
  const PERIOD = 745; // 12h25min in minutes
  const MID = 0.9;
  const AMP = 0.7;
  // Bali reference high tide anchor: 06:00
  const REF_HIGH_MIN = 6 * 60;

  const nowMin = now.getHours() * 60 + now.getMinutes();

  const tideAt = (m: number) => MID + AMP * Math.cos((2 * Math.PI * (m - REF_HIGH_MIN)) / PERIOD);
  const derivAt = (m: number) => -AMP * (2 * Math.PI / PERIOD) * Math.sin((2 * Math.PI * (m - REF_HIGH_MIN)) / PERIOD);

  const h = tideAt(nowMin);
  const rising = derivAt(nowMin) > 0;
  const state = rising ? "Rising" : "Falling";
  const height = h > MID + AMP * 0.4 ? "high" : h < MID - AMP * 0.4 ? "low" : "mid";

  // Next high = next multiple of PERIOD after nowMin
  let nextHighMin = REF_HIGH_MIN;
  while (nextHighMin <= nowMin) nextHighMin += PERIOD;
  // Clamp to same-day display (wrap if past midnight)
  const displayMin = nextHighMin % 1440;
  const nh = Math.floor(displayMin / 60);
  const nm = Math.round(displayMin % 60);
  const ampm = nh >= 12 ? "PM" : "AM";
  const displayH = nh > 12 ? nh - 12 : nh === 0 ? 12 : nh;
  const nextHigh = `${displayH}:${nm.toString().padStart(2, "0")} ${ampm}`;

  return { state, height, nextHigh };
}

export async function GET() {
  const apiKey = process.env.STORMGLASS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  const params = "waveHeight,wavePeriod,waveDirection,windSpeed,windDirection,waterTemperature";
  const url = `https://api.stormglass.io/v2/weather/point?lat=${LAT}&lng=${LNG}&params=${params}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: apiKey },
      // Cache for 6 hours — max 4 requests/day on 10req/day limit
      next: { revalidate: 21600 },
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    const hours: Record<string, { sg?: number }>[] = data.hours;

    // Find the closest hour to now
    const now = new Date();
    const current = hours.reduce((closest: typeof hours[0], h) => {
      const hTime = new Date((h as { time: string }).time).getTime();
      const cTime = new Date((closest as { time: string }).time).getTime();
      return Math.abs(hTime - now.getTime()) < Math.abs(cTime - now.getTime()) ? h : closest;
    });

    const get = (key: string) => (current[key] as { sg?: number })?.sg ?? 0;

    const waveHeight = Math.round(get("waveHeight") * 10) / 10;
    const wavePeriod = Math.round(get("wavePeriod"));
    const waveDir = degreesToCompass(get("waveDirection"));
    const windSpeedMs = get("windSpeed");
    const windSpeedKmh = Math.round(windSpeedMs * 3.6);
    const windDir = degreesToCompass(get("windDirection"));
    const waterTemp = Math.round(get("waterTemperature"));
    const tide = getTideState(now);

    // Build hourly wind data for today (Bali daylight: 6am–18pm)
    const todayStr = now.toISOString().slice(0, 10);
    const hourlyWind = hours
      .filter(h => {
        const t = (h as { time: string }).time;
        const hr = new Date(t).getHours();
        return t.startsWith(todayStr) && hr >= 6 && hr <= 18;
      })
      .map(h => {
        const t = new Date((h as { time: string }).time);
        const spd = ((h["windSpeed"] as { sg?: number })?.sg ?? 0) * 3.6;
        const deg = (h["windDirection"] as { sg?: number })?.sg ?? 0;
        return {
          hour: t.getHours(),
          speed: Math.round(spd),
          dir: degreesToCompass(deg),
          deg: Math.round(deg),
        };
      });

    return NextResponse.json({
      swellHeight: waveHeight,
      swellPeriod: wavePeriod,
      swellDir: waveDir,
      wind: windDir,
      windSpeed: windSpeedKmh,
      waterTemp,
      tide,
      hourlyWind,
      fetchedAt: now.toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
