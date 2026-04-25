import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Hyperdome Car Wash — Professional car wash in Logan QLD";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #F7F5F1 0%, #EFE9DC 55%, #E6DFCD 100%)",
          padding: "72px",
          fontFamily: "Georgia, serif",
          color: "#0E0E0C",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(80% 55% at 78% 16%, rgba(255,214,52,0.32) 0%, rgba(255,214,52,0) 60%), radial-gradient(60% 40% at 18% 82%, rgba(30,94,255,0.18) 0%, rgba(30,94,255,0) 70%)",
            display: "flex",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 16, zIndex: 1 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#0E0E0C",
              color: "#F7F5F1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 700,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            H
          </div>
          <div
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: 22,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(14,14,12,0.72)",
              display: "flex",
            }}
          >
            Hyperdome · Logan QLD
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, zIndex: 1 }}>
          <div
            style={{
              fontStyle: "italic",
              fontSize: 104,
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              maxWidth: 1000,
              display: "flex",
            }}
          >
            Professional car wash in Logan QLD.
          </div>
          <div
            style={{
              fontSize: 32,
              color: "rgba(14,14,12,0.7)",
              fontFamily: "system-ui, sans-serif",
              display: "flex",
            }}
          >
            Hand-finished detailing · Same-day bookings · Two locations
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            zIndex: 1,
            fontFamily: "system-ui, sans-serif",
            fontSize: 20,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(14,14,12,0.7)",
          }}
        >
          <div style={{ display: "flex" }}>logancarwash.com.au</div>
          <div style={{ display: "flex" }}>4.9 stars · Hyperdome Shopping Centre</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
