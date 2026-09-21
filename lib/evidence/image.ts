import sharp from "sharp";

export const EVIDENCE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const EVIDENCE_IMAGE_MAX_DIMENSION = 2400;

const FORMAT_CONFIGURATION = {
  jpeg: { mimeType: "image/jpeg", extension: "jpg" },
  png: { mimeType: "image/png", extension: "png" },
  webp: { mimeType: "image/webp", extension: "webp" },
} as const;

export class EvidenceImageError extends Error {
  constructor() {
    super("The uploaded image is invalid");
    this.name = "EvidenceImageError";
  }
}

export interface ProcessedEvidenceImage {
  data: Buffer;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  extension: "jpg" | "png" | "webp";
  width: number;
  height: number;
  fileSize: number;
}

export async function processEvidenceImage(file: File): Promise<ProcessedEvidenceImage> {
  if (file.size < 1 || file.size > EVIDENCE_IMAGE_MAX_BYTES) {
    throw new EvidenceImageError();
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new EvidenceImageError();
  }

  try {
    const input = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(input, { failOn: "error", limitInputPixels: 40_000_000 }).metadata();
    const format = metadata.format as keyof typeof FORMAT_CONFIGURATION | undefined;
    const configuration = format ? FORMAT_CONFIGURATION[format] : undefined;

    if (!configuration || configuration.mimeType !== file.type) {
      throw new EvidenceImageError();
    }

    let pipeline = sharp(input, { failOn: "error", limitInputPixels: 40_000_000 })
      .rotate()
      .resize({
        width: EVIDENCE_IMAGE_MAX_DIMENSION,
        height: EVIDENCE_IMAGE_MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      });

    if (format === "jpeg") pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true });
    if (format === "png") pipeline = pipeline.png({ compressionLevel: 9 });
    if (format === "webp") pipeline = pipeline.webp({ quality: 82 });

    const result = await pipeline.toBuffer({ resolveWithObject: true });
    if (
      !result.info.width ||
      !result.info.height ||
      result.data.byteLength > EVIDENCE_IMAGE_MAX_BYTES
    ) {
      throw new EvidenceImageError();
    }

    return {
      data: result.data,
      mimeType: configuration.mimeType,
      extension: configuration.extension,
      width: result.info.width,
      height: result.info.height,
      fileSize: result.data.byteLength,
    };
  } catch (error) {
    if (error instanceof EvidenceImageError) throw error;
    throw new EvidenceImageError();
  }
}
