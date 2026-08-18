# Deterministic Graphics Engine

A browser-based production workbench for generating repeatable social graphics, thumbnails, reports, and campaign assets from structured inputs. The engine uses HTML, CSS, SVG, and PDF primitives rather than image-generation models, which keeps layouts inspectable and revisions reproducible.

## Why deterministic rendering

Creative automation breaks down when the same prompt produces a different layout every time. This project treats design as a typed system: canvas rules, text hierarchy, safe zones, visual QA, and export behavior are explicit and testable.

## Features

- React 19 and TypeScript editing workbench
- Structured composition specifications and design-intelligence rules
- Multi-format canvas presets and safe-area guidance
- SVG and PDF-oriented output paths
- Mobile-thumbnail legibility checks
- Reproducible rendering without generative-image dependencies

## Run locally

```bash
npm ci
npm run dev
```

## Verify

```bash
npm run typecheck
npm run build
```

## Architecture

```mermaid
flowchart LR
  Spec[Structured design spec] --> Rules[Layout and QA rules]
  Rules --> Canvas[React render surface]
  Canvas --> Export[SVG / PDF / image export]
```

## License

MIT
