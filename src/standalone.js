import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls as ThreeOrbitControls } from "three/addons/controls/OrbitControls.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import {
  DEFAULT_MATERIAL,
  MATERIAL_PRESETS,
  OPENPBR_EXAMPLE_PRESETS,
  ADVANCED_PARAMETER_GROUPS,
  buildOpenPbrGroupsFromKeys,
  OPENPBR_SCHEMA,
  SIMPLE_PARAMETER_GROUPS,
  clampMaterial,
  downloadText,
  materialFromMaterialXGraph,
  materialFromOpenPbrMtlx,
  materialFromPrompt,
  toBlenderPython,
  toMaterialXGraph,
  toMaterialX,
  toThreePhysicalProps
} from "./materialModel.js?v=githubpages1";

const h = React.createElement;

function App() {
  const [generatedMaterial, setGeneratedMaterial] = useState(DEFAULT_MATERIAL);
  const [material, setMaterial] = useState(DEFAULT_MATERIAL);
  const [prompt, setPrompt] = useState(DEFAULT_MATERIAL.description);
  const [graphDraft, setGraphDraft] = useState("");
  const [graphMessage, setGraphMessage] = useState("Synced from OpenPBR parameters.");
  const [compareSplit, setCompareSplit] = useState(50);
  const [parameterMode, setParameterMode] = useState("simple");
  const [referenceImage, setReferenceImage] = useState(null);
  const imageInputRef = useRef(null);
  const materialX = useMemo(() => toMaterialX(material), [material]);
  const materialXGraph = useMemo(() => toMaterialXGraph(material), [material]);
  const materialXGraphJson = useMemo(() => JSON.stringify(materialXGraph, null, 2), [materialXGraph]);
  const blenderPython = useMemo(() => toBlenderPython(material), [material]);

  useEffect(() => {
    setGraphDraft(materialXGraphJson);
    setGraphMessage("Synced from OpenPBR parameters.");
  }, [materialXGraphJson]);

  function updateParam(key, value) {
    setMaterial((current) => clampMaterial({
      ...current,
      explicitOpenPbrKeys: addExplicitKey(current.explicitOpenPbrKeys, key),
      openpbr: {
        ...current.openpbr,
        [key]: Number(value)
      }
    }));
  }

  function updateBool(key, value) {
    setMaterial((current) => clampMaterial({
      ...current,
      explicitOpenPbrKeys: addExplicitKey(current.explicitOpenPbrKeys, key),
      openpbr: {
        ...current.openpbr,
        [key]: Boolean(value)
      }
    }));
  }

  function updateInputSource(key, source) {
    setMaterial((current) => {
      const nextSources = { ...(current.inputSources || {}) };
      if (source === "value") {
        delete nextSources[key];
      } else {
        nextSources[key] = source;
      }
      return clampMaterial({
        ...current,
        explicitOpenPbrKeys: addExplicitKey(current.explicitOpenPbrKeys, key),
        inputSources: nextSources
      });
    });
  }

  function updateColor(key, value) {
    const numeric = Number.parseInt(value.slice(1), 16);
    const color = [
      ((numeric >> 16) & 255) / 255,
      ((numeric >> 8) & 255) / 255,
      (numeric & 255) / 255
    ];
    setMaterial((current) => clampMaterial({
      ...current,
      explicitOpenPbrKeys: addExplicitKey(current.explicitOpenPbrKeys, key),
      openpbr: {
        ...current.openpbr,
        [key]: color
      }
    }));
  }

  function applyGraphDraft() {
    try {
      const parsed = JSON.parse(graphDraft);
      const next = materialFromMaterialXGraph(parsed, material);
      setGeneratedMaterial(next);
      setMaterial(next);
      setPrompt(next.description);
      setGraphMessage("Applied pasted MaterialX graph JSON.");
    } catch (error) {
      setGraphMessage(`Invalid JSON: ${error.message}`);
    }
  }

  function generateFromPrompt() {
    const next = materialFromPrompt(prompt);
    setGeneratedMaterial(next);
    setMaterial(next);
  }

  function updateReferenceImage(event) {
    const file = event.target.files?.[0] || null;
    setReferenceImage(file ? { name: file.name, size: file.size } : null);
  }

  function applyPreset(preset) {
    const next = clampMaterial(preset);
    setGeneratedMaterial(next);
    setMaterial(next);
    setPrompt(next.description);
  }

  async function applyExamplePreset(preset) {
    try {
      setGraphMessage(`Loading ${preset.label} from local OpenPBR example.`);
      const response = await fetch(preset.url);
      if (!response.ok) {
        throw new Error(`Could not load ${preset.url}`);
      }
      const xml = await response.text();
      const next = materialFromOpenPbrMtlx(xml, material, preset.name);
      setGeneratedMaterial(next);
      setMaterial(next);
      setPrompt(next.description);
      setGraphMessage(`Loaded ${preset.label} from assets/examples.`);
    } catch (error) {
      setGraphMessage(`Preset load failed: ${error.message}`);
    }
  }

  const visibleGroups = useMemo(() => {
    if (parameterMode === "advanced") return ADVANCED_PARAMETER_GROUPS;
    const explicitKeys = new Set(material.explicitOpenPbrKeys || []);
    if (!explicitKeys.size) return SIMPLE_PARAMETER_GROUPS;
    return buildOpenPbrGroupsFromKeys(Array.from(explicitKeys));
  }, [material.explicitOpenPbrKeys, parameterMode]);
  const schemaByKey = useMemo(() => new Map(OPENPBR_SCHEMA.map(([key, label, type]) => [key, { label, type }])), []);

  return h("main", { className: "app-shell" },
    h("section", { className: "left-rail io-rail" },
      h("div", { className: "brand" },
        h("div", { className: "mark" }, "PBR"),
        h("div", null,
          h("h1", null, "OpenPBR Material Lab"),
          h("p", null, "Natural language -> MaterialX graph -> OpenPBR preview")
        )
      ),
      h("div", { className: "io-stack" },
        h(StageCard, { title: "Input A", className: "input-card compact-input-card" },
          h("textarea", {
            id: "prompt",
            value: prompt,
            spellCheck: "false",
            onChange: (event) => setPrompt(event.target.value)
          }),
          h("div", { className: "input-action-row" },
            h("input", {
              ref: imageInputRef,
              className: "visually-hidden-file",
              type: "file",
              accept: "image/*",
              onChange: updateReferenceImage
            }),
            h("button", {
              type: "button",
              className: "upload-button",
              onClick: () => imageInputRef.current?.click()
            }, "Upload image"),
            h("button", { className: "generate-button", onClick: generateFromPrompt }, "Generate MaterialX graph JSON"),
            h("span", { className: "upload-status" },
              referenceImage ? referenceImage.name : "No image selected"
            )
          ),
          h("div", { className: "preset-grid compact-presets" },
            MATERIAL_PRESETS.map((preset, index) => h("button", {
              key: preset.name,
              className: "preset-card",
              onClick: () => applyPreset(preset)
            }, `Example ${index + 1}`))
          )
        ),
        h(StageCard, { title: "Output: MaterialX graph JSON" },
          h("textarea", {
            className: "graph-editor",
            value: graphDraft,
            spellCheck: "false",
            onChange: (event) => {
              setGraphDraft(event.target.value);
              setGraphMessage("Editing pasted/generated graph. Apply it to update preview and parameters.");
            }
          }),
          h("div", { className: graphMessage.startsWith("Invalid") ? "graph-message error" : "graph-message" }, graphMessage),
          h("div", { className: "export-actions" },
            h("button", { onClick: applyGraphDraft }, "Apply JSON"),
            h("button", { onClick: () => downloadText(`${safeFileName(material.name)}_materialx_graph.json`, graphDraft) }, "Export JSON"),
            h("button", { onClick: () => downloadText(`${safeFileName(material.name)}.mtlx`, materialX) }, "Export .mtlx"),
            h("button", { onClick: () => downloadText(`${safeFileName(material.name)}_blender.py`, blenderPython) }, "Export Blender")
          )
        )
      )
    ),

    h("section", { className: "presets-rail" },
      h(StageCard, { title: "Presets", className: "official-preset-card" },
        h("div", { className: "official-preset-grid" },
          OPENPBR_EXAMPLE_PRESETS.map((preset) => h("button", {
            key: preset.name,
            className: "official-preset-button",
            "data-preset": preset.name,
            onMouseDown: () => applyExamplePreset(preset),
            title: preset.name
          }, preset.label))
        )
      )
    ),

    h("section", { className: "preview-region" },
      h(PreviewCompare, {
        generatedMaterial,
        adjustedMaterial: material,
        split: compareSplit,
        onSplitChange: setCompareSplit
      })
    ),

    h("section", { className: "right-rail params-rail" },
      h(StageCard, {
        title: "OpenPBR parameters",
        action: h("button", {
          className: "compact-reset-button",
          onClick: () => setMaterial(generatedMaterial)
        }, "Reset")
      },
        h("div", { className: "mode-toggle", role: "group", "aria-label": "Parameter detail mode" },
          ["simple", "advanced"].map((mode) => h("button", {
            key: mode,
            className: parameterMode === mode ? "active" : "",
            onClick: () => setParameterMode(mode)
          }, mode === "simple" ? "Simple" : "Advanced"))
        ),
        h("div", { className: "generated-field" },
          h("span", null, "Material name"),
          h("input", {
            value: material.name,
            "aria-label": "Material name",
            onChange: (event) => setMaterial((current) => ({ ...current, name: event.target.value }))
          })
        ),
        visibleGroups.map((group) => h("div", { className: "parameter-group", key: group.title },
          h("h2", null, group.title),
          group.params.map(([key, label, min, max, step, type]) => {
            if (type === "color3") {
              return h(ColorEditor, {
                key,
                label,
                value: material.openpbr[key],
                source: material.inputSources?.[key] || "value",
                onSourceChange: (source) => updateInputSource(key, source),
                onChange: (value) => updateColor(key, value)
              });
            }
            if (type === "boolean") {
              return h("label", { className: "toggle-row", key },
              h("span", null, label),
              h("input", {
                type: "checkbox",
                checked: Boolean(material.openpbr[key]),
                onChange: (event) => updateBool(key, event.target.checked)
              })
              );
            }
            return h("label", { className: "slider-row", key },
              h("span", null, label),
              h("input", {
                type: "range",
                min,
                max,
                step,
                value: material.openpbr[key],
                onChange: (event) => updateParam(key, event.target.value)
              }),
              h("output", null, Number(material.openpbr[key]).toFixed(step >= 1 ? 0 : step < 0.01 ? 3 : 2)),
              h(SourceSelect, {
                value: material.inputSources?.[key] || "value",
                disabled: schemaByKey.get(key)?.type !== "float",
                onChange: (source) => updateInputSource(key, source)
              })
            );
          })
        ))
      )
    )
  );
}

function StageCard({ number, title, note, action, className = "", children }) {
  return h("section", { className: `stage-card ${className}`.trim() },
    h("div", { className: `${number ? "stage-heading" : "stage-heading no-badge"}${action ? " with-action" : ""}` },
      number ? h("span", { className: "stage-number" }, number) : null,
      h("div", null,
        h("h2", null, title),
        note ? h("p", null, note) : null
      ),
      action ? h("div", { className: "stage-action" }, action) : null
    ),
    children
  );
}

function PreviewCompare({ generatedMaterial, adjustedMaterial, split, onSplitChange }) {
  const shellRef = useRef(null);
  const cameraSyncRef = useRef(null);

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
      h(PreviewCanvas, { material: adjustedMaterial, interactive: true, cameraSyncRef })
    ),
    h("div", {
      className: "compare-layer generated-clip",
      style: { clipPath: `inset(0 ${100 - split}% 0 0)`, pointerEvents: "none" }
    },
      h(PreviewCanvas, { material: generatedMaterial, cameraSyncRef })
    ),
    h("div", { className: "compare-label compare-label-left" }, "Generated"),
    h("div", { className: "compare-label compare-label-right" }, "Adjusted"),
    h("div", {
      className: "compare-divider",
      style: { left: `${split}%` },
      onPointerDown: startDrag
    },
      h("span", null)
    )
  );
}

function PreviewCanvas({ material, interactive = false, cameraSyncRef }) {
  return h(Canvas, {
    camera: { position: [0, 0.32, 4.9], fov: 34 },
    onCreated: ({ gl }) => {
      gl.toneMapping = THREE.ACESFilmicToneMapping;
      gl.toneMappingExposure = 1.05;
    }
  },
    h("color", { attach: "background", args: ["#15171b"] }),
    h(HdriLighting, null),
    h(Suspense, { fallback: null },
      h(MaterialTestBall, { material })
    ),
    interactive ? h(OrbitControls, { cameraSyncRef }) : h(CameraFollower, { cameraSyncRef })
  );
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

function MaterialTestBall({ material }) {
  const props = toThreePhysicalProps(material);
  const testMaterial = useMemo(() => new THREE.MeshPhysicalMaterial(props), [material]);
  const grayMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#777b82",
    roughness: 0.58,
    metalness: 0,
    side: THREE.DoubleSide
  }), []);
  const entries = useMemo(() => [
    ["mesh000", "./assets/material_test_ball/Mesh000.obj", grayMaterial, {
      scale: 0.482906,
      position: [0.110507, 0.494301, 0.126194]
    }],
    ["mesh001", "./assets/material_test_ball/Mesh001.obj", testMaterial, {
      scale: 0.482906,
      position: [0.0571719, 0.213656, 0.0682078]
    }],
    ["mesh002", "./assets/material_test_ball/Mesh002.obj", testMaterial, {
      scale: 0.482906,
      position: [0.156382, 0.777229, 0.161698]
    }]
  ], [testMaterial, grayMaterial]);
  const meshes = useObjMeshes(entries);

  return h("group", null,
    h("group", { scale: 1.52, position: [-0.16, -0.9, -0.04] },
      meshes.map(({ key, object }) => h("primitive", { key, object }))
    )
  );
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

function SourceSelect({ value, onChange, disabled = false }) {
  return h("select", {
    className: "source-select",
    value,
    disabled,
    title: "Connect this OpenPBR input to a MaterialX source node",
    onChange: (event) => onChange(event.target.value)
  },
    h("option", { value: "value" }, "Value"),
    h("option", { value: "texture" }, "Texture"),
    h("option", { value: "procedural" }, "Procedural")
  );
}

function ColorEditor({ label, value, source, onSourceChange, onChange }) {
  const hex = `#${value.map((channel) => Math.round(channel * 255).toString(16).padStart(2, "0")).join("")}`;
  return h("label", { className: "color-row" },
    h("span", null, label),
    h("input", { type: "color", value: hex, onChange: (event) => onChange(event.target.value) }),
    h("code", null, value.map((v) => v.toFixed(2)).join(", ")),
    h(SourceSelect, { value: source, onChange: onSourceChange })
  );
}

function safeFileName(value) {
  return String(value || "material").trim().replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 64) || "material";
}

function addExplicitKey(keys = [], key) {
  return Array.from(new Set([...(keys || []), key]));
}

createRoot(document.getElementById("root")).render(h(App));
