/* Melsa Elevators — animated 3D hero: a gearless traction machine built from scratch.
   1) Each part flies in and fits into place, with the camera following it.
   2) The finished machine turns and its sheave spins.
   3) It opens into a labelled exploded view, then clears and the loop restarts.
   ?t3d=<seconds> freezes the animation at that time (for testing). */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { GTAOPass } from "three/addons/postprocessing/GTAOPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const host = document.getElementById("hero3d");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

// [english, arabic] — numbered like the parts diagram
const PARTS = [
  ["frame", "Main body (frame)", "جسم الماكينة"],
  ["stator", "Stator winding", "ملفات الاستاتور"],
  ["rotor", "Rotor & main shaft", "الروتور وعمود الإدارة"],
  ["bearF", "Front bearing", "رولمان البلي الأمامي"],
  ["bearR", "Rear bearing", "رولمان البلي الخلفي"],
  ["coverF", "Front end cover", "الغطاء الأمامي"],
  ["coverR", "Rear end cover", "الغطاء الخلفي"],
  ["hub", "Sheave hub & bolts", "صرة الطارة والمسامير"],
  ["sheave", "Traction sheave", "طارة الجر"],
  ["brake", "Brake assembly", "مجموعة الفرامل"],
  ["jbox", "Junction box", "علبة التوصيلات"],
  ["fan", "Cooling fan", "مروحة التبريد"],
  ["fanCover", "Fan cover", "غطاء المروحة"],
  ["inverter", "Inverter / terminal box", "علبة الإنفرتر والأطراف"],
];

function start() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" }); }
  catch (e) { return false; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  // photo-studio environment: dark room with large softboxes and thin strip lights, so metal and paint get crisp reflections
  function studio() {
    const env = new THREE.Scene(), box = new THREE.BoxGeometry(1, 1, 1);
    const room = new THREE.Mesh(new THREE.BoxGeometry(30, 16, 30), new THREE.MeshBasicMaterial({ color: 0x14181f, side: THREE.BackSide })); env.add(room);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshBasicMaterial({ color: 0x2a2e35 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -7.9; env.add(floor);
    const panel = (w, h, d, x, y, z, v, ry = 0, rx = 0) => { const m = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: new THREE.Color(v, v, v * 1.02) })); m.scale.set(w, h, d); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); env.add(m); };
    panel(12, 0.2, 6, 0, 7.8, 0, 2.6);             // big overhead softbox
    panel(0.6, 10, 0.2, -9, 1, 6, 6, 0.6);         // vertical strips
    panel(0.6, 10, 0.2, 9, 1, 6, 4, -0.6);
    panel(0.4, 8, 0.2, -6, 1, -12, 3);
    panel(0.4, 8, 0.2, 6, 1, -12, 3);
    panel(6, 2, 0.2, 3, 3, 14.8, 0.9);             // front fill card
    panel(0.3, 0.3, 14, -14.8, 4, 0, 5);           // horizontal kicker
    return pm.fromScene(env, 0.02).texture;
  }
  scene.environment = studio();
  scene.environmentIntensity = 1.0;
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x0b1d35, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(3, 7, 5); scene.add(key);
  key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 5;
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 20 }); key.shadow.bias = -0.0006;
  const fill = new THREE.DirectionalLight(0xe8eefc, 0.9); fill.position.set(-5, 3, 3); scene.add(fill);
  const rim = new THREE.PointLight(0xc5ad87, 26, 18); rim.position.set(-3, 3, -4); scene.add(rim);
  key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 7;
  RectAreaLightUniformsLib.init();
  const softbox = (w, h, int, pos, col = 0xffffff) => { const l = new THREE.RectAreaLight(col, int, w, h); l.position.set(...pos); l.lookAt(0, 0, 0); scene.add(l); return l; };
  softbox(5, 2.2, 3.2, [0, 5.5, 2.5]);            // overhead softbox
  softbox(0.5, 5, 4.5, [-4.5, 1.5, 2.5]);         // left strip: long highlight on the frame fins
  softbox(0.5, 5, 3.0, [4.5, 1.2, 1.5], 0xdfe7ff); // right strip, cool

  /* ---------- materials ---------- */
  function noiseTex(base, lines, strength, vertical) {
    const c = document.createElement("canvas"); c.width = c.height = 512; const g = c.getContext("2d");
    g.fillStyle = base; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < lines; i++) {
      const y = Math.random() * 512, l = 40 + Math.random() * 300, x = Math.random() * 512;
      g.strokeStyle = Math.random() < 0.5 ? `rgba(255,255,255,${Math.random() * strength})` : `rgba(0,0,0,${Math.random() * strength})`;
      g.lineWidth = Math.random() * 1.2 + 0.3; g.beginPath();
      if (vertical) { g.moveTo(y, x); g.lineTo(y, x + l); } else { g.moveTo(x, y); g.lineTo(x + l, y); } g.stroke();
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t;
  }
  function copperTex() {
    const c = document.createElement("canvas"); c.width = 512; c.height = 128; const g = c.getContext("2d");
    g.fillStyle = "#9a5426"; g.fillRect(0, 0, 512, 128);
    for (let x = 0; x < 512; x += 3) { g.fillStyle = `rgba(${200 + Math.random() * 55 | 0},${110 + Math.random() * 50 | 0},${50 + Math.random() * 30 | 0},0.9)`; g.fillRect(x, 0, 2, 128); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 1); return t;
  }
  // height-noise to normal map (for paint orange-peel, cast texture and brushed metal)
  function normalTex(kind, rep = 2) {
    const N = 256, h = new Float32Array(N * N);
    for (let o = 0; o < 5; o++) {               // value-noise octaves
      const f = 4 << o, a = 1 / (1 << o), grid = []; for (let i = 0; i <= f; i++) { grid[i] = []; for (let j = 0; j <= f; j++) grid[i][j] = Math.random(); }
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        let gx = x / N * f, gy = y / N * f;
        if (kind === "brushed") gx *= 0.08;       // long streaks along one axis
        const i = gx | 0, j = gy | 0, u = gx - i, v = gy - j, sm = (t) => t * t * (3 - 2 * t);
        const A = grid[i % f][j % f], B = grid[(i + 1) % f][j % f], C = grid[i % f][(j + 1) % f], D = grid[(i + 1) % f][(j + 1) % f];
        h[y * N + x] += a * ((A * (1 - sm(u)) + B * sm(u)) * (1 - sm(v)) + (C * (1 - sm(u)) + D * sm(u)) * sm(v));
      }
    }
    const c = document.createElement("canvas"); c.width = c.height = N; const g = c.getContext("2d"), img = g.createImageData(N, N);
    const k = kind === "cast" ? 3.2 : kind === "brushed" ? 2.0 : 1.2;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const dx = (h[y * N + (x + 1) % N] - h[y * N + (x + N - 1) % N]) * k, dy = (h[((y + 1) % N) * N + x] - h[((y + N - 1) % N) * N + x]) * k;
      const l = Math.hypot(dx, dy, 1), q = (y * N + x) * 4;
      img.data[q] = (-dx / l * 0.5 + 0.5) * 255; img.data[q + 1] = (-dy / l * 0.5 + 0.5) * 255; img.data[q + 2] = (1 / l * 0.5 + 0.5) * 255; img.data[q + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.anisotropy = 8; return t;
  }
  const nPeel = normalTex("peel", 6), nCast = normalTex("cast", 3), nBrush = normalTex("brushed", 2);
  const M = {
    blue: new THREE.MeshPhysicalMaterial({ color: 0x1a4aad, metalness: 0.15, roughness: 0.42, clearcoat: 1, clearcoatRoughness: 0.12, normalMap: nCast, normalScale: new THREE.Vector2(0.35, 0.35), clearcoatNormalMap: nPeel, clearcoatNormalScale: new THREE.Vector2(0.12, 0.12) }),
    yellow: new THREE.MeshPhysicalMaterial({ color: 0xf0be12, metalness: 0.1, roughness: 0.4, clearcoat: 1, clearcoatRoughness: 0.1, normalMap: nCast, normalScale: new THREE.Vector2(0.25, 0.25), clearcoatNormalMap: nPeel, clearcoatNormalScale: new THREE.Vector2(0.1, 0.1) }),
    steel: new THREE.MeshPhysicalMaterial({ map: noiseTex("#c9ced4", 2200, 0.16), metalness: 1, roughness: 0.24, normalMap: nBrush, normalScale: new THREE.Vector2(0.25, 0.25) }),
    machined: new THREE.MeshPhysicalMaterial({ color: 0xc2c8cf, metalness: 1, roughness: 0.12, normalMap: nBrush, normalScale: new THREE.Vector2(0.12, 0.12) }),
    alu: new THREE.MeshPhysicalMaterial({ map: noiseTex("#b8bec6", 1400, 0.12), metalness: 0.9, roughness: 0.48, normalMap: nCast, normalScale: new THREE.Vector2(0.5, 0.5) }),
    dark: new THREE.MeshPhysicalMaterial({ color: 0x2b3038, metalness: 0.85, roughness: 0.32, normalMap: nBrush, normalScale: new THREE.Vector2(0.2, 0.2) }),
    black: new THREE.MeshPhysicalMaterial({ color: 0x15171b, metalness: 0.1, roughness: 0.6, normalMap: nCast, normalScale: new THREE.Vector2(0.4, 0.4) }),
    blackGloss: new THREE.MeshPhysicalMaterial({ color: 0x111317, metalness: 0.3, roughness: 0.25, clearcoat: 0.8 }),
    copper: new THREE.MeshStandardMaterial({ map: copperTex(), color: 0xffffff, metalness: 0.85, roughness: 0.3 }),
    lam: new THREE.MeshStandardMaterial({ map: noiseTex("#7c848e", 3000, 0.25, true), metalness: 0.9, roughness: 0.35 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xd6b25a, metalness: 1, roughness: 0.3 }),
  };

  /* ---------- geometry helpers (machine axis = X) ---------- */
  const SEG = 72;
  const mesh = (geo, mat, parent, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
  const lathe = (pts) => { const g = new THREE.LatheGeometry(pts.map(([r, x]) => new THREE.Vector2(r, x)), SEG); g.rotateZ(-Math.PI / 2); return g; }; // profile [radius, x]
  const tube = (rOut, rIn, len) => lathe([[rIn, -len / 2], [rOut, -len / 2], [rOut, len / 2], [rIn, len / 2], [rIn, -len / 2]]);
  const cylX = (r, len, seg = SEG) => { const g = new THREE.CylinderGeometry(r, r, len, seg); g.rotateZ(Math.PI / 2); return g; };
  const hexGeo = {}, washerGeo = {};
  const bolt = (parent, x, y, z, size, dir = Math.sign(x) || 1) => {
    const k = size.toFixed(3);
    hexGeo[k] = hexGeo[k] || (() => { const g = new THREE.CylinderGeometry(size, size, size * 0.9, 6); g.rotateZ(Math.PI / 2); return g; })();
    washerGeo[k] = washerGeo[k] || lathe([[size * 0.45, 0], [size * 1.35, 0], [size * 1.35, size * 0.18], [size * 0.45, size * 0.18]]);
    const w = mesh(washerGeo[k], M.machined, parent, x, y, z); w.scale.x = dir;
    const h = mesh(hexGeo[k], M.steel, parent, x + dir * size * 0.6, y, z);
    mesh(new THREE.SphereGeometry(size * 0.55, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2).rotateZ(-dir * Math.PI / 2), M.steel, parent, x + dir * size * 1.05, y, z);
    return h;
  };
  const ringBolts = (parent, n, r, x, mat = M.machined, size = 0.035) => {
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; bolt(parent, x, Math.cos(a) * r, Math.sin(a) * r, size * 0.9); }
  };
  const rbox = (w, h, d) => new RoundedBoxGeometry(w, h, d, 3, Math.min(w, h, d) * 0.22);

  const machine = new THREE.Group(); scene.add(machine);
  const P = {}; // part groups
  const part = (name) => { const g = new THREE.Group(); machine.add(g); P[name] = g; return g; };

  // 1. frame: finned cylindrical body with feet, top pad and lifting eyes
  {
    const g = part("frame");
    mesh(tube(0.8, 0.67, 1.7), M.blue, g);
    const fin = lathe([[0.79, -0.022], [0.88, -0.014], [0.895, 0], [0.88, 0.014], [0.79, 0.022]]);
    for (let i = 0; i < 9; i++) mesh(fin, M.blue, g, -0.72 + i * 0.18, 0, 0);
    for (const z of [-0.5, 0.5]) { mesh(rbox(1.5, 0.12, 0.34), M.blue, g, 0, -0.78, z); mesh(rbox(1.2, 0.3, 0.12), M.blue, g, 0, -0.62, z * 0.82); }
    mesh(rbox(1.35, 0.08, 0.9), M.blue, g, 0, 0.82, 0);
    for (const x of [-0.72, 0.72]) { const e = mesh(new THREE.TorusGeometry(0.075, 0.025, 10, 24), M.yellow, g, x, 0.98, 0.42); e.rotation.y = Math.PI / 2; mesh(rbox(0.06, 0.08, 0.06), M.yellow, g, x, 0.89, 0.42); }
  }
  // 2. stator: laminated core with copper windings
  {
    const g = part("stator");
    mesh(tube(0.665, 0.5, 1.5), M.lam, g);
    for (const x of [-0.8, 0.8]) { const w = mesh(new THREE.TorusGeometry(0.575, 0.07, 14, SEG), M.copper, g, x, 0, 0); w.rotation.y = Math.PI / 2; }
    for (let i = 0; i < 36; i++) { const a = (i / 36) * Math.PI * 2; mesh(rbox(1.5, 0.035, 0.03), M.copper, g, 0, Math.cos(a) * 0.515, Math.sin(a) * 0.515).rotation.x = -a; }
  }
  // 3. rotor + main shaft
  {
    const g = part("rotor");
    mesh(cylX(0.46, 1.42), M.dark, g);
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; mesh(rbox(1.36, 0.04, 0.12), M.machined, g, 0, Math.cos(a) * 0.465, Math.sin(a) * 0.465).rotation.x = -a; }
    mesh(lathe([[0, -2.15], [0.085, -2.15], [0.095, -2.08], [0.095, -1.0], [0.12, -0.95], [0.12, 0.95], [0.1, 1.0], [0.1, 1.95], [0.085, 2.0], [0, 2.0]]), M.machined, g);
  }
  // bearings: outer ring, inner ring, balls
  const bearing = (name, x) => {
    const g = part(name); g.position.x = x;
    mesh(tube(0.2, 0.165, 0.1), M.machined, g); mesh(tube(0.135, 0.098, 0.1), M.machined, g);
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; mesh(new THREE.SphereGeometry(0.03, 12, 10), M.steel, g, 0, Math.cos(a) * 0.15, Math.sin(a) * 0.15); }
    mesh(tube(0.168, 0.132, 0.02), M.black, g, 0.045, 0, 0);
  };
  bearing("bearF", -1.03); bearing("bearR", 1.03);
  // end covers: cast aluminium flange with boss and bolts
  const cover = (name, x, dir) => {
    const g = part(name); g.position.x = x;
    mesh(lathe([[0.2, 0], [0.84, 0], [0.84, 0.07 * dir], [0.42, 0.11 * dir], [0.34, 0.26 * dir], [0.2, 0.26 * dir], [0.2, 0]]), M.alu, g);
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.3; mesh(rbox(0.16, 0.05, 0.05), M.alu, g, 0.1 * dir, Math.cos(a) * 0.62, Math.sin(a) * 0.62).rotation.x = -a; }
    ringBolts(g, 8, 0.76, 0.09 * dir);
  };
  cover("coverF", -0.86, -1); cover("coverR", 0.86, 1);
  // sheave hub with bolts
  {
    const g = part("hub"); g.position.x = -1.36;
    mesh(lathe([[0.1, -0.12], [0.3, -0.12], [0.3, 0.12], [0.1, 0.12]]), M.blue, g);
    ringBolts(g, 6, 0.21, -0.14, M.machined, 0.03);
  }
  // traction sheave: 5 V-grooves, web with lightening holes
  let sheave;
  {
    const g = part("sheave"); g.position.x = -1.72; sheave = g;
    const R = 0.9, w = 0.42, n = 5, pts = [[R - 0.08, -w / 2], [R, -w / 2]];
    for (let i = 0; i < n; i++) { const x0 = -w / 2 + (i + 0.5) * (w / n); pts.push([R, x0 - 0.036], [R - 0.012, x0 - 0.03], [R - 0.085, x0 - 0.006], [R - 0.09, x0], [R - 0.085, x0 + 0.006], [R - 0.012, x0 + 0.03], [R, x0 + 0.036]); }
    pts.push([R, w / 2], [R - 0.08, w / 2], [R - 0.08, -w / 2]); // rim only, so the web cut-outs show
    mesh(lathe(pts), M.yellow, g);
    // web: a disc with five kidney-shaped cut-outs, extruded
    const web = new THREE.Shape(); web.absarc(0, 0, R - 0.08, 0, Math.PI * 2, false);
    for (let i = 0; i < 5; i++) { const a0 = (i / 5) * Math.PI * 2 + 0.16, a1 = a0 + Math.PI * 2 / 5 - 0.32, hole = new THREE.Path();
      hole.absarc(0, 0, 0.72, a0, a1, false); hole.absarc(0, 0, 0.42, a1, a0, true); hole.closePath(); web.holes.push(hole); }
    web.holes.push(new THREE.Path().absarc(0, 0, 0.3, 0, Math.PI * 2, true));
    const wg = new THREE.ExtrudeGeometry(web, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 3, curveSegments: 48 });
    wg.translate(0, 0, -0.035); wg.rotateY(Math.PI / 2);
    mesh(wg, M.yellow, g, 0.02, 0, 0);
    mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.12, SEG).rotateZ(Math.PI / 2), M.blue, g, 0.0, 0, 0);
    mesh(new THREE.TorusGeometry(R - 0.03, 0.012, 6, SEG), M.black, g, 0, 0, 0).rotation.y = Math.PI / 2;
  }
  // brake assembly on the top pad: plate + two brake units
  {
    const g = part("brake"); g.position.set(-0.1, 0.9, 0);
    mesh(rbox(1.1, 0.05, 0.82), M.alu, g);
    for (const z of [-0.2, 0.2]) {
      mesh(rbox(0.42, 0.18, 0.36), M.black, g, -0.15, 0.115, z);
      mesh(new THREE.CylinderGeometry(0.14, 0.15, 0.1, 40), M.machined, g, -0.15, 0.25, z);
      mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 20), M.dark, g, -0.15, 0.32, z);
      for (const dx of [-0.17, 0.17]) for (const dz of [-0.14, 0.14]) mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.28, 8), M.machined, g, -0.15 + dx, 0.15, z + dz);
    }
  }
  // junction box
  {
    const g = part("jbox"); g.position.set(0.42, 1.1, 0);
    mesh(rbox(0.5, 0.3, 0.72), M.blackGloss, g);
    mesh(rbox(0.52, 0.04, 0.74), M.black, g, 0, 0.16, 0);
    for (const z of [-0.22, 0, 0.22]) mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.08, 12), M.dark, g, 0.27, -0.05, z).rotation.z = Math.PI / 2;
  }
  // cooling fan
  let fanRot;
  {
    const g = part("fan"); g.position.x = 1.3;
    mesh(cylX(0.11, 0.1, 32), M.black, g); fanRot = new THREE.Group(); g.add(fanRot);
    for (let i = 0; i < 7; i++) { const b = mesh(rbox(0.02, 0.5, 0.16), M.black, fanRot, 0, 0, 0); const a = (i / 7) * Math.PI * 2; b.position.set(0, Math.cos(a) * 0.33, Math.sin(a) * 0.33); b.rotation.x = -a; b.rotation.y = 0.5; }
  }
  // fan cover with grille
  {
    const g = part("fanCover"); g.position.x = 1.5;
    mesh(rbox(0.22, 1.25, 1.25), M.black, g);
    for (let i = -4; i <= 4; i++) mesh(rbox(0.02, 1.0, 0.035), M.dark, g, 0.115, 0, i * 0.11);
    for (let i = -4; i <= 4; i++) mesh(rbox(0.02, 0.035, 1.0), M.dark, g, 0.118, i * 0.11, 0);
    ringBolts(g, 4, 0.78, 0.12, M.machined, 0.03);
  }
  // inverter / terminal box
  {
    const g = part("inverter"); g.position.x = 1.86;
    mesh(rbox(0.42, 1.1, 0.85), M.blackGloss, g);
    for (let i = 0; i < 6; i++) mesh(rbox(0.02, 0.03, 0.6), M.dark, g, 0.215, 0.3 - i * 0.08, 0);
    mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.14, 20), M.black, g, 0, 0.62, 0.2);
    mesh(rbox(0.03, 0.18, 0.3), M.dark, g, 0.22, -0.32, 0);
  }

  // soft shadow catcher under the machine
  const ground = new THREE.Mesh(new THREE.CircleGeometry(4, 64), new THREE.ShadowMaterial({ opacity: 0.32 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.85; ground.receiveShadow = true; scene.add(ground);

  /* ---------- each part: assembled place, where it comes from, exploded place ---------- */
  const fly = {
    frame: [0, -4, 0], stator: [5, 0, 0], rotor: [-6, 0, 0], bearF: [-4, 0.8, 0], bearR: [4, 0.8, 0], coverF: [-4, 0, 0], coverR: [4, 0, 0],
    hub: [-4, 0, 0], sheave: [-6, 1.5, 0], brake: [0, 4, 0], jbox: [0, 4, 0.5], fan: [4, 0, 0], fanCover: [4, 0, 0], inverter: [5, 1, 0],
  };
  // exploded positions (offsets from the assembled place); stator and rotor slide out sideways so they show
  const exp = {
    frame: [0, 0, 0], stator: [0, 0, 1.8], rotor: [0, 0, 1.8], bearF: [-1.0, 0, 0], bearR: [1.0, 0, 0], coverF: [-0.8, 0, 0], coverR: [0.8, 0, 0],
    hub: [-1.15, 0, 0], sheave: [-1.4, 0, 0], brake: [0, 0.75, 0], jbox: [0.15, 1.15, 0], fan: [1.15, 0, 0], fanCover: [1.35, 0, 0], inverter: [1.55, 0, 0],
  };
  const LIST = PARTS.map(([k, en, ar], i) => {
    const g = P[k], asm = g.position.clone();
    return { k, g, i, en, ar, asm, from: asm.clone().add(new THREE.Vector3(...fly[k])), exp: asm.clone().add(new THREE.Vector3(...exp[k])), size: new THREE.Box3().setFromObject(g).getSize(new THREE.Vector3()).length() };
  });

  /* ---------- labels ---------- */
  const lab = LIST.map((p) => { const s = document.createElement("span"); s.className = "c3-lab"; host.append(s); return s; });
  let langNow = -1;

  /* ---------- timeline ---------- */
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const ease = (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const easeOut = (x) => 1 - Math.pow(1 - x, 3);
  const INTRO = 1.6, STEPLEN = 3.1, FLYLEN = 2.1;
  const BUILT = INTRO + LIST.length * STEPLEN;                 // ≈ 45 s
  const SHOW = [BUILT, BUILT + 7], EXP = [BUILT + 7.5, BUILT + 9.5], HOLDX = BUILT + 15, CLEAR = [HOLDX, HOLDX + 1.6], CYCLE = HOLDX + 2.2;
  // camera angle for each step [azimuth, elevation]: 0 = side view, negative = sheave side
  const VIEW = { frame: [-0.7, 0.32], stator: [0.9, 0.18], rotor: [-0.9, 0.18], bearF: [-1.1, 0.2], bearR: [1.1, 0.2], coverF: [-1.0, 0.22], coverR: [1.0, 0.22],
    hub: [-1.2, 0.18], sheave: [-0.9, 0.2], brake: [-0.4, 0.7], jbox: [0.4, 0.6], fan: [1.3, 0.2], fanCover: [1.0, 0.2], inverter: [0.8, 0.25] };
  const focus = new THREE.Vector3(), camT = new THREE.Vector3(), v = new THREE.Vector3();
  let wantAz = -0.6, wantEl = 0.25, wantD = 8;

  function apply(T) {
    const t = T % CYCLE;
    const cur = t >= INTRO && t < BUILT ? Math.floor((t - INTRO) / STEPLEN) : -1;
    const ex = ease(seg(t, ...EXP)), clr = ease(seg(t, ...CLEAR));
    LIST.forEach((p, i) => {
      const s0 = INTRO + i * STEPLEN, a = ease(seg(t, s0 + 0.35, s0 + 0.35 + FLYLEN));
      const g = p.g, on = t >= s0;
      g.visible = on && clr < 0.999;
      g.position.copy(p.from).lerp(p.asm, a);
      if (ex > 0) g.position.lerp(p.exp, ex);
      if (clr > 0) g.position.lerp(p.exp.clone().multiplyScalar(1.6).add(new THREE.Vector3(0, 0, 0)), clr);
      const sc = (0.55 + 0.45 * easeOut(seg(t, s0, s0 + 1.2))) * (1 - clr);
      g.scale.setScalar(Math.max(0.001, sc));
      // a gentle turn while flying in, settling flat when seated
      const spinAxis = p.k === "sheave" || p.k === "hub" || p.k === "rotor" || p.k === "fan" ? "x" : "y";
      g.rotation.set(0, 0, 0);
      g.rotation[spinAxis] = (1 - a) * (spinAxis === "x" ? 4.5 : 0.9);
      // seating pulse
      p.seat = Math.sin(Math.PI * seg(t, s0 + 0.35 + FLYLEN - 0.25, s0 + 0.35 + FLYLEN + 0.35));
    });
    // finished machine runs: sheave, rotor and fan spin
    const run = seg(t, BUILT - 0.5, BUILT + 1.5) * (1 - ex);
    const spin = T * 2.2 * run;
    sheave.rotation.x += spin; P.hub.rotation.x += spin; P.rotor.rotation.x += spin; fanRot.rotation.x = T * 9 * run;
    machine.rotation.y = (reduce ? 0 : 1) * (ease(seg(t, SHOW[0], SHOW[1])) * Math.PI * 2 * 0.5 + Math.sin(T * 0.2) * 0.04) * (1 - ex) + ex * 0.0;

    // camera: follow the part being fitted, then pull back for the reveal
    if (cur >= 0) {
      const p = LIST[cur], s0 = INTRO + cur * STEPLEN, k = ease(seg(t, s0 + 0.2, s0 + 1.6));
      const seat = new THREE.Vector3(); seat.copy(p.asm).lerp(new THREE.Vector3(0, 0.1, 0), 0.45);
      focus.copy(seat).lerp(p.g.position, 0.18 * (1 - k));
      const vw = VIEW[p.k]; wantAz = vw[0]; wantEl = vw[1];
      wantD = fit(Math.max(3.3, p.size * 0.9 + 1.7)) * (1 - 0.08 * k);
    } else if (t < INTRO) { focus.set(0, 0.1, 0); wantAz = -0.7; wantEl = 0.3; wantD = fit(3.2); }
    else if (t < EXP[0]) { focus.set(0, 0.1, 0); wantAz = -0.55; wantEl = 0.24; wantD = fit(4.4); }
    else { focus.set(0, 0.3, 0); wantAz = -0.62; wantEl = 0.38; wantD = fit(6.4); }

    // labels: the current part while it's fitted, all of them in the exploded view
    const L = document.documentElement.lang === "ar" ? 1 : 0, W2 = host.clientWidth, H2 = host.clientHeight;
    const allVis = ease(seg(t, EXP[1] - 0.3, EXP[1] + 0.6)) * (1 - ease(seg(t, CLEAR[0] - 0.6, CLEAR[0])));
    LIST.forEach((p, i) => {
      const el = lab[i];
      if (L !== langNow) el.textContent = `${i + 1}  ${L ? p.ar : p.en}`;
      const s0 = INTRO + i * STEPLEN, mine = cur === i ? Math.min(seg(t, s0 + 0.2, s0 + 0.7), 1 - seg(t, s0 + STEPLEN - 0.4, s0 + STEPLEN)) : 0;
      const vis = Math.max(mine, allVis);
      v.set(0, 0, 0); p.g.localToWorld(v); v.y += p.k === "brake" || p.k === "jbox" ? 0.35 : Math.min(1.0, p.size * 0.42);
      v.project(camera);
      el.style.opacity = (vis * (v.z < 1 ? 1 : 0)).toFixed(2);
      el.classList.toggle("big", mine > 0); el.classList.toggle("sm", allVis > 0 && mine === 0);
      el.style.transform = `translate(-50%,-100%) translate(${((v.x + 1) / 2 * W2).toFixed(1)}px,${((1 - v.y) / 2 * H2).toFixed(1)}px)`;
    });
    langNow = L;
  }

  /* ---------- camera & loop ---------- */
  function fit(size) { const f = THREE.MathUtils.degToRad(camera.fov) / 2; return Math.max(size / 2 / Math.tan(f), size / 2 / (Math.tan(f) * camera.aspect)) * 1.25; }
  // ambient occlusion: soft contact shadows in every gap and corner (skipped on small screens)
  let composer = null, gtao = null;
  if (innerWidth > 700 && !reduce) {
    try {
      const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
      composer = new EffectComposer(renderer, rt);
      composer.addPass(new RenderPass(scene, camera));
      gtao = new GTAOPass(scene, camera, 1, 1); gtao.output = GTAOPass.OUTPUT.Default;
      gtao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.4, thickness: 1.2, scale: 1.1, samples: 16 });
      gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 5, rings: 2, samples: 16 });
      composer.addPass(gtao); composer.addPass(new OutputPass());
    } catch (e) { composer = null; }
  }
  function resize() { const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); } }
  new ResizeObserver(resize).observe(host); resize();
  const FIX = ((q) => q === null ? null : +q)(new URLSearchParams(location.search).get("t3d"));
  let visible = true, t0 = performance.now(), last = t0, camD = 9, camA = -0.7, camE = 0.3;
  camT.set(0, 0.1, 0);
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(host);
  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) { last = now; return; }
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    const T = FIX != null ? FIX : reduce ? BUILT + 1 : (now - t0) / 1000;
    apply(T);
    const s = FIX != null ? 1 : 1 - Math.exp(-dt * 1.3), sa = FIX != null ? 1 : 1 - Math.exp(-dt * 0.8);
    camT.lerp(focus, s); camD += (wantD - camD) * s; camA += (wantAz - camA) * sa; camE += (wantEl - camE) * sa;
    const a = camA + (reduce ? 0 : Math.sin(T * 0.08) * 0.08), ce = Math.cos(Math.atan(camE));
    camera.position.set(camT.x + Math.sin(a) * camD * ce, camT.y + camD * Math.sin(Math.atan(camE)), camT.z + Math.cos(a) * camD * ce);
    camera.lookAt(camT);
    composer ? composer.render() : renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
  return true;
}

if (host) {
  const go = () => { try { if (start()) document.querySelector(".hero")?.classList.add("has3d"); } catch (e) { console.warn(e); } };
  if (document.readyState === "complete") go(); else addEventListener("load", go, { once: true });
}
