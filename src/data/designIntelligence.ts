import type { DesignBrief } from "../engine/types";

export type StyleSystem = {
  id: DesignBrief["styleSystem"];
  name: string;
  summary: string;
  rules: string[];
  accentBehavior: string;
};

export const portfolioSources = [
  "Behance search: YouTube thumbnail portfolios",
  "Behance search: social media design portfolios",
  "Behance search: Twitch / YouTube overlay systems",
  "Behance search: poster typography campaign portfolios",
  "FREE NEON STREAM OVERLAY FOR TWITCH AND YOUTUBE by Michail Brauz",
  "Clean Animated Stream Overlay by Fun Founder Designs",
  "Yellow and Orange Animated Stream Overlay Pack by Fun Founder Designs",
  "YouTube banner / cover / channel art and logo by Nurul Alam",
  "Banner cover for YouTube, Twitch, LinkedIn and Facebook by Nurul Alam",
  "Observed product-opening creator patterns across current YouTube search results",
];

export const designFindings = [
  "Use one dominant message and one dominant asset; secondary labels stay subordinate.",
  "Primary text must survive a 25% thumbnail preview: all caps, heavy weight, strong contrast, minimal words.",
  "Creator and stream designs work best with dark foundations, controlled glow, and saturated accents on borders, dividers, and CTA areas.",
  "Strong social banners use panoramic balance: center identity, edge assets, low-contrast background type or texture, and strict safe-zone discipline.",
  "Overlay systems need consistent panel grammar: gameplay largest, webcam/chat secondary, labels small but standardized, and content areas left clean.",
  "Use depth in layers: background tone, broad geometry, asset matte/rim, foreground type, then small accent marks.",
  "Avoid more than 3 accent colors, tiny critical text, mixed visual styles, or busy texture behind key words.",
  "Product-focused creator thumbnails favor one oversized product/card focal point, one emotional face anchor, a 1-2 word payoff/question, thick foreground separation, and saturated comic color blocking.",
  "Product-focused thumbnails should fail QA if the host reaction is tiny, if the product is not the dominant object, if the hook needs more than 2 words to understand, if a duo channel drops one host without a deliberate reason, or if any secondary label is unreadable at 160x90.",
  "Behance-grade portfolios show complete systems, not isolated decoration: repeatable spacing, type scale, color roles, focal ratio, export discipline, and consistent source asset treatment.",
  "High-performing thumbnail portfolios avoid decorative clutter around the main story; arrows, labels, stickers, and bursts only survive when they clarify the payoff at mobile size.",
  "Campaign/poster portfolios use confident negative space and large scale jumps; the engine should flag layouts where all elements feel similar in size or importance.",
];

export const portfolioGradeQualityGates = [
  {
    id: "single-focal-story",
    rule: "Every export must have one instantly readable focal story: dominant asset, dominant headline, and no competing tertiary claims.",
  },
  {
    id: "mobile-first-type",
    rule: "Primary type must remain readable in feed previews; creator thumbnails need oversized type and secondary labels must be removed if they collapse.",
  },
  {
    id: "strong-hierarchy-ratio",
    rule: "The largest type/asset tier should clearly outrank the second tier; flat hierarchy is treated as a QA warning.",
  },
  {
    id: "real-assets-only",
    rule: "Use supplied, owned, licensed, supplier, or sourced reference assets with deterministic SVG/CSS/canvas geometry. Do not use generative image output.",
  },
  {
    id: "intentional-layering",
    rule: "Portfolio-grade compositions need background structure, focal asset, type, foreground separation, and a controlled accent system.",
  },
  {
    id: "palette-discipline",
    rule: "Keep colors role-based and limited. Avoid random fills, generic glows, and decoration that reads as template filler.",
  },
  {
    id: "export-qa",
    rule: "Final production handoff should include platform-size export, contact sheet/manifest, and a QA pass for rights, contrast, crop, and mobile readability.",
  },
];

export const creatorThumbnailQualityGates = [
  {
    id: "product-dominance",
    rule: "For product-opening videos, the real product/card/box must occupy roughly 45-65% of the frame and be instantly identifiable at 160x90.",
  },
  {
    id: "reaction-anchor",
    rule: "Use one large real face/reaction anchor, not small host context. The expression must remain recognizable at 160x90.",
  },
  {
    id: "duo-channel-presence",
    rule: "For duo-led channels, keep both hosts visible unless the brief deliberately calls for a single-host thumbnail; at least one host should be large enough to carry emotion.",
  },
  {
    id: "hook-discipline",
    rule: "Use one hook of 1-2 words plus punctuation. Remove secondary labels unless they are still readable at 160x90.",
  },
  {
    id: "authentic-assets",
    rule: "Use real product and creator assets. Avoid generic synthetic-looking bursts, arrows, or decorative stickers unless they are minimal and clearly graphic, not AI-like.",
  },
  {
    id: "mobile-preview",
    rule: "Every final YouTube thumbnail export must include a 160x90 mobile preview and manual QA against product clarity, hook readability, face recognizability, and unreadable-label removal.",
  },
];

export const styleSystems: StyleSystem[] = [
  {
    id: "creator-impact",
    name: "Creator Impact",
    summary: "High-click YouTube/social composition with one huge real asset, one short hook, and feed-scale contrast.",
    accentBehavior: "Accent color appears as separation, outline, or one payoff marker; CTAs are suppressed unless the platform actually needs them.",
    rules: ["1-4 word headline", "one oversized focal asset", "visible face or payoff anchor", "160x90 readability", "no unreadable labels"],
  },
  {
    id: "stream-overlay",
    name: "Stream Overlay",
    summary: "Twitch/YouTube stream package logic with framed panels, dark content wells, and unified border styling.",
    accentBehavior: "Accent color becomes frame stroke, glow surrogate, labels, and panel dividers.",
    rules: ["largest gameplay panel", "consistent panel borders", "dark empty content areas", "small labels only as metadata"],
  },
  {
    id: "social-banner",
    name: "Social Banner",
    summary: "Portfolio-led social system with restrained copy, repeatable spacing, and polished brand/asset treatment.",
    accentBehavior: "Accent color anchors edge marks, social strip, and low-volume emphasis, not random decoration.",
    rules: ["center-safe identity", "edge-balanced assets", "wide negative space", "strict type scale"],
  },
  {
    id: "commerce-editorial",
    name: "Commerce Editorial",
    summary: "Premium promotional layout for Shopify, ads, and product launches with product clarity and campaign-grade restraint.",
    accentBehavior: "Accent color is used sparingly for offer markers, proof points, and CTA affordance.",
    rules: ["product clarity first", "price/CTA system-ready", "clean matte", "portfolio spacing"],
  },
];

export function getStyleSystem(id: DesignBrief["styleSystem"]): StyleSystem {
  return styleSystems.find((style) => style.id === id) ?? styleSystems[0];
}
