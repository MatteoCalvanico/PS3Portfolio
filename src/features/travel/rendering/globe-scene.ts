import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  findCountryAtLatLon,
  latLonToVector3,
  vector3ToLatLon,
  type CountryRecord,
  type LngLat,
  type WorldDataset,
} from "../model/world-data";
import { createGlobeTextures } from "./globe-texture";

const GLOBE_RADIUS = 1;
const MIN_DISTANCE = 1.32;
const MAX_DISTANCE = 4.2;
const DEFAULT_LAT = 41.5;
const DEFAULT_LON = 13.5;
const DEFAULT_DISTANCE = 2.65;

const outerAtmosphereVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const outerAtmosphereFragment = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vec3 viewDir = normalize(vViewPosition);
    // On a BackSide shell, dot(vNormal, -viewDir) is 0 at the outer boundary and
    // peaks at the Earth's horizon, creating a soft halo that fades seamlessly into space.
    float rim = clamp(dot(vNormal, -viewDir) / 0.52, 0.0, 1.0);
    float glowStrength = pow(rim, 2.6);
    vec3 glow = mix(vec3(0.14, 0.45, 1.0), vec3(0.58, 0.88, 1.0), glowStrength);
    gl_FragColor = vec4(glow, glowStrength * 0.78);
  }
`;

const innerRimFragment = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vec3 viewDir = normalize(vViewPosition);
    float rim = pow(1.0 - max(0.0, dot(vNormal, viewDir)), 3.4);
    vec3 color = mix(vec3(0.18, 0.56, 1.0), vec3(0.75, 0.93, 1.0), rim);
    gl_FragColor = vec4(color, rim * 0.34);
  }
`;

export interface HoverPayload {
  country: CountryRecord;
  x: number;
  y: number;
}

export interface GlobeSceneCallbacks {
  onSelectCountry: (country: CountryRecord | null) => void;
  onHoverCountry: (hover: HoverPayload | null) => void;
  onInteractionStart?: () => void;
  onWebGLError: () => void;
}

export interface GlobeSceneController {
  setSelectedCountry: (
    country: CountryRecord | null,
    animate?: boolean,
  ) => void;
  flyToCountry: (country: CountryRecord) => void;
  resetView: () => void;
  zoomBy: (multiplier: number) => void;
  setAutoRotate: (enabled: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
  dispose: () => void;
}

interface FlyAnimation {
  startDir: THREE.Vector3;
  endDir: THREE.Vector3;
  startDist: number;
  endDist: number;
  startTime: number;
  durationMs: number;
}

function buildLineSegmentsFromPaths(
  paths: readonly (readonly LngLat[])[],
  radius: number,
): THREE.BufferGeometry {
  let segmentCount = 0;
  for (const path of paths) {
    for (let i = 1; i < path.length; i++) {
      if (Math.abs(path[i][0] - path[i - 1][0]) <= 180) {
        segmentCount++;
      }
    }
  }

  const positions = new Float32Array(segmentCount * 6);
  let offset = 0;
  for (const path of paths) {
    for (let i = 1; i < path.length; i++) {
      const [lonA, latA] = path[i - 1];
      const [lonB, latB] = path[i];
      if (Math.abs(lonB - lonA) > 180) continue;
      const a = latLonToVector3(latA, lonA, radius);
      const b = latLonToVector3(latB, lonB, radius);
      positions[offset++] = a.x;
      positions[offset++] = a.y;
      positions[offset++] = a.z;
      positions[offset++] = b.x;
      positions[offset++] = b.y;
      positions[offset++] = b.z;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geometry;
}

function buildCountryOutlineGeometry(
  countries: readonly CountryRecord[],
  radius: number,
): THREE.BufferGeometry {
  const paths: LngLat[][] = [];
  for (const country of countries) {
    for (const polygon of country.polygons) {
      for (const ring of polygon.rings) {
        if (ring.length >= 2) paths.push(ring as LngLat[]);
      }
    }
  }
  return buildLineSegmentsFromPaths(paths, radius);
}

function createStarfield(): THREE.Points {
  const count = 850;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  // Deterministic pseudo-random stars so visual appearance is stable across renders.
  let seed = 1337;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < count; i++) {
    const u = rand();
    const v = rand();
    const theta = u * Math.PI * 2;
    const phi = Math.acos(2 * v - 1);
    const radius = 26 + rand() * 24;

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi);
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

    const tint = 0.72 + rand() * 0.28;
    colors[i * 3] = tint * 0.85;
    colors[i * 3 + 1] = tint * 0.92;
    colors[i * 3 + 2] = tint;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.14,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    sizeAttenuation: true,
  });

  return new THREE.Points(geometry, material);
}

function orientOnSurface(
  object: THREE.Object3D,
  lat: number,
  lon: number,
  radius: number,
) {
  const pos = latLonToVector3(lat, lon, radius);
  object.position.set(pos.x, pos.y, pos.z);
  const normal = new THREE.Vector3(pos.x, pos.y, pos.z).normalize();
  object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
}

export function createGlobeScene(
  container: HTMLElement,
  dataset: WorldDataset,
  initialReducedMotion: boolean,
  initialAutoRotate: boolean,
  callbacks: GlobeSceneCallbacks,
): GlobeSceneController | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
  } catch {
    callbacks.onWebGLError();
    return null;
  }

  const canvas = renderer.domElement;
  canvas.className = "travel-globe-canvas";
  canvas.setAttribute("role", "img");
  canvas.setAttribute(
    "aria-label",
    `Interactive 3D globe highlighting ${dataset.stats.visitedCount} visited countries`,
  );
  container.appendChild(canvas);

  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  const initialPos = latLonToVector3(
    DEFAULT_LAT,
    DEFAULT_LON,
    DEFAULT_DISTANCE,
  );
  camera.position.set(initialPos.x, initialPos.y, initialPos.z);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.075;
  controls.enablePan = false;
  controls.minDistance = MIN_DISTANCE;
  controls.maxDistance = MAX_DISTANCE;
  controls.rotateSpeed = 0.55;
  controls.zoomSpeed = 0.85;
  controls.autoRotateSpeed = 0.38;

  // Lighting tuned for luminous PS3/XMB glass aesthetic.
  const ambientLight = new THREE.AmbientLight(0x8cb8ff, 1.45);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xeef6ff, 1.7);
  keyLight.position.set(4.5, 3.2, 4.0);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x3a82ff, 0.95);
  rimLight.position.set(-4.5, -2.0, -3.5);
  scene.add(rimLight);

  const hemiLight = new THREE.HemisphereLight(0xb2d5ff, 0x0a1c44, 0.55);
  scene.add(hemiLight);

  const starfield = createStarfield();
  scene.add(starfield);

  // High-resolution dynamic canvas texture for crisp countries + ocean specular mask.
  const isCompact =
    Math.min(window.innerWidth, window.innerHeight) < 700 ||
    (window.devicePixelRatio || 1) <= 1;
  const texWidth = isCompact ? 2048 : 4096;
  const texHeight = texWidth / 2;
  const dynamicTextures = createGlobeTextures(
    dataset.countries,
    texWidth,
    texHeight,
  );

  const colorTexture = new THREE.CanvasTexture(dynamicTextures.colorCanvas);
  colorTexture.colorSpace = THREE.SRGBColorSpace;
  colorTexture.anisotropy = Math.min(
    8,
    renderer.capabilities.getMaxAnisotropy(),
  );
  colorTexture.needsUpdate = true;

  const specularTexture = new THREE.CanvasTexture(
    dynamicTextures.specularCanvas,
  );
  specularTexture.needsUpdate = true;

  const globeGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 96, 64);
  const globeMaterial = new THREE.MeshPhongMaterial({
    map: colorTexture,
    specularMap: specularTexture,
    specular: new THREE.Color(0x4a82d8),
    shininess: 22,
    emissive: new THREE.Color(0x041230),
    emissiveIntensity: 0.35,
  });
  const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
  scene.add(globeMesh);

  // Crisp 3D vector borders directly over the sphere.
  const allBordersGeometry = buildLineSegmentsFromPaths(
    dataset.borders,
    GLOBE_RADIUS * 1.0018,
  );
  const allBordersMaterial = new THREE.LineBasicMaterial({
    color: 0x8cc0ff,
    transparent: true,
    opacity: 0.32,
  });
  const allBordersLines = new THREE.LineSegments(
    allBordersGeometry,
    allBordersMaterial,
  );
  scene.add(allBordersLines);

  // Luminous 3D borders around visited countries.
  const visitedBordersGeometry = buildCountryOutlineGeometry(
    dataset.visitedCountries,
    GLOBE_RADIUS * 1.0032,
  );
  const visitedBordersMaterial = new THREE.LineBasicMaterial({
    color: 0x9effe6,
    transparent: true,
    opacity: 0.82,
  });
  const visitedBordersLines = new THREE.LineSegments(
    visitedBordersGeometry,
    visitedBordersMaterial,
  );
  scene.add(visitedBordersLines);

  // Dynamic 3D highlight border for the currently selected country.
  const selectedBorderMaterial = new THREE.LineBasicMaterial({
    color: 0xf4fbff,
    transparent: true,
    opacity: 0.96,
  });
  let selectedBorderLines: THREE.LineSegments | null = null;

  // Atmospheric Fresnel outer halo & subtle inner glass rim.
  const outerAtmosphereGeo = new THREE.SphereGeometry(
    GLOBE_RADIUS * 1.13,
    64,
    48,
  );
  const outerAtmosphereMat = new THREE.ShaderMaterial({
    vertexShader: outerAtmosphereVertex,
    fragmentShader: outerAtmosphereFragment,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  const outerAtmosphereMesh = new THREE.Mesh(
    outerAtmosphereGeo,
    outerAtmosphereMat,
  );
  scene.add(outerAtmosphereMesh);

  const innerRimGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.012, 64, 48);
  const innerRimMat = new THREE.ShaderMaterial({
    vertexShader: outerAtmosphereVertex,
    fragmentShader: innerRimFragment,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  const innerRimMesh = new THREE.Mesh(innerRimGeo, innerRimMat);
  scene.add(innerRimMesh);

  // Dedicated luminous 3D beacons for visited microstates (San Marino, Vatican City).
  const beaconGroup = new THREE.Group();
  scene.add(beaconGroup);

  const microstateHitTargets: THREE.Mesh[] = [];
  const pulsingRings: THREE.Mesh[] = [];
  const stemGeo = new THREE.CylinderGeometry(0.0022, 0.0014, 0.036, 8);
  stemGeo.translate(0, 0.018, 0);
  const capGeo = new THREE.SphereGeometry(0.0085, 16, 16);
  const ringGeo = new THREE.RingGeometry(0.011, 0.0165, 32);
  ringGeo.rotateX(-Math.PI / 2);
  const hitGeo = new THREE.SphereGeometry(0.026, 12, 12);

  const beaconStemMat = new THREE.MeshBasicMaterial({
    color: 0x9cffea,
    transparent: true,
    opacity: 0.9,
  });
  const beaconCapMat = new THREE.MeshBasicMaterial({
    color: 0x64ffd4,
  });
  const beaconRingMat = new THREE.MeshBasicMaterial({
    color: 0x7affde,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
  });
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });

  const visitedMicrostates = dataset.visitedCountries.filter(
    (country) => country.microstate,
  );

  for (const microstate of visitedMicrostates) {
    const marker = new THREE.Group();
    orientOnSurface(
      marker,
      microstate.lat,
      microstate.lon,
      GLOBE_RADIUS * 1.001,
    );

    const stem = new THREE.Mesh(stemGeo, beaconStemMat);
    const cap = new THREE.Mesh(capGeo, beaconCapMat);
    cap.position.y = 0.038;

    const ring = new THREE.Mesh(ringGeo, beaconRingMat.clone());
    ring.position.y = 0.0025;
    pulsingRings.push(ring);

    const hitSphere = new THREE.Mesh(hitGeo, hitMat);
    hitSphere.position.y = 0.02;
    hitSphere.userData = { country: microstate };
    microstateHitTargets.push(hitSphere);

    marker.add(stem, cap, ring, hitSphere);
    beaconGroup.add(marker);
  }

  // Dynamic focus beacon for whichever country is currently selected.
  const focusBeacon = new THREE.Group();
  focusBeacon.visible = false;
  const focusRingGeo = new THREE.RingGeometry(0.016, 0.024, 40);
  focusRingGeo.rotateX(-Math.PI / 2);
  const focusRingMat = new THREE.MeshBasicMaterial({
    color: 0xf0f9ff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });
  const focusRingMesh = new THREE.Mesh(focusRingGeo, focusRingMat);
  focusRingMesh.position.y = 0.0045;

  const focusDotGeo = new THREE.SphereGeometry(0.007, 16, 16);
  const focusDotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const focusDotMesh = new THREE.Mesh(focusDotGeo, focusDotMat);
  focusDotMesh.position.y = 0.008;

  focusBeacon.add(focusRingMesh, focusDotMesh);
  scene.add(focusBeacon);

  // Runtime state
  let disposed = false;
  let contextLost = false;
  let frameId = 0;
  let reducedMotion = initialReducedMotion;
  let autoRotate = initialAutoRotate && !initialReducedMotion;
  let selectedCountry: CountryRecord | null = null;
  let hoveredCountry: CountryRecord | null = null;
  let flyAnim: FlyAnimation | null = null;
  let isPointerDown = false;
  let pointerDownX = 0;
  let pointerDownY = 0;
  let lastHoverCheck = 0;

  controls.autoRotate = autoRotate;

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  const updateSelectedVisuals = (country: CountryRecord | null) => {
    if (selectedBorderLines) {
      scene.remove(selectedBorderLines);
      selectedBorderLines.geometry.dispose();
      selectedBorderLines = null;
    }

    if (country) {
      const geo = buildCountryOutlineGeometry([country], GLOBE_RADIUS * 1.0046);
      selectedBorderLines = new THREE.LineSegments(geo, selectedBorderMaterial);
      scene.add(selectedBorderLines);

      orientOnSurface(
        focusBeacon,
        country.lat,
        country.lon,
        GLOBE_RADIUS * 1.002,
      );
      focusRingMat.color.setHex(country.visited ? 0x9effee : 0xc7e2ff);
      focusBeacon.visible = true;
    } else {
      focusBeacon.visible = false;
    }

    dynamicTextures.updateHighlight(selectedCountry, hoveredCountry);
    colorTexture.needsUpdate = true;
  };

  const startFlyTo = (lat: number, lon: number, targetDistance: number) => {
    const endVec = latLonToVector3(lat, lon, 1);
    const endDir = new THREE.Vector3(endVec.x, endVec.y, endVec.z).normalize();
    const clampedDist = Math.max(
      MIN_DISTANCE,
      Math.min(MAX_DISTANCE, targetDistance),
    );

    if (reducedMotion) {
      flyAnim = null;
      camera.position.copy(endDir.multiplyScalar(clampedDist));
      controls.update();
      renderOnce();
      return;
    }

    const startDist = camera.position.length();
    const startDir = camera.position.clone().normalize();
    flyAnim = {
      startDir,
      endDir,
      startDist,
      endDist: clampedDist,
      startTime: performance.now(),
      durationMs: 850,
    };
  };

  const pickCountryFromEvent = (event: PointerEvent): CountryRecord | null => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;

    ndc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);

    // Check microstate beacons first so San Marino & Vatican City are easy to pick.
    const beaconHits = raycaster.intersectObjects(microstateHitTargets, false);
    if (beaconHits.length > 0) {
      const hitCountry = beaconHits[0].object.userData?.country as
        | CountryRecord
        | undefined;
      if (hitCountry) return hitCountry;
    }

    const globeHits = raycaster.intersectObject(globeMesh, false);
    if (globeHits.length === 0) return null;

    const point = globeHits[0].point;
    const { lat, lon } = vector3ToLatLon(point.x, point.y, point.z);
    // Scale microstate pick tolerance slightly with zoom distance.
    const dist = camera.position.length();
    const tolerance = Math.max(0.35, Math.min(1.1, (dist - 1.0) * 0.45));
    return findCountryAtLatLon(dataset.countries, lat, lon, tolerance);
  };

  const onPointerDown = (event: PointerEvent) => {
    isPointerDown = true;
    pointerDownX = event.clientX;
    pointerDownY = event.clientY;
    if (flyAnim) {
      flyAnim = null;
    }
    callbacks.onInteractionStart?.();
  };

  const onPointerMove = (event: PointerEvent) => {
    if (isPointerDown) {
      if (hoveredCountry) {
        hoveredCountry = null;
        canvas.style.cursor = "grabbing";
        callbacks.onHoverCountry(null);
      }
      return;
    }

    const now = performance.now();
    if (now - lastHoverCheck < 32) return;
    lastHoverCheck = now;

    const country = pickCountryFromEvent(event);
    const rect = canvas.getBoundingClientRect();

    if (country) {
      canvas.style.cursor = "pointer";
      if (hoveredCountry?.key !== country.key) {
        hoveredCountry = country;
        dynamicTextures.updateHighlight(selectedCountry, hoveredCountry);
        colorTexture.needsUpdate = true;
      }
      callbacks.onHoverCountry({
        country,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    } else {
      canvas.style.cursor = "grab";
      if (hoveredCountry) {
        hoveredCountry = null;
        dynamicTextures.updateHighlight(selectedCountry, hoveredCountry);
        colorTexture.needsUpdate = true;
        callbacks.onHoverCountry(null);
      }
    }
  };

  const onPointerUp = (event: PointerEvent) => {
    if (!isPointerDown) return;
    isPointerDown = false;
    const moved = Math.hypot(
      event.clientX - pointerDownX,
      event.clientY - pointerDownY,
    );
    if (moved > 6) {
      canvas.style.cursor = "grab";
      return;
    }

    const picked = pickCountryFromEvent(event);
    if (picked) {
      callbacks.onSelectCountry(picked);
    }
  };

  const onPointerLeave = () => {
    isPointerDown = false;
    if (hoveredCountry) {
      hoveredCountry = null;
      dynamicTextures.updateHighlight(selectedCountry, hoveredCountry);
      colorTexture.needsUpdate = true;
      callbacks.onHoverCountry(null);
    }
  };

  const onWheel = () => {
    if (flyAnim) flyAnim = null;
    callbacks.onInteractionStart?.();
  };

  const renderOnce = () => {
    if (!disposed && !contextLost) {
      renderer.render(scene, camera);
    }
  };

  const slerpAxis = new THREE.Vector3();
  const slerpQuat = new THREE.Quaternion();
  const currentDir = new THREE.Vector3();

  const tick = (now: number) => {
    frameId = 0;
    if (disposed || contextLost || document.hidden) return;

    if (flyAnim) {
      const t = Math.min(1, (now - flyAnim.startTime) / flyAnim.durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const dot = Math.max(
        -1,
        Math.min(1, flyAnim.startDir.dot(flyAnim.endDir)),
      );
      const angle = Math.acos(dot);

      if (angle > 1e-4) {
        slerpAxis.crossVectors(flyAnim.startDir, flyAnim.endDir);
        if (slerpAxis.lengthSq() < 1e-6) {
          slerpAxis.set(0, 1, 0);
        } else {
          slerpAxis.normalize();
        }
        slerpQuat.setFromAxisAngle(slerpAxis, angle * eased);
        currentDir
          .copy(flyAnim.startDir)
          .applyQuaternion(slerpQuat)
          .normalize();
      } else {
        currentDir.copy(flyAnim.endDir);
      }

      const dist =
        flyAnim.startDist + (flyAnim.endDist - flyAnim.startDist) * eased;
      camera.position.copy(currentDir.multiplyScalar(dist));

      if (t >= 1) {
        flyAnim = null;
      }
    }

    // Scale orbit sensitivity smoothly as user zooms closer to small countries.
    const camDist = camera.position.length();
    controls.rotateSpeed = Math.max(
      0.18,
      Math.min(0.68, (camDist - 1.0) * 0.34),
    );
    controls.autoRotate = autoRotate && !reducedMotion && !flyAnim;
    controls.update();

    // Gentle pulse on microstate beacons and active focus ring.
    if (!reducedMotion) {
      const pulse = (now * 0.0014) % 1;
      for (let i = 0; i < pulsingRings.length; i++) {
        const phase = (pulse + i * 0.37) % 1;
        const scale = 0.85 + phase * 1.45;
        pulsingRings[i].scale.setScalar(scale);
        const mat = pulsingRings[i].material as THREE.MeshBasicMaterial;
        mat.opacity = (1 - phase) * 0.72;
      }

      if (focusBeacon.visible) {
        const fScale = 0.9 + pulse * 1.15;
        focusRingMesh.scale.setScalar(fScale);
        focusRingMat.opacity = (1 - pulse) * 0.9;
      }
    } else {
      for (const ring of pulsingRings) {
        ring.scale.setScalar(1.1);
        (ring.material as THREE.MeshBasicMaterial).opacity = 0.65;
      }
      if (focusBeacon.visible) {
        focusRingMesh.scale.setScalar(1.1);
        focusRingMat.opacity = 0.85;
      }
    }

    renderOnce();
    frameId = window.requestAnimationFrame(tick);
  };

  const stopLoop = () => {
    if (frameId) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    }
  };

  const startLoop = () => {
    if (disposed || contextLost || document.hidden || frameId) return;
    frameId = window.requestAnimationFrame(tick);
  };

  const resize = () => {
    if (disposed || contextLost) return;
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderOnce();
  };

  const onVisibilityChange = () => {
    if (document.hidden) stopLoop();
    else startLoop();
  };

  const onContextLost = (event: Event) => {
    event.preventDefault();
    contextLost = true;
    stopLoop();
  };

  const onContextRestored = () => {
    contextLost = false;
    colorTexture.needsUpdate = true;
    specularTexture.needsUpdate = true;
    resize();
    startLoop();
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  document.addEventListener("visibilitychange", onVisibilityChange);
  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointerleave", onPointerLeave);
  canvas.addEventListener("wheel", onWheel, { passive: true });
  canvas.style.cursor = "grab";

  resize();
  startLoop();

  return {
    setSelectedCountry(country, animate = true) {
      selectedCountry = country;
      updateSelectedVisuals(country);
      if (country && animate) {
        startFlyTo(country.lat, country.lon, country.zoomDistance);
      }
    },
    flyToCountry(country) {
      startFlyTo(country.lat, country.lon, country.zoomDistance);
    },
    resetView() {
      startFlyTo(DEFAULT_LAT, DEFAULT_LON, DEFAULT_DISTANCE);
    },
    zoomBy(multiplier) {
      const current = camera.position.length();
      const target = Math.max(
        MIN_DISTANCE,
        Math.min(MAX_DISTANCE, current * multiplier),
      );
      const { lat, lon } = vector3ToLatLon(
        camera.position.x,
        camera.position.y,
        camera.position.z,
      );
      startFlyTo(lat, lon, target);
    },
    setAutoRotate(enabled) {
      autoRotate = enabled;
      controls.autoRotate = autoRotate && !reducedMotion;
    },
    setReducedMotion(reduced) {
      reducedMotion = reduced;
      controls.autoRotate = autoRotate && !reducedMotion;
    },
    dispose() {
      disposed = true;
      stopLoop();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("wheel", onWheel);
      controls.dispose();

      globeGeometry.dispose();
      globeMaterial.dispose();
      colorTexture.dispose();
      specularTexture.dispose();
      allBordersGeometry.dispose();
      allBordersMaterial.dispose();
      visitedBordersGeometry.dispose();
      visitedBordersMaterial.dispose();
      if (selectedBorderLines) {
        selectedBorderLines.geometry.dispose();
      }
      selectedBorderMaterial.dispose();
      outerAtmosphereGeo.dispose();
      outerAtmosphereMat.dispose();
      innerRimGeo.dispose();
      innerRimMat.dispose();
      starfield.geometry.dispose();
      (starfield.material as THREE.Material).dispose();
      stemGeo.dispose();
      capGeo.dispose();
      ringGeo.dispose();
      hitGeo.dispose();
      beaconStemMat.dispose();
      beaconCapMat.dispose();
      beaconRingMat.dispose();
      hitMat.dispose();
      for (const ring of pulsingRings) {
        (ring.material as THREE.Material).dispose();
      }
      focusRingGeo.dispose();
      focusRingMat.dispose();
      focusDotGeo.dispose();
      focusDotMat.dispose();

      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
