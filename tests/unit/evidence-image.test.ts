import sharp from "sharp";
import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMAGE_MAX_BYTES,
  EvidenceImageError,
  processEvidenceImage,
} from "@/lib/evidence/image";
import { createEvidenceStoragePath } from "@/lib/evidence/submit";

function testFile(data: Buffer, name: string, type: string): File {
  return {
    name,
    type,
    size: data.byteLength,
    arrayBuffer: async () => data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength),
  } as File;
}

async function image(format: "jpeg" | "png" | "webp") {
  return sharp({
    create: { width: 24, height: 16, channels: 3, background: "#315f6d" },
  })
    [format]()
    .toBuffer();
}

describe("evidence image processing", () => {
  it.each([
    ["jpeg", "image/jpeg"],
    ["png", "image/png"],
    ["webp", "image/webp"],
  ] as const)("accepts and re-encodes %s", async (format, mimeType) => {
    const result = await processEvidenceImage(
      testFile(await image(format), `citizen-name.${format}`, mimeType),
    );
    expect(result.mimeType).toBe(mimeType);
    expect(result.width).toBe(24);
    expect(result.height).toBe(16);
    expect(result.fileSize).toBeGreaterThan(0);
  });

  it("rejects oversized, unsupported and fake image payloads", async () => {
    await expect(
      processEvidenceImage(
        testFile(Buffer.alloc(EVIDENCE_IMAGE_MAX_BYTES + 1), "large.jpg", "image/jpeg"),
      ),
    ).rejects.toBeInstanceOf(EvidenceImageError);
    await expect(
      processEvidenceImage(testFile(Buffer.from("%PDF-1.7"), "report.pdf", "application/pdf")),
    ).rejects.toBeInstanceOf(EvidenceImageError);
    await expect(
      processEvidenceImage(
        testFile(Buffer.from("#!/bin/sh\necho unsafe"), "unsafe.jpg", "image/jpeg"),
      ),
    ).rejects.toBeInstanceOf(EvidenceImageError);
    await expect(
      processEvidenceImage(
        testFile(Buffer.from("MZ executable"), "unsafe.exe", "application/octet-stream"),
      ),
    ).rejects.toBeInstanceOf(EvidenceImageError);
  });

  it("rejects a declared MIME that does not match the decoded image", async () => {
    await expect(
      processEvidenceImage(testFile(await image("png"), "fake.jpg", "image/jpeg")),
    ).rejects.toBeInstanceOf(EvidenceImageError);
  });

  it("strips embedded metadata through re-encoding", async () => {
    const withMetadata = await sharp({
      create: { width: 20, height: 20, channels: 3, background: "white" },
    })
      .jpeg()
      .withMetadata({ exif: { IFD0: { Artist: "Private reporter" } } })
      .toBuffer();
    expect((await sharp(withMetadata).metadata()).exif).toBeDefined();

    const result = await processEvidenceImage(
      testFile(withMetadata, "private-location.jpg", "image/jpeg"),
    );
    const metadata = await sharp(result.data).metadata();
    expect(metadata.exif).toBeUndefined();
    expect(metadata.icc).toBeUndefined();
    expect(metadata.xmp).toBeUndefined();
  });

  it("does not use a citizen filename in the storage key", () => {
    const path = createEvidenceStoragePath(
      "PR-NG-FCT-2026-000001",
      "jpg",
      "generated-id",
    );
    expect(path).toBe("PR-NG-FCT-2026-000001/generated-id.jpg");
    expect(path).not.toContain("private-location");
  });
});
