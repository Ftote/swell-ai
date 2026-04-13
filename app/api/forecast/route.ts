import { NextResponse } from "next/server";

// Bali central coordinates (south coast — covers Bukit + Canggu)
const LAT = -8.85;
const LNG = 115.08;

function degreesToCompass(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function getTideState(hour: number): { state: string; height: string; nextHigh: string } {
  // Simple pseudo-tide based on hour (Bali tides roughly semi-diurnal)
  const cycle = ((hour % 12) / 12) * Math.PI * 2;
  const tideVal = Math.sin(cycle);
  const height = tideVal > 0.5 ? "high" : tideVal < -0.5 ? "low" : "mid";
  const state = tideVal > 0 ? "Rising" : "Falling";
  const nextHighHour = hour < 6 ? 6 : hour < 18 ? 18 : 30;
  const hoursUntil = nextHighHour - hour;
  const nextHighTime = new Date();
  nextHighTime.setHours(nextHighHour, 0, 0, 0);
  const nextHigh = hoursUntil <= 0
    ? "Now"
    : nextHighTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
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
    const tide = getTideState(now.getHours());

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
