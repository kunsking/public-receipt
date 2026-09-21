import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AddEvidenceFlow } from "@/components/evidence/add-evidence-flow";
import { EvidenceTimeline } from "@/components/evidence/evidence-timeline";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("community evidence submission UI", () => {
  it("reviews and confirms a text-only unverified report", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        accepted: true,
        state: {
          verificationStatus: "community_report",
          moderationStatus: "pending",
          publicVisibility: false,
        },
      }),
    }));
    vi.stubGlobal("scrollTo", vi.fn());

    render(
      <AddEvidenceFlow
        defaultAreaCouncil="Kwali"
        projectTitle="Piri community road"
        receiptId="PR-NG-FCT-2026-000001"
      />,
    );

    fireEvent.click(screen.getByLabelText("Work appears incomplete"));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.change(screen.getByLabelText(/Tell us what you observed/), {
      target: { value: "Walls are standing." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.change(screen.getByLabelText(/Locality/), { target: { value: "Piri" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByText(/Review your submission/i)).toBeInTheDocument();
    expect(screen.getByText("COMMUNITY REPORTED")).toBeInTheDocument();
    expect(screen.getByText("UNVERIFIED")).toBeInTheDocument();
    fireEvent.click(
      screen.getByLabelText(
        "I understand that this is a community report and is not automatically verified.",
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "Submit Evidence" }));

    await waitFor(() => expect(screen.getByTestId("evidence-confirmation")).toBeVisible());
    expect(screen.getByText("Evidence received")).toBeInTheDocument();
    expect(screen.getByText("PENDING REVIEW")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Receipt" })).toHaveAttribute(
      "href",
      "/receipt/PR-NG-FCT-2026-000001",
    );
  });

  it("requires an observation before progressing", () => {
    render(
      <AddEvidenceFlow
        defaultAreaCouncil="Kwali"
        projectTitle="Piri community road"
        receiptId="PR-NG-FCT-2026-000001"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Choose what you observed before continuing.",
    );
  });
});

describe("public evidence timeline UI", () => {
  it("shows the trust-preserving empty state", () => {
    render(<EvidenceTimeline evidence={[]} />);
    expect(screen.getByText("No public community evidence yet")).toBeInTheDocument();
    expect(screen.getByText(/appear here only when they meet/)).toBeInTheDocument();
  });

  it("renders an approved community report without private fields", () => {
    render(
      <EvidenceTimeline
        evidence={[
          {
            observationType: "work_started",
            description: "Foundation work is visible.",
            areaCouncil: "Kwali",
            locality: "Piri",
            verificationStatus: "community_report",
            submittedAt: "2026-09-21T12:00:00Z",
            imageUrl: null,
            imageWidth: null,
            imageHeight: null,
          },
        ]}
      />,
    );
    expect(screen.getByText("COMMUNITY REPORTED")).toBeInTheDocument();
    expect(screen.getByText("UNVERIFIED")).toBeInTheDocument();
    expect(screen.getByText("Piri, Kwali")).toBeInTheDocument();
    expect(screen.getByText(/not been independently verified/)).toBeInTheDocument();
  });
});
