export type ChannelCategory =
  | "commerce"
  | "creator"
  | "social"
  | "ads"
  | "print"
  | "utility";

export type PlatformSpec = {
  id: string;
  name: string;
  category: ChannelCategory;
  width: number;
  height: number;
  safe: { top: number; right: number; bottom: number; left: number };
  recommendedFormats: Array<"png" | "jpg" | "pdf" | "mp4">;
  notes: string[];
};

export type AdapterStatus = "ready" | "configured" | "needs_credentials" | "manual_handoff";

export type AdapterDefinition = {
  id: string;
  name: string;
  purpose: string;
  status: AdapterStatus;
  capabilities: string[];
  requiredConfig: string[];
  mvpRole: string;
};

export type AssetItem = {
  id: string;
  name: string;
  src: string;
  kind: "image" | "logo" | "texture" | "screenshot" | "icon";
  source: string;
  rights: "owned" | "licensed" | "supplier" | "public-reference" | "unknown";
  tags: string[];
};

export type BrandKit = {
  name: string;
  mode: "neutral" | "brand";
  colors: {
    ink: string;
    paper: string;
    primary: string;
    secondary: string;
    accent: string;
    danger: string;
  };
  fonts: {
    display: string;
    body: string;
    mono: string;
  };
  rules: string[];
};

export type DesignBrief = {
  platformId: string;
  styleSystem: "creator-impact" | "stream-overlay" | "social-banner" | "commerce-editorial";
  objective: string;
  audience: string;
  headline: string;
  kicker: string;
  subline: string;
  cta: string;
  tone: "premium" | "urgent" | "editorial" | "playful" | "technical" | "minimal";
  assetIds: string[];
};

export type TextWeight = 400 | 500 | 600 | 700 | 800 | 900;

export type DesignElement =
  | {
      id: string;
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      fill: string;
      opacity?: number;
      rx?: number;
      stroke?: string;
      strokeWidth?: number;
      rotate?: number;
    }
  | {
      id: string;
      type: "text";
      x: number;
      y: number;
      width: number;
      text: string;
      fill: string;
      size: number;
      weight: TextWeight;
      family: string;
      align?: "start" | "middle" | "end";
      lineHeight?: number;
      transform?: "uppercase" | "none";
      stroke?: string;
      strokeWidth?: number;
      letterSpacing?: number;
    }
  | {
      id: string;
      type: "image";
      x: number;
      y: number;
      width: number;
      height: number;
      src: string;
      opacity?: number;
      radius?: number;
      fit?: "cover" | "contain";
      rotate?: number;
    }
  | {
      id: string;
      type: "path";
      d: string;
      fill: string;
      opacity?: number;
      stroke?: string;
      strokeWidth?: number;
    };

export type DesignVariant = {
  id: string;
  name: string;
  strategy: string;
  platform: PlatformSpec;
  elements: DesignElement[];
  qa: QualityFinding[];
};

export type QualityFinding = {
  level: "pass" | "warn" | "fail";
  label: string;
  detail: string;
};
