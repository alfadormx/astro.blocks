# Changelog

## 0.3.0 — 2026-11-26

### Features

- **Layout:** add a head slot ([1ccb75e](https://github.com/alfadormx/astro.blocks/commit/1ccb75e92ba0c74b457adb808bc417f11074238d))
- **Header:** add a languageToggle in the right zone ([06bdfad](https://github.com/alfadormx/astro.blocks/commit/06bdfad68756561ca24e2c5b7008cee9f3925908))
- **blocks:** render titles and short copy as inline rich text ([f0d3742](https://github.com/alfadormx/astro.blocks/commit/f0d3742dd42258bfef43a52021f6637241f6b182))

### Fixes

- **integration:** silence astro-icon when a site has no src/icons ([3dca54a](https://github.com/alfadormx/astro.blocks/commit/3dca54a9a942092c99d1a8270c7fff7818dd06a8))
- **blocks:** safelist sidebar grid ratios at every breakpoint ([a66450a](https://github.com/alfadormx/astro.blocks/commit/a66450a8f34d9df4e7c31d1fadef004823a7372b))
- **Footer:** use the muted token and drop the footnote margin ([e5e2aa7](https://github.com/alfadormx/astro.blocks/commit/e5e2aa799b7c1cb09dc25244af774aab5fbe2892))
- **integration:** pre-bundle leaflet for installed sites ([e413592](https://github.com/alfadormx/astro.blocks/commit/e413592ed772912ae0fb51c84b27a24594c9338d))
- **blocks:** render icon links once and keep og:image fields ([bbdcdf0](https://github.com/alfadormx/astro.blocks/commit/bbdcdf069df1830e8280af2c7ae91a060084b733))
  Metadata now renders the icon links. A custom layout that renders `<Favicons />` next to `<Metadata>` gets each icon twice: drop `<Favicons />`.
- **Item:** let mediaClass size an image ([bab8e40](https://github.com/alfadormx/astro.blocks/commit/bab8e405a5cff21bfcb6bd4004467bed32acb693))
- **ContentCarousel:** render the default slot once ([e166caf](https://github.com/alfadormx/astro.blocks/commit/e166caf0d4b8cfa151642c410ca144bdd051abf9))
- **blocks:** let Header and Footer take logo={false} ([cf2f80b](https://github.com/alfadormx/astro.blocks/commit/cf2f80b86d0c046bcc6c0e4769375e876b89c352))
- **Container:** keep air padding inside minHeight ([b4ba8bf](https://github.com/alfadormx/astro.blocks/commit/b4ba8bfa12821af13e4435c72bf2df1f5fdfe490))

## 0.2.0 — 2026-11-26

### Features

- **Background:** add alt for meaningful background images ([37831ee](https://github.com/alfadormx/astro.blocks/commit/37831ee22ecad43ef7a554ed2e5b64bbabc60079))
- **CallToAction:** add plain surface for full-bleed backgrounds ([42d4f27](https://github.com/alfadormx/astro.blocks/commit/42d4f273737b1a6780cfec3a2238c205e6c41dcf))
- **Hero:** add contentPosition for bottom-aligned copy ([a062a79](https://github.com/alfadormx/astro.blocks/commit/a062a795804c71eff93f6173f0aeeb0d01bb9858))

### Fixes

- **Hero:** let a consumer overlayClass replace the default wash ([4e79706](https://github.com/alfadormx/astro.blocks/commit/4e797061fe519bf1c5ed9b3a9c9424cf9b49702e))

## 0.1.1 — 2026-11-23

### Fixes

- **ContentCarousel:** stop animating nav button visibility ([a86b523](https://github.com/alfadormx/astro.blocks/commit/a86b523bf3a086b0d9f3cc143ac40f77dd4fc2f9))
- **Image:** allow aspectRatio alone for responsive layout ([a58e816](https://github.com/alfadormx/astro.blocks/commit/a58e816694da6bc981954cdd5b329da4fef697de))

## 0.1.0 — 2026-11-21

First tagged release. Install it in a site with `github:alfadormx/astro.blocks#v0.1.0&path:packages/blocks` and follow the Installing guide in the docs site for the required icon sets and setup.
