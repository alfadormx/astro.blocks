# Sample models

Used by the ModelViewer documentation page and its browser specs.

| File            | Source                                                                                                                                                              | License |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `avocado.glb`   | [KhronosGroup/glTF-Sample-Assets `Models/Avocado/glTF-Binary/Avocado.glb`](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/Avocado)             | CC0-1.0 |
| `water-bottle/` | [KhronosGroup/glTF-Sample-Assets `Models/WaterBottle/glTF-Binary/WaterBottle.glb`](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/WaterBottle) | CC0-1.0 |

Textures were shrunk to keep the repository small:

```sh
pnpm dlx @gltf-transform/cli resize Avocado.glb public/models/avocado.glb --width 256 --height 256
pnpm dlx @gltf-transform/cli resize WaterBottle.glb wb.glb --width 256 --height 256
```

The water bottle is split into a `.gltf` with a separate `.bin` and images, so the docs exercise external resources:

```sh
pnpm dlx @gltf-transform/cli copy wb.glb public/models/water-bottle/WaterBottle.gltf
```
