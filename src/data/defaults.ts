import type { AssetItem, BrandKit, DesignBrief } from "../engine/types";

export const defaultBrand: BrandKit = {
  name: "Neutral Studio",
  mode: "neutral",
  colors: {
    ink: "#101216",
    paper: "#f6f4ef",
    primary: "#1a6f6a",
    secondary: "#e4d049",
    accent: "#d94343",
    danger: "#ef2d2d",
  },
  fonts: {
    display: "Inter, Arial, sans-serif",
    body: "Inter, Arial, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
  },
  rules: [
    "Prioritize one focal object and one dominant message.",
    "Use high contrast; avoid text over busy imagery without a matte.",
    "Do not use generative imagery or AI-made visual assets.",
    "Prefer owned, licensed, or supplier-provided assets for production.",
  ],
};

export const defaultBrief: DesignBrief = {
  platformId: "youtube-thumbnail",
  styleSystem: "creator-impact",
  objective: "Create a high-click graphic that still looks designed, not spammy.",
  audience: "Collectors, shoppers, and social viewers scanning quickly on mobile.",
  headline: "WHAT'S INSIDE?",
  kicker: "NEW DROP",
  subline: "Real assets. Strong composition. No generative imagery.",
  cta: "WATCH NOW",
  tone: "premium",
  assetIds: [],
};

export const sampleAssets: AssetItem[] = [
  {
    id: "sample-product",
    name: "Sample product block",
    kind: "image",
    source: "Built-in placeholder",
    rights: "owned",
    tags: ["product", "placeholder"],
    src:
      "data:image/svg+xml;charset=utf-8," +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1100" viewBox="0 0 900 1100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f7fafc"/><stop offset="1" stop-color="#cfe7e3"/></linearGradient></defs><rect width="900" height="1100" rx="76" fill="url(#g)"/><rect x="95" y="110" width="710" height="880" rx="52" fill="#11151b"/><rect x="135" y="160" width="630" height="410" rx="34" fill="#1a6f6a"/><circle cx="280" cy="310" r="100" fill="#e4d049"/><circle cx="455" cy="310" r="120" fill="#d94343" opacity=".88"/><circle cx="620" cy="310" r="95" fill="#ffffff" opacity=".9"/><text x="450" y="675" text-anchor="middle" font-family="Arial" font-size="72" font-weight="800" fill="#fff">PRODUCT</text><text x="450" y="760" text-anchor="middle" font-family="Arial" font-size="38" font-weight="700" fill="#e4d049">REAL ASSET SLOT</text><rect x="180" y="820" width="540" height="80" rx="40" fill="#fff"/><text x="450" y="873" text-anchor="middle" font-family="Arial" font-size="36" font-weight="800" fill="#11151b">NON-GENERATIVE</text></svg>',
      ),
  },
];
