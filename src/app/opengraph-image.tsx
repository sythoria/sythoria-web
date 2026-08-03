import { ImageResponse } from "next/og";

export const alt = "Sythoria desktop client and documentation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "92px",
        color: "#f5f5f7",
        background:
          "radial-gradient(circle at 80% 20%, #4f5f9f 0, transparent 42%), #0d0d0f",
      }}
    >
      <div style={{ fontSize: 82, fontWeight: 700, letterSpacing: "-4px" }}>
        Sythoria
      </div>
      <div
        style={{
          marginTop: 24,
          maxWidth: 850,
          fontSize: 34,
          lineHeight: 1.35,
          color: "#c9c9cf",
        }}
      >
        A desktop client for local and hosted language models.
      </div>
      <div style={{ marginTop: 52, fontSize: 22, color: "#aeb9df" }}>
        Download · Documentation · Release notes
      </div>
    </div>,
    size
  );
}
