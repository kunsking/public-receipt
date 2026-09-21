import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ShareActions } from "@/components/receipt/share-actions";
import { ShareReceiptCard } from "@/components/receipt/share-receipt-card";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("share receipt card", () => {
  it("renders the official record and cautious evidence state", () => {
    render(
      <ShareReceiptCard
        data={{
          receiptId: "PR-NG-FCT-2026-000001",
          title: "Piri community road",
          location: "Piri, Kwali Area Council, FCT",
          allocation: "₦140,000,000",
          evidenceState: "NO VERIFIED IMPLEMENTATION EVIDENCE AVAILABLE",
        }}
      />,
    );

    expect(screen.getByText("OFFICIAL RECORD")).toBeInTheDocument();
    expect(screen.getByText("₦140,000,000")).toBeInTheDocument();
    expect(screen.getByText("NO VERIFIED IMPLEMENTATION EVIDENCE AVAILABLE")).toBeInTheDocument();
    expect(screen.queryByText(/failed project|corruption|stolen funds/i)).not.toBeInTheDocument();
  });

  it("falls back from unavailable native sharing to copying the receipt link", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText }, share: undefined });
    render(<ShareActions receiptId="PR-NG-FCT-2026-000001" title="Piri community road" />);

    fireEvent.click(screen.getByRole("button", { name: "Share" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(
      "http://localhost:3000/receipt/PR-NG-FCT-2026-000001",
    ));
    expect(screen.getByRole("status")).toHaveTextContent("Receipt link copied.");
  });
});
