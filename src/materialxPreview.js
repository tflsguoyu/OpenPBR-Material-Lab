import * as THREE from "three";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import { clampMaterial, toMaterialX } from "./materialModel.js?v=mtlx26";

let runtimePromise = null;
let environmentPromise = null;
const ENV_RADIANCE_URL = "./assets/envmap/san_giuseppe_bridge_split.hdr";
const ENV_IRRADIANCE_URL = "./assets/envmap/san_giuseppe_bridge_split_irradiance.hdr";
const LIGHT_RIG_URL = "./assets/envmap/san_giuseppe_bridge_split.mtlx";

export async function createMaterialXPreviewMaterial(material, renderer) {
  const runtime = await getMaterialXRuntime();
  const env = await getMaterialXEnvironment(renderer);
  const normalized = clampMaterial(material);
  const openpbr = normalized.openpbr;
  const mx = runtime.mx;
  const doc = mx.createDocument();
  doc.setDataLibrary(runtime.stdlib);

  const xml = toMaterialX(asConstantMaterial(normalized));
  await mx.readFromXmlString(doc, xml, "");

  const elem = mx.findRenderableElement(doc);
  if (!elem) {
    throw new Error("MaterialX did not find a renderable element.");
  }

  const { lights, lightData } = await getMaterialXLights(runtime);
  runtime.genContext.getOptions().hwSrgbEncodeOutput = true;
  const isTransparent = mx.isTransparentSurface(elem, runtime.generator.getTarget());
  runtime.genContext.getOptions().hwTransparency = isTransparent;
  runtime.genContext.getOptions().shaderInterfaceType = mx.ShaderInterfaceType.SHADER_INTERFACE_COMPLETE;

  const shader = runtime.generator.generate(elem.getNamePath(), elem, runtime.genContext);
  const vertexShader = stripVersion(shader.getSourceCode("vertex"));
  const fragmentShader = isTransparent
    ? disableEnvironmentTransmission(stripVersion(shader.getSourceCode("pixel")))
    : stripVersion(shader.getSourceCode("pixel"));
  const uniforms = {
    ...getUniformValues(shader.getStage("vertex")),
    ...getUniformValues(shader.getStage("pixel")),
    u_numActiveLightSources: { value: lights.length },
    u_lightData: { value: lightData },
    u_envMatrix: { value: getLightRotation() },
    u_envRadiance: { value: env.radiance },
    u_envRadianceMips: { value: env.mips },
    u_envRadianceSamples: { value: 16 },
    u_envIrradiance: { value: env.irradiance },
    u_envLightIntensity: { value: 1.15 },
    u_refractionTwoSided: { value: !openpbr.geometry_thin_walled },
    u_refractionEnv: { value: true },
    u_sceneColor: { value: createFallbackSceneTexture() },
    u_viewportSize: { value: new THREE.Vector2(1, 1) },
    u_transmissionDepth: { value: openpbr.geometry_thin_walled ? 0 : openpbr.transmission_depth }
  };

  shader.delete?.();

  const rawMaterial = new THREE.RawShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    glslVersion: THREE.GLSL3,
    transparent: isTransparent,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneMinusSrcAlphaFactor,
    blendDst: THREE.SrcAlphaFactor,
    side: THREE.DoubleSide,
    name: "MaterialX Constant OpenPBR"
  });
  rawMaterial.userData.isMaterialXPreview = true;
  return rawMaterial;
}

export function prepareMaterialXGeometry(geometry) {
  if (!geometry) return geometry;
  if (geometry.attributes.position) geometry.attributes.i_position = geometry.attributes.position;
  if (geometry.attributes.normal) geometry.attributes.i_normal = geometry.attributes.normal;
  geometry.attributes.i_tangent = geometry.attributes.tangent || createFallbackTangents(geometry);
  if (geometry.attributes.uv) geometry.attributes.i_texcoord_0 = geometry.attributes.uv;
  if (geometry.attributes.uv1) geometry.attributes.i_texcoord_1 = geometry.attributes.uv1;
  if (geometry.attributes.uv2) geometry.attributes.i_texcoord_2 = geometry.attributes.uv2;
  return geometry;
}

function createFallbackTangents(geometry) {
  const normal = geometry.attributes.normal;
  const position = geometry.attributes.position;
  if (!normal || !position) return undefined;

  const tangents = new Float32Array(position.count * 3);
  const normalVector = new THREE.Vector3();
  const reference = new THREE.Vector3();
  const tangent = new THREE.Vector3();

  for (let i = 0; i < position.count; i += 1) {
    normalVector.fromBufferAttribute(normal, i).normalize();
    reference.set(Math.abs(normalVector.y) < 0.999 ? 0 : 1, Math.abs(normalVector.y) < 0.999 ? 1 : 0, 0);
    tangent.crossVectors(reference, normalVector).normalize();
    tangents[i * 3] = tangent.x;
    tangents[i * 3 + 1] = tangent.y;
    tangents[i * 3 + 2] = tangent.z;
  }

  return new THREE.BufferAttribute(tangents, 3);
}

export function updateMaterialXUniforms(object, material, camera) {
  if (!material?.userData?.isMaterialXPreview || !material.uniforms) return;
  const uniforms = material.uniforms;
  if (uniforms.u_worldMatrix) uniforms.u_worldMatrix.value = object.matrixWorld;
  if (uniforms.u_viewProjectionMatrix) {
    if (!uniforms.u_viewProjectionMatrix.value?.multiplyMatrices) {
      uniforms.u_viewProjectionMatrix.value = new THREE.Matrix4();
    }
    uniforms.u_viewProjectionMatrix.value.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  }
  if (uniforms.u_viewPosition) {
    if (!uniforms.u_viewPosition.value?.isVector3) {
      uniforms.u_viewPosition.value = new THREE.Vector3();
    }
    uniforms.u_viewPosition.value = camera.getWorldPosition(uniforms.u_viewPosition.value || new THREE.Vector3());
  }
  if (uniforms.u_worldInverseTransposeMatrix) {
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(object.matrixWorld);
    uniforms.u_worldInverseTransposeMatrix.value = new THREE.Matrix4().setFromMatrix3(normalMatrix);
  }
  material.uniformsNeedUpdate = true;
}

export function updateMaterialXTransmissionTarget(material, texture, size) {
  if (!material?.userData?.isMaterialXPreview || !material.uniforms) return;
  if (material.uniforms.u_sceneColor && texture) {
    material.uniforms.u_sceneColor.value = texture;
  }
  if (material.uniforms.u_viewportSize && size) {
    material.uniforms.u_viewportSize.value.set(Math.max(1, size.width), Math.max(1, size.height));
  }
}

function getMaterialXRuntime() {
  if (!runtimePromise) {
    runtimePromise = import("../vendor/materialx/JsMaterialXGenShader.js")
      .then(({ default: MaterialX }) => MaterialX({
        locateFile: (path) => `./vendor/materialx/${path}`
      }))
      .then((mx) => {
        const generator = mx.EsslShaderGenerator.create();
        const genContext = new mx.GenContext(generator);
        const stdlib = mx.loadStandardLibraries(genContext);
        return { mx, generator, genContext, stdlib };
      });
  }
  return runtimePromise;
}

async function getMaterialXLights(runtime) {
  const mx = runtime.mx;
  const lightRigXml = await loadText(LIGHT_RIG_URL);
  const lightDoc = mx.createDocument();
  lightDoc.setDataLibrary(runtime.stdlib);
  await mx.readFromXmlString(lightDoc, lightRigXml, "");
  const lights = Array.from(lightDoc.getNodes()).filter((node) => node.getType() === "lightshader");
  const lightData = registerLights(mx, lights, runtime.genContext);
  return { lights, lightData };
}

function registerLights(mx, lights, genContext) {
  mx.HwShaderGenerator.unbindLightShaders(genContext);

  const lightTypesBound = {};
  const lightData = [];
  let lightId = 1;
  for (const light of lights) {
    const nodeDef = light.getNodeDef();
    const nodeName = nodeDef.getName();
    if (!lightTypesBound[nodeName]) {
      lightTypesBound[nodeName] = lightId;
      mx.HwShaderGenerator.bindLightShader(nodeDef, lightId, genContext);
      lightId += 1;
    }

    const lightDirection = light.getValueElement("direction").getValue().getData().data();
    const lightColor = light.getValueElement("color").getValue().getData().data();
    const lightIntensity = light.getValueElement("intensity").getValue().getData();
    const rotatedLightDirection = new THREE.Vector3(...lightDirection);
    rotatedLightDirection.transformDirection(getLightRotation());

    lightData.push({
      type: lightTypesBound[nodeName],
      direction: rotatedLightDirection,
      color: new THREE.Vector3(...lightColor),
      intensity: lightIntensity
    });
  }

  genContext.getOptions().hwMaxActiveLightSources = Math.max(
    genContext.getOptions().hwMaxActiveLightSources,
    lights.length
  );
  return lightData;
}

function getMaterialXEnvironment(renderer) {
  if (!environmentPromise) {
    const loader = new HDRLoader();
    environmentPromise = Promise.all([
      loadHdr(loader, ENV_RADIANCE_URL),
      loadHdr(loader, ENV_IRRADIANCE_URL)
    ]).then(([radianceTexture, irradianceTexture]) => {
      const radiance = prepareEnvTexture(radianceTexture, renderer.capabilities);
      const irradiance = prepareEnvTexture(irradianceTexture, renderer.capabilities);
      return {
        radiance,
        irradiance,
        mips: Math.trunc(Math.log2(Math.max(radiance.image.width, radiance.image.height))) + 1
      };
    });
  }
  return environmentPromise;
}

function loadHdr(loader, url) {
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });
}

function loadText(url) {
  return new Promise((resolve, reject) => {
    new THREE.FileLoader().load(url, resolve, undefined, reject);
  });
}

function prepareEnvTexture(texture, capabilities) {
  const prepared = new THREE.DataTexture(
    texture.image.data,
    texture.image.width,
    texture.image.height,
    texture.format,
    texture.type
  );
  prepared.wrapS = THREE.RepeatWrapping;
  prepared.wrapT = THREE.RepeatWrapping;
  prepared.anisotropy = capabilities.getMaxAnisotropy();
  prepared.minFilter = THREE.LinearMipmapLinearFilter;
  prepared.magFilter = THREE.LinearFilter;
  prepared.generateMipmaps = true;
  prepared.needsUpdate = true;
  return prepared;
}

function getUniformValues(shaderStage) {
  const threeUniforms = {};
  Object.values(shaderStage.getUniformBlocks()).forEach((uniforms) => {
    if (uniforms.empty()) return;
    for (let i = 0; i < uniforms.size(); i += 1) {
      const variable = uniforms.get(i);
      const value = variable.getValue()?.getData();
      const threeValue = toThreeUniform(variable.getType().getName(), value);
      if (threeValue !== null) {
        threeUniforms[variable.getVariable()] = new THREE.Uniform(threeValue);
      }
    }
  });
  return threeUniforms;
}

function getLightRotation() {
  return new THREE.Matrix4().makeRotationY(Math.PI / 2);
}

function toThreeUniform(type, value) {
  switch (type) {
    case "float":
    case "integer":
    case "boolean":
      return value;
    case "vector2":
      return fromVector(value, 2);
    case "vector3":
    case "color3":
      return fromVector(value, 3);
    case "vector4":
    case "color4":
      return fromVector(value, 4);
    case "matrix33":
      return new THREE.Matrix3().fromArray(fromMatrix(value, 9));
    case "matrix44":
      return new THREE.Matrix4().fromArray(fromMatrix(value, 16));
    default:
      return null;
  }
}

function fromVector(value, dimension) {
  return value ? value.data() : Array.from({ length: dimension }, () => 0);
}

function fromMatrix(value, dimension) {
  if (!value) return Array.from({ length: dimension }, () => 0);
  const entries = [];
  for (let row = 0; row < value.numRows(); row += 1) {
    for (let column = 0; column < value.numColumns(); column += 1) {
      entries.push(value.getItem(row, column));
    }
  }
  return entries;
}

function asConstantMaterial(material) {
  const normalized = clampMaterial(material);
  return {
    ...normalized,
    inputSources: {},
    textures: [],
    procedural: {}
  };
}

function stripVersion(shaderSource) {
  return shaderSource.replace(/^#version\s+.*\n/, "");
}

function disableEnvironmentTransmission(shaderSource) {
  const withSceneUniforms = shaderSource.replace(
    /(precision\s+highp\s+float;\s*)/,
    `$1
uniform sampler2D u_sceneColor;
uniform vec2 u_viewportSize;
uniform float u_transmissionDepth;
`
  );

  return withSceneUniforms.replace(
    /vec3 mx_surface_transmission\(vec3 N, vec3 V, vec3 X, vec2 alpha, int distribution, FresnelData fd, vec3 tint\)\s*\{\s*\/\/ Approximate the appearance of surface transmission as glossy[\s\S]*?return mx_environment_radiance\(N, V, X, alpha, distribution, fd\) \* tint;\s*\}/,
    `vec3 mx_surface_transmission(vec3 N, vec3 V, vec3 X, vec2 alpha, int distribution, FresnelData fd, vec3 tint)
{
    float eta = max(fd.ior.x, 1.0);
    vec3 refracted = refract(-V, normalize(N), 1.0 / eta);
    vec2 offset = refracted.xy * u_transmissionDepth * 0.24;
    vec2 sceneUv = gl_FragCoord.xy / max(u_viewportSize, vec2(1.0)) + offset;
    sceneUv = clamp(sceneUv, vec2(0.0), vec2(1.0));
    return texture(u_sceneColor, sceneUv).rgb * tint;
}`
  );
}

function createFallbackSceneTexture() {
  const texture = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1, THREE.RGBAFormat);
  texture.needsUpdate = true;
  return texture;
}
