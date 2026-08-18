import { adapters } from "../data/adapters";
import type { AssetItem, BrandKit, DesignBrief, DesignVariant } from "../engine/types";
import { variantToSvg } from "../engine/svg";

export type HandoffManifest = {
  generatedAt: string;
  engine: string;
  nonGenerative: true;
  brief: DesignBrief;
  brand: BrandKit;
  variants: Array<{
    id: string;
    name: string;
    strategy: string;
    platform: {
      id: string;
      name: string;
      width: number;
      height: number;
      safe: DesignVariant["platform"]["safe"];
      recommendedFormats: DesignVariant["platform"]["recommendedFormats"];
    };
    svg: string;
    qa: DesignVariant["qa"];
  }>;
  assets: Array<Pick<AssetItem, "id" | "name" | "kind" | "source" | "rights" | "tags">>;
  adapters: typeof adapters;
  notes: string[];
};

export function buildHandoffManifest(brief: DesignBrief, brand: BrandKit, variants: DesignVariant[], assets: AssetItem[]): HandoffManifest {
  return {
    generatedAt: new Date().toISOString(),
    engine: "Graphics Engine deterministic renderer",
    nonGenerative: true,
    brief,
    brand,
    variants: variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      strategy: variant.strategy,
      platform: {
        id: variant.platform.id,
        name: variant.platform.name,
        width: variant.platform.width,
        height: variant.platform.height,
        safe: variant.platform.safe,
        recommendedFormats: variant.platform.recommendedFormats,
      },
      svg: variantToSvg(variant),
      qa: variant.qa,
    })),
    assets: assets.map(({ id, name, kind, source, rights, tags }) => ({ id, name, kind, source, rights, tags })),
    adapters,
    notes: [
      "No generative AI imagery or Canva Magic Design is used.",
      "Canva/Figma handoff is SVG/JSON-first; live pushing requires credentials and explicit approval.",
      "Production use should prefer owned, licensed, or supplier-provided assets.",
    ],
  };
}
