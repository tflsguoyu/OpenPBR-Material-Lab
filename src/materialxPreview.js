import * as THREE from "three";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import { clampMaterial, toMaterialX } from "./materialModel.js?v=mtlx6";

let runtimePromise = null;
let environmentPromise = null;

export async function createMaterialXPreviewMaterial(material, renderer) {
  const runtime = await getMaterialXRuntime();
  const env = await getMaterialXEnvironment(renderer);
  const mx = runtime.mx;
  const doc = mx.createDocument();
  doc.setDataLibrary(runtime.stdlib);

  const xml = toMaterialX(asConstantMaterial(material));
  await mx.readFromXmlString(doc, xml, "");

  const elem = mx.findRenderableElement(doc);
  if (!elem) {
    throw new Error("MaterialX did not find a renderable element.");
  }

  runtime.genContext.getOptions().hwSrgbEncodeOutput = true;
  runtime.genContext.getOptions().hwTransparency = false;
  runtime.genContext.getOptions().shaderInterfaceType = mx.ShaderInterfaceType.SHADER_INTERFACE_COMPLETE;

  const shader = runtime.generator.generate(elem.getNamePath(), elem, runtime.genContext);
  const vertexShader = stripVersion(shader.getSourceCode("vertex"));
  const fragmentShader = stripVersion(shader.getSourceCode("pixel"));
  const uniforms = {
    ...getUniformValues(shader.getStage("vertex")),
    ...getUniformValues(shader.getStage("pixel")),
    u_numActiveLightSources: { value: 0 },
    u_lightData: {
      value: [{
        type: 0,
        direction: new THREE.Vector3(0, 0, -1),
        color: new THREE.Vector3(0, 0, 0),
        intensity: 0
      }]
    },
    u_envMatrix: { value: new THREE.Matrix4().makeRotationY(Math.PI / 2) },
    u_envRadiance: { value: env.radiance },
    u_envRadianceMips: { value: env.mips },
    u_envRadianceSamples: { value: 16 },
    u_envIrradiance: { value: env.irradiance },
    u_refractionEnv: { value: true }
  };

  shader.delete?.();

  const rawMaterial = new THREE.RawShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    glslVersion: THREE.GLSL3,
    transparent: clampMaterial(material).openpbr.geometry_opacity < 0.995,
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
  if (geometry.attributes.tangent) geometry.attributes.i_tangent = geometry.attributes.tangent;
  if (geometry.attributes.uv) geometry.attributes.i_texcoord_0 = geometry.attributes.uv;
  if (geometry.attributes.uv1) geometry.attributes.i_texcoord_1 = geometry.attributes.uv1;
  if (geometry.attributes.uv2) geometry.attributes.i_texcoord_2 = geometry.attributes.uv2;
  return geometry;
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

function getMaterialXEnvironment(renderer) {
  if (!environmentPromise) {
    environmentPromise = new Promise((resolve, reject) => {
      new HDRLoader().load("./assets/envmap.hdr", (texture) => {
        const radiance = prepareEnvTexture(texture, renderer.capabilities);
        const irradiance = prepareEnvTexture(texture, renderer.capabilities);
        resolve({
          radiance,
          irradiance,
          mips: Math.trunc(Math.log2(Math.max(radiance.image.width, radiance.image.height))) + 1
        });
      }, undefined, reject);
    });
  }
  return environmentPromise;
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
