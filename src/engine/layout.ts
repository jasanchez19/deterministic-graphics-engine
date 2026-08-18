import type { AssetItem, BrandKit, DesignBrief, DesignElement, DesignVariant, PlatformSpec } from "./types";
import { runQualityChecks } from "./qa";
import { readableOn } from "./color";
import { getStyleSystem } from "../data/designIntelligence";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const round = (value: number) => Math.round(value);

function pickAsset(brief: DesignBrief, assets: AssetItem[]): AssetItem | undefined {
  return assets.find((asset) => brief.assetIds.includes(asset.id)) ?? assets[0];
}

function baseScale(platform: PlatformSpec): number {
  return Math.min(platform.width / 1280, platform.height / 720);
}

function text(
  id: string,
  x: number,
  y: number,
  width: number,
  value: string,
  fill: string,
  size: number,
  weight: 400 | 500 | 600 | 700 | 800 | 900,
  family: string,
  align: "start" | "middle" | "end" = "start",
  stroke?: string,
  strokeWidth?: number,
): DesignElement {
  return {
    id,
    type: "text",
    x: round(x),
    y: round(y),
    width: round(width),
    text: value,
    fill,
    size: round(size),
    weight,
    family,
    align,
    transform: "uppercase",
    stroke,
    strokeWidth,
  };
}

function rect(id: string, x: number, y: number, width: number, height: number, fill: string, rx = 0, opacity?: number): DesignElement {
  return { id, type: "rect", x: round(x), y: round(y), width: round(width), height: round(height), fill, rx, opacity };
}

function image(id: string, x: number, y: number, width: number, height: number, src: string, fit: "cover" | "contain" = "contain", rotate?: number): DesignElement {
  return { id, type: "image", x: round(x), y: round(y), width: round(width), height: round(height), src, fit, rotate };
}

function compose(variant: Omit<DesignVariant, "qa">, assets: AssetItem[]): DesignVariant {
  return { ...variant, qa: runQualityChecks(variant, assets) };
}

export function generateVariants(brief: DesignBrief, platform: PlatformSpec, brand: BrandKit, assets: AssetItem[]): DesignVariant[] {
  const asset = pickAsset(brief, assets);
  const style = getStyleSystem(brief.styleSystem);
  const w = platform.width;
  const h = platform.height;
  const s = baseScale(platform);
  const isVertical = h > w * 1.2;
  const isSquare = Math.abs(w - h) < w * 0.1;
  const safeX = platform.safe.left;
  const safeY = platform.safe.top;
  const safeW = w - platform.safe.left - platform.safe.right;
  const safeH = h - platform.safe.top - platform.safe.bottom;
  const src = asset?.src ?? "";
  const display = brand.fonts.display;
  const body = brand.fonts.body;
  const inkOnPrimary = readableOn(brand.colors.primary);
  const inkOnAccent = readableOn(brand.colors.accent);
  const headline = brief.headline || "MAKE IT CLEAR";
  const kicker = brief.kicker || "NEW";
  const subline = brief.subline || brief.objective;
  const cta = brief.cta || "LEARN MORE";
  const strongStroke = brief.styleSystem === "creator-impact" || brief.styleSystem === "stream-overlay";
  const darkBase = brief.styleSystem === "stream-overlay" || brief.styleSystem === "creator-impact";
  const creatorSurface = brief.styleSystem === "creator-impact" && platform.category === "creator";

  const variants: DesignVariant[] = [];

  variants.push(
    compose(
      {
        id: "variant-1",
        name: "Editorial Split",
        strategy: "Dominant real asset with a structured editorial message block.",
        platform,
        elements: [
          rect("bg", 0, 0, w, h, darkBase ? brand.colors.ink : brand.colors.paper),
          rect("left-panel", 0, 0, isVertical ? w : w * 0.48, h, brand.colors.ink),
          rect("depth-band", isVertical ? 0 : w * 0.48, 0, isVertical ? w : w * 0.52, h, brand.colors.paper, 0, 0.94),
          rect("accent-bar", safeX, safeY, clamp(w * 0.13, 96, 240), clamp(10 * s, 8, 18), brand.colors.secondary, 2),
          text("kicker", safeX, safeY + 52 * s, safeW * 0.42, kicker, brand.colors.secondary, 31 * s, 800, body),
          text("headline", safeX, safeY + 138 * s, isVertical ? safeW : safeW * 0.43, headline, "#ffffff", 82 * s, 900, display, "start", strongStroke ? brand.colors.ink : undefined, strongStroke ? 5 * s : undefined),
          text("subline", safeX, safeY + 350 * s, isVertical ? safeW * 0.8 : safeW * 0.38, subline, "#d9dde2", 27 * s, 700, body),
          rect("cta-pill", safeX, h - platform.safe.bottom - 78 * s, clamp(w * 0.22, 210, 360), clamp(56 * s, 46, 78), brand.colors.accent, 6),
          text("cta", safeX + 24 * s, h - platform.safe.bottom - 39 * s, clamp(w * 0.18, 160, 300), cta, inkOnAccent, 26 * s, 900, body),
          rect("asset-matte", isVertical ? w * 0.12 : w * 0.48, isVertical ? h * 0.47 : h * 0.08, isVertical ? w * 0.76 : w * 0.46, isVertical ? h * 0.38 : h * 0.82, "#ffffff", 8),
          image("asset", isVertical ? w * 0.16 : w * 0.52, isVertical ? h * 0.5 : h * 0.12, isVertical ? w * 0.68 : w * 0.38, isVertical ? h * 0.32 : h * 0.74, src),
        ],
      },
      assets,
    ),
  );

  variants.push(
    compose(
      {
        id: "variant-2",
        name: creatorSurface ? "Creator Hero" : "Center Impact",
        strategy: creatorSurface
          ? `Behance/TCG-inspired creator frame: one oversized sourced asset, one large hook, and no collapsed labels. Learned system: ${style.name}.`
          : `Large centered asset, heavy headline, clean campaign framing. Learned system: ${style.name}.`,
        platform,
        elements: creatorSurface
          ? [
              rect("bg", 0, 0, w, h, brand.colors.ink),
              rect("color-field", w * 0.36, 0, w * 0.64, h, brand.colors.primary),
              rect("warm-block", w * 0.47, h * 0.08, w * 0.44, h * 0.8, brand.colors.secondary, 8, 0.98),
              rect("asset-shadow", w * 0.48, h * 0.17, w * 0.43, h * 0.62, "#000000", 8, 0.22),
              rect("asset-matte", w * 0.45, h * 0.11, w * 0.43, h * 0.66, "#ffffff", 8),
              image("asset", w * 0.47, h * 0.12, w * 0.39, h * 0.65, src),
              rect("headline-anchor", safeX - 18 * s, h * 0.32, w * 0.43, h * 0.31, brand.colors.accent, 8),
              text("headline", safeX, h * 0.48, w * 0.39, headline, "#ffffff", 104 * s, 900, display, "start", brand.colors.ink, 7 * s),
              rect("kicker-plate", safeX, safeY + 6 * s, clamp(w * 0.28, 260, 420), clamp(54 * s, 44, 70), brand.colors.paper, 5),
              text("kicker", safeX + 22 * s, safeY + 43 * s, clamp(w * 0.24, 220, 360), kicker, brand.colors.ink, 27 * s, 900, body),
              rect("bottom-rule", safeX, h - platform.safe.bottom - 30 * s, safeW * 0.42, 9 * s, brand.colors.secondary, 2),
            ]
          : [
              rect("bg", 0, 0, w, h, brand.colors.ink),
              rect("top-band", 0, 0, w, h * 0.2, brand.colors.primary),
              rect("bottom-band", 0, h * 0.78, w, h * 0.22, brand.colors.secondary),
              rect("safe-glow-left", -w * 0.08, h * 0.18, w * 0.28, h * 0.6, brand.colors.accent, 8, 0.16),
              rect("safe-glow-right", w * 0.8, h * 0.2, w * 0.25, h * 0.55, brand.colors.primary, 8, 0.22),
              text("kicker", w / 2, safeY + 45 * s, safeW * 0.8, kicker, inkOnPrimary, 30 * s, 900, body, "middle"),
              image("asset", w * (isVertical ? 0.17 : 0.34), h * (isVertical ? 0.25 : 0.16), w * (isVertical ? 0.66 : 0.32), h * (isVertical ? 0.46 : 0.54), src),
              rect("headline-matte", safeX, h * (isVertical ? 0.68 : 0.62), safeW, h * (isVertical ? 0.16 : 0.21), brand.colors.paper, 8),
              text("headline", w / 2, h * (isVertical ? 0.735 : 0.72), safeW * 0.92, headline, brand.colors.ink, 76 * s, 900, display, "middle", "#ffffff", strongStroke ? 4 * s : 0),
              text("cta", w / 2, h - platform.safe.bottom - 28 * s, safeW * 0.56, cta, brand.colors.ink, 27 * s, 900, body, "middle"),
            ],
      },
      assets,
    ),
  );

  variants.push(
    compose(
      {
        id: "variant-3",
        name: "Premium Catalog",
        strategy: "Commerce-grade catalog layout with clear hierarchy and licensing-safe asset placement.",
        platform,
        elements: [
          rect("bg", 0, 0, w, h, "#ffffff"),
          rect("rail", 0, 0, isVertical ? w : w * 0.12, h, brand.colors.primary),
          rect("thin-line", safeX, safeY, safeW, 3 * s, brand.colors.ink),
          text("kicker", safeX, safeY + 50 * s, safeW * 0.5, kicker, brand.colors.primary, 26 * s, 800, body),
          text("headline", safeX, safeY + 145 * s, isVertical ? safeW : safeW * 0.48, headline, brand.colors.ink, 66 * s, 900, display),
          text("subline", safeX, safeY + 310 * s, isVertical ? safeW * 0.75 : safeW * 0.42, subline, "#535a63", 25 * s, 700, body),
          rect("asset-bg", isVertical ? safeX : w * 0.58, isVertical ? h * 0.48 : h * 0.16, isVertical ? safeW : w * 0.32, isVertical ? h * 0.34 : h * 0.66, brand.colors.paper, 6),
          image("asset", isVertical ? safeX + safeW * 0.08 : w * 0.61, isVertical ? h * 0.5 : h * 0.19, isVertical ? safeW * 0.84 : w * 0.26, isVertical ? h * 0.3 : h * 0.6, src),
          rect("cta-rule", safeX, h - platform.safe.bottom - 86 * s, clamp(w * 0.38, 260, 620), 4 * s, brand.colors.accent),
          text("cta", safeX, h - platform.safe.bottom - 35 * s, safeW * 0.42, cta, brand.colors.accent, 28 * s, 900, body),
        ],
      },
      assets,
    ),
  );

  variants.push(
    compose(
      {
        id: "variant-4",
        name: creatorSurface ? "Feed Stopper" : "Social Punch",
        strategy: creatorSurface
          ? `Fast creator composition with poster-scale type, a real-asset payoff, and ruthless label economy from ${style.name}.`
          : `Fast social composition with oversized type, bold color blocking, and thumbnail-safe contrast from ${style.name}.`,
        platform,
        elements: creatorSurface
          ? [
              rect("bg", 0, 0, w, h, brand.colors.secondary),
              rect("left-slab", 0, 0, w * 0.44, h, brand.colors.ink),
              rect("asset-field", w * 0.38, h * 0.08, w * 0.52, h * 0.78, brand.colors.paper, 8),
              rect("asset-rim", w * 0.41, h * 0.11, w * 0.46, h * 0.72, brand.colors.accent, 8),
              image("asset", w * 0.44, h * 0.15, w * 0.4, h * 0.64, src),
              text("headline", safeX, h * 0.28, w * 0.36, headline, "#ffffff", 112 * s, 900, display, "start", brand.colors.accent, 7 * s),
              rect("kicker-rule", safeX, h * 0.63, w * 0.31, 8 * s, brand.colors.secondary, 2),
              text("kicker", safeX, h * 0.7, w * 0.32, kicker, brand.colors.secondary, 31 * s, 900, body),
            ]
          : [
              rect("bg", 0, 0, w, h, brand.colors.secondary),
              rect("corner-a", -w * 0.12, h * 0.08, w * 0.52, h * 0.2, brand.colors.primary, 8, 0.96),
              rect("corner-b", w * 0.58, h * 0.68, w * 0.55, h * 0.22, brand.colors.accent, 8, 0.96),
              image("asset", w * 0.19, h * (isVertical ? 0.26 : 0.17), w * 0.62, h * (isVertical ? 0.38 : 0.52), src),
              text("kicker", safeX, safeY + 48 * s, safeW * 0.7, kicker, brand.colors.ink, 27 * s, 900, body),
              text("headline", w / 2, h * (isVertical ? 0.69 : 0.73), safeW * 0.96, headline, brand.colors.ink, 83 * s, 900, display, "middle", "#ffffff", 5 * s),
              rect("cta-bg", w / 2 - clamp(w * 0.2, 190, 330), h - platform.safe.bottom - 86 * s, clamp(w * 0.4, 380, 660), clamp(58 * s, 46, 82), brand.colors.ink, 6),
              text("cta", w / 2, h - platform.safe.bottom - 45 * s, clamp(w * 0.36, 320, 600), cta, "#ffffff", 27 * s, 900, body, "middle"),
            ],
      },
      assets,
    ),
  );

  variants.push(
    compose(
      {
        id: "variant-5",
        name: brief.styleSystem === "stream-overlay" ? "Overlay System" : "Offer System",
        strategy:
          brief.styleSystem === "stream-overlay"
            ? "Stream package frame system: gameplay well, webcam/chat hierarchy, consistent accent borders."
            : "Scalable product/offers graphic for commerce, ads, and channel posts.",
        platform,
        elements:
          brief.styleSystem === "stream-overlay"
            ? [
                rect("bg", 0, 0, w, h, brand.colors.ink),
                rect("gameplay", safeX, safeY + 88 * s, safeW * 0.66, safeH * 0.72, "#080b10", 8),
                rect("gameplay-stroke", safeX - 5 * s, safeY + 83 * s, safeW * 0.66 + 10 * s, safeH * 0.72 + 10 * s, brand.colors.primary, 8, 0.88),
                rect("gameplay-inner", safeX, safeY + 88 * s, safeW * 0.66, safeH * 0.72, "#080b10", 6),
                rect("webcam", safeX + safeW * 0.7, safeY + 88 * s, safeW * 0.3, safeH * 0.32, "#101216", 8),
                rect("chat", safeX + safeW * 0.7, safeY + safeH * 0.48, safeW * 0.3, safeH * 0.37, "#101216", 8),
                rect("webcam-line", safeX + safeW * 0.7, safeY + 88 * s, safeW * 0.3, 8 * s, brand.colors.secondary, 2),
                rect("chat-line", safeX + safeW * 0.7, safeY + safeH * 0.48, safeW * 0.3, 8 * s, brand.colors.accent, 2),
                image("asset", safeX + safeW * 0.75, safeY + safeH * 0.16, safeW * 0.2, safeH * 0.18, src),
                text("kicker", safeX, safeY + 42 * s, safeW * 0.32, kicker, brand.colors.secondary, 24 * s, 900, body),
                text("headline", w / 2, safeY + 56 * s, safeW * 0.62, headline, "#ffffff", 54 * s, 900, display, "middle", brand.colors.primary, 4 * s),
                text("webcam-label", safeX + safeW * 0.72, safeY + 142 * s, safeW * 0.22, "WEBCAM", "#ffffff", 21 * s, 900, body),
                text("chat-label", safeX + safeW * 0.72, safeY + safeH * 0.56, safeW * 0.22, "LIVE CHAT", "#ffffff", 21 * s, 900, body),
                rect("cta-bg", safeX, h - platform.safe.bottom - 54 * s, safeW, 42 * s, brand.colors.primary, 4),
                text("cta-text", w / 2, h - platform.safe.bottom - 24 * s, safeW * 0.8, cta, inkOnPrimary, 21 * s, 900, body, "middle"),
              ]
            : [
          rect("bg", 0, 0, w, h, brand.colors.paper),
          rect("header", 0, 0, w, Math.max(h * 0.18, 140 * s), brand.colors.accent),
          text("kicker", safeX, safeY + 46 * s, safeW * 0.72, kicker, inkOnAccent, 30 * s, 900, body),
          text("headline", safeX, safeY + 140 * s, safeW * (isSquare ? 0.78 : 0.56), headline, brand.colors.ink, 70 * s, 900, display),
          rect("asset-frame", isVertical ? safeX : w * 0.59, isVertical ? h * 0.39 : h * 0.24, isVertical ? safeW : w * 0.32, isVertical ? h * 0.34 : h * 0.5, "#ffffff", 8),
          image("asset", isVertical ? safeX + safeW * 0.08 : w * 0.62, isVertical ? h * 0.41 : h * 0.27, isVertical ? safeW * 0.84 : w * 0.26, isVertical ? h * 0.3 : h * 0.44, src),
          rect("subline-box", safeX, h - platform.safe.bottom - safeH * 0.26, isVertical ? safeW : safeW * 0.52, safeH * 0.18, brand.colors.ink, 8),
          text("subline", safeX + 28 * s, h - platform.safe.bottom - safeH * 0.18, isVertical ? safeW * 0.8 : safeW * 0.44, subline, "#ffffff", 25 * s, 700, body),
          rect("cta", safeX, h - platform.safe.bottom - 60 * s, clamp(w * 0.25, 230, 420), clamp(48 * s, 42, 72), brand.colors.primary, 5),
          text("cta-text", safeX + 22 * s, h - platform.safe.bottom - 27 * s, clamp(w * 0.2, 180, 350), cta, inkOnPrimary, 24 * s, 900, body),
        ],
      },
      assets,
    ),
  );

  return variants;
}
