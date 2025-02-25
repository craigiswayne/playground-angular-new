import * as THREE from '/node_modules/three/build/three.module.js';

// Setup Scene, Camera, and Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 10;

// Load Landscape Background (Replace 'landscape.jpg' with your image)
const textureLoader = new THREE.TextureLoader();
const landscapeTexture = textureLoader.load('landscape.jpg');
scene.background = landscapeTexture;

// Particle System for Waterfall
const particleCount = 2000;
const particlesGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  positions[i * 3] = Math.random() * 2 - 1; // x
  positions[i * 3 + 1] = 5 + Math.random() * 2; // y (start at top)
  positions[i * 3 + 2] = Math.random() * 0.5 - 0.25; // z
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particlesMaterial = new THREE.PointsMaterial({
  color: 0x00aaff,
  size: 0.05,
  transparent: true,
  opacity: 0.6,
  blending: THREE.AdditiveBlending // Additive blending for a glow effect
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// Waterfall Plane with Scrolling Texture (Replace 'waterfall.jpg' with your image)
const waterfallTexture = textureLoader.load('waterfall.png');
waterfallTexture.wrapS = THREE.RepeatWrapping;
waterfallTexture.wrapT = THREE.RepeatWrapping;
waterfallTexture.repeat.set(1, 2); // Adjust repeat to fit your waterfall

const waterfallMaterial = new THREE.MeshBasicMaterial({
  map: waterfallTexture,
  transparent: true,
  opacity: 0.8
});

const waterfallGeometry = new THREE.PlaneGeometry(2, 4); // Adjust size to fit your waterfall
const waterfallPlane = new THREE.Mesh(waterfallGeometry, waterfallMaterial);
waterfallPlane.position.y = 1; // Position the plane where the waterfall is
scene.add(waterfallPlane);
renderer.setAnimationLoop(animate)

// Animation Loop
function animate() {
  // Particle System Animation
  const positionsArray = particlesGeometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    positionsArray[i * 3 + 1] -= 0.02; // Move down
    if (positionsArray[i * 3 + 1] < -2) {
      positionsArray[i * 3 + 1] = 5 + Math.random() * 2; // Reset at top
    }
  }
  particlesGeometry.attributes.position.needsUpdate = true;

  // Waterfall Texture Animation
  waterfallTexture.offset.y -= 0.005; // Scroll the texture

  renderer.render(scene, camera);
}

animate();

// Handle Window Resizing
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);
