import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0E0E0C",
          color: "#F7F5F1",
          fontFamily: "system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 22,
          borderRadius: 7,
        }}
      >
        H
      </div>
    ),
    { ...size }
  );
}
