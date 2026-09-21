import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#171717" }}>
        <div style={{ width: 300, height: 360, display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f7f4ee", color: "#171717", padding: "52px 42px", borderRadius: 28, borderLeft: "22px solid #285943" }}>
          <div style={{ fontSize: 58, fontWeight: 900, letterSpacing: "-0.04em" }}>PR</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 104, height: 104, borderRadius: 999, background: "#285943" }}>
            <div style={{ width: 31, height: 58, borderRight: "12px solid white", borderBottom: "12px solid white", transform: "rotate(45deg) translate(-5px, -5px)" }} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "0.12em" }}>RECORD</div>
        </div>
      </div>
    ),
    size,
  );
}
