import { useMemo, useState } from "react";
import { Download, FileJson, FileText, Image as ImageIcon, Layers, MonitorCheck, Palette, Plus, ShieldCheck, Upload } from "lucide-react";
import { adapters } from "./data/adapters";
import { defaultBrand, defaultBrief, sampleAssets } from "./data/defaults";
import { designFindings, getStyleSystem, portfolioGradeQualityGates, portfolioSources, styleSystems } from "./data/designIntelligence";
import { getPlatform, platforms } from "./data/platforms";
import { buildHandoffManifest } from "./adapters/handoff";
import { generateVariants } from "./engine/layout";
import { variantToSvg } from "./engine/svg";
import type { AssetItem, BrandKit, DesignBrief } from "./engine/types";
import { buildContactSheetSvg, downloadJson, downloadPdf, downloadRaster, downloadSvg, downloadText } from "./utils/exporters";
import "./styles.css";

type ColorKey = keyof BrandKit["colors"];

const tones: DesignBrief["tone"][] = ["premium", "urgent", "editorial", "playful", "technical", "minimal"];

function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) {
  return (
    <label className="field">
      <span>{label}</span>
      {multiline ? <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} /> : <input value={value} onChange={(event) => onChange(event.target.value)} />}
    </label>
  );
}

function StatusDot({ level }: { level: "pass" | "warn" | "fail" }) {
  return <span className={`status-dot ${level}`} aria-hidden="true" />;
}

export default function App() {
  const [brief, setBrief] = useState<DesignBrief>(defaultBrief);
  const [brand, setBrand] = useState<BrandKit>(defaultBrand);
  const [assets, setAssets] = useState<AssetItem[]>(sampleAssets);
  const [selected, setSelected] = useState(0);
  const [urlAsset, setUrlAsset] = useState("");
  const [urlRights, setUrlRights] = useState<AssetItem["rights"]>("unknown");
  const platform = getPlatform(brief.platformId);
  const variants = useMemo(() => generateVariants(brief, platform, brand, assets), [brief, platform, brand, assets]);
  const selectedVariant = variants[Math.min(selected, variants.length - 1)];
  const manifest = useMemo(() => buildHandoffManifest(brief, brand, variants, assets), [brief, brand, variants, assets]);
  const activeStyle = getStyleSystem(brief.styleSystem);

  function updateBrief<K extends keyof DesignBrief>(key: K, value: DesignBrief[K]) {
    setBrief((current) => ({ ...current, [key]: value }));
  }

  function updateColor(key: ColorKey, value: string) {
    setBrand((current) => ({ ...current, colors: { ...current.colors, [key]: value } }));
  }

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const loaded = await Promise.all(
      Array.from(files).map(
        (file) =>
          new Promise<AssetItem>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                id: `upload-${crypto.randomUUID()}`,
                name: file.name,
                kind: "image",
                src: String(reader.result),
                source: "Local upload",
                rights: "owned",
                tags: ["uploaded"],
              });
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          }),
      ),
    );
    setAssets((current) => [...loaded, ...current]);
    setBrief((current) => ({ ...current, assetIds: [loaded[0].id] }));
  }

  function loadPartnersSample() {
    const productAsset: AssetItem = {
      id: "partners-prismatic-product",
      name: "Prismatic Evolutions SPC",
      kind: "image",
      src: "/campaigns/partners-prismatic/assets/prismatic-spc.jpg",
      source: "https://product-images.tcgplayer.com/622770.jpg",
      rights: "public-reference",
      tags: ["pokemon", "tcg", "product", "partners-in-hobbies"],
    };
    const channelAsset: AssetItem = {
      id: "partners-in-hobbies-avatar",
      name: "Partners in Hobbies channel image",
      kind: "logo",
      src: "/campaigns/partners-prismatic/assets/partners-avatar.jpg",
      source: "https://www.youtube.com/@partnersinhobbies",
      rights: "owned",
      tags: ["channel", "brand"],
    };
    setAssets([productAsset, channelAsset, ...sampleAssets]);
    setBrand({
      ...defaultBrand,
      name: "Partners in Hobbies",
      colors: {
        ink: "#101216",
        paper: "#f6f4ef",
        primary: "#1a6f6a",
        secondary: "#e4d049",
        accent: "#d94343",
        danger: "#ef2d2d",
      },
    });
    setBrief({
      platformId: "youtube-thumbnail",
      styleSystem: "creator-impact",
      objective: "Create a high-click YouTube thumbnail for opening a Prismatic Evolutions Super-Premium Collection.",
      audience: "Collectors and casual viewers scanning YouTube on mobile.",
      headline: "WHAT'S INSIDE?",
      kicker: "NEW OPENING",
      subline: "Prismatic Evolutions Super-Premium Collection",
      cta: "WATCH NOW",
      tone: "urgent",
      assetIds: [productAsset.id],
    });
    setSelected(0);
  }

  function addUrlAsset() {
    const clean = urlAsset.trim();
    if (!clean) return;
    let hostname = "Remote asset";
    try {
      hostname = new URL(clean).hostname;
    } catch {
      alert("Enter a valid https:// image URL.");
      return;
    }
    const asset: AssetItem = {
      id: `url-${crypto.randomUUID()}`,
      name: hostname,
      kind: "image",
      src: clean,
      source: clean,
      rights: urlRights,
      tags: ["url"],
    };
    setAssets((current) => [asset, ...current]);
    setBrief((current) => ({ ...current, assetIds: [asset.id] }));
    setUrlAsset("");
  }

  async function safeExport(action: () => void | Promise<void>) {
    try {
      await action();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Export failed.");
    }
  }

  return (
    <main className="app-shell">
      <aside className="side-panel">
        <div className="brand-mark">
          <div>
            <p className="eyebrow">Non-generative production workbench</p>
            <h1>Graphics Engine</h1>
          </div>
          <ShieldCheck size={26} aria-hidden="true" />
        </div>

        <section className="panel-section">
          <div className="section-title">
            <Layers size={18} aria-hidden="true" />
            <h2>Brief</h2>
          </div>
          <button className="preset-button" onClick={loadPartnersSample}>
            <ImageIcon size={17} aria-hidden="true" />
            Load Partners sample
          </button>
          <label className="field">
            <span>Output</span>
            <select value={brief.platformId} onChange={(event) => updateBrief("platformId", event.target.value)}>
              {platforms.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <Field label="Objective" value={brief.objective} onChange={(value) => updateBrief("objective", value)} multiline />
          <Field label="Audience" value={brief.audience} onChange={(value) => updateBrief("audience", value)} multiline />
          <Field label="Kicker" value={brief.kicker} onChange={(value) => updateBrief("kicker", value)} />
          <Field label="Headline" value={brief.headline} onChange={(value) => updateBrief("headline", value)} />
          <Field label="Subline" value={brief.subline} onChange={(value) => updateBrief("subline", value)} multiline />
          <Field label="CTA" value={brief.cta} onChange={(value) => updateBrief("cta", value)} />
          <label className="field">
            <span>Tone</span>
            <select value={brief.tone} onChange={(event) => updateBrief("tone", event.target.value as DesignBrief["tone"])}>
              {tones.map((tone) => (
                <option key={tone} value={tone}>
                  {tone}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Design system</span>
            <select value={brief.styleSystem} onChange={(event) => updateBrief("styleSystem", event.target.value as DesignBrief["styleSystem"])}>
              {styleSystems.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.name}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="panel-section">
          <div className="section-title">
            <Palette size={18} aria-hidden="true" />
            <h2>Brand</h2>
          </div>
          <Field label="Kit name" value={brand.name} onChange={(value) => setBrand((current) => ({ ...current, name: value }))} />
          <div className="color-grid">
            {(Object.keys(brand.colors) as ColorKey[]).map((key) => (
              <label className="color-field" key={key}>
                <span>{key}</span>
                <input type="color" value={brand.colors[key]} onChange={(event) => updateColor(key, event.target.value)} />
              </label>
            ))}
          </div>
        </section>
      </aside>

      <section className="workbench">
        <header className="topbar">
          <div>
            <p className="eyebrow">{platform.category} / {platform.width}x{platform.height}</p>
            <h2>{selectedVariant.name}</h2>
            <p className="strategy-line">{activeStyle.name}: {activeStyle.summary}</p>
          </div>
          <div className="topbar-actions">
            <button onClick={() => safeExport(() => downloadSvg(selectedVariant))}>
              <Download size={17} aria-hidden="true" />
              SVG
            </button>
            <button onClick={() => safeExport(() => downloadRaster(selectedVariant, "png"))}>
              <ImageIcon size={17} aria-hidden="true" />
              PNG
            </button>
            <button onClick={() => safeExport(() => downloadRaster(selectedVariant, "jpeg"))}>
              <ImageIcon size={17} aria-hidden="true" />
              JPG
            </button>
            <button onClick={() => safeExport(() => downloadPdf(selectedVariant))}>
              <FileText size={17} aria-hidden="true" />
              PDF
            </button>
          </div>
        </header>

        <div className="preview-stage">
          <div className="artboard" style={{ aspectRatio: `${platform.width} / ${platform.height}` }} dangerouslySetInnerHTML={{ __html: variantToSvg(selectedVariant) }} />
        </div>

        <div className="variant-strip">
          {variants.map((variant, index) => (
            <button className={index === selected ? "thumb active" : "thumb"} key={variant.id} onClick={() => setSelected(index)} aria-label={`Select ${variant.name}`}>
              <span className="thumb-art" aria-hidden="true" dangerouslySetInnerHTML={{ __html: variantToSvg(variant) }} />
              <span>{variant.name}</span>
            </button>
          ))}
        </div>
      </section>

      <aside className="right-panel">
        <section className="panel-section assets">
          <div className="section-title">
            <Upload size={18} aria-hidden="true" />
            <h2>Assets</h2>
          </div>
          <label className="upload-target">
            <Upload size={20} aria-hidden="true" />
            <span>Upload owned assets</span>
            <input type="file" accept="image/*" multiple onChange={(event) => addFiles(event.target.files)} />
          </label>
          <div className="asset-url-row">
            <input placeholder="https://asset-url" value={urlAsset} onChange={(event) => setUrlAsset(event.target.value)} />
            <select value={urlRights} onChange={(event) => setUrlRights(event.target.value as AssetItem["rights"])}>
              <option value="unknown">unknown</option>
              <option value="owned">owned</option>
              <option value="licensed">licensed</option>
              <option value="supplier">supplier</option>
              <option value="public-reference">public ref</option>
            </select>
            <button className="icon-button" onClick={addUrlAsset} aria-label="Add URL asset">
              <Plus size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="asset-list">
            {assets.map((asset) => (
              <button key={asset.id} className={brief.assetIds[0] === asset.id ? "asset-item active" : "asset-item"} onClick={() => updateBrief("assetIds", [asset.id])}>
                <img src={asset.src} alt="" />
                <span>
                  <strong>{asset.name}</strong>
                  <small>{asset.rights}</small>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel-section">
          <div className="section-title">
            <MonitorCheck size={18} aria-hidden="true" />
            <h2>Quality</h2>
          </div>
          <div className="qa-list">
            {selectedVariant.qa.map((finding) => (
              <div className="qa-row" key={finding.label}>
                <StatusDot level={finding.level} />
                <div>
                  <strong>{finding.label}</strong>
                  <p>{finding.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel-section">
          <div className="section-title">
            <FileJson size={18} aria-hidden="true" />
            <h2>Adapters</h2>
          </div>
          <div className="adapter-list">
            {adapters.map((adapter) => (
              <div className="adapter-row" key={adapter.id}>
                <strong>{adapter.name}</strong>
                <span>{adapter.status.replaceAll("_", " ")}</span>
              </div>
            ))}
          </div>
          <div className="export-grid">
            <button onClick={() => safeExport(() => downloadJson("graphics-engine-handoff.json", manifest))}>
              <FileJson size={17} aria-hidden="true" />
              Manifest
            </button>
            <button onClick={() => safeExport(() => downloadText("graphics-engine-contact-sheet.svg", buildContactSheetSvg(variants), "image/svg+xml;charset=utf-8"))}>
              <Layers size={17} aria-hidden="true" />
              Contact sheet
            </button>
          </div>
        </section>

        <section className="panel-section">
          <div className="section-title">
            <Palette size={18} aria-hidden="true" />
            <h2>Design Intelligence</h2>
          </div>
          <div className="learning-card">
            <strong>{activeStyle.name}</strong>
            <p>{activeStyle.summary}</p>
            <small>{activeStyle.accentBehavior}</small>
          </div>
          <div className="rule-list">
            {activeStyle.rules.map((rule) => (
              <span key={rule}>{rule}</span>
            ))}
          </div>
          <details className="research-notes" open>
            <summary>Portfolio-grade gates</summary>
            <ul>
              {portfolioGradeQualityGates.map((gate) => (
                <li key={gate.id}>{gate.rule}</li>
              ))}
            </ul>
          </details>
          <details className="research-notes">
            <summary>Portfolio rules learned</summary>
            <ul>
              {designFindings.map((finding) => (
                <li key={finding}>{finding}</li>
              ))}
            </ul>
          </details>
          <details className="research-notes">
            <summary>Reference set</summary>
            <ul>
              {portfolioSources.map((source) => (
                <li key={source}>{source}</li>
              ))}
            </ul>
          </details>
        </section>
      </aside>
    </main>
  );
}
