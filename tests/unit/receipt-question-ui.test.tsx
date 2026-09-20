import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ReceiptQuestion } from "@/components/ai/receipt-question";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("receipt question UI", () => {
  it("renders a labelled, receipt-scoped question form", () => {
    render(<ReceiptQuestion receiptId="PR-NG-FCT-2026-000001" />);

    expect(screen.getByRole("heading", { name: "Ask about this receipt" })).toBeInTheDocument();
    expect(screen.getByLabelText("Your question")).toHaveAttribute("maxlength", "300");
    expect(screen.getByPlaceholderText("Ask about this project…")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "How much was budgeted?" })).toBeInTheDocument();
  });

  it("renders a structured answer, basis, caveat and source action", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        state: "supported",
        answer: "The 2026 federal budget record lists ₦140,000,000 for this project.",
        basis: [{ type: "official_record", label: "2026 federal budget record" }],
        caveat: "Budgeted ≠ Released ≠ Spent ≠ Completed.",
        sourceRequired: true,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<ReceiptQuestion receiptId="PR-NG-FCT-2026-000001" />);
    fireEvent.click(screen.getByRole("button", { name: "How much was budgeted?" }));

    await waitFor(() => expect(screen.getByTestId("trusted-answer")).toBeInTheDocument());
    expect(screen.getByText("SUPPORTED BY OFFICIAL RECORD")).toBeInTheDocument();
    expect(screen.getByText("₦140,000,000", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("2026 federal budget record")).toBeInTheDocument();
    expect(screen.getByText("Budgeted ≠ Released ≠ Spent ≠ Completed.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View official source/ })).toHaveAttribute(
      "href",
      "/receipt/PR-NG-FCT-2026-000001/source",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/receipt/PR-NG-FCT-2026-000001/ask",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("shows the graceful unavailable state without removing the receipt interface", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "answer_unavailable" }),
      }),
    );

    render(<ReceiptQuestion receiptId="PR-NG-FCT-2026-000001" />);
    fireEvent.change(screen.getByLabelText("Your question"), {
      target: { value: "Compare this with all projects nationally" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Check this receipt" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Public Receipt couldn't answer that safely right now",
      );
    });
    expect(screen.getByRole("heading", { name: "Ask about this receipt" })).toBeInTheDocument();
  });
});
