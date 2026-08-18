import type { DesignElement, DesignVariant } from "./types";

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

function wrapText(text: string, maxWidth: number, size: number, maxLines = 4): string[] {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (!normalized) return [""];

  const maxChars = Math.max(7, Math.floor(maxWidth / (size * 0.56)));
  const words = normalized.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= maxChars) {
      line = candidate;
      continue;
    }

    if (line) lines.push(line);
    line = word.length > maxChars ? word.slice(0, maxChars - 1) + "..." : word;

    if (lines.length === maxLines - 1) break;
  }

  if (line && lines.length < maxLines) lines.push(line);
  return lines;
}

function renderText(element: Extract<DesignElement, { type: "text" }>): string {
  const lineHeight = element.lineHeight ?? element.size * 1.04;
  const lines = wrapText(
    element.transform === "uppercase" ? element.text.toUpperCase() : element.text,
    element.width,
    element.size,
    element.size > 78 ? 3 : 4,
  );
  const anchor = element.align ?? "start";
  const tspans = lines
    .map((line, index) => {
      const dy = index === 0 ? 0 : lineHeight;
      return `<tspan x="${element.x}" dy="${dy}">${escapeXml(line)}</tspan>`;
    })
    .join("");

  const stroke = element.stroke ? ` stroke="${element.stroke}" stroke-width="${element.strokeWidth ?? 0}" paint-order="stroke"` : "";
  return `<text x="${element.x}" y="${element.y}" font-family="${escapeXml(element.family)}" font-size="${element.size}" font-weight="${element.weight}" fill="${element.fill}" text-anchor="${anchor}" letter-spacing="${element.letterSpacing ?? 0}"${stroke}>${tspans}</text>`;
}

function renderElement(element: DesignElement): string {
  const opacity = "opacity" in element && element.opacity !== undefined ? ` opacity="${element.opacity}"` : "";

  if (element.type === "rect") {
    const transform = element.rotate ? ` transform="rotate(${element.rotate} ${element.x + element.width / 2} ${element.y + element.height / 2})"` : "";
    const stroke = element.stroke ? ` stroke="${element.stroke}" stroke-width="${element.strokeWidth ?? 1}"` : "";
    return `<rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" rx="${element.rx ?? 0}" fill="${element.fill}"${opacity}${stroke}${transform}/>`;
  }

  if (element.type === "image") {
    const transform = element.rotate ? ` transform="rotate(${element.rotate} ${element.x + element.width / 2} ${element.y + element.height / 2})"` : "";
    return `<image href="${escapeXml(element.src)}" x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" preserveAspectRatio="${element.fit === "contain" ? "xMidYMid meet" : "xMidYMid slice"}"${opacity}${transform}/>`;
  }

  if (element.type === "path") {
    const stroke = element.stroke ? ` stroke="${element.stroke}" stroke-width="${element.strokeWidth ?? 1}"` : "";
    return `<path d="${element.d}" fill="${element.fill}"${opacity}${stroke}/>`;
  }

  return renderText(element);
}

export function variantToSvg(variant: DesignVariant): string {
  const { width, height } = variant.platform;
  const elements = variant.elements.map(renderElement).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(variant.name)}">
<rect width="${width}" height="${height}" fill="transparent"/>
${elements}
</svg>`;
}
