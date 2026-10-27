/* Melsa Elevators — animated 3D hero.
   A glass shaft builds itself, the cabin assembles from flying parts,
   rides up and down the floors, then breaks apart and rebuilds (loop). */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const host = document.getElementById("hero3d");
const ind = document.getElementById("liftInd");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

function start() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" }); }
  catch (e) { return false; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.append(renderer.domElement);

  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 1.5;
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);

  scene.add(new THREE.HemisphereLight(0xbfd6ff, 0x0a1730, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(4, 10, 6); scene.add(key);
  const rim = new THREE.PointLight(0x3aa0ff, 30, 30); rim.position.set(-4, 6, -3); scene.add(rim);
  const red = new THREE.PointLight(0xff2a3d, 12, 12); red.position.set(3, 1, 3); scene.add(red);

  const CYAN = 0x7cc8ff, NAVY = 0x023584, RED = 0xd8031a;
  const FLOORS = [0, 2.8, 5.6], TOP = 9.2;

  /* ---------- helpers ---------- */
  const fades = [];          // materials whose opacity follows a phase value
  function edges(mesh, color = CYAN, op = 0.9) {
    const l = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 20),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: op, depthWrite: false }));
    mesh.add(l); return l;
  }
  const metal = (c, m = 0.85, r = 0.3) => new THREE.MeshStandardMaterial({ color: c, metalness: m, roughness: r, transparent: true });
  const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);

  /* ---------- ground: blueprint grid + glowing pads ---------- */
  const grid = new THREE.GridHelper(14, 28, 0x3a7bd5, 0x1d3f7a);
  grid.material.transparent = true; grid.material.opacity = 0.35; scene.add(grid);
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.5, 1.56, 64),
    new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.01; scene.add(ring);

  /* ---------- shaft (glass tower) ---------- */
  const shaft = new THREE.Group(); scene.add(shaft);
  const postMat = metal(0x1b2433, 0.7, 0.4);
  const W = 1.95, D = 1.85;
  for (const [x, z] of [[-W / 2, -D / 2], [W / 2, -D / 2], [-W / 2, D / 2], [W / 2, D / 2]]) {
    const p = box(0.07, TOP, 0.07, postMat); p.position.set(x, TOP / 2, z); edges(p, CYAN, 0.5); shaft.add(p);
  }
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x9fd3ff, metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false });
  for (const [w, x, z, ry] of [[W, 0, -D / 2, 0], [D, -W / 2, 0, Math.PI / 2], [D, W / 2, 0, Math.PI / 2]]) {
    const g = new THREE.Mesh(new THREE.PlaneGeometry(w, TOP), glassMat); g.position.set(x, TOP / 2, z); g.rotation.y = ry; shaft.add(g);
  }
  // floor slabs + landing frames
  FLOORS.forEach((y, i) => {
    const slab = box(3.4, 0.14, 1.4, metal(0x26324a, 0.4, 0.6)); slab.position.set(0, y - 0.07, D / 2 + 0.7); edges(slab, CYAN, 0.35); shaft.add(slab);
    const fr = new THREE.Group(); fr.position.set(0, y, D / 2 + 0.01);
    const m = metal(0xd9dee5, 0.9, 0.25);
    const l = box(0.08, 2.25, 0.06, m); l.position.set(-0.66, 1.12, 0);
    const r = l.clone(); r.position.x = 0.66;
    const h = box(1.4, 0.1, 0.06, m); h.position.set(0, 2.3, 0);
    [l, r, h].forEach(o => { edges(o, RED, 0.8); fr.add(o); });
    shaft.add(fr);
  });
  // top frame + machine
  const topFrame = box(W + 0.1, 0.12, D + 0.1, metal(0x1b2433)); topFrame.position.y = TOP; edges(topFrame, CYAN, 0.6); shaft.add(topFrame);
  const machine = new THREE.Group(); machine.position.set(0, TOP + 0.38, -0.35); shaft.add(machine);
  const mBase = box(1.1, 0.12, 0.6, metal(0x2b3550)); mBase.position.y = -0.3; edges(mBase); machine.add(mBase);
  const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.42, 32), metal(NAVY, 0.6, 0.35)); motor.rotation.z = Math.PI / 2; motor.position.x = -0.32; machine.add(motor); edges(motor, CYAN, 0.4);
  const sheave = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.12, 32), metal(0xf2c94c, 0.9, 0.25)); sheave.rotation.z = Math.PI / 2; sheave.position.x = 0.12; machine.add(sheave);
  const spokes = edges(sheave, 0x0a1730, 0.9);

  // guide rails (grow from the ground)
  const rails = [];
  for (const x of [-0.82, 0.82]) {
    const g = new THREE.BoxGeometry(0.05, TOP, 0.09); g.translate(0, TOP / 2, 0);
    const r = new THREE.Mesh(g, metal(0xaab4c0, 0.9, 0.3)); r.position.set(x, 0, 0); edges(r, CYAN, 0.6); shaft.add(r); rails.push(r);
  }
  // counterweight
  const cw = box(0.62, 1.1, 0.16, metal(0x39445a, 0.6, 0.5)); cw.position.z = -D / 2 + 0.16; edges(cw, CYAN, 0.6); shaft.add(cw);

  // scan beam used while building
  const scan = new THREE.Mesh(new THREE.BoxGeometry(W + 0.4, 0.02, D + 0.4),
    new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(scan);

  /* ---------- cabin (assembles from parts) ---------- */
  const car = new THREE.Group(); scene.add(car);
  const parts = [];
  function part(mesh, x, y, z, edgeColor = CYAN) {
    mesh.position.set(x, y, z); const e = edges(mesh, edgeColor, 0.9);
    const dir = new THREE.Vector3(x, y - 1.1, z); if (dir.lengthSq() < 0.01) dir.set(0, 1, 0);
    dir.normalize();
    parts.push({ mesh, e, base: new THREE.Vector3(x, y, z),
      off: dir.multiplyScalar(1.8 + Math.random() * 1.2).add(new THREE.Vector3(0, Math.random() * 0.8, 0)),
      rot: new THREE.Euler((Math.random() - 0.5) * 2.4, (Math.random() - 0.5) * 2.4, (Math.random() - 0.5) * 2.4) });
    car.add(mesh); return mesh;
  }
  const wallM = metal(0xc9d1da, 0.92, 0.22), goldM = metal(0xc8a45e, 0.95, 0.22), darkM = metal(0x2b2f36, 0.3, 0.5);
  part(box(1.4, 0.08, 1.3, darkM), 0, 0.04, 0);                      // floor
  const ceil = part(box(1.4, 0.08, 1.3, metal(0xe8edf3, 0.5, 0.4)), 0, 2.26, 0);
  part(box(1.4, 2.18, 0.04, wallM), 0, 1.13, -0.63);                 // back
  part(box(0.04, 2.18, 1.3, wallM), -0.68, 1.13, 0);                 // left
  part(box(0.04, 2.18, 1.3, wallM), 0.68, 1.13, 0);                  // right
  part(box(0.12, 2.18, 0.04, goldM), -0.64, 1.13, 0.64);             // front returns
  part(box(0.12, 2.18, 0.04, goldM), 0.64, 1.13, 0.64);
  part(box(1.4, 0.16, 0.04, goldM), 0, 2.14, 0.64);                  // header
  const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.1, 12), goldM); rail.rotation.z = Math.PI / 2; part(rail, 0, 0.95, -0.58);
  const cop = part(box(0.12, 0.7, 0.02, metal(0x111318, 0.4, 0.3)), 0.55, 1.25, 0.6, RED); // COP panel
  part(box(0.07, 2.7, 0.07, metal(0x1b2433)), -0.76, 1.3, 0);        // sling uprights
  part(box(0.07, 2.7, 0.07, metal(0x1b2433)), 0.76, 1.3, 0);
  part(box(1.6, 0.1, 0.12, metal(0x1b2433)), 0, 2.62, 0);            // crosshead
  const doorL = part(box(0.62, 2.02, 0.03, goldM), -0.31, 1.05, 0.67);
  const doorR = part(box(0.62, 2.02, 0.03, goldM), 0.31, 1.05, 0.67);
  const light = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.9), new THREE.MeshBasicMaterial({ color: 0xfff1c8, transparent: true }));
  light.rotation.x = Math.PI / 2; light.position.y = 2.21; car.add(light);
  const carLight = new THREE.PointLight(0xfff1c8, 0, 3); carLight.position.y = 1.9; car.add(carLight);

  // ropes
  const ropeGeo = new THREE.BufferGeometry(); const ropePts = new Float32Array(6 * 3 * 2);
  ropeGeo.setAttribute("position", new THREE.BufferAttribute(ropePts, 3));
  const ropes = new THREE.LineSegments(ropeGeo, new THREE.LineBasicMaterial({ color: 0xdfe6ee, transparent: true, opacity: 0.85 })); scene.add(ropes);

  /* ---------- timeline ---------- */
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const ease = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const back = x => { const c = 1.4; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const CYCLE = 17;
  const LABEL = ["G", "1", "2"];
  let lastInd = "";

  function apply(T) {
    // intro: shaft + rails build once
    const intro = seg(T, 0, 2.2);
    rails.forEach(r => r.scale.y = Math.max(0.001, ease(seg(T, 0.2, 2.0))));
    const iv = ease(intro);
    shaft.traverse(o => { const m = o.material; if (!m) return; if (m.userData.base === undefined) m.userData.base = m.opacity; m.opacity = m.userData.base * iv; });
    scan.visible = T < 2.4; scan.position.y = TOP * ease(seg(T, 0, 2.2)); scan.material.opacity = 0.55 * (1 - seg(T, 1.9, 2.4));

    const t = Math.max(0, T - 1.2) % CYCLE;
    const assemble = back(seg(t, 0, 2.4)) * (1 - ease(seg(t, 15.3, 16.9)));
    const solid = ease(seg(t, 2.2, 3.3)) * (1 - ease(seg(t, 15.0, 15.8)));
    parts.forEach(p => {
      const k = 1 - assemble;
      p.mesh.position.copy(p.base).addScaledVector(p.off, k);
      p.mesh.rotation.set(p.rot.x * k, p.rot.y * k, p.rot.z * k);
      p.mesh.material.opacity = solid;
      p.e.material.opacity = 0.25 + 0.7 * (1 - solid);
    });
    // doors: closed during rides, open at floors
    const open = Math.max(1 - seg(t, 3.3, 4.1), seg(t, 7.6, 8.3) * (1 - seg(t, 9.3, 10.0)), seg(t, 13.6, 14.3) * (1 - seg(t, 15.0, 15.6)));
    const o = ease(open) * 0.56;
    if (assemble > 0.999) { doorL.position.x = -0.31 - o; doorR.position.x = 0.31 + o; }
    // ride
    const up = ease(seg(t, 4.2, 7.6)), down = ease(seg(t, 10.0, 13.6));
    const y = FLOORS[2] * (up - down);
    car.position.y = y;
    cw.position.y = 0.75 + (FLOORS[2] - y) + 0.9;
    sheave.rotation.x = y * 2.4;
    light.material.opacity = solid; carLight.intensity = 6 * solid;
    ceil.material.emissive = new THREE.Color(0xfff1c8); ceil.material.emissiveIntensity = 0.25 * solid;
    cop.material.emissive = new THREE.Color(RED); cop.material.emissiveIntensity = 0.6 * solid;
    // ropes appear once the car is solid
    ropes.material.opacity = 0.85 * solid;
    const sy = TOP + 0.38, sz = -0.35;
    let i = 0; const put = (a, b) => { ropePts.set([...a, ...b], i); i += 6; };
    for (const dx of [-0.05, 0, 0.05]) {
      put([dx, y + 2.67, 0], [dx + 0.12, sy, sz + 0.2]);
      put([dx + 0.12, sy, sz - 0.2], [dx, cw.position.y + 0.55, cw.position.z]);
    }
    ropeGeo.attributes.position.needsUpdate = true;
    // floor indicator
    if (ind) {
      const f = Math.round(y / 2.8), dir = t > 4.2 && t < 7.6 ? "▲" : t > 10 && t < 13.6 ? "▼" : "•";
      const txt = dir + " " + LABEL[clamp(f, 0, 2)];
      if (txt !== lastInd) { ind.textContent = txt; lastInd = txt; }
      ind.classList.toggle("on", solid > 0.5);
    }
    ring.material.opacity = 0.35 + 0.35 * Math.sin(T * 2.2) ** 2;
  }

  /* ---------- camera & loop ---------- */
  function resize() {
    const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    const H = 6.6, fov = THREE.MathUtils.degToRad(camera.fov);
    let dist = (H / 2) / Math.tan(fov / 2) * 1.08;
    const Wd = 4.2; const distW = (Wd / 2) / (Math.tan(fov / 2) * camera.aspect); dist = Math.max(dist, distW);
    camera.userData.dist = dist; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(host); resize();

  let visible = true, t0 = performance.now(), camY = 2.6, last = t0;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(host);
  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    const T = reduce ? 5.5 : (now - t0) / 1000;
    apply(T);
    const a = -0.55 + (reduce ? 0 : Math.sin(T * 0.12) * 0.35), d = camera.userData.dist || 14;
    const want = T < 2.4 ? 2.6 + 3.2 * Math.sin(Math.min(1, T / 2.4) * Math.PI) : car.position.y + 1.6;
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    camY += (want - camY) * (1 - Math.exp(-dt * 3.5));
    camera.position.set(Math.sin(a) * d, camY + 1.6, Math.cos(a) * d);
    camera.lookAt(0, camY, 0);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
  return true;
}

if (host) {
  const go = () => { try { if (start()) document.querySelector(".hero")?.classList.add("has3d"); } catch (e) { console.warn(e); } };
  if (document.readyState === "complete") go(); else addEventListener("load", go, { once: true });
}
