import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { WebGPURenderer, MeshSSSNodeMaterial, TSL } from "three/webgpu";
import { OrbitControls as ThreeOrbitControls } from "three/addons/controls/OrbitControls.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import { clampMaterial, toThreePhysicalProps } from "./materialModel.js?v=mtlx6";
import {
  createMaterialXPreviewMaterial,
  prepareMaterialXGeometry,
  updateMaterialXUniforms
} from "./materialxPreview.js?v=mtlx6";

const h = React.createElement;

const TEST_BALL_MESHES = [
  ["mesh000", "./assets/material_test_ball/Mesh000.obj", "neutral", {
    scale: 0.482906,
    position: [0.110507, 0.494301, 0.126194]
  }],
  ["mesh001", "./assets/material_test_ball/Mesh001.obj", "test", {
    scale: 0.482906,
    position: [0.0571719, 0.213656, 0.0682078]
  }],
  ["mesh002", "./assets/material_test_ball/Mesh002.obj", "test", {
    scale: 0.482906,
    position: [0.156382, 0.777229, 0.161698]
  }]
];

export function PreviewCompare({
  generatedMaterial,
  adjustedMaterial,
  previewMode,
  onPreviewModeChange,
  split,
  onSplitChange
}) {
  const shellRef = useRef(null);
  const cameraSyncRef = useRef(null);
  const [fps, setFps] = useState(null);
  const webGpuAvailable = canUseWebGpu();
  const rendererStatus = previewMode === "materialx"
    ? "Renderer: MaterialX ESSL constants"
    : previewMode === "sss"
      ? webGpuAvailable ? "Renderer: WebGPU SSS" : "Renderer: WebGL Physical fallback"
      : "Renderer: WebGL Physical";

  function updateSplitFromClientX(clientX) {
    const bounds = shellRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const next = ((clientX - bounds.left) / bounds.width) * 100;
    onSplitChange(Math.max(0, Math.min(100, next)));
  }

  function startDrag(event) {
    event.preventDefault();
    updateSplitFromClientX(event.clientX);
    const handleMove = (moveEvent) => updateSplitFromClientX(moveEvent.clientX);
    const stopDrag = () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", stopDrag);
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", stopDrag);
  }

  return h("div", { className: "compare-canvas-shell", ref: shellRef },
    h("div", { className: "compare-layer" },
      h(PreviewCanvas, {
        material: adjustedMaterial,
        previewMode,
        interactive: true,
        cameraSyncRef,
        onFps: setFps
      })
    ),
    h("div", {
      className: "compare-layer generated-clip",
      style: { clipPath: `inset(0 ${100 - split}% 0 0)`, pointerEvents: "none" }
    },
      h(PreviewCanvas, { material: generatedMaterial, previewMode, cameraSyncRef })
    ),
    h("div", { className: "preview-mode-toggle", role: "group", "aria-label": "Preview renderer" },
      h("button", {
        className: previewMode === "physical" ? "active" : "",
        onClick: () => onPreviewModeChange("physical")
      }, "Physical"),
      h("button", {
        className: previewMode === "sss" ? "active" : "",
        onClick: () => onPreviewModeChange("sss")
      }, "SSS"),
      h("button", {
        className: previewMode === "materialx" ? "active" : "",
        onClick: () => onPreviewModeChange("materialx")
      }, "MaterialX")
    ),
    h("div", { className: "preview-renderer-status" }, rendererStatus),
    h("div", { className: "preview-fps-status" }, fps == null ? "FPS: --" : `FPS: ${fps}`),
    h("div", {
      className: "compare-label-pair",
      style: { left: `${split}%` }
    },
      h("div", { className: "compare-label compare-label-generated" }, "Generated"),
      h("div", { className: "compare-label compare-label-adjusted" }, "Adjusted")
    ),
    h("div", {
      className: "compare-divider",
      style: { left: `${split}%` },
      onPointerDown: startDrag
    },
      h("span", null)
    )
  );
}

function PreviewCanvas({ material, previewMode, interactive = false, cameraSyncRef, onFps }) {
  const useWebGpu = previewMode === "sss" && canUseWebGpu();
  return h(Canvas, {
    key: useWebGpu ? "webgpu" : "webgl",
    camera: { position: [0, 0.32, 4.9], fov: 34 },
    gl: useWebGpu ? createWebGpuRenderer : undefined,
    onCreated: ({ gl }) => {
      gl.toneMapping = THREE.ACESFilmicToneMapping;
      gl.toneMappingExposure = 1.05;
    }
  },
    h("color", { attach: "background", args: ["#15171b"] }),
    h(HdriLighting, null),
    h(Suspense, { fallback: null },
      h(MaterialTestBall, { material, previewMode: previewMode === "materialx" ? "materialx" : useWebGpu ? "sss" : "physical" })
    ),
    onFps ? h(FpsSampler, { onFps }) : null,
    interactive ? h(OrbitControls, { cameraSyncRef }) : h(CameraFollower, { cameraSyncRef })
  );
}

function FpsSampler({ onFps }) {
  const frames = useRef(0);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    frames.current += 1;
    elapsed.current += delta;
    if (elapsed.current >= 0.5) {
      onFps(Math.round(frames.current / elapsed.current));
      frames.current = 0;
      elapsed.current = 0;
    }
  });

  return null;
}

async function createWebGpuRenderer(props) {
  const renderer = new WebGPURenderer({
    ...props,
    antialias: true
  });
  await renderer.init();
  return renderer;
}

function canUseWebGpu() {
  return typeof navigator !== "undefined" && Boolean(navigator.gpu);
}

function HdriLighting() {
  const { scene } = useThree();

  useEffect(() => {
    let cancelled = false;
    const loader = new HDRLoader();

    loader.load("./assets/envmap.hdr", (texture) => {
      if (cancelled) {
        texture.dispose();
        return;
      }

      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
      scene.environmentIntensity = 1.15;
    });

    return () => {
      cancelled = true;
      if (scene.environment) {
        scene.environment.dispose();
        scene.environment = null;
      }
    };
  }, [scene]);

  return null;
}

function MaterialTestBall({ material, previewMode }) {
  const { gl } = useThree();
  const props = toThreePhysicalProps(material);
  const [materialXPreviewMaterial, setMaterialXPreviewMaterial] = useState(null);
  const physicalFallbackMaterial = useMemo(() => createPreviewMaterial(material, props, previewMode), [material, previewMode]);
  const testMaterial = previewMode === "materialx" && materialXPreviewMaterial
    ? materialXPreviewMaterial
    : physicalFallbackMaterial;
  const neutralMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#777b82",
    roughness: 0.58,
    metalness: 0,
    side: THREE.DoubleSide
  }), []);

  useEffect(() => {
    if (previewMode !== "materialx") {
      setMaterialXPreviewMaterial(null);
      return undefined;
    }

    let cancelled = false;
    createMaterialXPreviewMaterial(material, gl).then((nextMaterial) => {
      if (cancelled) {
        nextMaterial.dispose();
        return;
      }
      setMaterialXPreviewMaterial((previous) => {
        previous?.dispose();
        return nextMaterial;
      });
    }).catch((error) => {
      console.error("MaterialX preview failed:", error);
      if (!cancelled) setMaterialXPreviewMaterial(null);
    });

    return () => {
      cancelled = true;
    };
  }, [material, previewMode, gl]);

  const entries = useMemo(() => TEST_BALL_MESHES.map(([key, url, materialRole, transform]) => [
    key,
    url,
    materialRole === "test" ? testMaterial : neutralMaterial,
    transform
  ]), [testMaterial, neutralMaterial]);
  const meshes = useObjMeshes(entries);

  return h("group", null,
    h("group", { scale: 1.52, position: [-0.16, -0.9, -0.04] },
      meshes.map(({ key, object }) => h("primitive", { key, object }))
    )
  );
}

function createPreviewMaterial(material, props, previewMode) {
  if (previewMode !== "sss") {
    return new THREE.MeshPhysicalMaterial(props);
  }

  const p = clampMaterial(material).openpbr;
  const sssMaterial = new MeshSSSNodeMaterial(props);
  const sssWeight = p.subsurface_weight;

  if (sssWeight > 0) {
    sssMaterial.thicknessColorNode = TSL.color(rgbToCss(p.subsurface_color));
    sssMaterial.thicknessDistortionNode = TSL.float(Math.min(1, 0.08 + p.subsurface_scatter_anisotropy * 0.25));
    sssMaterial.thicknessAmbientNode = TSL.float(Math.min(1, 0.12 + sssWeight * 0.35));
    sssMaterial.thicknessAttenuationNode = TSL.float(Math.min(1, 0.08 + sssWeight * 0.75));
    sssMaterial.thicknessPowerNode = TSL.float(Math.max(0.5, 2.8 - p.subsurface_radius * 0.18));
    sssMaterial.thicknessScaleNode = TSL.float(Math.max(0.1, p.subsurface_radius * sssWeight * 4));
  }

  return sssMaterial;
}

function rgbToCss(colorValue) {
  const [r, g, b] = colorValue.map((channel) => Math.round(Math.max(0, Math.min(1, channel)) * 255));
  return `rgb(${r}, ${g}, ${b})`;
}

function useObjMeshes(entries) {
  const [meshes, setMeshes] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const loader = new OBJLoader();
    Promise.all(entries.map(([key, url, material, transform]) => loadObj(loader, url).then((object) => {
      object.traverse((child) => {
        if (child.isMesh) {
          child.material = material;
          child.castShadow = true;
          child.receiveShadow = true;
          child.geometry = smoothGeometry(child.geometry);
          prepareMaterialXGeometry(child.geometry);
          child.onBeforeRender = (_renderer, _scene, camera) => {
            updateMaterialXUniforms(child, child.material, camera);
          };
        }
      });
      if (transform) {
        object.scale.setScalar(transform.scale);
        object.position.set(...transform.position);
      }
      return { key, object };
    }))).then((loaded) => {
      if (!cancelled) setMeshes(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [entries]);

  return meshes;
}

function smoothGeometry(geometry) {
  const smoothed = geometry.clone();
  const position = smoothed.getAttribute("position");
  const index = smoothed.index;
  if (!position) return smoothed;

  const tolerance = 10000;
  const normalSums = new Map();
  const normal = new THREE.BufferAttribute(new Float32Array(position.count * 3), 3);
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const cb = new THREE.Vector3();
  const ab = new THREE.Vector3();

  const vertexIndex = (triangleOffset) => index ? index.getX(triangleOffset) : triangleOffset;
  const keyFor = (vertex) => {
    const x = Math.round(position.getX(vertex) * tolerance);
    const y = Math.round(position.getY(vertex) * tolerance);
    const z = Math.round(position.getZ(vertex) * tolerance);
    return `${x},${y},${z}`;
  };
  const addNormal = (vertex, faceNormal) => {
    const key = keyFor(vertex);
    const sum = normalSums.get(key) ?? new THREE.Vector3();
    sum.add(faceNormal);
    normalSums.set(key, sum);
  };

  const triangleCount = index ? index.count : position.count;
  for (let i = 0; i < triangleCount; i += 3) {
    const ia = vertexIndex(i);
    const ib = vertexIndex(i + 1);
    const ic = vertexIndex(i + 2);
    a.fromBufferAttribute(position, ia);
    b.fromBufferAttribute(position, ib);
    c.fromBufferAttribute(position, ic);
    cb.subVectors(c, b);
    ab.subVectors(a, b);
    const faceNormal = cb.cross(ab).normalize();
    addNormal(ia, faceNormal);
    addNormal(ib, faceNormal);
    addNormal(ic, faceNormal);
  }

  for (let i = 0; i < position.count; i += 1) {
    const smoothedNormal = normalSums.get(keyFor(i)) ?? new THREE.Vector3(0, 1, 0);
    smoothedNormal.normalize();
    normal.setXYZ(i, smoothedNormal.x, smoothedNormal.y, smoothedNormal.z);
  }

  smoothed.setAttribute("normal", normal);
  return smoothed;
}

function loadObj(loader, url) {
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });
}

function CameraFollower({ cameraSyncRef }) {
  const { camera } = useThree();

  useFrame(() => {
    const synced = cameraSyncRef?.current;
    if (!synced) return;
    camera.position.copy(synced.position);
    camera.quaternion.copy(synced.quaternion);
    camera.zoom = synced.zoom;
    camera.updateProjectionMatrix();
  });

  return null;
}

function OrbitControls({ cameraSyncRef }) {
  const { camera, gl } = useThree();
  const controls = useRef(null);

  useEffect(() => {
    controls.current = new ThreeOrbitControls(camera, gl.domElement);
    controls.current.enableDamping = true;
    controls.current.target.set(0, 0, 0);
    return () => controls.current?.dispose();
  }, [camera, gl]);

  useFrame(() => {
    controls.current?.update();
    if (cameraSyncRef) {
      cameraSyncRef.current = {
        position: camera.position.clone(),
        quaternion: camera.quaternion.clone(),
        zoom: camera.zoom
      };
    }
  });
  return null;
}
