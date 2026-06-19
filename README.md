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
- It ignores MaterialX source-node, texture, and procedural connections for now.
- It uses MaterialX `JsMaterialXGenShader.js`, `.wasm`, and `.data` to generate WebGL 2 ESSL shaders.
- Three.js still owns the canvas, camera, OBJ test ball, split comparison UI, and per-object matrix uniforms.

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
    envmap.hdr               Preview environment map
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

- Add texture/procedural connections for all OpenPBR `float` and `color3` inputs, matching the official MaterialX `open_pbr_surface` nodedef.
- Treat `color3` inputs as color textures, including `base_color`, `specular_color`, `transmission_color`, `subsurface_color`, `fuzz_color`, `coat_color`, and `emission_color`.
- Treat `float` inputs as grayscale maps, including weights, roughness values, IOR values, transmission depth, subsurface radius, thin-film controls, emission luminance, and `geometry_opacity`.
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
