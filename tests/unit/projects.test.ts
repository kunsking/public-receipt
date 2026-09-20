import { describe, expect, it, vi } from "vitest";

import { getProjectByReceiptId, mapProjectRow } from "@/lib/data/projects";

const databaseRow: Parameters<typeof mapProjectRow>[0] = {
  id: "project-id",
  receipt_id: "PR-NG-FCT-2026-000001",
  budget_year: 2026,
  project_code: "ERGP12238012",
  official_title: "CONSTRUCTION OF RURAL ROAD AT PIRI COMMUNITY",
  plain_language_title: null,
  plain_language_description: null,
  amount: "140000000.00",
  currency: "NGN",
  sector: "roads_transport",
  ministry: "Federal Ministry",
  department: null,
  agency: null,
  state: "Federal Capital Territory",
  area_council: "Kwali",
  community: "Piri",
  location_raw: "Piri Community, Kwali",
  location_confidence: "high",
  data_confidence: "high",
  created_at: "2026-09-20T00:00:00.000Z",
  updated_at: "2026-09-20T00:00:00.000Z",
};

describe("project mapping", () => {
  it("maps database fields to the typed domain shape", () => {
    const project = mapProjectRow(databaseRow);
    expect(project.receiptId).toBe("PR-NG-FCT-2026-000001");
    expect(project.amount).toBe(140000000);
    expect(project.areaCouncil).toBe("Kwali");
  });
});

describe("project repository", () => {
  it("retrieves a project by receipt ID", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: databaseRow, error: null });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });
    const client = { from } as unknown as Parameters<typeof getProjectByReceiptId>[1];

    const project = await getProjectByReceiptId("PR-NG-FCT-2026-000001", client);

    expect(from).toHaveBeenCalledWith("projects");
    expect(eq).toHaveBeenCalledWith("receipt_id", "PR-NG-FCT-2026-000001");
    expect(project?.officialTitle).toContain("PIRI COMMUNITY");
  });

  it("returns null when the receipt does not exist", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const client = { from: vi.fn().mockReturnValue({ select }) } as unknown as Parameters<
      typeof getProjectByReceiptId
    >[1];

    await expect(getProjectByReceiptId("PR-NG-FCT-2026-999999", client)).resolves.toBeNull();
  });
});
