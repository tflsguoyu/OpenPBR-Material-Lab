import {
  DEFAULT_MATERIAL,
  MATERIAL_PRESETS,
  buildOpenPbrGroupsFromKeys,
  materialFromMaterialXGraph,
  materialFromOpenPbrMtlx,
  toBlenderPython,
  toMaterialX,
  toMaterialXGraph,
  toThreePhysicalProps
} from "../src/materialModel.js";
import fs from "node:fs";
import path from "node:path";

const materials = [DEFAULT_MATERIAL, ...MATERIAL_PRESETS];

for (const material of materials) {
  const materialX = toMaterialX(material);
  const materialXGraph = toMaterialXGraph(material);
  const roundTrip = materialFromMaterialXGraph(materialXGraph, DEFAULT_MATERIAL);
  const blender = toBlenderPython(material);
  const three = toThreePhysicalProps(material);

  if (!materialX.includes("<open_pbr_surface")) {
    throw new Error(`${material.name}: MaterialX missing open_pbr_surface node`);
  }
  if (!blender.includes("Principled BSDF")) {
    throw new Error(`${material.name}: Blender script missing Principled BSDF mapping`);
  }
  if (materialXGraph.materialx?.nodes?.find((node) => node.category === "open_pbr_surface") == null) {
    throw new Error(`${material.name}: MaterialX graph JSON missing open_pbr_surface node`);
  }
  if (roundTrip.name !== material.name) {
    throw new Error(`${material.name}: MaterialX graph JSON round trip lost material name`);
  }
  if (!three.color || typeof three.roughness !== "number") {
    throw new Error(`${material.name}: Three.js material props are incomplete`);
  }
}

const examplesPath = new URL("../assets/examples", import.meta.url);
const exampleFiles = fs.readdirSync(examplesPath).filter((file) => file.endsWith(".mtlx")).sort();

for (const file of exampleFiles) {
  const xml = fs.readFileSync(new URL(file, `${examplesPath.href}/`), "utf8");
  const material = materialFromOpenPbrMtlx(xml, DEFAULT_MATERIAL, path.basename(file, ".mtlx"));
  const graph = toMaterialXGraph(material);
  const surface = graph.materialx.nodes.find((node) => node.category === "open_pbr_surface");
  const graphKeys = Object.keys(surface?.inputs || {});
  const groupedKeys = buildOpenPbrGroupsFromKeys(material.explicitOpenPbrKeys).flatMap((group) => group.params.map((param) => param[0]));
  const sameSet = (left, right) => left.length === right.length && left.every((key) => right.includes(key));

  if (!surface) {
    throw new Error(`${file}: MaterialX graph JSON missing open_pbr_surface node`);
  }
  if (graphKeys.includes("geomInputs")) {
    throw new Error(`${file}: MaterialX graph JSON should not contain geomInputs`);
  }
  if (!sameSet(graphKeys, material.explicitOpenPbrKeys)) {
    throw new Error(`${file}: graph inputs do not match parsed OpenPBR inputs`);
  }
  if (!sameSet(groupedKeys, material.explicitOpenPbrKeys)) {
    throw new Error(`${file}: parameter groups do not match parsed OpenPBR inputs`);
  }
}

console.log(`Validated ${materials.length} generated presets and ${exampleFiles.length} OpenPBR examples.`);
