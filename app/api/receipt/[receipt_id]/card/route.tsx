import { ImageResponse } from "next/og";

import { getPublicReceiptByReceiptId } from "@/lib/data/receipts";
import { getReceiptShareData } from "@/lib/share/receipt-share";

type CardRouteContext = { params: Promise<{ receipt_id: string }> };

export async function GET(_request: Request, context: CardRouteContext) {
  const { receipt_id: receiptId } = await context.params;
  const receipt = await getPublicReceiptByReceiptId(receiptId);
  if (!receipt) return Response.json({ error: "receipt_not_found" }, { status: 404 });

  const data = getReceiptShareData(receipt);
  const imageAllocation = data.allocation.startsWith("₦")
    ? `NGN ${data.allocation.slice(1)}`
    : data.allocation;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f7f4ee",
          color: "#171717",
          padding: "64px",
          borderLeft: "18px solid #285943",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px dashed #c8c3b8", paddingBottom: "28px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#285943", letterSpacing: "0.18em" }}>PUBLIC RECEIPT</div>
              <div style={{ marginTop: 12, fontSize: 20, color: "#696969" }}>{data.receiptId}</div>
            </div>
            <div style={{ display: "flex", borderRadius: 999, background: "#e4eee8", color: "#285943", padding: "14px 20px", fontSize: 20, fontWeight: 800 }}>OFFICIAL RECORD</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 38 }}>
            <div style={{ fontSize: 43, lineHeight: 1.1, fontWeight: 700, maxWidth: 1020 }}>{data.title}</div>
            <div style={{ marginTop: 24, fontSize: 25, color: "#696969" }}>{data.location}</div>
            <div style={{ marginTop: 34, fontSize: 64, fontWeight: 800, letterSpacing: "-0.03em" }}>{imageAllocation}</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "2px dashed #c8c3b8", paddingTop: "26px" }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 760 }}>
            <div style={{ fontSize: 16, color: "#696969", letterSpacing: "0.12em" }}>IMPLEMENTATION EVIDENCE</div>
            <div style={{ marginTop: 10, fontSize: 22, fontWeight: 800 }}>{data.evidenceState}</div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#696969" }}>ASK · VERIFY · ACT</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" },
    },
  );
}
