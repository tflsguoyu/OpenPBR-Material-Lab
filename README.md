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

The preview uses Three.js `MeshPhysicalMaterial`, so it is an approximation of OpenPBR rather than a full reference OpenPBR renderer.

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
    standalone.js            React/R3F app
    materialModel.js         OpenPBR, MaterialX, export logic
    app.css                  UI styles
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
