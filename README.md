# OpenPBR Material Lab

A browser-based prototype for turning material descriptions and OpenPBR examples into an editable MaterialX-style graph, OpenPBR parameter controls, and a live Three.js preview.

The project is intentionally static: it can run from GitHub Pages without a build step.

## What It Does

- Accepts a natural-language material description in **Input A**.
- Loads official OpenPBR example `.mtlx` files from local `assets/examples`.
- Displays the generated **MaterialX graph JSON**.
- Lets you edit OpenPBR parameters in **Simple** or **Advanced** mode.
- Updates the preview and graph JSON when parameters change.
- Exports graph JSON, `.mtlx`, and a Blender Python approximation.

## Current Pipeline

```text
User description or preset
  -> MaterialX graph JSON
  -> OpenPBR parameters
  -> Three.js / React Three Fiber preview
  -> Export: JSON / .mtlx / Blender Python
```

The preview has three renderer modes:

- **Physical** keeps the original WebGL `MeshPhysicalMaterial` path. It maps OpenPBR values to the closest Three.js physical material controls and includes a lightweight subsurface visual approximation.
- **SSS** uses the experimental Three.js WebGPU `MeshSSSNodeMaterial` path when WebGPU is available. This preserves the old Physical renderer as a fallback while adding a dedicated subsurface scattering term.
- **MaterialX** uses the official MaterialX JavaScript shader generator files vendored in `vendor/materialx`. It builds ESSL GLSL from the exported `.mtlx`, then renders it through a Three.js `RawShaderMaterial`.

All modes are approximations of OpenPBR rather than full reference OpenPBR renderers.

## Preview Mapping Notes

The Physical preview maps OpenPBR controls to Three.js as follows:

- `base_color`, `base_weight` -> `color`
- `base_metalness` -> `metalness`
- `specular_roughness` -> `roughness`
- `specular_roughness_anisotropy` -> `anisotropy`
- `specular_ior` -> `ior`
- `specular_weight`, `specular_color` -> `specularIntensity`, `specularColor`
- `coat_weight`, `coat_roughness` -> `clearcoat`, `clearcoatRoughness`
- `fuzz_weight`, `fuzz_color`, `fuzz_roughness` -> `sheen`, `sheenColor`, `sheenRoughness`
- `thin_film_weight`, `thin_film_ior`, `thin_film_thickness` -> `iridescence`, `iridescenceIOR`, `iridescenceThicknessRange`
- `transmission_weight`, `transmission_color`, `transmission_depth`, `transmission_dispersion_scale` -> `transmission`, `attenuationColor`, `attenuationDistance`, `thickness`, `dispersion`
- `geometry_opacity` -> `opacity`/`transparent`, except transmissive materials keep `opacity` at 1 because Three.js transmission expects that
- `emission_color`, `emission_luminance` -> `emissive`, `emissiveIntensity`

Texture/procedural source bindings are now preserved for every OpenPBR `float` and `color3` input in the graph and `.mtlx` export. In the Physical/SSS preview, supported bindings are mapped to the closest Three.js map slots:

- Color textures use sRGB sampling and can drive `map`, `specularColorMap`, `sheenColorMap`, and `emissiveMap`.
- Float textures use linear grayscale sampling and can drive `metalnessMap`, `roughnessMap`, `specularIntensityMap`, `transmissionMap`, `thicknessMap`, `clearcoatMap`, `clearcoatRoughnessMap`, `sheenRoughnessMap`, `alphaMap`, `iridescenceMap`, and `iridescenceThicknessMap`.
- Procedural sources are represented as MaterialX `noise2d` nodes in graph/export and as deterministic preview noise textures in Physical/SSS.
- OpenPBR inputs with no direct Three.js map equivalent remain represented in graph/export even when the live Physical/SSS preview cannot show them as maps.

The Physical subsurface approximation is intentionally simple:

- `subsurface_weight` blends `subsurface_color` into `base_color`
- `subsurface_weight` reduces preview metalness and slightly lowers roughness
- `subsurface_weight` adds a small amount of Three.js `transmission`
- `subsurface_radius` increases preview `thickness`
- `subsurface_color` influences `attenuationColor`
- `subsurface_color` adds a subtle emissive lift so darker areas read as softly translucent

The SSS preview mode then adds the experimental WebGPU node material controls:

- `subsurface_color` -> `thicknessColorNode`
- `subsurface_weight` -> ambient, attenuation, and scale strength
- `subsurface_radius` -> scattering scale and power
- `subsurface_scatter_anisotropy` -> distortion strength

The MaterialX preview mode is intentionally limited for this first pass:

- It supports constant OpenPBR parameter values only.
- It still ignores MaterialX source-node, texture, and procedural connections at live shader-generation time, even though graph and `.mtlx` export preserve those connections.
- It uses MaterialX `JsMaterialXGenShader.js`, `.wasm`, and `.data` to generate WebGL 2 ESSL shaders.
- Three.js still owns the canvas, camera, OBJ test ball, split comparison UI, and per-object matrix uniforms.
- It uses `assets/envmap/san_giuseppe_bridge_split.hdr`, `assets/envmap/san_giuseppe_bridge_split_irradiance.hdr`, and `assets/envmap/san_giuseppe_bridge_split.mtlx` for MaterialX image-based lighting and the matching split directional light.
- OBJ meshes without tangents get generated fallback tangents, because MaterialX OpenPBR uses tangent-space inputs for anisotropy and layered highlights.

## Rendering Alignment Notes

These notes capture the current MaterialX/Physical/SSS preview decisions and why they were made:

- MaterialX uses the same `san_giuseppe_bridge` split lighting assets as the MaterialX viewer: radiance HDR for specular environment lookups, irradiance HDR for diffuse environment lookups, and the `.mtlx` light rig for the extracted directional light. This keeps MaterialX-generated OpenPBR shaders closer to the official viewer's lighting setup.
- The MaterialX light rig and environment matrix are rotated by `Y +90deg`, matching the MaterialX viewer helper convention. Without this, mirror-like materials showed the same environment with a visible angular offset.
- The Physical/SSS preview still uses `assets/envmap/san_giuseppe_bridge.hdr` as its Three.js scene environment. It does not load the MaterialX split irradiance map or the `.mtlx` directional light because those are specific to MaterialX shader generation.
- MaterialX transparent transmission does not sample the environment directly in this preview. The generated transparent shader branch is patched to sample a screen-space scene color target instead, so internal geometry such as `mesh000` can appear through transmissive `mesh001`/`mesh002` instead of always showing an inverted environment-only refraction.
- `transmission_depth` drives the MaterialX screen-space refraction offset. `geometry_thin_walled=true` forces that depth to `0`, while `geometry_thin_walled=false` uses the parameter value directly.
- Physical/SSS also treats `transmission_depth=0` as a real value. The UI default is the preview shell thickness (`0.117`) for the test ball, but dragging the control to `0` no longer silently restores that default at render time.
- OpenPBR UI ranges now follow the official parameter guidance more closely: soft slider ranges are kept practical for editing, while hard clamps allow physically meaningful values beyond the visible slider where the spec allows them.

## Run Locally

From this folder:

```bash
python3 -m http.server 5180
```

Open:

```text
http://127.0.0.1:5180/
```

## GitHub Pages

Publish the folder as a static site. The root `index.html` is the app entry point.

No bundling is required. React, Three.js, and React Three Fiber are loaded from CDN through the import map in `index.html`.

## Project Structure

```text
openpbr-material-lab/
  index.html                 Static GitHub Pages entry
  src/
    standalone.js            App state, panels, and material editing flow
    previewScene.js          Three.js preview scene, OBJ loading, camera sync
    materialxPreview.js      MaterialX constant-parameter shader preview bridge
    materialModel.js         OpenPBR, MaterialX, export logic
    app.css                  UI styles
  vendor/
    materialx/               Official MaterialX JS/WASM shader generator assets
  assets/
    envmap/                  Preview environment maps
    material_test_ball/      Local OBJ preview model
    examples/                Local OpenPBR example .mtlx files
  scripts/
    validate-materials.mjs   Local validation checks
```

## Validate

```bash
node scripts/validate-materials.mjs
```

The validation script checks the built-in material presets and every local OpenPBR example in `assets/examples`.

## TODO

- Add dedicated map handling for `geometry_normal`, `geometry_coat_normal`, `geometry_tangent`, and `geometry_coat_tangent`.
- Keep `geometry_thin_walled` as a uniform material-level boolean instead of a texture input.

## Notes

- The natural-language generator is currently deterministic local prototype logic.
- Future API integration should replace that local generator with structured model output.
- Simple mode shows only parameters present in the current material.
- Advanced mode shows the full OpenPBR parameter schema.
- Official OpenPBR geometry inputs are recognized, but omitted from sample output unless a material explicitly uses them.

## References

- [OpenPBR](https://github.com/AcademySoftwareFoundation/OpenPBR)
- [OpenPBR Surface Specification](https://academysoftwarefoundation.github.io/OpenPBR/)
- [MaterialX](https://github.com/AcademySoftwareFoundation/MaterialX)
