"use client";

import { useState } from "react";
import Map, { Marker, Popup } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

interface ScoredSpot {
  id: string; name: string; zone: string; type: string; direction: string;
  level: number; maxSwell: number; minSwell: number; idealWind: string;
  idealSwellDir: string; tideReq: string; danger: number; crowd: number;
  img: string; desc: string; access: string; bottom: string;
  lat: number; lng: number;
  score: number; reasons: string[]; warnings: string[]; boardTip: string;
}

export default function SpotMap({ spots }: { spots: ScoredSpot[] }) {
  const [popupSpot, setPopupSpot] = useState<ScoredSpot | null>(null);

  return (
    <div style={{ height: "calc(100vh - 100px)", position: "relative" }}>
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{ longitude: 115.18, latitude: -8.72, zoom: 10.5 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        onClick={() => setPopupSpot(null)}
      >
        {spots.map((spot, i) => {
          const color = spot.score >= 60 ? "#00d2b4" : spot.score >= 40 ? "#f5a623" : "#ff6b6b";
          const size = i < 3 ? 36 : 28;
          return (
            <Marker key={spot.id} longitude={spot.lng} latitude={spot.lat} anchor="center">
              <div
                onClick={e => { e.stopPropagation(); setPopupSpot(spot); }}
                style={{
                  width: size, height: size, borderRadius: "50%",
                  background: `${color}20`,
                  border: `2px solid ${color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                  fontSize: i < 3 ? 13 : 10, fontWeight: 900, color,
                  boxShadow: i === 0 ? `0 0 16px ${color}80` : "none",
                }}
              >
                {i === 0 ? "★" : spot.score}
              </div>
            </Marker>
          );
        })}

        {popupSpot && (
          <Popup
            longitude={popupSpot.lng}
            latitude={popupSpot.lat}
            anchor="bottom"
            onClose={() => setPopupSpot(null)}
            closeButton={false}
            offset={20}
          >
            <div style={{ background: "#0a1e2e", border: "1px solid rgba(0,210,180,0.2)", borderRadius: 14, padding: "14px 16px", minWidth: 200, color: "#dce8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{popupSpot.img} {popupSpot.name}</div>
                  <div style={{ fontSize: 11, color: "#5a8ca8", marginTop: 2 }}>{popupSpot.zone} · {popupSpot.type}</div>
                </div>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%", flexShrink: 0, marginLeft: 10,
                  background: popupSpot.score >= 60 ? "rgba(0,210,180,0.12)" : "rgba(245,166,35,0.12)",
                  border: `2px solid ${popupSpot.score >= 60 ? "rgba(0,210,180,0.4)" : "rgba(245,166,35,0.4)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 900,
                  color: popupSpot.score >= 60 ? "#00d2b4" : "#f5a623",
                }}>{popupSpot.score}</div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                {popupSpot.reasons.slice(0, 2).map((r, i) => (
                  <span key={i} style={{ fontSize: 10, background: "rgba(0,210,180,0.06)", border: "1px solid rgba(0,210,180,0.15)", borderRadius: 6, padding: "3px 8px", color: "#00d2b4" }}>✓ {r}</span>
                ))}
              </div>
              {popupSpot.warnings.length > 0 && (
                <div style={{ fontSize: 10, color: "#ff8a8a", marginBottom: 6 }}>⚠️ {popupSpot.warnings[0]}</div>
              )}
              <div style={{ fontSize: 10, color: "#4a6a7a" }}>{popupSpot.access}</div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Legend */}
      <div style={{ position: "absolute", bottom: 20, left: 16, background: "rgba(6,15,26,0.9)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 14px", fontSize: 11, color: "#6a9ab8", display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: "#00d2b4", display: "inline-block" }} /> Good match</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f5a623", display: "inline-block" }} /> Decent</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff6b6b", display: "inline-block" }} /> Not ideal</div>
      </div>
    </div>
  );
}
