export const DEFAULT_MATERIAL = {
  name: "brushed dark titanium",
  description: "Dark titanium with subtle anisotropic brushing, a soft clear coat, and faint cool iridescence.",
  openpbr: {
    base_weight: 1,
    base_color: [0.18, 0.17, 0.16],
    base_diffuse_roughness: 0,
    base_metalness: 1,
    specular_weight: 1,
    specular_color: [1, 1, 1],
    specular_roughness: 0.38,
    specular_roughness_anisotropy: 0.65,
    specular_ior: 1.55,
    transmission_weight: 0,
    transmission_color: [1, 1, 1],
    transmission_depth: 0,
    transmission_scatter: [0, 0, 0],
    transmission_scatter_anisotropy: 0,
    transmission_dispersion_scale: 0,
    transmission_dispersion_abbe_number: 20,
    subsurface_weight: 0,
    subsurface_color: [0.8, 0.8, 0.8],
    subsurface_radius: 1,
    subsurface_radius_scale: [1, 0.5, 0.25],
    subsurface_scatter_anisotropy: 0,
    coat_weight: 0.1,
    coat_color: [1, 1, 1],
    coat_roughness: 0.25,
    coat_roughness_anisotropy: 0,
    coat_ior: 1.6,
    coat_darkening: 1,
    fuzz_weight: 0.04,
    fuzz_color: [1, 1, 1],
    fuzz_roughness: 0.5,
    emission_color: [0, 0, 0],
    emission_luminance: 0,
    geometry_opacity: 1,
    geometry_thin_walled: false,
    thin_film_weight: 0.18,
    thin_film_thickness: 0.42,
    thin_film_ior: 1.4
  },
  explicitOpenPbrKeys: [
    "base_color",
    "base_metalness",
    "specular_roughness",
    "specular_roughness_anisotropy",
    "specular_ior",
    "coat_weight",
    "coat_roughness",
    "fuzz_weight",
    "emission_color",
    "emission_luminance",
    "geometry_opacity",
    "thin_film_weight",
    "thin_film_thickness"
  ],
  inputSources: {},
  textures: [],
  procedural: {
    brushing: {
      type: "anisotropic_noise",
      scale: 45,
      strength: 0.18
    }
  }
};

export const PREVIEW_SHELL_THICKNESS = 0.117;

export const PARQUET_WOOD_MATERIAL = {
  name: "warm parquet wood",
  description: "Warm butcher-block/parquet wood with varied plank tones, directional grain, satin finish, and subtle clear coat.",
  openpbr: {
    base_weight: 1,
    base_color: [0.72, 0.43, 0.19],
    base_diffuse_roughness: 0.38,
    base_metalness: 0,
    specular_weight: 0.55,
    specular_color: [1, 0.92, 0.82],
    specular_roughness: 0.48,
    specular_roughness_anisotropy: 0.35,
    specular_ior: 1.48,
    transmission_weight: 0,
    subsurface_weight: 0,
    coat_weight: 0.18,
    coat_color: [1, 0.9, 0.78],
    coat_roughness: 0.32,
    coat_ior: 1.5,
    fuzz_weight: 0.04,
    fuzz_color: [0.9, 0.62, 0.34],
    fuzz_roughness: 0.72,
    emission_luminance: 0,
    geometry_opacity: 1,
    geometry_thin_walled: false,
    thin_film_weight: 0
  },
  explicitOpenPbrKeys: [
    "base_weight",
    "base_color",
    "base_diffuse_roughness",
    "base_metalness",
    "specular_weight",
    "specular_color",
    "specular_roughness",
    "specular_roughness_anisotropy",
    "specular_ior",
    "transmission_weight",
    "subsurface_weight",
    "coat_weight",
    "coat_color",
    "coat_roughness",
    "coat_ior",
    "fuzz_weight",
    "fuzz_color",
    "fuzz_roughness",
    "emission_luminance",
    "geometry_opacity",
    "geometry_thin_walled",
    "thin_film_weight"
  ],
  inputSources: {
    base_color: "texture",
    specular_roughness: "procedural"
  },
  textures: [
    {
      name: "base_color",
      file: "assets/textures/base_color.png",
      colorspace: "srgb"
    }
  ],
  procedural: {}
};

export const MATERIAL_PRESETS = [
  PARQUET_WOOD_MATERIAL,
  {
    name: "warm translucent jade",
    description: "Soft green jade with waxy surface, modest subsurface body, and low polish.",
    openpbr: {
      base_color: [0.38, 0.68, 0.52],
      base_metalness: 0,
      specular_roughness: 0.52,
      specular_roughness_anisotropy: 0,
      specular_ior: 1.48,
      transmission_weight: 0.2,
      coat_weight: 0.18,
      coat_roughness: 0.42,
      fuzz_weight: 0.02,
      emission_color: [0, 0, 0],
      emission_luminance: 0,
      geometry_opacity: 0.82,
      thin_film_weight: 0,
      thin_film_thickness: 0
    },
    textures: [],
    procedural: {}
  },
  {
    name: "oxidized copper edge wear",
    description: "Aged copper with teal oxidation, metallic exposed edges, and rough clear coat.",
    openpbr: {
      base_color: [0.38, 0.46, 0.38],
      base_metalness: 0.78,
      specular_roughness: 0.62,
      specular_roughness_anisotropy: 0.15,
      specular_ior: 1.5,
      coat_weight: 0.06,
      coat_roughness: 0.58,
      fuzz_weight: 0.08,
      emission_color: [0, 0, 0],
      emission_luminance: 0,
      geometry_opacity: 1,
      thin_film_weight: 0.08,
      thin_film_thickness: 0.54
    },
    textures: [],
    procedural: {
      patina: {
        type: "cellular_noise",
        scale: 18,
        strength: 0.34
      }
    }
  }
];

export const OFFICIAL_OPENPBR_PRESETS = [
  {
    name: "open_pbr_aluminum_brushed",
    label: "Aluminum",
    description: "MaterialX OpenPbr example: brushed aluminum.",
    openpbr: {
      base_color: [0.82, 0.84, 0.86],
      base_metalness: 1,
      specular_roughness: 0.24,
      specular_roughness_anisotropy: 0.82,
      specular_ior: 1.5,
      coat_weight: 0,
      fuzz_weight: 0,
      geometry_opacity: 1
    },
    inputSources: {},
    textures: [],
    procedural: {}
  },
  {
    name: "open_pbr_carpaint",
    label: "Carpaint",
    description: "MaterialX OpenPbr example: layered automotive paint with clear coat.",
    openpbr: {
      base_color: [0.82, 0.02, 0.015],
      base_metalness: 0,
      specular_roughness: 0.34,
      specular_ior: 1.5,
      coat_weight: 0.78,
      coat_roughness: 0.08,
      coat_ior: 1.55,
      thin_film_weight: 0.08,
      thin_film_thickness: 0.42,
      geometry_opacity: 1
    },
    inputSources: {},
    textures: [],
    procedural: {}
  },
  {
    name: "open_pbr_default",
    label: "Default",
    description: "MaterialX OpenPbr example: default neutral surface.",
    openpbr: {
      base_weight: 1,
      base_color: [0.8, 0.8, 0.8],
      base_diffuse_roughness: 0,
      base_metalness: 0,
      specular_weight: 1,
      specular_color: [1, 1, 1],
      specular_roughness: 0.3,
      specular_ior: 1.5,
      specular_roughness_anisotropy: 0,
      geometry_opacity: 1
    },
    inputSources: {},
    textures: [],
    procedural: {}
  },
  {
    name: "open_pbr_glass",
    label: "Glass",
    description: "MaterialX OpenPbr example: clear transmissive glass.",
    openpbr: {
      base_weight: 0,
      base_color: [1, 1, 1],
      base_metalness: 0,
      specular_roughness: 0.01,
      specular_ior: 1.52,
      transmission_weight: 1,
      transmission_color: [1, 1, 1],
      geometry_opacity: 0.32
    },
    inputSources: {},
    textures: [],
    procedural: {}
  },
  {
    name: "open_pbr_honey",
    label: "Honey",
    description: "MaterialX OpenPbr example: amber translucent honey.",
    openpbr: {
      base_color: [1, 0.54, 0.08],
      base_metalness: 0,
      specular_roughness: 0.16,
      specular_ior: 1.47,
      transmission_weight: 0.62,
      transmission_color: [1, 0.62, 0.18],
      transmission_depth: 0.55,
      subsurface_weight: 0.18,
      subsurface_color: [1, 0.56, 0.12],
      geometry_opacity: 0.74
    },
    inputSources: {},
    textures: [],
    procedural: {}
  },
  {
    name: "open_pbr_ketchup",
    label: "Ketchup",
    description: "MaterialX OpenPbr example: red viscous ketchup.",
    openpbr: {
      base_color: [0.82, 0.04, 0.025],
      base_metalness: 0,
      specular_roughness: 0.48,
      specular_ior: 1.43,
      subsurface_weight: 0.22,
      subsurface_color: [0.9, 0.05, 0.025],
      coat_weight: 0.18,
      coat_roughness: 0.18,
      geometry_opacity: 1
    },
    inputSources: {},
    textures: [],
    procedural: {}
  },
  {
    name: "open_pbr_lightbulb",
    label: "Lightbulb",
    description: "MaterialX OpenPbr example: glowing light bulb material.",
    openpbr: {
      base_weight: 0.2,
      base_color: [1, 0.92, 0.72],
      base_metalness: 0,
      specular_roughness: 0.12,
      transmission_weight: 0.38,
      emission_color: [1, 0.82, 0.45],
      emission_luminance: 10,
      geometry_opacity: 0.72
    },
    inputSources: {},
    textures: [],
    procedural: {}
  },
  {
    name: "open_pbr_pearl",
    label: "Pearl",
    description: "MaterialX OpenPbr example: pearl with soft iridescence.",
    openpbr: {
      base_color: [0.94, 0.88, 0.78],
      base_metalness: 0,
      specular_roughness: 0.22,
      specular_ior: 1.56,
      subsurface_weight: 0.18,
      subsurface_color: [1, 0.86, 0.76],
      thin_film_weight: 0.36,
      thin_film_thickness: 0.48,
      coat_weight: 0.22,
      coat_roughness: 0.12,
      geometry_opacity: 1
    },
    inputSources: {},
    textures: [],
    procedural: {}
  },
  {
    name: "open_pbr_soapbubble",
    label: "Soapbubble",
    description: "MaterialX OpenPbr example: thin transparent soap bubble film.",
    openpbr: {
      base_weight: 0,
      base_color: [1, 1, 1],
      base_metalness: 0,
      specular_roughness: 0.02,
      specular_ior: 1.33,
      transmission_weight: 0.8,
      thin_film_weight: 1,
      thin_film_thickness: 0.36,
      thin_film_ior: 1.33,
      geometry_opacity: 0.18,
      geometry_thin_walled: true
    },
    inputSources: {},
    textures: [],
    procedural: {}
  },
  {
    name: "open_pbr_velvet",
    label: "Velvet",
    description: "MaterialX OpenPbr example: soft velvet fabric with strong fuzz.",
    openpbr: {
      base_color: [0.12, 0.02, 0.16],
      base_metalness: 0,
      specular_roughness: 0.78,
      specular_ior: 1.45,
      fuzz_weight: 0.72,
      fuzz_color: [0.42, 0.16, 0.58],
      fuzz_roughness: 0.86,
      coat_weight: 0,
      geometry_opacity: 1
    },
    inputSources: {},
    textures: [],
    procedural: {}
  }
];

export const OPENPBR_EXAMPLE_PRESETS = [
  "open_pbr_aluminum_brushed",
  "open_pbr_beryllium",
  "open_pbr_blackboard",
  "open_pbr_blood",
  "open_pbr_brass",
  "open_pbr_brick",
  "open_pbr_carpaint",
  "open_pbr_cesium",
  "open_pbr_charcoal",
  "open_pbr_chocolate",
  "open_pbr_chromium",
  "open_pbr_cobalt",
  "open_pbr_coffee",
  "open_pbr_concrete",
  "open_pbr_cooking_oil",
  "open_pbr_copper",
  "open_pbr_default",
  "open_pbr_diamond",
  "open_pbr_egg_shell",
  "open_pbr_eye_cornea",
  "open_pbr_eye_lens",
  "open_pbr_eye_sclera",
  "open_pbr_gasoline",
  "open_pbr_germanium",
  "open_pbr_glass",
  "open_pbr_gold",
  "open_pbr_gray_card",
  "open_pbr_honey_crystallized",
  "open_pbr_honey_liquid",
  "open_pbr_ice",
  "open_pbr_iridium",
  "open_pbr_iron",
  "open_pbr_ketchup",
  "open_pbr_lcd_display_6500k",
  "open_pbr_lead",
  "open_pbr_light_bulb_2700k",
  "open_pbr_light_bulb_5000k",
  "open_pbr_lithium",
  "open_pbr_magnesium",
  "open_pbr_manganese",
  "open_pbr_marble",
  "open_pbr_mercury",
  "open_pbr_milk",
  "open_pbr_molybdenum",
  "open_pbr_nickel",
  "open_pbr_office_paper",
  "open_pbr_palladium",
  "open_pbr_pearl",
  "open_pbr_petroleum",
  "open_pbr_plastic_acrylic",
  "open_pbr_plastic_pc",
  "open_pbr_plastic_pet",
  "open_pbr_plastic_polyurethane",
  "open_pbr_plastic_pp",
  "open_pbr_plastic_pvc",
  "open_pbr_platinum",
  "open_pbr_potassium",
  "open_pbr_quartz",
  "open_pbr_rubidium",
  "open_pbr_salt",
  "open_pbr_sand",
  "open_pbr_sapphire",
  "open_pbr_silicon",
  "open_pbr_silver",
  "open_pbr_skin_i",
  "open_pbr_skin_ii",
  "open_pbr_skin_iii",
  "open_pbr_skin_iv",
  "open_pbr_skin_v",
  "open_pbr_skin_vi",
  "open_pbr_snow",
  "open_pbr_soapbubble",
  "open_pbr_sodium",
  "open_pbr_stainless_steel",
  "open_pbr_tire",
  "open_pbr_titanium",
  "open_pbr_toner_black",
  "open_pbr_tungsten",
  "open_pbr_vanadium",
  "open_pbr_velvet",
  "open_pbr_water",
  "open_pbr_whiteboard",
  "open_pbr_zinc"
].map((name) => ({
  name,
  label: labelFromOpenPbrExampleName(name),
  url: `./assets/examples/${name}.mtlx`
}));

export const OPENPBR_SCHEMA = [
  ["base_weight", "Weight", "float", 1, 0, 1, 0.01, "Base", "advanced"],
  ["base_color", "Color", "color3", [0.8, 0.8, 0.8], 0, 1, 0.01, "Base", "simple"],
  ["base_diffuse_roughness", "Diffuse roughness", "float", 0, 0, 1, 0.01, "Base", "advanced"],
  ["base_metalness", "Metalness", "float", 0, 0, 1, 0.01, "Base", "simple"],
  ["specular_weight", "Weight", "float", 1, 0, 1, 0.01, "Specular", "advanced", 0, Infinity],
  ["specular_color", "Color", "color3", [1, 1, 1], 0, 1, 0.01, "Specular", "advanced"],
  ["specular_roughness", "Roughness", "float", 0.3, 0, 1, 0.01, "Specular", "simple"],
  ["specular_ior", "IOR", "float", 1.5, 1, 3, 0.01, "Specular", "simple", 0, Infinity],
  ["specular_roughness_anisotropy", "Roughness anisotropy", "float", 0, 0, 1, 0.01, "Specular", "simple"],
  ["transmission_weight", "Weight", "float", 0, 0, 1, 0.01, "Transmission", "advanced"],
  ["transmission_color", "Color", "color3", [1, 1, 1], 0, 1, 0.01, "Transmission", "advanced"],
  ["transmission_depth", "Depth", "float", PREVIEW_SHELL_THICKNESS, 0, 1, 0.001, "Transmission", "advanced", 0, Infinity],
  ["transmission_scatter", "Scatter", "color3", [0, 0, 0], 0, 1, 0.01, "Transmission", "advanced"],
  ["transmission_scatter_anisotropy", "Scatter anisotropy", "float", 0, -1, 1, 0.01, "Transmission", "advanced"],
  ["transmission_dispersion_scale", "Dispersion scale", "float", 0, 0, 1, 0.01, "Transmission", "advanced"],
  ["transmission_dispersion_abbe_number", "Dispersion Abbe number", "float", 20, 9, 91, 1, "Transmission", "advanced", 0, Infinity],
  ["subsurface_weight", "Weight", "float", 0, 0, 1, 0.01, "Subsurface", "advanced"],
  ["subsurface_color", "Color", "color3", [0.8, 0.8, 0.8], 0, 1, 0.01, "Subsurface", "advanced"],
  ["subsurface_radius", "Radius", "float", 1, 0, 1, 0.001, "Subsurface", "advanced", 0, Infinity],
  ["subsurface_radius_scale", "Radius scale", "color3", [1, 0.5, 0.25], 0, 1, 0.01, "Subsurface", "advanced"],
  ["subsurface_scatter_anisotropy", "Scatter anisotropy", "float", 0, -1, 1, 0.01, "Subsurface", "advanced"],
  ["fuzz_weight", "Weight", "float", 0, 0, 1, 0.01, "Fuzz", "simple"],
  ["fuzz_color", "Color", "color3", [1, 1, 1], 0, 1, 0.01, "Fuzz", "advanced"],
  ["fuzz_roughness", "Roughness", "float", 0.5, 0, 1, 0.01, "Fuzz", "advanced"],
  ["coat_weight", "Weight", "float", 0, 0, 1, 0.01, "Coat", "simple"],
  ["coat_color", "Color", "color3", [1, 1, 1], 0, 1, 0.01, "Coat", "advanced"],
  ["coat_roughness", "Roughness", "float", 0, 0, 1, 0.01, "Coat", "simple"],
  ["coat_roughness_anisotropy", "Roughness anisotropy", "float", 0, 0, 1, 0.01, "Coat", "advanced"],
  ["coat_ior", "IOR", "float", 1.6, 1, 3, 0.01, "Coat", "advanced", 0, Infinity],
  ["coat_darkening", "Darkening", "float", 1, 0, 1, 0.01, "Coat", "advanced"],
  ["thin_film_weight", "Weight", "float", 0, 0, 1, 0.01, "Thin Film", "simple"],
  ["thin_film_thickness", "Thickness", "float", 0.5, 0, 1, 0.001, "Thin Film", "simple", 0, Infinity],
  ["thin_film_ior", "IOR", "float", 1.4, 1, 3, 0.01, "Thin Film", "advanced", 0, Infinity],
  ["emission_luminance", "Luminance", "float", 0, 0, 1000, 1, "Emission", "simple", 0, Infinity],
  ["emission_color", "Color", "color3", [1, 1, 1], 0, 1, 0.01, "Emission", "simple"],
  ["geometry_opacity", "Opacity", "float", 1, 0, 1, 0.01, "Geometry", "simple"],
  ["geometry_thin_walled", "Thin walled", "boolean", false, 0, 1, 1, "Geometry", "advanced"]
];

export const OPENPBR_GEOMETRY_INPUTS = [
  ["geometry_normal", "vector3", "Nworld"],
  ["geometry_coat_normal", "vector3", "Nworld"],
  ["geometry_tangent", "vector3", "Tworld"],
  ["geometry_coat_tangent", "vector3", "Tworld"]
];

export const SIMPLE_PARAMETER_GROUPS = buildSimpleGroups();
export const ADVANCED_PARAMETER_GROUPS = buildAdvancedGroups();
export const PARAMETER_GROUPS = SIMPLE_PARAMETER_GROUPS;

export function clampMaterial(material) {
  const next = structuredClone(material);
  const source = next.openpbr || {};
  const explicitKeys = Array.isArray(next.explicitOpenPbrKeys)
    ? next.explicitOpenPbrKeys
    : Object.keys(source);
  next.openpbr = {};
  for (const [key, , type, defaultValue, min, max, , , , hardMin = min, hardMax = max] of OPENPBR_SCHEMA) {
    const value = source[key] ?? defaultValue;
    if (type === "color3") {
      next.openpbr[key] = clampColor(value);
    } else if (type === "boolean") {
      next.openpbr[key] = Boolean(value);
    } else {
      next.openpbr[key] = clampNumber(value, hardMin, hardMax);
    }
  }
  next.explicitOpenPbrKeys = normalizeOpenPbrKeys(explicitKeys);
  next.inputSources = normalizeInputSources(next.inputSources);
  next.textures = normalizeTextures(next.textures);
  return next;
}

export function materialFromPrompt(prompt) {
  const lower = prompt.toLowerCase();
  const material = structuredClone(DEFAULT_MATERIAL);
  material.name = prompt.trim().slice(0, 64) || "generated material";
  material.description = prompt.trim();

  if (lower.includes("gold") || lower.includes("金")) {
    material.openpbr.base_color = [1, 0.72, 0.28];
    material.openpbr.base_metalness = 1;
    material.openpbr.specular_roughness = 0.28;
  }
  if (lower.includes("copper") || lower.includes("铜")) {
    material.openpbr.base_color = [0.78, 0.38, 0.18];
    material.openpbr.base_metalness = 1;
    material.openpbr.specular_roughness = 0.42;
  }
  if (lower.includes("jade") || lower.includes("玉")) {
    material.openpbr.base_color = [0.36, 0.68, 0.5];
    material.openpbr.base_metalness = 0;
    material.openpbr.geometry_opacity = 0.78;
    material.openpbr.specular_roughness = 0.5;
  }
  if (lower.includes("plastic") || lower.includes("塑料")) {
    material.openpbr.base_metalness = 0;
    material.openpbr.specular_roughness = 0.45;
    material.openpbr.coat_weight = 0.05;
  }
  if (lower.includes("rough") || lower.includes("粗糙")) {
    material.openpbr.specular_roughness = 0.72;
    material.openpbr.coat_roughness = 0.66;
  }
  if (lower.includes("mirror") || lower.includes("polished") || lower.includes("镜面") || lower.includes("抛光")) {
    material.openpbr.specular_roughness = 0.12;
    material.openpbr.coat_roughness = 0.08;
  }
  if (lower.includes("iridescent") || lower.includes("thin film") || lower.includes("虹彩") || lower.includes("薄膜")) {
    material.openpbr.thin_film_weight = 0.45;
    material.openpbr.thin_film_thickness = 0.52;
  }

  return clampMaterial(material);
}

export function toThreePhysicalProps(material) {
  const p = clampMaterial(material).openpbr;
  const sssWeight = p.subsurface_weight;
  const sssColor = p.subsurface_color;
  const sssMix = Math.min(0.6, sssWeight * 0.6);
  const transmission = Math.min(1, (p.transmission_weight + sssWeight * 0.28) * (1 - p.base_metalness));
  const alpha = p.geometry_opacity;
  const previewOpacity = transmission > 0 ? 1 : alpha;
  const threeIor = clampNumber(p.specular_ior, 1, 2.333);
  const baseColor = p.base_color.map((channel, index) => (
    channel * (1 - sssMix) + sssColor[index] * sssMix
  ) * p.base_weight);
  const emissionBoost = sssWeight * 0.18;
  const previewEmissive = p.emission_color.map((channel, index) => Math.min(1, channel + sssColor[index] * emissionBoost));
  return {
    color: rgbToHex(baseColor),
    metalness: p.base_metalness * (1 - sssWeight * 0.7),
    roughness: Math.max(transmission > 0 ? 0 : 0.04, p.specular_roughness * (1 - sssWeight * 0.18)),
    anisotropy: p.specular_roughness_anisotropy,
    ior: threeIor,
    specularIntensity: p.specular_weight,
    specularColor: rgbToHex(p.specular_color),
    clearcoat: p.coat_weight,
    clearcoatRoughness: p.coat_roughness,
    sheen: p.fuzz_weight,
    sheenColor: rgbToHex(p.fuzz_color),
    sheenRoughness: p.fuzz_roughness,
    iridescence: p.thin_film_weight,
    iridescenceIOR: clampNumber(p.thin_film_ior, 1, 2.333),
    iridescenceThicknessRange: [Math.max(1, p.thin_film_thickness * 1000 - 80), p.thin_film_thickness * 1000 + 80],
    transmission,
    thickness: p.geometry_thin_walled ? 0 : Math.max(0, p.transmission_depth + sssWeight * p.subsurface_radius * 0.35),
    attenuationColor: rgbToHex(mixColor(p.transmission_color, sssColor, sssWeight)),
    attenuationDistance: p.transmission_depth > 0 || sssWeight > 0
      ? Math.max(0.001, p.transmission_depth + p.subsurface_radius * sssWeight)
      : Infinity,
    dispersion: p.transmission_dispersion_scale,
    opacity: previewOpacity,
    transparent: alpha < 0.995 || transmission > 0,
    emissive: rgbToHex(previewEmissive),
    emissiveIntensity: p.emission_luminance + emissionBoost
  };
}

export function toMaterialX(material) {
  const normalized = clampMaterial(material);
  const safeName = sanitizeName(normalized.name);
  const p = normalized.openpbr;
  const openPbrKeys = materialOpenPbrKeys(normalized);
  const sourceNodes = materialXSourceNodes(normalized, safeName).join("\n");
  const inputs = OPENPBR_SCHEMA
    .filter(([key]) => openPbrKeys.includes(key))
    .map(([key, , type]) => materialXInput(key, type, p[key], normalized.inputSources?.[key], safeName))
    .join("\n");

  return `<?xml version="1.0"?>
<materialx version="1.39">
  <surfacematerial name="${safeName}_material" type="material">
    <input name="surfaceshader" type="surfaceshader" nodename="${safeName}_openpbr" />
  </surfacematerial>
${sourceNodes ? `${sourceNodes}\n` : ""}  <open_pbr_surface name="${safeName}_openpbr" type="surfaceshader">
${inputs}
  </open_pbr_surface>
</materialx>
`;
}

export function toMaterialXGraph(material) {
  const normalized = clampMaterial(material);
  const safeName = sanitizeName(normalized.name);
  const p = normalized.openpbr;
  const openPbrKeys = materialOpenPbrKeys(normalized);
  const openPbrInputs = Object.fromEntries(
    OPENPBR_SCHEMA
      .filter(([key]) => openPbrKeys.includes(key))
      .map(([key]) => [key, p[key]])
  );
  const sourceNodes = materialXGraphSourceNodes(normalized, safeName);
  const nodes = [
    {
      name: `${safeName}_openpbr`,
      category: "open_pbr_surface",
      type: "surfaceshader",
      inputs: openPbrInputs
    },
    {
      name: `${safeName}_material`,
      category: "surfacematerial",
      type: "material",
      inputs: {
        surfaceshader: `${safeName}_openpbr`
      }
    }
  ];

  const proceduralNodes = Object.entries(normalized.procedural || {}).map(([name, node]) => ({
    name,
    category: node.type,
    type: inferProceduralType(node.type),
    inputs: Object.fromEntries(
      Object.entries(node).filter(([key]) => key !== "type")
    )
  }));

  return {
    materialx: {
      version: "1.39",
      metadata: {
        name: normalized.name,
        description: normalized.description
      },
      nodes: [...proceduralNodes, ...sourceNodes, ...nodes],
      connections: [
        ...sourceNodes.map((node) => ({
          from: node.name,
          output: "out",
          to: `${safeName}_openpbr`,
          input: node.bindsTo,
          kind: node.sourceKind
        })),
        ...proceduralNodes.map((node) => ({
        from: node.name,
        to: `${safeName}_openpbr`,
        note: "Procedural source is preserved for graph planning; exact socket binding is renderer-specific in this prototype."
        }))
      ]
    }
  };
}

export function materialFromMaterialXGraph(graph, fallback = DEFAULT_MATERIAL) {
  const materialx = graph?.materialx || graph;
  const nodes = Array.isArray(materialx?.nodes) ? materialx.nodes : [];
  const surface = nodes.find((node) => node.category === "open_pbr_surface");
  const metadata = materialx?.metadata || {};
  const next = structuredClone(fallback);
  next.openpbr = { ...defaultOpenPbr(), ...(next.openpbr || {}) };

  next.name = metadata.name || next.name;
  next.description = metadata.description || next.description;

  if (surface?.inputs && typeof surface.inputs === "object") {
    next.explicitOpenPbrKeys = [];
    for (const [key, value] of Object.entries(surface.inputs)) {
      if (key in next.openpbr) {
        next.openpbr[key] = value;
        next.explicitOpenPbrKeys.push(key);
      }
    }
  }

  const nodesByName = new Map(nodes.map((node) => [node?.name, node]));
  const procedural = {};
  for (const node of nodes) {
    if (!node || node.category === "open_pbr_surface" || node.category === "surfacematerial" || node.category === "image" || node.bindsTo) continue;
    procedural[node.name || node.category] = {
      type: node.category,
      ...(node.inputs || {})
    };
  }
  next.procedural = procedural;
  next.inputSources = {};
  next.textures = [];
  for (const connection of Array.isArray(materialx?.connections) ? materialx.connections : []) {
    if (connection?.input && connection?.kind) {
      next.inputSources[connection.input] = connection.kind;
      const sourceNode = nodesByName.get(connection.from);
      if (connection.kind === "texture" && sourceNode?.category === "image" && sourceNode.inputs?.file) {
        next.textures.push({
          name: connection.input,
          file: sourceNode.inputs.file,
          colorspace: sourceNode.inputs.colorspace
        });
      }
    }
  }

  return clampMaterial(next);
}

export function materialFromOpenPbrMtlx(xmlText, fallback = DEFAULT_MATERIAL, sourceName = "open_pbr_example") {
  const surfaceMatch = String(xmlText).match(/<open_pbr_surface\b[^>]*>([\s\S]*?)<\/open_pbr_surface>/);
  if (!surfaceMatch) {
    throw new Error("No open_pbr_surface node found.");
  }

  const next = structuredClone(fallback);
  const materialMatch = String(xmlText).match(/<surfacematerial\b[^>]*\bname="([^"]+)"/);
  const materialName = materialMatch?.[1] || labelFromOpenPbrExampleName(sourceName);
  next.name = materialName.replace(/_/g, " ");
  next.description = `OpenPBR example material from ${sourceName}.mtlx.`;
  next.openpbr = defaultOpenPbr();
  next.inputSources = {};
  next.textures = [];
  next.procedural = {};
  next.explicitOpenPbrKeys = [];

  const schemaByKey = new Map(OPENPBR_SCHEMA.map(([key, , type]) => [key, type]));
  const inputPattern = /<input\b([^>]*)\/?>/g;
  let inputMatch;
  while ((inputMatch = inputPattern.exec(surfaceMatch[1]))) {
    const attrs = parseXmlAttributes(inputMatch[1]);
    const key = attrs.name;
    const value = attrs.value;
    const type = schemaByKey.get(key);
    if (!key || value == null || !type) continue;
    next.explicitOpenPbrKeys.push(key);

    if (type === "color3") {
      next.openpbr[key] = value.split(",").map((part) => Number(part.trim()));
    } else if (type === "boolean") {
      next.openpbr[key] = value === "true" || value === "1";
    } else {
      next.openpbr[key] = Number(value);
    }
  }

  return clampMaterial(next);
}

export function toBlenderPython(material) {
  const normalized = clampMaterial(material);
  const safeName = sanitizeName(normalized.name);
  const p = normalized.openpbr;
  const base = [...p.base_color, p.geometry_opacity].map((value) => Number(value).toFixed(4)).join(", ");
  const emission = [...p.emission_color, 1].map((value) => Number(value).toFixed(4)).join(", ");
  return `import bpy

mat = bpy.data.materials.new("${safeName}")
mat.use_nodes = True
mat.blend_method = "BLEND" if ${p.geometry_opacity.toFixed(4)} < 0.995 else "OPAQUE"
nodes = mat.node_tree.nodes
bsdf = nodes.get("Principled BSDF")

if bsdf:
    def set_input(name, value):
        socket = bsdf.inputs.get(name)
        if socket:
            socket.default_value = value

    set_input("Base Color", (${base}))
    set_input("Metallic", ${p.base_metalness.toFixed(4)})
    set_input("Roughness", ${p.specular_roughness.toFixed(4)})
    set_input("Alpha", ${p.geometry_opacity.toFixed(4)})
    set_input("Emission Color", (${emission}))
    set_input("Emission Strength", ${p.emission_luminance.toFixed(4)})
    set_input("Coat Weight", ${p.coat_weight.toFixed(4)})
    set_input("Coat Roughness", ${p.coat_roughness.toFixed(4)})
    set_input("Sheen Weight", ${p.fuzz_weight.toFixed(4)})
    set_input("IOR", ${p.specular_ior.toFixed(4)})

for obj in bpy.context.selected_objects:
    if hasattr(obj.data, "materials"):
        if obj.data.materials:
            obj.data.materials[0] = mat
        else:
            obj.data.materials.append(mat)

print("Applied OpenPBR approximation:", mat.name)
`;
}

export function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function clampNumber(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, number));
}

function clampColor(value) {
  const color = Array.isArray(value) ? value : [0, 0, 0];
  return [0, 1, 2].map((index) => clampNumber(color[index] ?? 0, 0, 1));
}

function mixColor(a, b, weight) {
  const amount = clampNumber(weight, 0, 1);
  return [0, 1, 2].map((index) => a[index] * (1 - amount) + b[index] * amount);
}

function rgbToHex(rgb) {
  return `#${rgb
    .map((value) => Math.round(clampNumber(value, 0, 1) * 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

function sanitizeName(name) {
  return String(name || "material")
    .trim()
    .replace(/[^a-zA-Z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64) || "material";
}

function labelFromOpenPbrExampleName(name) {
  return String(name || "")
    .replace(/^open_pbr_/, "")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function parseXmlAttributes(attributeText) {
  const attrs = {};
  const pattern = /([a-zA-Z_:][\w:.-]*)="([^"]*)"/g;
  let match;
  while ((match = pattern.exec(attributeText))) {
    attrs[match[1]] = match[2];
  }
  return attrs;
}

function defaultOpenPbr() {
  return Object.fromEntries(OPENPBR_SCHEMA.map(([key, , , defaultValue]) => [key, structuredClone(defaultValue)]));
}

function normalizeOpenPbrKeys(keys = []) {
  const schemaKeys = new Set(OPENPBR_SCHEMA.map(([key]) => key));
  return Array.from(new Set(keys.filter((key) => schemaKeys.has(key))));
}

function materialOpenPbrKeys(material) {
  const keys = normalizeOpenPbrKeys(material.explicitOpenPbrKeys || []);
  return keys.length ? keys : OPENPBR_SCHEMA.map(([key]) => key);
}

function buildAdvancedGroups() {
  return buildGroupsFromKeys(OPENPBR_SCHEMA.map(([key]) => key));
}

function buildSimpleGroups() {
  return buildGroupsFromKeys(OPENPBR_SCHEMA
    .filter(([, , , , , , , , mode]) => mode === "simple")
    .map(([key]) => key));
}

export function buildOpenPbrGroupsFromKeys(keys = []) {
  return buildGroupsFromKeys(normalizeOpenPbrKeys(keys));
}

function buildGroupsFromKeys(keys = []) {
  const groups = new Map();
  const visibleKeys = new Set(keys);
  for (const [key, label, type, , min, max, step, group] of OPENPBR_SCHEMA) {
    if (!visibleKeys.has(key)) continue;
    if (!groups.has(group)) groups.set(group, { title: group, params: [] });
    groups.get(group).params.push([key, label, min, max, step, type]);
  }
  return Array.from(groups.values());
}

function normalizeInputSources(inputSources = {}) {
  const schemaByKey = new Map(OPENPBR_SCHEMA.map(([key, , type]) => [key, type]));
  const normalized = {};
  for (const [key, source] of Object.entries(inputSources || {})) {
    const type = schemaByKey.get(key);
    if ((type === "float" || type === "color3") && (source === "texture" || source === "procedural")) {
      normalized[key] = source;
    }
  }
  return normalized;
}

function normalizeTextures(textures = []) {
  if (!Array.isArray(textures)) return [];
  return textures
    .filter((texture) => texture?.name && texture?.file)
    .map((texture) => ({
      name: String(texture.name),
      file: String(texture.file),
      colorspace: texture.colorspace ? String(texture.colorspace) : undefined
    }));
}

function sourceNodeName(safeName, key, source) {
  return `${safeName}_${key}_${source}`;
}

function sourceFileName(material, key) {
  const texture = normalizeTextures(material.textures).find((candidate) => candidate.name === key);
  return texture?.file || `assets/textures/${key}.png`;
}

function sourceColorSpace(material, key, type) {
  const texture = normalizeTextures(material.textures).find((candidate) => candidate.name === key);
  if (texture?.colorspace) return texture.colorspace;
  return type === "color3" ? "srgb" : "linear";
}

function materialXSourceNodes(material, safeName) {
  return Object.entries(material.inputSources || {}).map(([key, source]) => {
    const type = openPbrTypeFor(key);
    const name = sourceNodeName(safeName, key, source);
    if (source === "texture") {
      return `  <image name="${name}" type="${type}">
    <input name="file" type="filename" value="${sourceFileName(material, key)}" />
  </image>`;
    }
    return `  <noise2d name="${name}" type="${type}">
    <input name="scale" type="float" value="25.0" />
  </noise2d>`;
  });
}

function materialXGraphSourceNodes(material, safeName) {
  return Object.entries(material.inputSources || {}).map(([key, source]) => {
    const type = openPbrTypeFor(key);
    const name = sourceNodeName(safeName, key, source);
    return {
      name,
      category: source === "texture" ? "image" : "noise2d",
      type,
      sourceKind: source,
      bindsTo: key,
      inputs: source === "texture"
        ? { file: sourceFileName(material, key), colorspace: sourceColorSpace(material, key, type) }
        : { scale: 25, amplitude: type === "color3" ? 0.18 : 0.12, octaves: 4 }
    };
  });
}

function openPbrTypeFor(key) {
  const entry = OPENPBR_SCHEMA.find(([candidate]) => candidate === key);
  return entry?.[2] || "float";
}

function materialXInput(name, type, value, source, safeName) {
  if (source === "texture" || source === "procedural") {
    return `    <input name="${name}" type="${type}" nodename="${sourceNodeName(safeName, name, source)}" />`;
  }
  if (type === "color3") return colorInput(name, value);
  if (type === "boolean") return `    <input name="${name}" type="boolean" value="${value ? "true" : "false"}" />`;
  return floatInput(name, value);
}

function floatInput(name, value) {
  return `    <input name="${name}" type="float" value="${Number(value).toFixed(6)}" />`;
}

function colorInput(name, value) {
  return `    <input name="${name}" type="color3" value="${value.map((component) => Number(component).toFixed(6)).join(", ")}" />`;
}

function inferProceduralType(category) {
  if (String(category).includes("noise")) return "float";
  return "multioutput";
}
