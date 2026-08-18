import { jsPDF } from "jspdf";
import type { DesignVariant } from "../engine/types";
import { variantToSvg } from "../engine/svg";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function downloadText(filename: string, text: string, type = "text/plain;charset=utf-8") {
  downloadBlob(new Blob([text], { type }), filename);
}

export function downloadSvg(variant: DesignVariant) {
  downloadText(`${variant.id}.svg`, variantToSvg(variant), "image/svg+xml;charset=utf-8");
}

export function downloadJson(filename: string, value: unknown) {
  downloadText(filename, JSON.stringify(value, null, 2), "application/json;charset=utf-8");
}

async function variantToCanvas(variant: DesignVariant, matte = "transparent"): Promise<HTMLCanvasElement> {
  const svg = variantToSvg(variant);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.decoding = "async";

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("The SVG could not be rendered for raster export."));
    image.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = variant.platform.width;
  canvas.height = variant.platform.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas export is unavailable in this browser.");
  if (matte !== "transparent") {
    context.fillStyle = matte;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.drawImage(image, 0, 0);
  URL.revokeObjectURL(url);
  return canvas;
}

export async function downloadRaster(variant: DesignVariant, format: "png" | "jpeg") {
  const canvas = await variantToCanvas(variant, format === "jpeg" ? "#ffffff" : "transparent");
  const mime = format === "png" ? "image/png" : "image/jpeg";
  const out = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, format === "jpeg" ? 0.92 : undefined));
  if (!out) throw new Error("Raster export failed. Remote image URLs may need to be uploaded first to avoid browser CORS limits.");
  downloadBlob(out, `${variant.id}.${format === "jpeg" ? "jpg" : "png"}`);
}

export async function downloadPdf(variant: DesignVariant) {
  const canvas = await variantToCanvas(variant, "#ffffff");
  const dataUrl = canvas.toDataURL("image/jpeg", 0.94);
  const orientation = variant.platform.width >= variant.platform.height ? "landscape" : "portrait";
  const pdf = new jsPDF({ orientation, unit: "px", format: [variant.platform.width, variant.platform.height] });
  pdf.addImage(dataUrl, "JPEG", 0, 0, variant.platform.width, variant.platform.height);
  pdf.save(`${variant.id}.pdf`);
}

export function buildContactSheetSvg(variants: DesignVariant[]): string {
  const thumbW = 360;
  const gap = 28;
  const rows = variants.map((variant) => {
    const thumbH = Math.round((variant.platform.height / variant.platform.width) * thumbW);
    return { variant, thumbH };
  });
  const width = thumbW * 2 + gap * 3;
  const height = rows.reduce((total, row, index) => total + row.thumbH + 78 + (index % 2 === 1 ? gap : 0), gap);
  let y = gap;
  let x = gap;

  const items = rows
    .map(({ variant, thumbH }, index) => {
      const svg = variantToSvg(variant).replace("<svg ", `<svg x="${x}" y="${y}" `).replace(/ width="[^"]+"/, ` width="${thumbW}"`).replace(/ height="[^"]+"/, ` height="${thumbH}"`);
      const label = `<text x="${x}" y="${y + thumbH + 32}" font-family="Arial" font-size="18" font-weight="700" fill="#101216">${variant.name}</text><text x="${x}" y="${y + thumbH + 58}" font-family="Arial" font-size="13" fill="#535a63">${variant.platform.name} - ${variant.platform.width}x${variant.platform.height}</text>`;
      if (index % 2 === 0) {
        x += thumbW + gap;
      } else {
        x = gap;
        y += thumbH + 78 + gap;
      }
      return svg + label;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#f6f4ef"/>${items}</svg>`;
}
