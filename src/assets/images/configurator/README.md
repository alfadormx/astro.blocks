# Configurator stills

Model tile images for `/demos/jewellery-configurator`, one per Model option (`classic.webp`,
`bold.webp`). Each is an outline drawing of the ring in one flat grey, so a tile shows the model's
shape and never a metal.

They are generated from the demo itself:

```sh
pnpm stills:generate
```

The script needs Chromium (`pnpm exec playwright install chromium`). It reuses a running `pnpm dev`
or starts one. For each Model option it selects the option, waits for the viewer to settle, and
captures the viewer as a 640 px square with a transparent background. It then traces the edges of
the silhouette and the shading into a line drawing and resizes it to a 480 px WebP.

Regenerate after changing the ring models (`pnpm models:generate`) or the Model options. Expect
byte-level differences between machines (SwiftShader vs GPU) even when nothing visibly changed.

## Metal swatches

`metal-yellow.svg`, `metal-white.svg` and `metal-rose.svg` are the Color option swatches. They are
hand-written SVG spheres, not generated: each one's base colour matches its option's band mutation
(`#e6b422`, `#e5e4e2`, and `RoseGold` from `scripts/generate-ring-models.mjs` converted to sRGB,
`#f39590`). Update them by hand when those colours change.
