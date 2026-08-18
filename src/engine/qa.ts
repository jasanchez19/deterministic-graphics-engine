import type { AssetItem, DesignElement, DesignVariant, PlatformSpec, QualityFinding } from "./types";
import { contrastRatio } from "./color";

type RectLike = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function estimatedTextHeight(element: Extract<DesignElement, { type: "text" }>): number {
  const lineHeight = element.lineHeight ?? element.size * 1.04;
  const estimatedLines = Math.max(1, Math.ceil(element.text.length / Math.max(8, element.width / (element.size * 0.56))));
  return lineHeight * estimatedLines;
}

function insideSafeZone(element: DesignElement, platform: PlatformSpec): boolean {
  if (element.type !== "text") return true;
  const estimatedHeight = estimatedTextHeight(element);
  return (
    element.x >= platform.safe.left &&
    element.y >= platform.safe.top &&
    element.x + element.width <= platform.width - platform.safe.right &&
    element.y + estimatedHeight <= platform.height - platform.safe.bottom
  );
}

function area(element: RectLike): number {
  return Math.max(0, element.width) * Math.max(0, element.height);
}

function wordCount(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function containsPoint(rect: RectLike, x: number, y: number): boolean {
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}

function likelyTextBackground(
  element: Extract<DesignElement, { type: "text" }>,
  previousElements: DesignElement[],
): Extract<DesignElement, { type: "rect" }> | undefined {
  const centerX = element.x + element.width / 2;
  const centerY = element.y + estimatedTextHeight(element) / 2;
  return previousElements
    .filter((candidate): candidate is Extract<DesignElement, { type: "rect" }> => candidate.type === "rect")
    .reverse()
    .find((candidate) => containsPoint(candidate, centerX, centerY) || (candidate.x <= element.x && candidate.y <= element.y));
}

function distinctFills(elements: DesignElement[]): Set<string> {
  const fills = new Set<string>();
  for (const element of elements) {
    if ("fill" in element && element.fill.startsWith("#")) fills.add(element.fill.toLowerCase());
  }
  return fills;
}

function statusScore(findings: QualityFinding[]): number {
  return findings.reduce((score, finding) => {
    if (finding.level === "pass") return score + 1;
    if (finding.level === "warn") return score + 0.45;
    return score;
  }, 0);
}

export function runQualityChecks(variant: Omit<DesignVariant, "qa">, assets: AssetItem[]): QualityFinding[] {
  const findings: QualityFinding[] = [];
  const textElements = variant.elements.filter((element): element is Extract<DesignElement, { type: "text" }> => element.type === "text");
  const imageElements = variant.elements.filter((element): element is Extract<DesignElement, { type: "image" }> => element.type === "image");
  const rectElements = variant.elements.filter((element): element is Extract<DesignElement, { type: "rect" }> => element.type === "rect");
  const canvasArea = variant.platform.width * variant.platform.height;
  const creatorSurface = variant.platform.category === "creator";

  const textSizes = textElements.map((element) => element.size).sort((a, b) => b - a);
  const largestText = textSizes[0] ?? 0;
  const secondLargestText = textSizes[1] ?? 0;
  const minReadable = creatorSurface
    ? Math.max(54, Math.min(92, variant.platform.width * 0.058))
    : Math.max(28, Math.min(62, variant.platform.width * 0.034));
  findings.push(
    largestText >= minReadable
      ? { level: "pass", label: "Mobile Readability", detail: `Primary type is ${Math.round(largestText)}px for ${variant.platform.name}.` }
      : { level: "warn", label: "Mobile Readability", detail: "Primary type is not large enough for fast mobile scanning." },
  );

  const hierarchyRatio = secondLargestText > 0 ? largestText / secondLargestText : largestText > 0 ? 2 : 0;
  findings.push(
    hierarchyRatio >= 1.32
      ? { level: "pass", label: "Type Hierarchy", detail: `Primary type is ${hierarchyRatio.toFixed(1)}x the next text tier.` }
      : { level: "warn", label: "Type Hierarchy", detail: "The headline and secondary text are too close in size; portfolio work needs a clearer lead." },
  );

  const smallText = textElements.filter((element) => element.size < (creatorSurface ? 25 : 18));
  findings.push(
    smallText.length === 0
      ? { level: "pass", label: "Small Text Hygiene", detail: "No critical micro-labels are likely to collapse in previews." }
      : { level: "warn", label: "Small Text Hygiene", detail: `${smallText.length} text block may disappear at feed or thumbnail size.` },
  );

  const unsafeText = textElements.filter((element) => !insideSafeZone(element, variant.platform));
  findings.push(
    unsafeText.length === 0
      ? { level: "pass", label: "Safe Zone", detail: "Text stays inside the platform safe area." }
      : { level: "warn", label: "Safe Zone", detail: `${unsafeText.length} text block may collide with platform UI or crop zones.` },
  );

  const largestImageShare = Math.max(...imageElements.map((element) => area(element) / canvasArea), 0);
  const minImageShare = creatorSurface ? 0.24 : 0.16;
  findings.push(
    largestImageShare >= minImageShare && largestImageShare <= 0.72
      ? { level: "pass", label: "Focal Dominance", detail: `Largest real asset occupies ${Math.round(largestImageShare * 100)}% of the canvas.` }
      : largestImageShare > 0.72
        ? { level: "warn", label: "Focal Dominance", detail: "The focal asset may crowd the composition; leave enough room for type and framing." }
        : { level: "warn", label: "Focal Dominance", detail: "The main asset is too small for Behance-grade creator/social impact." },
  );

  const likelyHeadline = textElements.reduce<Extract<DesignElement, { type: "text" }> | undefined>(
    (current, element) => (!current || element.size > current.size ? element : current),
    undefined,
  );
  const hookWords = likelyHeadline ? wordCount(likelyHeadline.text) : 0;
  findings.push(
    !creatorSurface || hookWords <= 4
      ? { level: "pass", label: "Hook Economy", detail: creatorSurface ? `Primary hook is ${hookWords} word${hookWords === 1 ? "" : "s"}.` : "Copy length fits the selected platform." }
      : { level: "warn", label: "Hook Economy", detail: "Creator thumbnails should carry one short hook, not a sentence." },
  );

  const knownAssets = new Set(assets.map((asset) => asset.src));
  const usedAssetRecords = imageElements
    .map((element) => assets.find((asset) => knownAssets.has(element.src) && asset.src === element.src))
    .filter((asset): asset is AssetItem => Boolean(asset));
  const unknownAssets = usedAssetRecords.filter((asset) => asset.rights === "unknown");
  const publicReferenceAssets = usedAssetRecords.filter((asset) => asset.rights === "public-reference");
  findings.push(
    unknownAssets.length === 0
      ? publicReferenceAssets.length === 0
        ? { level: "pass", label: "Asset Rights", detail: "Used imagery is marked owned, licensed, or supplier-provided." }
        : { level: "warn", label: "Asset Rights", detail: `Public-reference assets need source review before final publication: ${publicReferenceAssets.map((asset) => asset.name).join(", ")}.` }
      : { level: "fail", label: "Asset Rights", detail: `Do not export production art with unknown-rights imagery: ${unknownAssets.map((asset) => asset.name).join(", ")}.` },
  );

  const weakContrast = textElements.slice(0, 5).filter((element) => {
    const elementIndex = variant.elements.indexOf(element);
    const likelyBg = likelyTextBackground(element, variant.elements.slice(0, elementIndex));
    return likelyBg ? contrastRatio(element.fill, likelyBg.fill) < 3.8 : false;
  });
  findings.push(
    weakContrast.length === 0
      ? { level: "pass", label: "Contrast", detail: "Key text passes the internal contrast heuristic." }
      : { level: "warn", label: "Contrast", detail: "One or more text blocks may need stronger contrast against its immediate background." },
  );

  const hasDepth = rectElements.length >= 3 && imageElements.length > 0 && textElements.length > 0;
  findings.push(
    hasDepth
      ? { level: "pass", label: "Layered Composition", detail: "Layout includes background structure, real asset, type, and foreground accents." }
      : { level: "warn", label: "Layered Composition", detail: "Portfolio-grade output needs intentional depth, not a flat asset-and-label stack." },
  );

  const fillCount = distinctFills(variant.elements).size;
  findings.push(
    fillCount <= 7
      ? { level: "pass", label: "Palette Discipline", detail: `${fillCount} distinct solid fills detected.` }
      : { level: "warn", label: "Palette Discipline", detail: "Too many unrelated fills can make the composition feel template-like instead of art-directed." },
  );

  findings.push(
    imageElements.length > 0
      ? { level: "pass", label: "Non-Generative Asset Use", detail: "Composition uses placed supplied/reference assets and deterministic vector geometry." }
      : { level: "warn", label: "Non-Generative Asset Use", detail: "Add a product, logo, screenshot, or owned asset so the output is not generic decoration." },
  );

  const score = Math.round((statusScore(findings) / findings.length) * 100);
  const hardFails = findings.filter((finding) => finding.level === "fail").length;
  return [
    {
      level: hardFails > 0 ? "fail" : score >= 86 ? "pass" : "warn",
      label: "Portfolio Score",
      detail: `${score}/100 against Behance-informed production gates: focal story, mobile type, hierarchy, real assets, rights, contrast, layering, and palette discipline.`,
    },
    ...findings,
  ];
}
