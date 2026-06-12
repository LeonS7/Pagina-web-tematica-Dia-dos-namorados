import * as THREE from "./vendor/three.module.js";
import { OrbitControls } from "./vendor/OrbitControls.js";

const photos = [
  { src: "fotos/WhatsApp Image 2026-.jpeg", title: "Minha estrela favorita", text: "Voce deixa qualquer dia com cara de lembranca boa." },
  { src: "fotos/WhatsApp Image 2026-0.jpeg", title: "Nosso brilho", text: "Tem momentos que parecem pequenos, mas ficam enormes no coracao." },
  { src: "fotos/WhatsApp Image 2026-06-.jpeg", title: "Ao seu lado", text: "Meu lugar preferido continua sendo pertinho de voce." },
  { src: "fotos/WhatsApp Image 2026-06-1.jpeg", title: "Riso facil", text: "Com voce, ate o simples ganha uma luz diferente." },
  { src: "fotos/WhatsApp Image 2026-06-11 .jpeg", title: "Memoria bonita", text: "A gente vira lembranca sem perceber, e eu amo cada pedaco." },
  { src: "fotos/WhatsApp Image 2026-06-11 a.jpeg", title: "Nosso caminho", text: "Cada passo com voce vale mais do que eu sei explicar." },
  { src: "fotos/WhatsApp Image 2026-06-11 at 21.1.jpeg", title: "Meu acaso preferido", text: "De todas as voltas do mundo, a melhor foi encontrar voce." },
  { src: "fotos/WhatsApp Image 2026-06-11 at 21.13..jpeg", title: "Pertinho", text: "O universo fica menor quando a gente esta junto." },
  { src: "fotos/WhatsApp Image 2026-06-11 at 21.13.28.jpeg", title: "Te escolher", text: "Eu escolheria voce de novo em cada versao da nossa historia." },
  { src: "fotos/WhatsApp Image 2026-06-11 at 21.13.29.jpeg", title: "Coisa linda", text: "Algumas fotos guardam exatamente o que meu peito sente." },
  { src: "fotos/WhatsApp Image 2026-06-11 at 21.13.3.jpeg", title: "Meu mundo", text: "Voce e aquele detalhe que faz tudo fazer sentido." },
  { src: "fotos/WhatsApp Image 2026-06-11 at 21.13.31.jpeg", title: "Sempre nos", text: "Que venham muitos outros dias com esse mesmo amor." },
  { src: "fotos/WhatsApp Image 2026-06.jpeg", title: "Infinito", text: "O que eu sinto por voce nao cabe em uma tela." }
];

const sceneHost = document.getElementById("scene");
const bgMusic = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");
const letterToggle = document.getElementById("letterToggle");
const letterDrawer = document.getElementById("letterDrawer");
const closeLetter = document.getElementById("closeLetter");
const memoryPanel = document.getElementById("memoryPanel");
const progressBar = document.getElementById("progressBar");
const mainPhoto = document.getElementById("mainPhoto");
const memoryKicker = document.getElementById("memoryKicker");
const memoryTitle = document.getElementById("memoryTitle");
const memoryText = document.getElementById("memoryText");
const photoRail = document.getElementById("photoRail");
const photoSpotlight = document.getElementById("photoSpotlight");
const spotlightImage = document.getElementById("spotlightImage");
const spotlightTitle = document.getElementById("spotlightTitle");
const closeSpotlight = document.getElementById("closeSpotlight");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020006);

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
camera.position.set(0, 4, 21);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(innerWidth, innerHeight);
sceneHost.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;

const clock = new THREE.Clock();
const galaxyGroup = new THREE.Group();
galaxyGroup.rotation.order = "ZYX";
galaxyGroup.rotation.z = 0.2;
scene.add(galaxyGroup);

const photoGroup = new THREE.Group();
galaxyGroup.add(photoGroup);

const heartGroup = new THREE.Group();
scene.add(heartGroup);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const photoWorldPosition = new THREE.Vector3();

const gu = {
  time: { value: 0 }
};

const targetPositions = [];
const startPositions = [];
const sizes = [];
const shift = [];

function pushShift() {
  shift.push(
    Math.random() * Math.PI,
    Math.random() * Math.PI * 2,
    (Math.random() * .9 + .1) * Math.PI * .1,
    Math.random() * .9 + .1
  );
}

function pushTarget(vector, size) {
  targetPositions.push(vector.x, vector.y, vector.z);
  const start = new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * .45);
  startPositions.push(start.x, start.y, start.z);
  sizes.push(size);
  pushShift();
}

for (let i = 0; i < 50000; i++) {
  pushTarget(new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * .5 + 9.5), Math.random() * 1.5 + .5);
}

for (let i = 0; i < 100000; i++) {
  const r = 10;
  const R = 40;
  const rand = Math.pow(Math.random(), 1.5);
  const radius = Math.sqrt(R * R * rand + (1 - rand) * r * r);
  const vector = new THREE.Vector3().setFromCylindricalCoords(radius, Math.random() * Math.PI * 2, (Math.random() - .5) * 2);
  pushTarget(vector, Math.random() * 1.5 + .5);
}

const livePositions = new Float32Array(startPositions);
const geometry = new THREE.BufferGeometry();
geometry.setAttribute("position", new THREE.BufferAttribute(livePositions, 3));
geometry.setAttribute("sizes", new THREE.Float32BufferAttribute(sizes, 1));
geometry.setAttribute("shift", new THREE.Float32BufferAttribute(shift, 4));

let active = 0;
let albumOpen = false;
let userPausedMusic = false;
let lastSwitch = performance.now();
const switchMs = 5200;

const material = new THREE.PointsMaterial({
  size: .125,
  transparent: true,
  depthTest: false,
  blending: THREE.AdditiveBlending,
  onBeforeCompile: shader => {
    shader.uniforms.time = gu.time;
    shader.vertexShader = `
      uniform float time;
      attribute float sizes;
      attribute vec4 shift;
      varying vec3 vColor;
      ${shader.vertexShader}
    `.replace(
      "gl_PointSize = size;",
      "gl_PointSize = size * sizes;"
    ).replace(
      "#include <color_vertex>",
      `#include <color_vertex>
        float d = length(abs(position) / vec3(40., 10., 40));
        d = clamp(d, 0., 1.);
        vColor = mix(vec3(227., 155., 0.), vec3(100., 50., 255.), d) / 255.;
      `
    ).replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
        float t = time;
        float moveT = mod(shift.x + shift.z * t, PI2);
        float moveS = mod(shift.y + shift.z * t, PI2);
        transformed += vec3(cos(moveS) * sin(moveT), cos(moveT), sin(moveS) * sin(moveT)) * shift.a;
      `
    );
    shader.fragmentShader = `
      varying vec3 vColor;
      ${shader.fragmentShader}
    `.replace(
      "#include <clipping_planes_fragment>",
      `#include <clipping_planes_fragment>
        float d = length(gl_PointCoord.xy - 0.5);
      `
    ).replace(
      "vec4 diffuseColor = vec4( diffuse, opacity );",
      "vec4 diffuseColor = vec4(vColor, smoothstep(0.5, 0.1, d) * opacity);"
    );
  }
});

const points = new THREE.Points(geometry, material);
galaxyGroup.add(points);

const blackHole = new THREE.Mesh(
  new THREE.SphereGeometry(.9, 48, 32),
  new THREE.MeshBasicMaterial({ color: 0x000000 })
);
scene.add(blackHole);

createHeart();
buildPhotoSprites();
buildPhotoRail();
setActive(0, false);

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(innerWidth, innerHeight);
});

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function updateBigBang(intro) {
  const eased = easeOutCubic(intro);
  const pos = geometry.attributes.position.array;
  for (let i = 0; i < pos.length; i++) {
    pos[i] = startPositions[i] + (targetPositions[i] - startPositions[i]) * eased;
  }
  geometry.attributes.position.needsUpdate = true;
  material.opacity = Math.min(1, intro * 1.5);
}

function createHeart() {
  const heartPositions = [];
  const heartSizes = [];
  const heartColors = [];
  for (let i = 0; i < 5200; i++) {
    const t = Math.random() * Math.PI * 2;
    const edge = Math.random() < .45;
    const fill = edge ? .92 + Math.random() * .08 : Math.pow(Math.random(), .48) * .84;
    const x = 16 * Math.pow(Math.sin(t), 3) * fill;
    const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * fill;
    heartPositions.push(x * .18, y * .16, (Math.random() - .5) * 1.12);
    heartSizes.push(edge ? .18 + Math.random() * .26 : .09 + Math.random() * .14);
    heartColors.push(.62 + Math.random() * .28, 0, .015 + Math.random() * .035);
  }

  const heartGeometry = new THREE.BufferGeometry();
  heartGeometry.setAttribute("position", new THREE.Float32BufferAttribute(heartPositions, 3));
  heartGeometry.setAttribute("sizes", new THREE.Float32BufferAttribute(heartSizes, 1));
  heartGeometry.setAttribute("color", new THREE.Float32BufferAttribute(heartColors, 3));

  const heartMaterial = new THREE.PointsMaterial({
    size: .24,
    transparent: true,
    opacity: .98,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true
  });

  const heart = new THREE.Points(heartGeometry, heartMaterial);
  heartGroup.position.set(0, 3.25, 0);
  heartGroup.add(heart);
}

function createPhotoTexture(src) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 256, 256);
  ctx.fillStyle = "rgba(255,255,255,.95)";
  ctx.beginPath();
  ctx.arc(128, 128, 124, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.arc(128, 128, 112, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = "#160016";
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  const image = new Image();
  image.onload = () => {
    const scale = Math.max(224 / image.width, 224 / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    ctx.drawImage(image, 128 - width / 2, 128 - height / 2, width, height);
    ctx.restore();
    ctx.strokeStyle = "rgba(255, 78, 188, .95)";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(128, 128, 119, 0, Math.PI * 2);
    ctx.stroke();
    texture.needsUpdate = true;
  };
  image.src = src;
  return texture;
}

function buildPhotoSprites() {
  photos.forEach((photo, index) => {
    const material = new THREE.SpriteMaterial({
      map: createPhotoTexture(photo.src),
      transparent: true,
      depthTest: false
    });
    const sprite = new THREE.Sprite(material);
    sprite.userData = {
      index,
      angle: index * Math.PI * 2 / photos.length + (index % 3) * .16,
      radius: 12.5 + (index % 6) * 3.15 + Math.floor(index / 6) * .7,
      height: ((index % 5) - 2) * .32,
      phase: index * .73,
      speed: .052 + (index % 3) * .006,
      baseScale: 2.05 + (index % 4) * .18
    };
    sprite.scale.setScalar(sprite.userData.baseScale);
    sprite.renderOrder = 3;
    photoGroup.add(sprite);
  });
}

function buildPhotoRail() {
  photos.forEach((photo, index) => {
    const thumb = document.createElement("button");
    thumb.type = "button";
    thumb.className = "thumb";
    thumb.title = photo.title;
    thumb.setAttribute("aria-label", photo.title);
    thumb.addEventListener("click", () => setActive(index, true));
    const thumbImg = document.createElement("img");
    thumbImg.src = photo.src;
    thumbImg.alt = "";
    thumb.appendChild(thumbImg);
    photoRail.appendChild(thumb);
  });
}

function updatePhotoSprites(time) {
  photoGroup.children.forEach(sprite => {
    const angle = sprite.userData.angle - time * sprite.userData.speed;
    const radius = sprite.userData.radius;
    const height = sprite.userData.height + Math.sin(time * .35 + sprite.userData.phase) * .18;
    sprite.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
    sprite.getWorldPosition(photoWorldPosition);
    const distance = camera.position.distanceTo(photoWorldPosition);
    const scale = Math.max(1.05, Math.min(sprite.userData.baseScale, distance * .072));
    sprite.scale.setScalar(scale);
  });
}

function updateHeart(time, intro) {
  const reveal = Math.min(1, Math.max(0, (intro - .45) / .55));
  const pulse = 1 + Math.sin(time * 3) * .075;
  heartGroup.scale.setScalar(pulse * reveal * 1.36);
  heartGroup.visible = reveal > .02;
}

function updateOrbitExtras(time, intro) {
  const reveal = Math.min(1, Math.max(0, (intro - .62) / .38));
  photoGroup.visible = reveal > .02;
  photoGroup.children.forEach(sprite => {
    sprite.material.opacity = reveal;
  });
  blackHole.visible = reveal > .02;
}

function setActive(index, manual) {
  active = (index + photos.length) % photos.length;
  const photo = photos[active];
  mainPhoto.src = photo.src;
  mainPhoto.alt = photo.title;
  memoryKicker.textContent = `Memoria ${String(active + 1).padStart(2, "0")}`;
  memoryTitle.textContent = photo.title;
  memoryText.textContent = photo.text;
  document.querySelectorAll(".thumb").forEach((thumb, thumbIndex) => {
    thumb.classList.toggle("active", thumbIndex === active);
  });
  if (manual) {
    lastSwitch = performance.now();
  }
}

function openPhotoPreview(index) {
  const safeIndex = (index + photos.length) % photos.length;
  const photo = photos[safeIndex];
  setActive(safeIndex, true);
  spotlightImage.src = photo.src;
  spotlightImage.alt = photo.title;
  spotlightTitle.textContent = photo.title;
  photoSpotlight.classList.add("open");
  photoSpotlight.setAttribute("aria-hidden", "false");
}

function closePhotoPreview() {
  photoSpotlight.classList.remove("open");
  photoSpotlight.setAttribute("aria-hidden", "true");
}

function getPhotoHit(event) {
  if (!photoGroup.visible) {
    return null;
  }
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  photoGroup.updateMatrixWorld(true);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(photoGroup.children, false);
  const hit = hits.find(item => item.object.material.opacity > .35);
  return hit ? hit.object : null;
}

function handleScenePointerDown(event) {
  if (bgMusic.paused) {
    playMusic();
  }
  const photo = getPhotoHit(event);
  if (photo) {
    openPhotoPreview(photo.userData.index);
  }
}

function handleScenePointerMove(event) {
  renderer.domElement.style.cursor = getPhotoHit(event) ? "pointer" : "";
}

function toggleLetter(forceOpen) {
  albumOpen = typeof forceOpen === "boolean" ? forceOpen : !albumOpen;
  letterDrawer.classList.toggle("open", albumOpen);
  memoryPanel.classList.toggle("open", albumOpen);
  letterToggle.classList.toggle("active", albumOpen);
  letterDrawer.setAttribute("aria-hidden", String(!albumOpen));
  memoryPanel.setAttribute("aria-hidden", String(!albumOpen));
}

async function playMusic() {
  if (userPausedMusic) {
    return;
  }
  bgMusic.volume = .42;
  try {
    await bgMusic.play();
    musicToggle.classList.add("playing");
    musicToggle.classList.remove("needs-tap");
  } catch (error) {
    musicToggle.classList.add("needs-tap");
  }
}

function toggleMusic() {
  if (bgMusic.paused) {
    userPausedMusic = false;
    playMusic();
  } else {
    userPausedMusic = true;
    bgMusic.pause();
    musicToggle.classList.remove("playing");
  }
}

letterToggle.addEventListener("click", () => toggleLetter());
closeLetter.addEventListener("click", () => toggleLetter(false));
musicToggle.addEventListener("click", toggleMusic);
document.getElementById("prevPhoto").addEventListener("click", () => setActive(active - 1, true));
document.getElementById("nextPhoto").addEventListener("click", () => setActive(active + 1, true));
closeSpotlight.addEventListener("click", closePhotoPreview);
photoSpotlight.addEventListener("click", event => {
  if (event.target === photoSpotlight) {
    closePhotoPreview();
  }
});
window.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closePhotoPreview();
    toggleLetter(false);
  }
});
window.addEventListener("load", playMusic);
renderer.domElement.addEventListener("pointerdown", handleScenePointerDown);
renderer.domElement.addEventListener("pointermove", handleScenePointerMove);

setInterval(() => {
  setActive(active + 1, false);
  lastSwitch = performance.now();
}, switchMs);

renderer.setAnimationLoop(() => {
  const elapsed = clock.getElapsedTime();
  const intro = Math.min(1, elapsed / 3.35);
  const t = elapsed * .5;

  if (intro < 1) {
    updateBigBang(intro);
  }

  gu.time.value = t * Math.PI;
  galaxyGroup.rotation.y = t * .05;
  controls.update();
  updatePhotoSprites(elapsed);
  updateHeart(elapsed, intro);
  updateOrbitExtras(elapsed, intro);

  const progressElapsed = (performance.now() - lastSwitch) % switchMs;
  progressBar.style.setProperty("--progress", `${(progressElapsed / switchMs) * 100}%`);
  renderer.render(scene, camera);
});
