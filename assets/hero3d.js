/* Melsa Elevators — animated 3D hero.
   1) The elevator's components are shown apart, each labelled.
   2) They fly into place one by one and build the full elevator.
   3) The cabin rides up and down the floors.
   4) Everything comes apart again and the loop restarts. */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const host = document.getElementById("hero3d");
const ind = document.getElementById("liftInd");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

const LABELS = {
  machine: ["Traction machine", "الماكينة"], controller: ["Controller", "لوحة الكنترول"], rails: ["Guide rails", "السكك"],
  cabin: ["Cabin", "الكابينة"], doors: ["Landing doors", "الأبواب الخارجية"], cw: ["Counterweight", "الثقل"],
  buffers: ["Buffers", "المخمدات"], lop: ["LOP panel", "لوحة الطلبات"],
  governor: ["Overspeed governor", "الجفرنر (منظم السرعة)"], cable: ["Travelling cable", "الكابل المرن"],
};

function start() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" }); }
  catch (e) { return false; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 1.5;
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xe6e4de, 0x0b1d35, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(4, 10, 6); scene.add(key);
  const rim = new THREE.PointLight(0xc5ad87, 30, 30); rim.position.set(-4, 6, -3); scene.add(rim);
  const redL = new THREE.PointLight(0xa82935, 3, 8); redL.position.set(3, 1, 3); scene.add(redL);

  const CYAN = 0xc5ad87, NAVY = 0x0b1d35, RED = 0xa82935;
  const B = 0.4, FLOORS = [B, B + 2.8, B + 5.6], TOP = B + 9.2, W = 2.3, D = 2.0, DZ = D / 2 - 0.28; // DZ = landing door line

  /* ---------- realistic look: shadows, generated metal textures, catalog photos ---------- */
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 12, bottom: -2, near: 1, far: 30 }); key.shadow.bias = -0.0008;
  const fill = new THREE.DirectionalLight(0xf5f4f0, 0.8); fill.position.set(-6, 5, 4); scene.add(fill);
  function brushed(base, vertical = false, strength = 0.18) {
    const c = document.createElement("canvas"); c.width = c.height = 512; const g = c.getContext("2d");
    g.fillStyle = base; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 2600; i++) {
      const y = Math.random() * 512, l = 40 + Math.random() * 300, x = Math.random() * 512, lt = Math.random() < 0.5;
      g.strokeStyle = lt ? `rgba(255,255,255,${Math.random() * strength})` : `rgba(0,0,0,${Math.random() * strength * 0.8})`;
      g.lineWidth = Math.random() * 1.2 + 0.3; g.beginPath();
      if (vertical) { g.moveTo(y, x); g.lineTo(y, x + l); } else { g.moveTo(x, y); g.lineTo(x + l, y); } g.stroke();
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t;
  }
  function concrete() {
    const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d");
    g.fillStyle = "#8d939c"; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 5000; i++) { const v = 110 + Math.random() * 60 | 0; g.fillStyle = `rgba(${v},${v},${v + 4},0.25)`; g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  }
  const tl = new THREE.TextureLoader();
  const photo = (src, rx = 1, ry = 1) => { const t = tl.load(src); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return t; };
  const stainlessTex = brushed("#c3cad2"), goldTex = brushed("#dcbd78", true, 0.1), darkTex = brushed("#3a414c", false, 0.12), concTex = concrete();
  const M = {
    stainless: new THREE.MeshStandardMaterial({ map: stainlessTex, metalness: 0.95, roughness: 0.28 }),
    gold: new THREE.MeshStandardMaterial({ map: goldTex, metalness: 0.9, roughness: 0.2 }),
    darkSteel: new THREE.MeshStandardMaterial({ map: darkTex, metalness: 0.7, roughness: 0.45 }),
    paintNavy: new THREE.MeshStandardMaterial({ color: NAVY, metalness: 0.3, roughness: 0.45 }),
    paintGrey: new THREE.MeshStandardMaterial({ color: 0x5b6472, metalness: 0.35, roughness: 0.55 }),
    paintRed: new THREE.MeshStandardMaterial({ color: 0xc0101e, metalness: 0.3, roughness: 0.4 }),
    machined: new THREE.MeshStandardMaterial({ color: 0xd9dde2, metalness: 1.0, roughness: 0.22 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x15171b, metalness: 0, roughness: 0.85 }),
    granite: new THREE.MeshStandardMaterial({ map: photo("assets/thumbs-lg/flooring_samples_09.jpg", 2, 2), metalness: 0.1, roughness: 0.18 }),
    marble: new THREE.MeshStandardMaterial({ map: photo("assets/thumbs-lg/flooring_samples_02.jpg", 2, 1), metalness: 0.05, roughness: 0.2 }),
    concrete: new THREE.MeshStandardMaterial({ map: concTex, metalness: 0, roughness: 0.9 }),
    glassPanel: new THREE.MeshStandardMaterial({ color: 0x0c0e12, metalness: 0.5, roughness: 0.15 }),
  };
  const ledM = c => new THREE.MeshBasicMaterial({ color: c });

  const edgeMats = [];
  function edges(mesh, color = CYAN, op = 0.7) {
    const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity: op, depthWrite: false });
    m.userData.base = op; edgeMats.push(m);
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 25), m)); return mesh;
  }
  const metal = (c, m = 0.85, r = 0.3) => new THREE.MeshStandardMaterial({ color: c, metalness: m, roughness: r });
  const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  const cyl = (r, h, mat, seg = 32) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
  const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };

  /* ---------- ground ---------- */
  const grid = new THREE.GridHelper(16, 32, 0x8a9bb0, 0x1d3f7a);
  grid.material.transparent = true; grid.material.opacity = 0.3; scene.add(grid);
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ opacity: 0.35 }));
  catcher.rotation.x = -Math.PI / 2; catcher.position.y = 0.002; catcher.receiveShadow = true; scene.add(catcher);
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.5, 1.56, 64), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.01; scene.add(ring);

  /* ---------- structure: steel & glass tower, marble landings, concrete pit ---------- */
  const structure = new THREE.Group(); scene.add(structure);
  const structMats = [];
  const sm = m => { const x = m.clone(); x.transparent = true; structMats.push(x); return x; };
  const postMat = sm(M.darkSteel), slabMat = sm(M.marble), slabEdge = sm(M.stainless), concMat = sm(M.concrete);
  const structEdges = [];
  const se = (m, c, o) => { edges(m, c, o); structEdges.push(m.children[m.children.length - 1].material); return m; };
  for (const [x, z] of [[-W / 2, -D / 2], [W / 2, -D / 2], [-W / 2, D / 2], [W / 2, D / 2]]) structure.add(at(se(box(0.08, TOP, 0.08, postMat), CYAN, 0.2), x, TOP / 2, z));
  for (let y = 1.4; y < TOP; y += 2.8) {   // horizontal steel ring beams
    structure.add(at(box(W, 0.06, 0.06, postMat), 0, y, -D / 2), at(box(0.06, 0.06, D, postMat), -W / 2, y, 0), at(box(0.06, 0.06, D, postMat), W / 2, y, 0));
  }
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xe8dcc4, metalness: 0, roughness: 0.02, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false, clearcoat: 1 });
  for (const [w, x, z, ry] of [[W, 0, -D / 2, 0], [D, -W / 2, 0, Math.PI / 2], [D, W / 2, 0, Math.PI / 2]]) {
    const g = new THREE.Mesh(new THREE.PlaneGeometry(w, TOP), glassMat); g.position.set(x, TOP / 2, z); g.rotation.y = ry; structure.add(g);
  }
  FLOORS.forEach(y => {
    structure.add(at(se(box(W - 0.12, 0.16, 1.7, slabMat), CYAN, 0.15), 0, y - 0.08, DZ + 0.88));
    structure.add(at(box(W - 0.1, 0.04, 0.04, slabEdge), 0, y - 0.15, DZ + 1.73));
  });
  structure.add(at(se(box(W, 0.1, D, concMat), CYAN, 0.15), 0, 0.05, 0));                    // pit floor
  structure.add(at(se(box(W + 0.12, 0.14, D + 0.12, postMat), CYAN, 0.2), 0, TOP, 0));       // top frame
  const scan = new THREE.Mesh(new THREE.BoxGeometry(W + 0.4, 0.02, D + 0.4), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(scan);

  /* ---------- landing doors: frame, sill, header & hall indicator + two gold panels per floor ---------- */
  const landing = new THREE.Group(); scene.add(landing);
  const leafM = new THREE.MeshStandardMaterial({ map: brushed("#c9c7c0", true, 0.06), metalness: 0.35, roughness: 0.45 });
  const LD = FLOORS.map((y, i) => {
    const g = new THREE.Group();
    g.add(at(edges(box(0.1, 2.3, 0.1, M.stainless), CYAN, 0.4), -0.5, 1.15, 0), at(edges(box(0.1, 2.3, 0.1, M.stainless), CYAN, 0.4), 0.5, 1.15, 0));
    g.add(at(edges(box(1.1, 0.12, 0.1, M.stainless), CYAN, 0.4), 0, 2.36, 0));
    g.add(at(box(1.1, 0.03, 0.16, M.machined), 0, 0.015, 0.02));                                  // sill
    const disp = at(box(0.26, 0.08, 0.02, M.glassPanel), 0, 2.56, 0.05); g.add(disp);
    disp.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.05), ledM(0xa82935)), 0, 0, 0.011));
    const hinge = new THREE.Group(); hinge.position.set(-0.45, 0, 0.03); g.add(hinge);        // the leaf swings on its left hinge
    const leaf = new THREE.Group(); leaf.position.x = 0.45; hinge.add(leaf);
    leaf.add(at(edges(box(0.9, 2.26, 0.045, leafM), CYAN, 0.4), 0, 1.15, 0));
    leaf.add(at(box(0.12, 0.98, 0.05, new THREE.MeshPhysicalMaterial({ color: 0xe8dcc4, roughness: 0.05, transmission: 0.6, transparent: true, opacity: 0.55 })), -0.12, 1.42, 0));
    for (const [w, h, x, y] of [[0.16, 0.03, -0.12, 1.92], [0.16, 0.03, -0.12, 0.92], [0.03, 1.0, -0.2, 1.42], [0.03, 1.0, -0.04, 1.42]]) leaf.add(at(box(w, h, 0.052, M.stainless), x, y, 0));
    leaf.add(at(box(0.04, 0.2, 0.06, M.machined), 0.34, 1.05, 0.04));                          // handle
    landing.add(g);
    return { g, hinge, asm: new THREE.Vector3(0, y, DZ), show: new THREE.Vector3(3.0 + i * 0.3, 3.4 + i * 0.12, -0.9 - i * 0.45) };
  });

  /* ---------- components (each shown apart, then assembled) ---------- */
  const comps = {};
  function comp(name, obj, show, win, labelOff = [0, 1, 0]) {
    scene.add(obj);
    comps[name] = { obj, show, win, labelOff: new THREE.Vector3(...labelOff), asm: { p: new THREE.Vector3(), s: 1 } };
    return comps[name];
  }

  // gearless traction machine: bedplate on I-beams, disc motor, brake, grooved sheave
  const machine = new THREE.Group();
  for (const z of [-0.2, 0.2]) machine.add(at(edges(box(1.15, 0.1, 0.08, M.paintGrey), CYAN, 0.4), 0, -0.34, z));
  machine.add(at(edges(box(1.0, 0.04, 0.55, M.darkSteel), CYAN, 0.4), 0, -0.27, 0));
  const motor = cyl(0.3, 0.22, M.paintNavy, 48); motor.rotation.z = Math.PI / 2; machine.add(at(edges(motor, CYAN, 0.3), -0.25, 0, 0));
  const cap = cyl(0.12, 0.05, M.machined); cap.rotation.z = Math.PI / 2; machine.add(at(cap, -0.385, 0, 0));
  for (const s of [-1, 1]) machine.add(at(box(0.14, 0.12, 0.1, M.paintRed), -0.1, 0.22 * s, 0.24));   // brake calipers
  machine.add(at(box(0.08, 0.3, 0.44, M.paintGrey), -0.08, -0.12, 0));                                  // motor stand
  const sheave = new THREE.Group(); sheave.position.x = 0.12; machine.add(sheave);
  const sh = cyl(0.26, 0.14, M.machined, 48); sh.rotation.z = Math.PI / 2; sheave.add(sh);
  for (let k = 0; k < 5; k++) { const gr = new THREE.Mesh(new THREE.TorusGeometry(0.262, 0.008, 6, 48), M.darkSteel); gr.rotation.y = Math.PI / 2; gr.position.x = -0.05 + k * 0.025; sheave.add(gr); }
  for (let k = 0; k < 6; k++) { const sp = box(0.02, 0.4, 0.04, M.darkSteel); sp.rotation.x = k * Math.PI / 6; sp.position.x = 0.075; sheave.add(sp); }
  machine.add(at(box(0.1, 0.36, 0.1, M.paintGrey), 0.26, -0.14, 0));                                   // outer bearing stand
  const mc = comp("machine", machine, { p: [-2.9, 7.2, 0.4], r: [0.3, 0.6, 0], s: 1.6 }, [6.3, 7.5], [0, 0.6, 0]);
  mc.asm.p.set(0, TOP + 0.42, -0.35);

  // controller cabinet
  const ctrl = new THREE.Group();
  ctrl.add(edges(box(0.38, 0.62, 0.22, M.paintGrey), CYAN, 0.4));
  ctrl.add(at(box(0.34, 0.58, 0.005, M.paintGrey), 0, 0, 0.113));
  ctrl.add(at(box(0.02, 0.12, 0.02, M.machined), 0.14, 0, 0.125));
  for (let k = 0; k < 5; k++) ctrl.add(at(box(0.22, 0.008, 0.004, M.darkSteel), -0.02, -0.22 + k * 0.025, 0.118));
  for (let i = 0; i < 3; i++) ctrl.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.013, 12), ledM(i ? 0x2bff88 : RED)), -0.08 + i * 0.05, 0.22, 0.117));
  const cc = comp("controller", ctrl, { p: [2.8, 7.2, 0.4], r: [0.2, -0.6, 0], s: 1.8 }, [6.5, 7.6], [0, 0.5, 0]);
  cc.asm.p.set(0.85, TOP + 0.38, 0.55);

  // guide rails: T-section steel with brackets
  const tShape = new THREE.Shape();
  tShape.moveTo(-0.045, 0); tShape.lineTo(0.045, 0); tShape.lineTo(0.045, 0.012); tShape.lineTo(0.008, 0.012); tShape.lineTo(0.008, 0.07);
  tShape.lineTo(-0.008, 0.07); tShape.lineTo(-0.008, 0.012); tShape.lineTo(-0.045, 0.012); tShape.closePath();
  const tGeo = new THREE.ExtrudeGeometry(tShape, { depth: TOP, bevelEnabled: false }); tGeo.rotateX(-Math.PI / 2);
  const rails = new THREE.Group();
  for (const s of [-1, 1]) {
    const r = new THREE.Mesh(tGeo, M.machined); r.rotation.y = s > 0 ? Math.PI / 2 : -Math.PI / 2; r.position.x = s * 0.86; rails.add(edges(r, CYAN, 0.3));
    for (let y = 0.9; y < TOP; y += 1.6) rails.add(at(box(W / 2 - 0.9, 0.05, 0.14, M.paintGrey), s * (0.9 + (W / 2 - 0.9) / 2), y, 0));
  }
  comp("rails", rails, { p: [-4.4, 0.3, -1.2], r: [0, -0.4, 0.12], s: 0.4 }, [5.0, 6.2], [0.3, TOP * 0.45, 0]);

  // buffers: red coil springs on base plates
  const buffers = new THREE.Group();
  const helix = []; for (let k = 0; k <= 160; k++) { const a = k / 160 * Math.PI * 2 * 6; helix.push(new THREE.Vector3(Math.cos(a) * 0.075, 0.08 + k / 160 * 0.26, Math.sin(a) * 0.075)); }
  const springGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(helix), 320, 0.012, 6);
  for (const x of [-0.4, 0.4]) {
    buffers.add(at(new THREE.Mesh(springGeo, M.paintRed), x, 0, 0));
    buffers.add(at(edges(box(0.26, 0.06, 0.26, M.paintGrey), CYAN, 0.4), x, 0.06, 0), at(cyl(0.1, 0.03, M.rubber), x, 0.36, 0));
  }
  comp("buffers", buffers, { p: [-3.5, 0.3, 2.3], r: [0.3, 0.5, 0], s: 2.0 }, [5.3, 6.3], [0, 0.5, 0]);

  // counterweight: steel frame with stacked filler blocks
  const cwG = new THREE.Group();
  for (const x of [-0.32, 0.32]) cwG.add(at(edges(box(0.05, 1.3, 0.14, M.paintGrey), CYAN, 0.4), x, 0, 0));
  for (const y of [-0.63, 0.63]) cwG.add(at(box(0.7, 0.06, 0.14, M.paintGrey), 0, y, 0));
  for (let i = 0; i < 9; i++) cwG.add(at(box(0.58, 0.12, 0.12, M.darkSteel), 0, -0.53 + i * 0.133, 0));
  comp("cw", cwG, { p: [-3.0, 3.4, -0.2], r: [0, 0.7, 0], s: 1.2 }, [5.8, 7.0], [0, 0.85, 0]);

  // cabin: stainless walls with panel seams, granite floor, LED ceiling, gold front, door operator, car-top rail, sling
  const car = new THREE.Group();
  const add = (m, x, y, z, ec = CYAN) => { edges(m, ec, 0.35); m.position.set(x, y, z); car.add(m); return m; };
  add(box(1.4, 0.08, 1.3, M.granite), 0, 0.04, 0);
  add(box(1.44, 0.06, 1.34, M.darkSteel), 0, -0.02, 0);
  const ceil = add(box(1.4, 0.06, 1.3, metal(0xeef2f6, 0.4, 0.4)), 0, 2.26, 0);
  add(box(1.4, 2.18, 0.04, M.stainless), 0, 1.13, -0.63);
  add(box(0.04, 2.18, 1.3, M.stainless), -0.68, 1.13, 0);
  add(box(0.04, 2.18, 1.3, M.stainless), 0.68, 1.13, 0);
  for (const x of [-0.35, 0.35]) car.add(at(box(0.012, 2.1, 0.005, M.darkSteel), x, 1.13, -0.608));
  for (const z of [-0.2, 0.25]) for (const s of [-1, 1]) car.add(at(box(0.005, 2.1, 0.012, M.darkSteel), s * 0.658, 1.13, z));
  add(box(0.12, 2.18, 0.04, M.gold), -0.64, 1.13, 0.64);
  add(box(0.12, 2.18, 0.04, M.gold), 0.64, 1.13, 0.64);
  add(box(1.4, 0.16, 0.04, M.gold), 0, 2.14, 0.64);
  const hr = cyl(0.02, 1.1, M.gold, 16); hr.rotation.z = Math.PI / 2; car.add(at(hr, 0, 0.95, -0.56));
  for (const x of [-0.5, 0.5]) { const br = at(cyl(0.008, 0.06, M.gold, 8), x, 0.95, -0.59); br.rotation.x = Math.PI / 2; car.add(br); }
  const cop = add(box(0.13, 0.74, 0.02, M.stainless), 0.56, 1.25, 0.6, RED);
  for (let k = 0; k < 6; k++) cop.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.016, 16), ledM(k ? 0xdfe6ee : RED)), 0, 0.22 - k * 0.07, 0.011));
  cop.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.05), ledM(0xa82935)), 0, 0.31, 0.011));
  for (const x of [-0.4, 0.4]) { const led = at(new THREE.Mesh(new THREE.PlaneGeometry(0.06, 1.0), ledM(0xfff1c8)), x, 2.225, 0); led.rotation.x = Math.PI / 2; car.add(led); }
  car.add(at(box(1.4, 0.1, 0.02, M.machined), 0, 0.05, 0.665));                                        // car sill
  for (const [x, z] of [[-0.68, -0.6], [0.68, -0.6], [-0.68, 0.45], [0.68, 0.45]]) car.add(at(cyl(0.012, 0.5, M.paintGrey, 8), x, 2.55, z)); // top balustrade posts
  car.add(at(box(1.38, 0.025, 0.025, M.paintGrey), 0, 2.8, -0.6), at(box(0.025, 0.025, 1.05, M.paintGrey), -0.68, 2.8, -0.08), at(box(0.025, 0.025, 1.05, M.paintGrey), 0.68, 2.8, -0.08));
  add(box(0.08, 2.9, 0.08, M.paintGrey), -0.76, 1.4, 0);                                              // sling uprights
  add(box(0.08, 2.9, 0.08, M.paintGrey), 0.76, 1.4, 0);
  add(box(1.66, 0.12, 0.14, M.paintGrey), 0, 2.9, 0);                                                 // crosshead
  add(box(1.66, 0.12, 0.14, M.paintGrey), 0, -0.1, 0);                                                // plank
  for (const s of [-1, 1]) for (const y of [-0.08, 2.85]) car.add(at(box(0.06, 0.1, 0.1, M.rubber), s * 0.82, y, 0)); // guide shoes
  for (const s of [-1, 1]) car.add(at(box(0.1, 0.16, 0.12, M.paintRed), s * 0.78, 0.08, 0));            // safety gear
  ceil.material.emissive = new THREE.Color(0xfff1c8); ceil.material.emissiveIntensity = 0.2;
  const carLight = new THREE.PointLight(0xfff1c8, 5, 3); carLight.position.y = 1.9; car.add(carLight);
  const doors = new THREE.Group(); // semi-automatic: the cabin has no doors of its own
  const doorL = edges(box(0.62, 2.02, 0.03, M.gold), CYAN, 0.35); doorL.position.set(-0.31, 1.06, 0.69); doors.add(doorL);
  const doorR = edges(box(0.62, 2.02, 0.03, M.gold), CYAN, 0.35); doorR.position.set(0.31, 1.06, 0.69); doors.add(doorR);
  const cabC = comp("cabin", car, { p: [2.9, 0.3, 1.9], r: [0.08, 0.55, 0], s: 1.0 }, [6.6, 7.9], [0, 3.1, 0]);

  // LOP: stainless plate, up/down buttons with lit rings
  const lop = new THREE.Group();
  lop.add(edges(box(0.16, 0.44, 0.02, M.stainless), CYAN, 0.4));
  for (const y of [0.07, -0.07]) {
    lop.add(at(new THREE.Mesh(new THREE.RingGeometry(0.03, 0.038, 24), ledM(0xc5ad87)), 0, y, 0.0105));
    lop.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.028, 24), M.machined), 0, y, 0.011));
  }
  lop.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.04), ledM(0xa82935)), 0, 0.17, 0.011));
  const lc = comp("lop", lop, { p: [3.5, 1.7, 2.6], r: [0, -0.4, 0], s: 2.4 }, [7.4, 8.4], [0, 0.4, 0]);
  lc.asm.p.set(0.8, B + 1.15, DZ + 0.06);

  // overspeed governor (top) + rope and tension pulley (pit)
  const gov = new THREE.Group();
  gov.add(at(edges(box(0.36, 0.05, 0.3, M.paintGrey), CYAN, 0.4), 0, -0.2, 0));
  for (const x of [-0.12, 0.12]) gov.add(at(box(0.03, 0.22, 0.05, M.paintGrey), x, -0.08, 0));
  const govSheave = new THREE.Group(); gov.add(govSheave);
  const gs = cyl(0.16, 0.05, M.machined, 36); gs.rotation.z = Math.PI / 2; govSheave.add(gs);
  const gg = new THREE.Mesh(new THREE.TorusGeometry(0.162, 0.007, 6, 40), M.darkSteel); gg.rotation.y = Math.PI / 2; govSheave.add(gg);
  for (const a of [0, Math.PI]) govSheave.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 8), M.paintRed), 0.035, Math.sin(a) * 0.09, Math.cos(a) * 0.09));
  const GX = -1.0, GZ = 0.55;
  const gc = comp("governor", gov, { p: [-1.5, 5.9, 0.6], r: [0.2, 0.8, 0], s: 2.2 }, [6.4, 7.5], [0, 0.45, 0]);
  gc.asm.p.set(GX, TOP + 0.32, GZ);
  const pulley = new THREE.Group(); pulley.position.set(GX, 0.32, GZ); scene.add(pulley);
  const pw = cyl(0.11, 0.04, M.machined, 24); pw.rotation.z = Math.PI / 2; pulley.add(pw);
  pulley.add(at(box(0.04, 0.04, 0.5, M.paintGrey), 0.05, 0, -0.2));
  const govRope = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(GX, TOP + 0.32, GZ + 0.16), new THREE.Vector3(GX, 0.32, GZ + 0.11),
    new THREE.Vector3(GX, TOP + 0.32, GZ - 0.16), new THREE.Vector3(GX, 0.32, GZ - 0.11)]),
    new THREE.LineBasicMaterial({ color: 0xd9dee5, transparent: true, opacity: 0.8 }));
  scene.add(govRope);

  // travelling cable: a coil when shown apart, a hanging flat loop under the car once installed
  const coilPts = []; for (let i = 0; i <= 120; i++) { const a = i / 120 * Math.PI * 2 * 3.2; coilPts.push(new THREE.Vector3(Math.cos(a) * 0.32, i / 120 * 0.34 - 0.17, Math.sin(a) * 0.32)); }
  const cableMat = new THREE.MeshStandardMaterial({ color: 0x1b1e24, metalness: 0.1, roughness: 0.7, transparent: true });
  const coilG = new THREE.Group(); coilG.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coilPts), 240, 0.03, 8), cableMat));
  const cab2 = comp("cable", coilG, { p: [-2.5, 1.4, 1.2], r: [0.5, 0.3, 0], s: 1.6 }, [7.6, 8.6], [0, 0.42, 0]);
  const CA = new THREE.Vector3(1.0, B + 2.8 + 1.2, -0.45), CL = 4.4;
  cab2.asm.p.set(0.72, B - 0.2, -0.45); cab2.asm.s = 0.55;   // the coil is brought under the cabin first
  const hangMat = cableMat.clone(); hangMat.color.set(0x2a2f38); hangMat.emissive = new THREE.Color(0xc5ad87); hangMat.emissiveIntensity = 0.25; let hang = null;
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 12), new THREE.MeshBasicMaterial({ color: 0xe8dcc4, transparent: true })); tip.visible = false; scene.add(tip);
  const tipGlow = new THREE.PointLight(0xc5ad87, 0, 1.6); tip.add(tipGlow);
  let hangCurve = null;
  function hangCable(carY, draw, op) {   // draw: 0..1 how much is installed, starting from the cabin end
    if (hang) { scene.remove(hang); hang.geometry.dispose(); hang = null; }
    if (draw < 0.01 || op < 0.01) return;
    const cy = carY, lo = Math.max(0.18, (CA.y + cy) / 2 - CL / 2);
    const z = -0.45, P = [CA.clone(), new THREE.Vector3(1.0, Math.min(CA.y - 0.3, lo + 0.5), z), new THREE.Vector3(0.98, lo + 0.12, z),
      new THREE.Vector3(0.86, lo, z), new THREE.Vector3(0.74, lo + 0.12, z), new THREE.Vector3(0.72, Math.max(lo + 0.14, Math.min(cy - 0.12, lo + 0.5)), z), new THREE.Vector3(0.62, cy - 0.12, z)];
    P.reverse(); hangCurve = new THREE.CatmullRomCurve3(P);
    hangMat.opacity = op;
    hang = new THREE.Mesh(new THREE.TubeGeometry(hangCurve, 64, 0.034, 6), hangMat); hang.castShadow = true;
    hang.geometry.setDrawRange(0, Math.floor(draw * hang.geometry.index.count / 36) * 36); scene.add(hang);
  }

  // shadows on all solid parts
  scene.traverse(o => { if (o.isMesh && o.material && !o.material.transparent && o.material.type !== "MeshBasicMaterial" && o !== catcher) { o.castShadow = true; o.receiveShadow = true; } });

  // hoisting ropes: drawn as tubes that arrive from far away and wrap the traction sheave
  const ropeGeo = new THREE.BufferGeometry(); const ropePts = new Float32Array(6 * 3 * 2);
  ropeGeo.setAttribute("position", new THREE.BufferAttribute(ropePts, 3));
  const ropes = new THREE.LineSegments(ropeGeo, new THREE.LineBasicMaterial({ color: 0xdfe6ee, transparent: true, opacity: 0.85 })); scene.add(ropes);
  const SX = 0.12, SY = TOP + 0.38, SZ = -0.35, SR = 0.28;
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0xe6edf5, metalness: 0.9, roughness: 0.25, emissive: new THREE.Color(0xc5ad87), emissiveIntensity: 0.35, transparent: true });
  const r1 = [new THREE.Vector3(3.6, TOP + 2.4, 3.2), new THREE.Vector3(2.2, TOP + 1.5, 1.8), new THREE.Vector3(0.9, SY + 0.7, 0.5), new THREE.Vector3(SX + 0.1, SY + SR + 0.05, SZ + 0.15)];
  for (let k = 0; k <= 60; k++) { const th = Math.PI / 2 + k / 60 * Math.PI * 2 * 1.5; r1.push(new THREE.Vector3(SX + 0.06 - k / 60 * 0.08, SY + Math.sin(th) * SR, SZ + Math.cos(th) * SR)); }
  r1.push(new THREE.Vector3(SX - 0.04, SY - 0.6, SZ + SR - 0.02), new THREE.Vector3(0, B + 2.96, 0));
  const r2 = [new THREE.Vector3(SX - 0.02, SY, SZ - SR), new THREE.Vector3(0.02, SY - 1.2, -D / 2 + 0.16), new THREE.Vector3(0, B + 7.3, -D / 2 + 0.16)];
  const tube = (pts, n) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.2), n, 0.016, 6), ropeMat);
  const rope1 = tube(r1, 260), rope2 = tube(r2, 60); scene.add(rope1, rope2);
  const rCount1 = rope1.geometry.index.count, rCount2 = rope2.geometry.index.count;
  const headCurve = new THREE.CatmullRomCurve3(r1, false, "catmullrom", 0.2);

  /* ---------- labels (HTML, follow their component on screen) ---------- */
  const lab = {};
  for (const k in LABELS) { const s = document.createElement("span"); s.className = "c3-lab"; host.append(s); lab[k] = s; }
  let langNow = -1;

  /* ---------- timeline: overview, then one part at a time with the camera on it ---------- */
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const ease = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  // focus: [offset x, y, z, size] in the part's own scale
  const FOCUS = { rails: [0, TOP * 0.5, 0, 5.2], buffers: [0, 0.2, 0, 1.8], cw: [0, 0, 0, 2.2], machine: [0, 0, 0, 2.2], governor: [0, -0.05, 0, 1.6],
    controller: [0, 0, 0, 1.6], cabin: [0, 1.2, 0, 3.4], lop: [0, 0, 0, 1.4], cable: [0, 0, 0, 2.0] };
  // real installation order: rails, landing doors, machine (+counterweight), cabin (+ropes), governor, controller, travelling cable, LOP, buffers
  const ORDER = [["shaft", 6.0], ["rails", 6.5], ["doors", 10.5], ["machine", 6.5], ["cw", 6.0], ["cabin", 7.0], ["ropes", 9.0],
    ["governor", 6.0], ["controller", 6.0], ["cable", 9.5], ["lop", 5.5], ["buffers", 6.0]];
  const INTRO = 5.0, HOLD = 1.9; // HOLD = camera travels to the part and shows it before it moves
  // best camera angle for each step: [azimuth (0 = front, + = right side, ±3 = back), height]
  const VIEW = { shaft: [-0.5, 0.14], rails: [-0.55, 0.1], doors: [-0.25, 0.08], machine: [-0.5, 0.45], cw: [-2.5, 0.18], cabin: [0.25, 0.1],
    ropes: [-0.7, 0.3], governor: [-1.0, 0.3], controller: [0.8, 0.3], cable: [2.0, 0.22], lop: [0.45, 0.05], buffers: [-2.3, 0.75] };
  let wantAz = -0.5, wantEl = 0.12;
  const STEP = {}; let tt = INTRO;
  for (const [n, d] of ORDER) { STEP[n] = [tt, tt + d]; tt += d; }
  const BUILT = tt;                                  // ≈ 44s
  const R = { lights: BUILT + 0.2, close1: [BUILT + 1.4, BUILT + 2.3], up: [BUILT + 2.6, BUILT + 7.4], open1: [BUILT + 7.4, BUILT + 8.3], close2: [BUILT + 9.8, BUILT + 10.7],
    down: [BUILT + 11.0, BUILT + 15.8], open2: [BUILT + 15.8, BUILT + 16.7] };
  const OUT = [BUILT + 18.0, BUILT + 21.0], CYCLE = BUILT + 22.0;
  for (const n in comps) comps[n].win = [STEP[n][0] + HOLD, STEP[n][1] - 0.9];
  comps.cable.win = [STEP.cable[0] + HOLD, STEP.cable[0] + HOLD + 2.0];
  const v = new THREE.Vector3(), camT = new THREE.Vector3(0, 4.2, 0);
  let lastInd = "", focusSize = 0, focus = new THREE.Vector3();

  function apply(T) {
    const t = T % CYCLE;
    const out = ease(seg(t, OUT[0], OUT[1]));
    const showIn = ease(seg(t, 0, 1.4));
    const up = ease(seg(t, ...R.up)), down = ease(seg(t, ...R.down));
    const carY = FLOORS[0] + 5.6 * (up - down);
    cabC.asm.p.set(0, carY, 0);
    comps.cw.asm.p.set(0, B + 0.55 + (5.6 - (carY - B)) + 0.6, -D / 2 + 0.16);

    // which step is running now
    let cur = null; for (const [n] of ORDER) { const [a, b] = STEP[n]; if (t >= a && t < b) { cur = n; break; } }
    for (const name in comps) {
      const c = comps[name], o = c.obj;
      const a = ease(seg(t, c.win[0], c.win[1])) * (1 - out);
      const pres = ease(seg(t, STEP[name][0], c.win[0])) * (1 - out), bump = Math.sin(Math.PI * seg(t, STEP[name][0], c.win[1]));
      const bob = (1 - a) * Math.sin(T * 0.9 + c.win[0] * 3) * 0.1;
      const spin = (1 - a) * (Math.sin(T * 0.35 + c.win[0]) * 0.25 + pres * 1.2);
      o.position.set(...c.show.p).lerp(c.asm.p, a); o.position.y += bob;
      o.rotation.set(c.show.r[0] * (1 - a), (c.show.r[1] + spin) * (1 - a), c.show.r[2] * (1 - a));
      o.scale.setScalar((c.show.s + (c.asm.s - c.show.s) * a) * (0.6 + 0.4 * showIn) * (1 + 0.06 * bump));
      c.a = a;
      if (!c.lines) { c.lines = []; o.traverse(x => { if (x.isLineSegments) c.lines.push(x.material); }); }
      for (const m of c.lines) m.opacity = m.userData.base * (1 - a);
    }
    // doors
    const [d0, d1] = STEP.doors;
    const open = Math.max(1 - seg(t, ...R.close1), seg(t, ...R.open1) * (1 - seg(t, ...R.close2)), seg(t, ...R.open2) * (1 - seg(t, OUT[0] - 0.9, OUT[0])));
    const o2 = ease(open) * 0.56 * (comps.cabin.a || 0); doorL.position.x = -0.31 - o2; doorR.position.x = 0.31 + o2;
    LD.forEach((d, i) => {
      const span = (d1 - 0.9 - (d0 + HOLD)) / 3, a = ease(seg(t, d0 + HOLD + i * span, d0 + HOLD + (i + 1) * span)) * (1 - out);
      const pres = ease(seg(t, d0, d0 + HOLD)) * (1 - out);
      d.g.position.copy(d.show).lerp(d.asm, a); d.g.position.y += (1 - a) * Math.sin(T * 0.9 + i) * 0.08;
      d.g.rotation.y = (1 - a) * (-0.7 + pres * 0.9); d.g.scale.setScalar(1 + 0.1 * (1 - a));
      if (!d.lines) { d.lines = []; d.g.traverse(x => { if (x.isLineSegments) d.lines.push(x.material); }); }
      for (const m of d.lines) m.opacity = m.userData.base * (1 - a);
      const here = a > 0.99 && Math.abs(carY - FLOORS[i]) < 0.03 ? o2 / 0.56 : 0;
      d.hinge.rotation.y = -1.45 * here;          // swing door opens outwards to the landing
    });
    sheave.rotation.x = carY * 2.4; govSheave.rotation.x = carY * 4; pulley.rotation.x = carY * 6;
    // shaft builds with a scan beam
    const [s0, s1] = STEP.shaft;
    const built = ease(seg(t, s0 + 0.4, s1 - 0.3)) * (1 - out);
    structure.visible = built > 0.01;
    structMats.forEach(m => m.opacity = built); glassMat.opacity = 0.08 * built;
    structEdges.forEach(m => m.opacity = m.userData.base * built);
    scan.visible = t > s0 + 0.3 && t < s1; scan.position.y = TOP * ease(seg(t, s0 + 0.4, s1 - 0.3)); scan.material.opacity = 0.55 * (1 - seg(t, s1 - 0.5, s1));
    // governor rope
    const gOn = (comps.governor.a > 0.98 ? 1 : 0) * (1 - out);
    govRope.material.opacity = 0.8 * gOn; govRope.visible = pulley.visible = gOn > 0.01;
    // travelling cable
    // travelling cable: coil arrives under the cabin, the end is fixed to the cabin, then it unwinds up to the shaft wall
    const [k0, k1] = STEP.cable, kDraw = ease(seg(t, k0 + HOLD + 1.9, k1 - 0.9));
    const cDraw = t >= k1 ? 1 : kDraw, cOp = 1 - out;
    coilG.scale.multiplyScalar(1 - 0.9 * cDraw); coilG.rotation.y += cDraw * 9;
    cableMat.opacity = 1 - ease(seg(cDraw, 0.85, 1)); coilG.visible = cableMat.opacity > 0.02 && out < 0.5;
    hangCable(carY, cDraw * (out > 0 ? 1 - out : 1), cOp);
    tip.visible = kDraw > 0.01 && kDraw < 0.99 && hangCurve; if (tip.visible) { tip.position.copy(hangCurve.getPointAt(kDraw)); tipGlow.intensity = 3; }
    // hoisting ropes: tube arrives from far, wraps the sheave, drops to car & counterweight, then hands over to live lines
    const [q0, q1] = STEP.ropes, qd = q1 - q0;
    const p1 = ease(seg(t, q0 + 0.5, q0 + qd * 0.72)), p2 = ease(seg(t, q0 + qd * 0.55, q0 + qd * 0.85));
    const hand = seg(t, q1 - 0.6, q1);
    rope1.visible = p1 > 0 && hand < 1 && out === 0; rope2.visible = p2 > 0 && hand < 1 && out === 0;
    rope1.geometry.setDrawRange(0, Math.floor(p1 * rCount1 / 36) * 36); rope2.geometry.setDrawRange(0, Math.floor(p2 * rCount2 / 36) * 36);
    ropeMat.opacity = 1 - hand;
    const ropeOn = hand * (1 - out) * (t >= q1 - 0.6 ? 1 : 0);
    ropes.material.opacity = 0.85 * ropeOn; ropes.visible = ropeOn > 0.01;
    const cwy = comps.cw.obj.position.y;
    let i = 0; const put = (a, b) => { ropePts.set([...a, ...b], i); i += 6; };
    for (const dx of [-0.05, 0, 0.05]) { put([dx, carY + 2.96, 0], [dx + SX, SY, SZ + SR]); put([dx + SX, SY, SZ - SR], [dx, cwy + 0.55, -D / 2 + 0.16]); }
    ropeGeo.attributes.position.needsUpdate = true;

    // camera focus
    let wantD, ropeHead = null;
    if (t < INTRO || t >= OUT[0]) { focus.set(0, 4.2, 0); wantD = dShow; }
    else if (cur === "shaft") { focus.set(0, 5.0, 0); wantD = fit(10.6, 5); }
    else if (cur === "doors") {
      const sp = (STEP.doors[1] - 0.9 - STEP.doors[0] - HOLD) / 3, u = (t - STEP.doors[0] - HOLD) / sp;
      if (u < 0) { focus.copy(LD[1].g.position); focus.y += 1.2; wantD = fit(4.2, 4.2); }
      else { const j = clamp(Math.floor(u), 0, 2), f = u - j; focus.copy(LD[j].g.position); focus.y += 1.15; if (j < 2 && f > 0.85) focus.lerp(LD[j + 1].g.position.clone().setY(LD[j + 1].g.position.y + 1.15), (f - 0.85) / 0.15); wantD = fit(3.6, 3.6); }
    }
    else if (cur === "ropes") {
      const u = clamp(p1 * 1.0); ropeHead = headCurve.getPointAt(Math.min(0.999, u));
      if (u < 0.5) { focus.copy(ropeHead).lerp(new THREE.Vector3(SX, SY, SZ), seg(u, 0.25, 0.5)); wantD = fit(3.2, 3.2); }
      else { focus.set(SX, SY, SZ).lerp(new THREE.Vector3(0, 5.2, 0), ease(seg(t, q0 + qd * 0.6, q1))); wantD = fit(2.6 + 8 * ease(seg(t, q0 + qd * 0.6, q1)), 3.0); }
    }
    else if (cur === "cable" && kDraw > 0 && hangCurve) { focus.copy(hangCurve.getPointAt(clamp(kDraw, 0.001, 0.999))); wantD = fit(2.8, 2.8); }
    else if (cur && FOCUS[cur]) { const c = comps[cur], f = FOCUS[cur]; focus.set(f[0], f[1], f[2]).multiplyScalar(c.obj.scale.x).add(c.obj.position); wantD = fit(f[3] * c.obj.scale.x / (cur === "rails" ? 1 : 1) + 0.6, f[3] * c.obj.scale.x + 0.6); }
    else if (t < R.up[0]) { focus.set(0, 5.2, 0); wantD = fit(10.6, 5); }
    else { focus.set(0, carY + 1.6, 0); wantD = dRide; }
    const vw = cur && VIEW[cur]; wantAz = vw ? vw[0] : -0.5; wantEl = vw ? vw[1] : 0.12;

    // labels: everything during the intro, then only the part in focus
    const L = document.documentElement.lang === "ar" ? 1 : 0;
    const introVis = ease(seg(t, 0.8, 1.8)) * (1 - ease(seg(t, INTRO - 0.6, INTRO)));
    const W2 = host.clientWidth, H2 = host.clientHeight;
    for (const kname in lab) {
      const el = lab[kname];
      if (L !== langNow) el.textContent = LABELS[kname][L];
      if (kname === "doors") { v.copy(LD[0].g.position); v.y += 2.75; }
      else { const c = comps[kname]; v.copy(c.labelOff).multiplyScalar(c.obj.scale.x).add(c.obj.position); }
      const st = STEP[kname], mine = st && t >= st[0] && t < st[1] ? Math.min(seg(t, st[0], st[0] + 0.4), 1 - seg(t, st[1] - 0.5, st[1])) : 0;
      const vis = Math.max(introVis, mine);
      v.project(camera);
      el.style.opacity = (vis * (v.z < 1 ? 1 : 0)).toFixed(2);
      el.classList.toggle("big", mine > 0);
      el.style.transform = `translate(-50%,-100%) translate(${((v.x + 1) / 2 * W2).toFixed(1)}px,${((1 - v.y) / 2 * H2).toFixed(1)}px)`;
    }
    langNow = L;
    if (ind) {
      const f = Math.round((carY - B) / 2.8), dir = t > R.up[0] && t < R.up[1] ? "▲" : t > R.down[0] && t < R.down[1] ? "▼" : "•";
      const txt = dir + " " + ["G", "1", "2"][clamp(f, 0, 2)];
      if (txt !== lastInd) { ind.textContent = txt; lastInd = txt; }
      ind.classList.toggle("on", t > R.close1[0] && t < OUT[0]);
    }
    ring.material.opacity = 0.35 + 0.35 * Math.sin(T * 2.2) ** 2;
    return wantD;
  }

  /* ---------- camera & loop ---------- */
  function fit(H, Wd) { const f = THREE.MathUtils.degToRad(camera.fov) / 2; return Math.max((H / 2) / Math.tan(f), (Wd / 2) / (Math.tan(f) * camera.aspect)) * 1.08; }
  let dShow = 20, dRide = 14;
  function resize() {
    const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    dShow = fit(9.2, 9.6); dRide = fit(6.6, 4.2);
  }
  new ResizeObserver(resize).observe(host); resize();

  const FIX = (q => q === null ? null : +q)(new URLSearchParams(location.search).get("t3d"));
  let visible = true, t0 = performance.now(), last = t0, camD = dShow, camA = -0.5, camE = 0.12;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(host);
  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) { last = now; return; }
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    const T = FIX != null ? FIX : reduce ? BUILT + 1 : (now - t0) / 1000;
    const wantD = apply(T);
    const s = FIX != null ? 1 : 1 - Math.exp(-dt * 1.15), sa = FIX != null ? 1 : 1 - Math.exp(-dt * 0.7);
    camT.lerp(focus, s); camD += (wantD - camD) * s; camA += (wantAz - camA) * sa; camE += (wantEl - camE) * sa;
    const a = camA + (reduce ? 0 : Math.sin(T * 0.07) * 0.12), ce = Math.cos(Math.atan(camE));
    camera.position.set(camT.x + Math.sin(a) * camD * ce, camT.y + camD * Math.sin(Math.atan(camE)), camT.z + Math.cos(a) * camD * ce);
    camera.lookAt(camT);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
  return true;
}

if (host) {
  const go = () => { try { if (start()) document.querySelector(".hero")?.classList.add("has3d"); } catch (e) { console.warn(e); } };
  if (document.readyState === "complete") go(); else addEventListener("load", go, { once: true });
}
